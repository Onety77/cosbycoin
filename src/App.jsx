import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { 
  AlertTriangle, 
  ExternalLink, 
  Terminal, 
  History,
  ShieldAlert,
  Zap,
  MessageSquare,
  Twitter,
  Globe,
  FileText,
  SendHorizontal,
  Settings,
  LogOut,
  Palette,
  Reply,
  X,
  ChevronDown,
  User,
  Copy,
  MessageCircle,
  Heart,
  Share2,
  ImagePlus,
  Sparkles,
  Upload,
  Download,
  ArrowLeft,
  RefreshCw,
  Loader2
} from 'lucide-react';

// --- CONSTANTS & CONFIGURATION ---
const OFFICIAL_CA = "CAgcxv5toycxkzffkUjW1gm8ArJVnRnXv7C2m32zpump";

// Environment-provided API Key (Instructional Mandate: Always set to empty string)
const apiKey = ""; 

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

const AVATAR_LIST = [
  { id: 'pepe', name: 'PEPE', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pepe' },
  { id: 'doge', name: 'DOGE', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=doge' },
  { id: 'wif', name: 'WIF', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=wif' },
  { id: 'wojak', name: 'WOJAK', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=wojak' },
  { id: 'bonk', name: 'DETECTIVE', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=detective' },
  { id: 'mask', name: 'MASK', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=mask' },
];

const COLOR_LIST = [
  { id: 'emerald', hex: '#10b981', label: 'NEON_EMERALD' },
  { id: 'blue', hex: '#3b82f6', label: 'CYBER_BLUE' },
  { id: 'pink', hex: '#ec4899', label: 'HOT_PINK' },
  { id: 'gold', hex: '#f59e0b', label: 'LIQUID_GOLD' },
  { id: 'purple', hex: '#a855f7', label: 'VOID_PURPLE' },
  { id: 'white', hex: '#ffffff', label: 'PURE_SIGNAL' },
];

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyB_gNokFnucM2nNAhhkRRnPsPNBAShYlMs",
      authDomain: "it-token.firebaseapp.com",
      projectId: "it-token",
      storageBucket: "it-token.firebasestorage.app",
      messagingSenderId: "804328953904",
      appId: "1:804328953904:web:e760545b579bf2527075f5"
    };

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- HELPERS ---
const getBase64FromUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Base64 conversion failed", e);
    return null;
  }
};

// --- MEDIA SPOTLIGHT DATA ---
const MEDIA_POSTS = [
  {
    id: 'tweet-buttcoin-1',
    name: 'Buttcoin',
    handle: '@buttcoin',
    avatar: 'buttcoin.jpg',
    text: 'Dear @EdandEthan, have you considered Buttcoin or perhaps Cosbycoin? cc @DreamHostBrett',
    image: 'photo_2026-01-15_09-33-29.jpg',
    link: 'https://x.com/buttcoin',
    stats: { replies: '8.2k', retweets: '4.1k', likes: '22.4k' }
  },
  {
    id: 'tweet-buttcoin-2',
    name: 'Buttcoin',
    handle: '@buttcoin',
    avatar: 'buttcoin.jpg',
    text: 'You learned about Bitcoin from DeFi ponzis and Matt Damon. I learned it from dog dick coffee table and CosbyCoin.\n\nWe are not the same.',
    image: 'photo_2026-01-15_09-48-19.jpg',
    link: 'https://x.com/ButtCoin/status/1600962725277880320?s=20',
    stats: { replies: '3.1k', retweets: '1.2k', likes: '15.9k' }
  }
];

// --- CHAT COMPONENT ---
const ChatApp = ({ darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");
  const [userColor, setUserColor] = useState(COLOR_LIST[5].hex);
  const [userAvatar, setUserAvatar] = useState(AVATAR_LIST[5].url);
  const [isSetup, setIsSetup] = useState(false);
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [copiedCA, setCopiedCA] = useState(false);

  const scrollRef = useRef(null);
  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Authentication failed:", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);

    const savedName = localStorage.getItem('cosby_alias');
    if (savedName) {
      setUsername(savedName);
      setUserColor(localStorage.getItem('cosby_color') || COLOR_LIST[5].hex);
      setUserAvatar(localStorage.getItem('cosby_avatar') || AVATAR_LIST[5].url);
      setIsSetup(true);
    }
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const msgCollection = collection(db, 'artifacts', appId, 'public', 'data', 'trollbox_messages');
    const unsubscribe = onSnapshot(msgCollection, (snapshot) => {
      if (snapshot.empty) {
        setMessages([]);
        return;
      }
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        let ts = data.timestamp?.toDate ? data.timestamp.toDate().getTime() : (data.timestamp || Date.now());
        return { id: doc.id, ...data, _sortTs: ts };
      });
      const sorted = msgs.sort((a, b) => a._sortTs - b._sortTs);
      setMessages(sorted.slice(-100));
      setTimeout(() => scrollToBottom(), 100);
    }, (err) => {
      console.error("Firestore sync error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = (behavior = 'smooth') => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
    document.body.removeChild(el);
  };

  const handleReaction = async (msgId, emoji) => {
    setContextMenu(null);
    if (!user) return;
    const storageKey = `reacted_${msgId}_${emoji}`;
    const hasReacted = localStorage.getItem(storageKey);
    const msgRef = doc(db, 'artifacts', appId, 'public', 'data', 'trollbox_messages', msgId);
    try {
      if (hasReacted) {
        await updateDoc(msgRef, { [`reactions.${emoji}`]: increment(-1) });
        localStorage.removeItem(storageKey);
      } else {
        await updateDoc(msgRef, { [`reactions.${emoji}`]: increment(1) });
        localStorage.setItem(storageKey, "true");
      }
    } catch (e) {}
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || isSending) return;
    setIsSending(true);
    const text = inputText.trim();
    const reply = replyingTo;
    setInputText("");
    setReplyingTo(null);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'trollbox_messages'), {
        text, uid: user.uid, user: username, color: userColor, avatar: userAvatar, 
        replyTo: reply ? { user: reply.user, text: reply.text } : null, 
        timestamp: serverTimestamp(), reactions: { heart: 0, up: 0 }
      });
      setTimeout(() => scrollToBottom(), 150);
    } catch (err) { 
      setError("Uplink failed."); 
    } finally { 
      setIsSending(false); 
    }
  };

  const handleJoin = () => {
    if (username.length < 2) return setError("Alias too short");
    localStorage.setItem('cosby_alias', username);
    localStorage.setItem('cosby_color', userColor);
    localStorage.setItem('cosby_avatar', userAvatar);
    setIsSetup(true);
  };

  if (!isSetup) {
    return (
      <div className={`w-full h-full p-8 flex flex-col bg-white/5 backdrop-blur-sm animate-fade-in ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="mb-6 border-b-2 border-red-600/30 pb-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-red-600 italic">Identify Yourself</h4>
        </div>
        <div className="space-y-6 flex-1">
          <input value={username} onChange={(e) => setUsername(e.target.value.toUpperCase())} placeholder="ALIAS" className={`w-full bg-transparent border-b-2 border-current py-3 outline-none text-2xl font-black italic tracking-tighter ${darkMode ? 'focus:border-white' : 'focus:border-black'}`} />
          <div>
            <span className="text-[10px] font-black uppercase opacity-40 block mb-3">Avatar Selection</span>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_LIST.map(av => (
                <button key={av.id} onClick={() => setUserAvatar(av.url)} className={`aspect-square border-2 transition-all p-0.5 ${userAvatar === av.url ? 'border-red-600 scale-110' : 'border-transparent opacity-40'}`}>
                  <img src={av.url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase opacity-40 block mb-3">Color Signature</span>
            <div className="flex gap-3">
              {COLOR_LIST.map(c => (
                <button key={c.id} onClick={() => setUserColor(c.hex)} className={`w-8 h-8 rounded-full border-2 transition-all ${userColor === c.hex ? 'border-white scale-125 shadow-md' : 'border-transparent opacity-40'}`} style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleJoin} className="w-full py-4 bg-red-700 text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-red-600 transition-all mt-6">Join Protest</button>
        {error && <p className="text-red-500 text-[10px] uppercase font-black mt-4 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full font-mono relative select-none" onClick={() => { setContextMenu(null); setActiveMenu(null); }}>
      <div className="bg-black text-white px-4 py-2 flex items-center justify-between border-b border-white/10">
        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic animate-pulse flex items-center gap-2"><ShieldAlert size={12}/> HACK_LIVE</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 cursor-pointer group" onClick={() => copyToClipboard(OFFICIAL_CA)}>
            <span className="text-[9px] opacity-40 group-hover:opacity-100 uppercase tracking-tighter transition-opacity">CA: {OFFICIAL_CA.slice(0, 10)}...</span>
            <Copy size={10} className={`${copiedCA ? 'text-green-500' : 'opacity-20'}`} />
          </div>
          <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu ? null : 'settings'); }} className="opacity-40 hover:opacity-100"><Settings size={14}/></button>
        </div>
      </div>
      <div ref={scrollRef} onScroll={(e) => { const { scrollTop, scrollHeight, clientHeight } = e.currentTarget; setShowScrollDown(scrollHeight - scrollTop - clientHeight > 300); }} className={`flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar scroll-smooth relative ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
        {messages.map((msg) => {
          const isMe = msg.uid === user?.uid;
          const hasReactions = msg.reactions && Object.values(msg.reactions).some(v => v > 0);
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in group/msg`} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, msg }); }} onTouchStart={(e) => { touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; longPressTimer.current = setTimeout(() => { setContextMenu({ x: e.touches[0].clientX, y: e.touches[0].clientY, msg }); }, 600); }} onTouchMove={(e) => { if (Math.abs(e.touches[0].clientX - touchStartPos.current.x) > 10 || Math.abs(e.touches[0].clientY - touchStartPos.current.y) > 10) clearTimeout(longPressTimer.current); }} onTouchEnd={() => clearTimeout(longPressTimer.current)} onDoubleClick={() => handleReaction(msg.id, 'heart')}>
              <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}><img src={msg.avatar} className="w-4 h-4 object-cover border border-current opacity-70" alt="" /><span className="text-[10px] font-black uppercase italic tracking-tighter" style={{ color: msg.color }}>{msg.user}</span></div>
              <div className={`relative px-4 py-2 max-w-[90%] border-r-4 text-[11px] font-bold shadow-sm cursor-pointer transition-all ${isMe ? 'bg-[#2b506f] text-white border-red-600' : (darkMode ? 'bg-white/5 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300')}`}>
                  {msg.replyTo && <div className="text-[9px] opacity-40 mb-2 border-l-2 border-current pl-2 italic bg-black/5 p-1 truncate">@{msg.replyTo.user}: {msg.replyTo.text}</div>}
                  <p className="break-words whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              {hasReactions && (
                <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {Object.entries(msg.reactions).map(([key, count]) => count > 0 && (
                    <button key={key} onClick={(e) => { e.stopPropagation(); handleReaction(msg.id, key); }} className="bg-black/10 px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-1 transition-all">{key === 'heart' ? '❤️' : '👌'} <span>{count}</span></button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showScrollDown && (
        <button onClick={() => scrollToBottom()} className="absolute bottom-24 right-6 z-[70] p-3 rounded-full shadow-2xl animate-bounce transition-opacity bg-red-700 text-white hover:bg-red-600">
          <ChevronDown size={20} strokeWidth={3}/>
        </button>
      )}
      {activeMenu === 'settings' && (
        <div className={`absolute top-10 right-4 z-[90] p-4 border-2 shadow-2xl flex flex-col gap-4 animate-fade-in ${darkMode ? 'bg-gray-900 border-white/10 text-white' : 'bg-white border-gray-200 text-black'}`} onClick={e => e.stopPropagation()}>
          <button onClick={() => { setIsSetup(false); setActiveMenu(null); }} className="text-[10px] font-black uppercase flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"><Palette size={14}/> Appearance</button>
          <div className="h-[1px] w-full opacity-10 bg-current" />
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[10px] font-black uppercase text-red-500 flex items-center gap-3 hover:opacity-70 transition-opacity"><LogOut size={14}/> Reset Signal</button>
        </div>
      )}
      {contextMenu && (
        <div className="fixed z-[1000] p-1 border-2 shadow-2xl bg-[#1a1b1e] border-white/20 min-w-[120px] animate-scale-up" style={{ top: Math.min(contextMenu.y, window.innerHeight - 100), left: Math.min(contextMenu.x, window.innerWidth - 120) }} onClick={e => e.stopPropagation()}>
           <button onClick={() => { setReplyingTo(contextMenu.msg); setContextMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase text-white hover:bg-white hover:text-black transition-colors"><Reply size={12}/> Reply</button>
           <div className="flex p-1 gap-1 border-t border-white/10">
             <button onClick={() => handleReaction(contextMenu.msg.id, 'heart')} className="flex-1 p-2 hover:bg-white/10 rounded transition-colors">❤️</button>
             <button onClick={() => handleReaction(contextMenu.msg.id, 'up')} className="flex-1 p-2 hover:bg-white/10 rounded transition-colors">👌</button>
           </div>
        </div>
      )}
      <div className={`p-4 border-t ${darkMode ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-white'}`}>
        {replyingTo && (
          <div className="flex justify-between items-center bg-red-900/10 p-2 mb-2 border-l-2 border-red-700 animate-fade-in">
            <span className="text-[9px] uppercase font-black italic text-red-600 truncate pr-6">Replying to {replyingTo.user}</span>
            <X size={10} className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => setReplyingTo(null)} />
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isSending ? "cosbing..." : "say something..."} disabled={isSending} className={`flex-1 bg-transparent border-b-2 py-2 px-1 text-sm font-black italic outline-none transition-all ${darkMode ? 'border-white/20 focus:border-white' : 'border-black/20 focus:border-black'}`} />
          <button type="submit" disabled={!inputText.trim() || isSending} className={`p-2 transition-all ${isSending ? 'opacity-20' : 'hover:text-red-600'}`}><SendHorizontal size={20} /></button>
        </form>
      </div>
    </div>
  );
};

// --- AMBIENT HIJACK COMPONENTS ---
const CosbyGhost = ({ src, x, y, scale }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: [0, 0.5, 0], scale: [0.5, scale, 0.5], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 4, ease: "easeInOut" }}
    className="fixed pointer-events-none z-[5]"
    style={{ left: x, top: y }}
  >
    <img src={src} className="w-48 md:w-64 grayscale opacity-40 shadow-2xl border border-red-600/20" alt="" />
  </motion.div>
);

const PassingMeme = ({ src, direction }) => (
  <motion.img
    initial={{ x: direction === 'right' ? '-100%' : '200%', y: Math.random() * 80 + '%' }}
    animate={{ x: direction === 'right' ? '200%' : '-100%' }}
    transition={{ duration: 15, ease: "linear" }}
    src={src}
    className="fixed w-32 md:w-48 opacity-20 pointer-events-none z-[1]"
  />
);

// --- AI MEME GENERATOR COMPONENT ---
const MemeGenerator = ({ darkMode, onBack }) => {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [memeResult, setMemeResult] = useState(null);
  const [uploadBase64, setUploadBase64] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const generateMeme = async (random = false) => {
    // Note: apiKey check removed as the environment injects it at runtime
    setGenerating(true);
    setError(null);
    
    try {
      const templateBase64 = await getBase64FromUrl('template.jpg');
      const backgroundBase64 = uploadBase64 ? uploadBase64.split(',')[1] : (templateBase64 || "");
      
      const userInstruction = random 
        ? "Generate a hilarious random meme quote, fake fact, or historical snippet about the 2011 CosbyCoin Bitcointalk hijack. Professional quality placement."
        : `Professionally place the following text onto this image: "${prompt}". If this is the template with a central box, place the text exactly inside that box using a font and color that matches the site's aesthetic. If this is a custom image, place the text centered and use a color that provides maximum professional contrast.`;

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: userInstruction },
              { inlineData: { mimeType: "image/jpeg", data: backgroundBase64 } }
            ]
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      });

      const result = await response.json();
      const base64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (base64) {
        setMemeResult(`data:image/png;base64,${base64}`);
      } else {
        throw new Error("AI failed to return an image.");
      }
    } catch (e) {
      console.error(e);
      setError("AI Generation failed. This usually means the API is temporarily busy. Retry?");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col animate-fade-in ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-100 text-black'}`}>
      <div className="p-4 border-b flex items-center justify-between bg-black text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase hover:text-red-500 transition-colors">
          <ArrowLeft size={16} /> Back to Forum
        </button>
        <span className="text-[10px] font-black tracking-widest uppercase italic">AI Meme Protocol v2.5</span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 overflow-y-auto">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-red-600">Meme Uplink</h2>
            <p className="text-xs opacity-60">Type your message or generate a random piece of 2011 lore.</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40">Meme Content</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="ENTER MEME TEXT..." className={`w-full h-32 bg-transparent border-2 p-3 outline-none text-sm font-bold resize-none ${darkMode ? 'border-white/20 focus:border-white' : 'border-black/20 focus:border-black'}`} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40">Custom Background (Optional)</label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-current p-4 hover:bg-current hover:bg-opacity-5 transition-all text-xs font-bold uppercase">
                <Upload size={16} /> {uploadBase64 ? 'Image Loaded' : 'Upload BG'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              </label>
              {uploadBase64 && (
                <button onClick={() => setUploadBase64(null)} className="p-4 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all"><X size={16}/></button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button disabled={generating || (!prompt.trim() && !uploadBase64)} onClick={() => generateMeme(false)} className="w-full py-4 bg-red-700 text-white font-black uppercase text-sm tracking-widest hover:bg-red-600 disabled:opacity-30 transition-all flex items-center justify-center gap-2">{generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Execute Generation</button>
            <button disabled={generating} onClick={() => generateMeme(true)} className="w-full py-4 border-2 border-current font-black uppercase text-sm tracking-widest hover:bg-current hover:bg-opacity-5 transition-all flex items-center justify-center gap-2"><RefreshCw size={18} className={generating ? 'animate-spin' : ''} /> Random Lore</button>
          </div>
          {error && <div className="p-3 bg-red-900/20 border border-red-900 text-red-500 text-[10px] font-black uppercase text-center">{error}</div>}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-current border-opacity-10 rounded-xl relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {memeResult ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex flex-col items-center justify-center p-4 gap-4" key="result">
                <img src={memeResult} className="max-w-full max-h-[70vh] shadow-2xl border-4 border-white" alt="Result" />
                <a href={memeResult} download="cosbycoin_meme.png" className="px-6 py-2 bg-black text-white rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-700 transition-colors"><Download size={14} /> Download Protocol</a>
              </motion.div>
            ) : (
              <div className="text-center space-y-4 opacity-20" key="waiting">
                <ImagePlus size={64} className="mx-auto" />
                <p className="text-xs font-black uppercase tracking-widest italic">Awaiting AI Uplink...</p>
              </div>
            )}
          </AnimatePresence>
          {generating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white gap-4">
              <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><Zap size={48} className="fill-current text-yellow-400" /></motion.div>
              <p className="font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Calculating Defacement...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- X MOCKUP COMPONENT ---
const XPostMockup = ({ isCosbyMode, avatar, name, handle, text, image, link, stats }) => (
  <a href={link || "#"} target="_blank" rel="noopener noreferrer" className={`block rounded-xl border p-4 mb-4 transition-all hover:shadow-lg outline-none ${isCosbyMode ? 'bg-[#000000] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex-shrink-0">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-1">
          <span className={`font-bold text-sm truncate ${isCosbyMode ? 'text-white' : 'text-black'}`}>{name}</span>
          <div className="w-3.5 h-3.5 bg-[#1d9bf0] rounded-full flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-current"><path d="M22.25 12c0-5.66-4.59-10.25-10.25-10.25S1.75 6.34 1.75 12c0 5.66 4.59 10.25 10.25 10.25S22.25 17.66 22.25 12zM10.5 17l-5-5 1.41-1.41L10.5 14.17l7.09-7.09L19 8.5 10.5 17z"/></svg>
          </div>
        </div>
        <span className="text-gray-500 text-xs truncate">{handle}</span>
      </div>
      <div className="ml-auto flex-shrink-0"><Twitter size={16} className={isCosbyMode ? 'text-white' : 'text-black'} /></div>
    </div>
    <p className={`text-[13px] mb-3 leading-tight ${isCosbyMode ? 'text-gray-200' : 'text-gray-800'}`}>{text}</p>
    {image && <div className="rounded-2xl border border-gray-200 overflow-hidden mb-3"><img src={image} alt="Tweet Content" className="w-full h-auto object-cover" /></div>}
    <div className="flex items-center justify-between text-gray-500 px-1">
      <div className="flex items-center gap-1.5"><MessageCircle size={14} /> <span className="text-[11px]">{stats?.replies || '0'}</span></div>
      <div className="flex items-center gap-1.5"><Share2 size={14} /> <span className="text-[11px]">{stats?.retweets || '0'}</span></div>
      <div className="flex items-center gap-1.5"><Heart size={14} /> <span className="text-[11px]">{stats?.likes || '0'}</span></div>
    </div>
  </a>
);

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home');
  const [isHacked, setIsHacked] = useState(false);
  const [isCosbyMode, setIsCosbyMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [glitchText, setGlitchText] = useState("BITCOIN FORUM");
  const [ghosts, setGhosts] = useState([]);
  const [passingMemes, setPassingMemes] = useState([]);
  const [caCopied, setCaCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHacked(true), 1500);
    const popupTimer = setTimeout(() => setShowPopup(true), 5000);
    return () => { clearTimeout(timer); clearTimeout(popupTimer); };
  }, []);

  useEffect(() => {
    if (isHacked) {
      const phrases = ["COSBYCOIN HQ", "HISTORY RESTORED", "THE FIRST MEME"];
      let i = 0;
      const interval = setInterval(() => {
        setGlitchText(phrases[i % phrases.length]);
        i++;
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHacked]);

  useEffect(() => {
    if (!isCosbyMode || view !== 'home') {
      setGhosts([]);
      setPassingMemes([]);
      return;
    }
    const ghostInterval = setInterval(() => {
      const id = Date.now();
      const newGhost = {
        id,
        src: `cosby${Math.floor(Math.random() * 8) + 1}.jpg`,
        x: Math.random() * 80 + 5 + '%',
        y: Math.random() * 80 + 5 + '%',
        scale: Math.random() * 0.5 + 0.5,
      };
      setGhosts(prev => [...prev.slice(-5), newGhost]);
      setTimeout(() => setGhosts(prev => prev.filter(g => g.id !== id)), 4000);
    }, 2500);
    const memeInterval = setInterval(() => {
      const id = `meme-${Date.now()}`;
      const newMeme = {
        id,
        src: `cosby${Math.floor(Math.random() * 8) + 1}.jpg`,
        direction: Math.random() > 0.5 ? 'right' : 'left'
      };
      setPassingMemes(prev => [...prev.slice(-3), newMeme]);
      setTimeout(() => setPassingMemes(prev => prev.filter(m => m.id !== id)), 16000);
    }, 8000);
    return () => { clearInterval(ghostInterval); clearInterval(memeInterval); };
  }, [isCosbyMode, view]);

  const copyCA = () => {
    const el = document.createElement('textarea');
    el.value = OFFICIAL_CA;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCaCopied(true);
    setTimeout(() => setCaCopied(false), 2000);
  };

  if (view === 'generator') {
    return <MemeGenerator darkMode={isCosbyMode} onBack={() => setView('home')} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isCosbyMode ? 'bg-[#1a1b1e] text-white' : 'bg-[#e5e5e8] text-[#000000]'} font-sans antialiased overflow-x-hidden`}>
      <AnimatePresence>
        {isCosbyMode && (
          <>
            {ghosts.map(ghost => <CosbyGhost key={ghost.id} {...ghost} />)}
            {passingMemes.map(meme => <PassingMeme key={meme.id} {...meme} />)}
          </>
        )}
      </AnimatePresence>

      <div onClick={copyCA} className={`sticky top-0 z-[60] w-full text-center py-2.5 transition-all cursor-pointer select-none overflow-hidden ${isCosbyMode ? 'bg-red-700/90 backdrop-blur-md border-b border-white/20' : 'bg-[#2b506f] border-b border-black/20'}`}>
        <div className="flex items-center justify-center gap-3 font-black tracking-[0.15em] text-[10px] md:text-xs text-white">
          <motion.div animate={isCosbyMode ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}><Zap size={14} className="fill-current text-yellow-400" /></motion.div>
          <span className="opacity-70 uppercase">Official Protocol:</span>
          <span className="font-mono text-xs">{OFFICIAL_CA}</span>
          <span className={`bg-white/20 px-2 py-0.5 rounded text-[8px] transition-all ${caCopied ? 'bg-green-500 scale-110' : ''}`}>{caCopied ? 'COPIED!' : 'TAP TO COPY'}</span>
        </div>
      </div>

      <nav className="bg-[#2b506f] text-white text-[10px] py-2.5 px-4 flex flex-wrap justify-between items-center border-b border-[#1a3144] sticky top-[41px] z-40 shadow-lg">
        <div className="flex gap-4 sm:gap-6 font-bold uppercase tracking-wider">
          <a href="#" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"><Globe size={13} /> Home</a>
          <a href="https://web.archive.org/web/20111025203743/http://cosbycoin.org/" target="_blank" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"><History size={13} /> Archive (2011)</a>
          <a href="https://bitcointalk.org/index.php?topic=126798.0Link" target="_blank" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"><ShieldAlert size={13} /> The Hack Thread</a>
          <a href="https://www.itnews.com.au/news/bitcoin-forum-hacked-by-donor-271688" target="_blank" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"><FileText size={13} /> News Coverage</a>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <a href="https://twitter.com/i/communities/2011679304862580738" target="_blank" className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded hover:bg-black/60 transition-all border border-white/10"><Twitter size={12} fill="currentColor" /> X.COM</a>
          <span className="opacity-50 italic hidden lg:inline">Established Oct 25, 2011</span>
        </div>
      </nav>

      <header className="p-6 max-w-6xl mx-auto mt-4 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <motion.div animate={isHacked ? { rotate: [0, -4, 4, 0], scale: [1, 1.03, 1] } : {}} transition={{ duration: 0.6, repeat: isHacked ? Infinity : 0, repeatDelay: 4 }} className="relative group cursor-help">
              <img src="logo.png" alt="CosbyCoin Logo" className="w-24 h-24 md:w-40 md:h-40 object-contain drop-shadow-2xl grayscale hover:grayscale-0 transition-all duration-500" onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=CosbyCoin"; }} />
              {isHacked && <div className="absolute inset-0 bg-red-600/10 animate-pulse rounded-full" />}
            </motion.div>
            <div className="space-y-1">
              <h1 className={`text-4xl md:text-6xl font-black tracking-tighter flex flex-col leading-none ${isCosbyMode ? 'text-white' : 'text-[#2b506f]'}`}>
                <span className={`${isHacked ? 'line-through opacity-10 text-xl' : ''} transition-all duration-700`}>BITCOIN FORUM</span>
                <AnimatePresence>
                  {isHacked && <motion.span initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="text-red-600 italic flex items-center gap-3"><Terminal size={40} className="hidden sm:block" /> {glitchText}</motion.span>}
                </AnimatePresence>
              </h1>
              <p className={`text-sm md:text-lg italic font-medium max-w-md ${isCosbyMode ? 'text-gray-400' : 'text-gray-600'}`}>"The most important altcoin you've never heard of... until now."</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setIsCosbyMode(!isCosbyMode)} className={`px-8 py-4 rounded-sm font-black text-sm uppercase tracking-widest border-2 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none ${isCosbyMode ? 'bg-red-700 border-white text-white hover:bg-red-600' : 'bg-white border-[#2b506f] text-[#2b506f] hover:bg-gray-50'}`}>{isCosbyMode ? "Cosby Mode: Active" : "Restore History"}</button>
            <p className="text-[9px] text-center opacity-40 font-bold uppercase tracking-widest">Click to engage defacement</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24 mt-8 relative z-20">
        <section className={`border-4 p-1 mb-10 shadow-xl transition-all ${isCosbyMode ? 'bg-gray-900 border-red-900/50' : 'bg-[#f6f6f6] border-[#c4c4c4]'}`}>
          <div className="bg-[#55708b] text-white px-4 py-2 text-[11px] font-black uppercase flex justify-between items-center">
            <span>Official Status: Unauthorized Access Detected</span>
            <AlertTriangle size={16} className="text-yellow-400" />
          </div>
          <div className={`p-8 border-t-2 transition-colors ${isCosbyMode ? 'bg-black/40 border-gray-800' : 'bg-white border-[#c4c4c4]'}`}>
            <h2 className="text-3xl md:text-5xl font-black text-[#b52a2a] mb-6 uppercase italic">The 2011 "Pre-Doge" Legacy</h2>
            <div className={`space-y-6 text-base md:text-xl leading-relaxed font-medium ${isCosbyMode ? 'text-gray-300' : 'text-gray-800'}`}>
              <p>Before Dogecoin ever existed, there was <strong>CosbyCoin</strong>. In 2011, a Bitcointalk forum donor hijacked the site, replacing “Bitcoin” with “CosbyCoin” and swapping logos with Bill Cosby’s face.</p>
              <div className="py-6 px-10 border-l-8 border-red-600 bg-red-600/5 italic text-2xl md:text-3xl font-black text-red-700">"Bitcoin was turned into a meme on the site we get all of our lore from."</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col h-full min-h-[700px]">
            <h3 className={`text-2xl font-black border-b-4 pb-3 mb-6 flex items-center gap-3 italic ${isCosbyMode ? 'text-white border-white' : 'text-[#2b506f] border-[#2b506f]'}`}><MessageSquare size={28} /> Live Forum Reaction</h3>
            <div className={`flex-1 border-4 rounded-lg shadow-2xl relative overflow-hidden transition-all duration-500 ${isCosbyMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-[#c4c4c4]'}`}><ChatApp darkMode={isCosbyMode} /></div>
          </div>
          <div className="space-y-8">
            <div onClick={() => setView('generator')} className={`group cursor-pointer border-4 rounded-sm shadow-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 ${isCosbyMode ? 'bg-gray-900 border-red-900' : 'bg-white border-[#2b506f]'}`}>
              <div className="bg-red-700 text-white p-3 font-black text-xs uppercase flex items-center justify-between">
                <span>AI Meme Generator</span>
                <Sparkles size={14} />
              </div>
              <div className="relative aspect-video overflow-hidden">
                <img src="template.jpg" alt="Meme Template" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white text-black px-4 py-2 font-black text-xs uppercase italic">Launch Protocol</span>
                </div>
              </div>
              <div className="p-4 text-[10px] font-bold uppercase opacity-60">Generate professional Cosby lore using Gemini AI.</div>
            </div>
            <div className={`border-4 rounded-sm shadow-xl overflow-hidden transition-colors ${isCosbyMode ? 'bg-gray-900 border-gray-700' : 'bg-[#fdfdfd] border-[#c4c4c4]'}`}>
              <div className="bg-[#2b506f] text-white p-4 font-black text-sm uppercase shadow-md italic">Media Spotlight</div>
              <div className="p-4 space-y-4">
                {MEDIA_POSTS.map(post => (<XPostMockup key={post.id} isCosbyMode={isCosbyMode} {...post} />))}
              </div>
            </div>
            <div className={`border-4 rounded-sm shadow-xl overflow-hidden transition-colors ${isCosbyMode ? 'bg-gray-900 border-gray-700' : 'bg-[#f0f4f7] border-[#c4c4c4]'}`}>
              <div className="bg-[#2b506f] text-white p-4 font-black text-sm uppercase shadow-md italic">Evidence Vault</div>
              <div className="p-6 space-y-6">
                <EvidenceCard title="Terminology Index" desc="CosbyCoin remains the only altcoin ever officially listed on the Bitcointalk terminology page." link="https://bitcointalk.org/index.php?topic=2533.0" isCosbyMode={isCosbyMode} />
                <EvidenceCard title="The IT News Report" desc="Deep dive into how a frustrated donor turned the crypto world upside down in 2011." link="https://www.itnews.com.au/news/bitcoin-forum-hijacked-by-frustrated-donor-276685" isCosbyMode={isCosbyMode} />
              </div>
            </div>
            <div className={`p-6 shadow-xl border-l-8 border-red-600 transition-colors ${isCosbyMode ? 'bg-gray-950 text-gray-400' : 'bg-white text-gray-700'}`}>
              <h4 className="font-black flex items-center gap-2 mb-3 text-red-600 uppercase italic underline decoration-4 underline-offset-4 tracking-tighter text-xl"><Zap size={22} className="fill-current"/> Historical Impact</h4>
              <p className="text-sm font-medium leading-relaxed">The 2011 hack proved that narrative is more powerful than code. CosbyCoin is a historical artifact that broke the "pure" Bitcoin narrative years before memecoins were a category.</p>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto p-4">
            <div className="bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] p-1 shadow-2xl max-w-[360px] w-full">
              <div className="bg-[#000080] text-white flex justify-between items-center px-2 py-1 text-xs font-bold mb-1">
                <span className="flex items-center gap-2"><Terminal size={12}/> System Alert</span>
                <button onClick={() => setShowPopup(false)} className="bg-[#c0c0c0] text-black px-1.5 leading-none border border-black hover:bg-red-600 hover:text-white transition-colors">X</button>
              </div>
              <div className="bg-white border border-[#808080] p-6 flex flex-col items-center gap-6">
                <img src="popup.jpg" alt="Original Hack Coin" className="w-56 h-56 object-cover border-4 border-black" onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=History+Alert"; }} />
                <p className="text-[14px] font-black text-black uppercase text-center italic">"I have replaced your Bitcoin with history."</p>
                <button onClick={() => setShowPopup(false)} className="bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] px-12 py-3 text-sm font-black active:border-[#808080]">OK</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className={`text-center py-16 text-xs border-t-8 transition-colors ${isCosbyMode ? 'bg-black text-white/30 border-red-900' : 'bg-[#1a3144] text-white/50 border-[#0d1a24]'}`}>
        <p className="font-black uppercase tracking-[0.4em] text-sm">© 2011-2026 CosbyCoin Foundation. The Original Hijack.</p>
        <p className="mt-4 italic font-medium">"History cannot be moderated. Pudding cannot be stopped."</p>
      </footer>
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
};

const EvidenceCard = ({ title, desc, link, isCosbyMode }) => (
  <div className={`p-5 border-2 rounded shadow-sm hover:shadow-md transition-all ${isCosbyMode ? 'bg-black/40 border-gray-700 hover:border-red-600' : 'bg-white border-gray-200 hover:border-[#2b506f]'}`}>
    <h5 className={`font-black text-sm flex items-center justify-between gap-2 mb-3 uppercase italic ${isCosbyMode ? 'text-red-500' : 'text-[#2b506f]'}`}>{title} <ExternalLink size={16} /></h5>
    <p className={`text-[12px] mb-4 leading-relaxed font-medium ${isCosbyMode ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
    <a href={link} target="_blank" rel="noopener noreferrer" className={`text-xs font-black uppercase tracking-widest hover:underline decoration-2 ${isCosbyMode ? 'text-white' : 'text-blue-700'}`}>Verify the Truth →</a>
  </div>
);

export default App;