import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo 
} from 'react';

import { initializeApp, getApps, getApp } from 'firebase/app';

import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';

import { 
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';

import {
  Copy,
  ShieldCheck,
  Shield,
  Send,
  SendHorizontal,
  Moon,
  Sun,
  Image as ImageIcon,
  Download,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Cpu,
  MoveRight,
  X,
  Maximize2,
  Zap,
  Users,
  Terminal,
  Volume2,
  VolumeX,
  SkipForward,
  Settings,
  Palette,
  LogOut,
  Quote,
  Reply,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Check,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';


// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyB_gNokFnucM2nNAhhkRRnPsPNBAShYlMs",
  authDomain: "it-token.firebaseapp.com",
  projectId: "it-token",
  storageBucket: "it-token.firebasestorage.app",
  messagingSenderId: "804328953904",
  appId: "1:804328953904:web:e760545b579bf2527075f5"
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const appId = 'it-token-os';

const apiKey = (() => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_GEMINI) return import.meta.env.VITE_APP_GEMINI;
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env?.VITE_APP_GEMINI) return process.env.VITE_APP_GEMINI;
  } catch (e) {}
  try {
    if (typeof window !== 'undefined' && window.VITE_APP_GEMINI) return window.VITE_APP_GEMINI;
  } catch (e) {}
  return typeof __apiKey !== 'undefined' ? __apiKey : "";
})();

const AVATAR_LIST = [
  { id: 'pepe', name: 'PEPE', url: '/pfps/pepe.jpg' },
  { id: 'doge', name: 'DOGE', url: '/pfps/doge.jpg' },
  { id: 'wif', name: 'WIF', url: '/pfps/wif.jpg' },
  { id: 'wojak', name: 'WOJAK', url: '/pfps/wojak.jpg' },
  { id: 'bonk', name: 'DETECTIVE', url: '/pfps/detective.jpg' },
  { id: 'mask', name: 'MASK', url: '/pfps/mask.jpg' },
];

const COLOR_LIST = [
  { id: 'emerald', hex: '#10b981', label: 'NEON_EMERALD' },
  { id: 'blue', hex: '#3b82f6', label: 'CYBER_BLUE' },
  { id: 'pink', hex: '#ec4899', label: 'HOT_PINK' },
  { id: 'gold', hex: '#f59e0b', label: 'LIQUID_GOLD' },
  { id: 'purple', hex: '#a855f7', label: 'VOID_PURPLE' },
  { id: 'white', hex: '#ffffff', label: 'PURE_SIGNAL' },
];

const CHAT_PLAYLIST = [
  { title: "GET_IT_STARTED", file: "GET_IT_STARTED.mp3" },
  { title: "PUMP_IT", file: "https://firebasestorage.googleapis.com/v0/b/it-token.firebaseapp.com/o/music%2Fpump_it.mp3?alt=media&token=050c599d-1894-494d-b380-d14b51405d6c" },
  { title: "PUMP_IT_UP", file: "PUMP_IT_UP.mp3" },
  { title: "PUMP_IT_UP_00", file: "https://firebasestorage.googleapis.com/v0/b/it-token.firebaseapp.com/o/music%2Fpump_it_up2.mp3?alt=media&token=d14da2fe-ba13-40bc-8fc2-055b7a46b23c" },
  { title: "LA_LA_LA", file: "https://firebasestorage.googleapis.com/v0/b/it-token.firebaseapp.com/o/music%2FLALALA.mp3?alt=media&token=11a3bc8c-8498-458a-92b8-140d18575228" },
  { title: "BIG_DAWGS", file: "https://firebasestorage.googleapis.com/v0/b/it-token.firebaseapp.com/o/music%2Fbig_dawgs.mp3?alt=media&token=69bdcaa4-8283-4379-9516-93323bd61f43" },
  { title: "DILIH", file: "https://firebasestorage.googleapis.com/v0/b/it-token.firebaseapp.com/o/music%2FDILIH.mp3?alt=media&token=3694cbb2-0da0-42af-9c90-7c7457b890e9" },
  { title: "BEAT_IT", file: "https://firebasestorage.googleapis.com/v0/b/it-token.firebaseapp.com/o/music%2Fbeat_it.mp3?alt=media&token=9069b2e4-44bc-4f8d-b119-e5b324b24700" },
  { title: "CANT_HOLD_US", file: "https://firebasestorage.googleapis.com/v0/b/it-token.firebaseapp.com/o/music%2Fcant_hold_us.mp3?alt=media&token=e20bbdc8-df20-41a3-b1aa-4ab9bf59019b" },
  { title: "MEME_IT", file: "MEME_IT.mp3" }
];

const ChatApp = ({ db, auth, appId, darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");
  const [userColor, setUserColor] = useState(COLOR_LIST[0].hex);
  const [userAvatar, setUserAvatar] = useState(AVATAR_LIST[5].url);
  const [isSetup, setIsSetup] = useState(false);
  const [user, setUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [copiedCA, setCopiedCA] = useState(false);

  const scrollRef = useRef(null);
  const audioRef = useRef(null);
  const adminRef = useRef(null);
  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const CA_ADDRESS = "0xRIGHT_COIN_CONTRACT_ADDRESS_TBA";

  // 1. Auth Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
    });
    
    const savedName = localStorage.getItem('right_alias');
    if (savedName) {
      setUsername(savedName);
      setUserColor(localStorage.getItem('right_color') || COLOR_LIST[0].hex);
      setUserAvatar(localStorage.getItem('right_avatar') || AVATAR_LIST[5].url);
      setIsSetup(true);
    }
    return () => unsubscribe();
  }, [auth]);

  // 2. Database Listener
  useEffect(() => {
    if (!user || !db) return;
    const msgCollection = collection(db, 'artifacts', appId, 'public', 'data', 'trollbox_messages');
    
    const unsubscribe = onSnapshot(msgCollection, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        let ts = data.timestamp?.toDate ? data.timestamp.toDate().getTime() : (data.timestamp || Date.now());
        return { id: doc.id, ...data, _sortTs: ts };
      });
      
      const sorted = msgs.sort((a, b) => a._sortTs - b._sortTs);
      setMessages(sorted.slice(-100)); 
    });

    return () => unsubscribe();
  }, [user, db, appId]);

  // 3. Audio logic
  useEffect(() => {
    if (!isSetup || isMuted || !CHAT_PLAYLIST[trackIndex]) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    const track = CHAT_PLAYLIST[trackIndex];
    if (!audioRef.current) {
      audioRef.current = new Audio(track.file);
      audioRef.current.volume = 0.2;
    } else if (audioRef.current.src !== track.file) {
      audioRef.current.src = track.file;
    }
    audioRef.current.play().catch(() => setIsMuted(true));
    audioRef.current.onended = () => setTrackIndex((prev) => (prev + 1) % CHAT_PLAYLIST.length);
  }, [isSetup, isMuted, trackIndex]);

  const scrollToBottom = (behavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 300);
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  const handleReaction = async (msgId, emoji) => {
    setContextMenu(null);
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
        text,
        uid: user.uid,
        user: username,
        color: userColor,
        avatar: userAvatar,
        replyTo: reply ? { user: reply.user, text: reply.text } : null,
        timestamp: serverTimestamp(),
        reactions: { heart: 0, up: 0 }
      });
      setTimeout(() => scrollToBottom(), 150);
    } catch (err) {
      setError("Send failed");
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleJoin = () => {
    if (username.length < 2) return setError("Name too short");
    localStorage.setItem('right_alias', username);
    localStorage.setItem('right_color', userColor);
    localStorage.setItem('right_avatar', userAvatar);
    setIsSetup(true);
    setIsMuted(false);
  };

  const handleTouchStart = (e, msg) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ x: e.touches[0].clientX, y: e.touches[0].clientY, msg });
    }, 600);
  };

  const handleTouchMove = (e) => {
    const moveX = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const moveY = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (moveX > 10 || moveY > 10) clearTimeout(longPressTimer.current);
  };

  if (!isSetup) {
    const isNewUser = !localStorage.getItem('right_alias');
    return (
      <div className="flex flex-col items-end w-full animate-fade-in font-mono">
        <div className={`w-full p-8 border-2 border-dashed flex flex-col gap-8 ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}>
          <div className="text-right space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic">{isNewUser ? 'Choose your look' : 'Update appearance'}</h4>
            <input value={username} onChange={(e) => setUsername(e.target.value.toUpperCase())} placeholder="YOUR_NAME" disabled={!isNewUser} className={`w-full bg-transparent border-b-2 border-current py-4 text-right outline-none text-2xl font-black italic tracking-tighter ${!isNewUser ? 'opacity-30' : ''}`} />
          </div>
          <div className="space-y-4">
             <span className="text-[8px] font-black uppercase tracking-widest opacity-30 block text-right">Choose Avatar</span>
             <div className="grid grid-cols-6 gap-2">
                {AVATAR_LIST.map(av => (
                  <button key={av.id} onClick={() => setUserAvatar(av.url)} className={`aspect-square border-2 transition-all ${userAvatar === av.url ? 'border-current scale-110' : 'border-transparent opacity-30 hover:opacity-100'}`}><img src={av.url} className="w-full h-full object-cover pointer-events-none" alt="" /></button>
                ))}
             </div>
          </div>
          <div className="space-y-4">
             <span className="text-[8px] font-black uppercase tracking-widest opacity-30 block text-right">Theme Color</span>
             <div className="flex justify-end gap-3">
                {COLOR_LIST.map(c => (
                  <button key={c.id} onClick={() => setUserColor(c.hex)} className={`w-6 h-6 rounded-full border-2 transition-all ${userColor === c.hex ? 'border-white scale-125' : 'border-transparent opacity-40'}`} style={{ backgroundColor: c.hex }} />
                ))}
             </div>
          </div>
          <button onClick={handleJoin} className="w-full py-4 bg-current text-current-bg font-black uppercase text-xs tracking-[0.4em] hover:opacity-80 transition-all">{isNewUser ? 'Join' : 'Save'}</button>
          {error && <p className="text-red-500 text-[9px] uppercase font-black text-right">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[600px] animate-fade-in font-mono relative select-none" onClick={() => { setContextMenu(null); setActiveMenu(null); }}>
      <div className={`sticky top-0 z-[60] w-full px-4 py-2 border-b flex items-center justify-between backdrop-blur-md cursor-pointer transition-colors ${darkMode ? 'bg-black/80 border-white/10 hover:bg-white/5' : 'bg-white/80 border-black/5 hover:bg-black/5'}`} onClick={() => adminRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="text-[8px] font-black text-[#f59e0b] uppercase tracking-widest italic animate-pulse flex items-center gap-2"><ShieldAlert size={10}/> Pinned CA</span>
          <span className="text-[7px] opacity-40 truncate px-4 font-bold">{CA_ADDRESS}</span>
          <Copy size={10} className="opacity-20" />
      </div>
      <div className={`flex justify-between items-center p-3 border-b mb-2 ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
         <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="opacity-40 hover:opacity-100">{isMuted ? <VolumeX size={16}/> : <Volume2 size={16} className="text-green-500 animate-pulse" />}</button>
            <button onClick={(e) => { e.stopPropagation(); setTrackIndex(p => (p + 1) % CHAT_PLAYLIST.length); }} className="opacity-20 hover:opacity-100"><SkipForward size={14}/></button>
            <div className="text-[8px] uppercase tracking-widest opacity-20 truncate max-w-[100px] ml-2">{isMuted ? 'Muted' : CHAT_PLAYLIST[trackIndex]?.title}</div>
         </div>
         <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu ? null : 'settings'); }} className="opacity-40 hover:opacity-100"><Settings size={16}/></button>
      </div>
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar relative scroll-smooth">
        {/* PERMANENT ADMIN SIGNAL - Now styled as a standard chat item but with unique style */}
        <div ref={adminRef} className="flex flex-col items-start animate-fade-in w-full mb-4">
           <div className="flex items-center gap-2 mb-1">
              <img src="/pfps/mask.jpg" className="w-4 h-4 object-cover rounded-sm border border-[#f59e0b]/30" alt="" />
              <span className="text-[8px] font-black uppercase tracking-tighter text-[#f59e0b]">Admin</span>
              <span className="text-[7px] opacity-20 uppercase font-black">[Official]</span>
           </div>
           <div className={`relative px-4 py-3 max-w-[85%] border-r-4 text-xs font-bold transition-all shadow-md cursor-pointer border-[#f59e0b] ${darkMode ? 'bg-[#f59e0b]/5 text-[#f59e0b] shadow-[#f59e0b]/5' : 'bg-[#f59e0b]/10 text-amber-900 shadow-amber-900/5'}`} onClick={() => copyToClipboard(CA_ADDRESS)}>
              <div className="text-[7px] opacity-40 mb-1 italic uppercase">Important Announcement</div>
              <p className="break-words whitespace-pre-wrap leading-relaxed">Official Contract Address: {CA_ADDRESS}</p>
              <div className="mt-2 flex items-center gap-2 opacity-40 text-[7px] font-black uppercase">
                 {copiedCA ? <><Check size={8} /> Copied</> : <><Copy size={8}/> Tap to copy</>}
              </div>
           </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.uid === user?.uid;
          const hasReactions = msg.reactions && Object.values(msg.reactions).some(v => v > 0);
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in group/msg`} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, msg }); }} onTouchStart={(e) => handleTouchStart(e, msg)} onTouchMove={handleTouchMove} onTouchEnd={() => clearTimeout(longPressTimer.current)} onDoubleClick={() => handleReaction(msg.id, 'heart')}>
              <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}><img src={msg.avatar} className="w-4 h-4 object-cover opacity-60 rounded-sm" alt="" /><span className="text-[8px] font-black uppercase tracking-tighter opacity-60" style={{ color: msg.color }}>{msg.user}</span></div>
              <div className={`relative px-4 py-3 max-w-[85%] border-r-4 text-xs font-bold transition-all shadow-sm ${isMe ? (darkMode ? 'bg-white text-black border-white shadow-white/5' : 'bg-black text-white border-black shadow-black/5') : (darkMode ? 'bg-white/5 text-white border-white/20' : 'bg-black/5 text-black border-black/10')}`}>
                 {msg.replyTo && (
                   <div className="text-[7px] opacity-40 mb-2 border-l-2 border-current pl-2 truncate italic bg-current bg-opacity-5 p-1">
                      Replied to {msg.replyTo.user}: "{msg.replyTo.text}"
                   </div>
                 )}
                 <p className="break-words whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              {hasReactions && <div className={`flex gap-2 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>{Object.entries(msg.reactions).map(([key, count]) => count > 0 && <button key={key} onClick={(e) => { e.stopPropagation(); handleReaction(msg.id, key); }} className="bg-current bg-opacity-10 px-2 py-1 rounded-full text-[8px] flex items-center gap-1 font-black shadow-sm transition-all hover:scale-110 active:scale-125">{key === 'heart' ? '❤️' : '👌'} <span>{count}</span></button>)}</div>}
            </div>
          );
        })}
      </div>
      {showScrollDown && (
        <button onClick={() => scrollToBottom()} className={`absolute bottom-24 right-6 z-[70] p-3 rounded-full shadow-2xl animate-bounce hover:opacity-80 transition-opacity ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
           <ChevronDown size={20} strokeWidth={3}/>
        </button>
      )}
      {contextMenu && (
        <div className={`fixed z-[1000] p-1 border-2 shadow-2xl min-w-[140px] animate-scale-up ${darkMode ? 'bg-[#080808] border-white/10' : 'bg-white border-black/5'}`} style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: Math.min(contextMenu.x, window.innerWidth - 150) }} onClick={e => e.stopPropagation()}>
           <button onClick={() => { setReplyingTo(contextMenu.msg); setContextMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase hover:bg-current hover:text-current-bg transition-colors"><Reply size={12}/> Reply</button>
           <div className="h-[1px] w-full opacity-10 bg-current my-1" /><div className="flex p-1 gap-1">
              <button onClick={() => handleReaction(contextMenu.msg.id, 'heart')} className="flex-1 p-2 hover:bg-current hover:text-current-bg transition-colors flex justify-center text-xs">❤️</button>
              <button onClick={() => handleReaction(contextMenu.msg.id, 'up')} className="flex-1 p-2 hover:bg-current hover:text-current-bg transition-colors flex justify-center text-xs">👌</button>
           </div>
        </div>
      )}
      {activeMenu === 'settings' && (
        <div className={`absolute top-12 right-4 z-[90] p-4 border-2 shadow-2xl flex flex-col gap-4 animate-fade-in ${darkMode ? 'bg-[#080808] border-white/10 text-white' : 'bg-white border-black/5 text-black'}`}>
           <button onClick={() => { setIsSetup(false); setActiveMenu(null); }} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"><Palette size={14}/> Change Appearance</button>
           <div className={`h-[1px] w-full opacity-10 bg-current`} /><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"><LogOut size={14}/> Log Out</button>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-current border-opacity-5 relative z-[80]">
        {replyingTo && <div className="flex justify-between items-center bg-current bg-opacity-5 p-2 mb-2 border-r-4 border-current animate-fade-in"><span className="text-[8px] uppercase font-black italic opacity-60 truncate pr-6">Replying to {replyingTo.user}</span><X size={10} className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => setReplyingTo(null)} /></div>}
        <form onSubmit={handleSend} className="flex gap-2"><input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isSending ? "Sending..." : "Say something..."} disabled={isSending} className={`flex-1 bg-transparent border-b-2 py-3 px-2 text-right outline-none text-[11px] font-black italic transition-all ${darkMode ? 'border-white/10 focus:border-white text-white' : 'border-black/10 focus:border-black text-black'}`} /><button type="submit" disabled={!inputText.trim() || isSending} className={`p-3 border transition-all ${darkMode ? 'border-white/10 hover:bg-white hover:text-black' : 'border-black/10 hover:border-black hover:text-white'} disabled:opacity-20`}><SendHorizontal size={18} /></button></form>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
    </div>
  );
};


const App = () => {
  const [view, setView] = useState('home'); 
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showXNote, setShowXNote] = useState(false);
  const [logoPulse, setLogoPulse] = useState(false);
  const ca = "0xRIGHT_COIN_CONTRACT_ADDRESS_TBA";

  // AI State Logic
  const [uploadImage, setUploadImage] = useState(null);
  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const copyToClipboard = (textToCopy) => {
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      if (document.execCommand('copy')) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogoClick = () => {
    setLogoPulse(true);
    setTimeout(() => {
      setLogoPulse(false);
      setView('home');
    }, 600);
  };

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
      console.error("Template fetch failed", e);
      return null;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const architectMeme = async () => {
    if (!uploadImage || !apiKey) {
      if (!apiKey) setError("Missing API configuration.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    const base64Data = uploadImage.split(',')[1];
    
    try {
      const templateBase64 = await getBase64FromUrl('blank.jpg');
      
      const prompt = `Perform an Artistic Right Correction:
      1. Reference Image 1 (User Meme) and Image 2 (Wide Template).
      2. Use Image 2 as your rigid canvas for the final output size and ratio.
      3. EXTRACT ONLY THE MAIN SUBJECT from Image 1. 
      4. RE-DRAW the entire background of Image 1 on the Image 2 canvas in a messy, hand-drawn digital sketch style. It should feel artistic and sketchy, not a photo. and must fill the whole frame. 
      5. SHRINK the extracted subject from Image 1 a bit, only if it is too big. 
      6. PLACE this subject at the absolute far-right edge of the new sketchy canvas.
      7. Leave the remaining 70%% of the image to the left completely empty of subjects, showing only the simplified sketchy background.

      8. On top of the newly drawn background, add a small, hand-written, sketchy text element that feels naturally placed in the composition.
The text must include the word “right”, but must never be the same phrase twice.
Generate a short powerful positive quote that subtly responds to the subject’s pose, mood, or context in the image.
Use imperfect, ugly handwriting with hand-drawn energy, artsy and organic, matching the background’s color palette and texture.
The placement should feel accidental yet intentional — like it was scribbled by a human after looking at the image.
If the generated quote does not sound natural when read aloud, regenerate it.

      9. The goal is to make the subject look like they are fleeing to the far right. The final output must be a panoramic 4:1 artifact. 
      10. NO BORDER. IT IS CRUCIAL THAT THE OUPUT SIZE IS IMAGE 2 SIZE (WIDE TEMPLATE). 
      
      `;

      const fetchWithRetry = async (retries = 5, delay = 1000) => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt }, 
                { inlineData: { mimeType: "image/png", data: base64Data } },
                { inlineData: { mimeType: "image/png", data: templateBase64 } }
              ]
            }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
          })
        });

        if (!response.ok) throw new Error("Signal Disrupted");
        const result = await response.json();
        const base64Image = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
        
        if (base64Image) setGeneratedMeme(`data:image/png;base64,${base64Image}`);
        else throw new Error("Incomplete Signal");
      };

      await fetchWithRetry();
    } catch (err) {
      setError("Void timeout. Signal lost. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadArtifact = () => {
    if (!generatedMeme) return;
    const link = document.createElement('a');
    link.href = generatedMeme;
    link.download = 'right_artifact.png';
    link.click();
  };

  const HomeView = () => (
    <div className="animate-fade-in flex flex-col items-end w-full">
      <header className="flex flex-col items-end pt-12 mb-12 group cursor-pointer">
        <div className="relative mb-8" onClick={handleLogoClick}>
          <img 
            src="logo.png" 
            alt="Logo" 
            className={`w-20 h-20 object-contain transition-all duration-500 transform active:scale-90 ${logoPulse ? 'scale-110 rotate-[25deg] filter brightness-150' : 'group-hover:scale-110 group-hover:-rotate-6'}`} 
          />
        </div>
        <h2 className="text-2xl font-black tracking-tighter leading-[0.9] uppercase italic transition-all duration-500 group-hover:opacity-70">
          made for the <br/>right people
        </h2>
        <div className="h-1.5 w-12 bg-current mt-5 transition-all duration-700 group-hover:w-full" />
      </header>

      <main className="flex flex-col items-end space-y-12 mb-20 w-full">
        <div className="space-y-1 flex flex-col items-end font-mono text-right">
          <p className="text-[14px] font-bold tracking-tight italic opacity-80 transition-all hover:translate-x-[-4px]">quietly built.</p>
          <p className="text-[14px] font-bold tracking-tight italic opacity-60 transition-all hover:translate-x-[-4px]">slowly found.</p>
          <p className="text-[14px] font-bold tracking-tight italic opacity-40 transition-all hover:translate-x-[-4px]">rightfully held.</p>
          
          <div className="flex flex-col items-end gap-3 mt-10">
            <button 
              onClick={() => setView('world')}
              className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] px-6 py-3 border border-current hover:bg-current hover:text-current-bg transition-all ${darkMode ? 'border-white/20 hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-black/20 hover:bg-black hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.05)]'}`}
            >
              Make things right <MoveRight size={14} />
            </button>
            <button 
              onClick={() => setView('community')}
              className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] px-6 py-3 border border-current hover:bg-current hover:text-current-bg transition-all ${darkMode ? 'border-white/20 hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-black/20 hover:bg-black hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.05)]'}`}
            >
              Right Community <Users size={14} />
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col items-end space-y-10 group/asset overflow-hidden">
          <div className="text-right w-full overflow-hidden relative">
            <span className={`absolute top-0 right-0 text-[clamp(1.5rem,8vw,3rem)] font-black italic tracking-tighter leading-none opacity-5 transition-all duration-700 group-hover:translate-x-4 group-hover:-translate-y-2 max-w-full truncate`}>RIGHTCOIN</span>
            <span className="relative z-10 text-[clamp(1rem,8vw,1.5rem)] font-black italic tracking-tighter leading-none select-all block transition-all hover:tracking-normal max-w-full truncate">RIGHTCOIN</span>
            <span className="relative z-10 text-[clamp(0.4rem,8vw,0.9rem)] font-light italic tracking-tighter leading-none select-all block transition-all hover:tracking-normal max-w-full truncate">built for the conviction of the few</span>
            <div className="h-[1px] w-full bg-current mt-4 opacity-10" />
          </div>

          <div className="flex flex-col items-end group/ca w-full">
            <span className={`text-[8px] font-black uppercase tracking-[0.4em] mb-3 italic opacity-40`}>Contract Address</span>
            <div onClick={() => copyToClipboard(ca)} className={`w-full cursor-pointer border-r-4 py-4 px-6 transition-all flex items-center justify-between ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'}`}>
              <div className="transition-transform group-hover/ca:rotate-12">
                {copied ? <ShieldCheck size={18} className="text-green-500" /> : <Copy size={18} className="opacity-20" />}
              </div>
              <span className="font-mono text-[11px] tracking-tighter opacity-40 group-hover/ca:opacity-100 uppercase truncate ml-4">{copied ? "COPIED" : ca.slice(0, 18) + "..."}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-700 flex justify-end font-sans selection:bg-current selection:text-current relative overflow-hidden ${darkMode ? 'bg-[#080808] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] ${darkMode ? 'grid-white' : 'grid-black'}" />
      <div className="fixed inset-0 noise-overlay opacity-[0.04] pointer-events-none" />

      <div className={`w-full max-w-md md:max-w-sm lg:max-w-[340px] flex flex-col p-8 md:p-12 lg:p-14 text-right relative z-10 border-l ${darkMode ? 'border-white/5 bg-black/40 shadow-2xl' : 'border-black/5 bg-white/40 shadow-xl'} overflow-y-auto no-scrollbar scroll-smooth`}>
        
        {view === 'home' ? (
          <HomeView />
        ) : (
          <div className="animate-fade-in flex flex-col items-end w-full">
            <header className="w-full mb-10 flex flex-col items-end">
              <div className="w-full flex justify-between items-center mb-8">
                <button 
                  onClick={() => setView('home')} 
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity"
                >
                  <ArrowLeft size={12} /> Back
                </button>
                <img 
                  src="logo.png" 
                  alt="Logo" 
                  onClick={handleLogoClick}
                  className={`w-8 h-8 object-contain cursor-pointer transition-transform duration-300 ${logoPulse ? 'scale-125 rotate-12' : 'hover:scale-110'}`} 
                />
              </div>
              <h3 className="text-3xl font-black italic uppercase border-r-8 border-current pr-4 leading-[0.8]">
                {view === 'world' ? 'Make Things\nRight' : 'Right\nCommunity'}
              </h3>
            </header>

            {view === 'world' ? (
              <div className="w-full space-y-16">
                <div className="space-y-6 flex flex-col items-end w-full">
                  <div className="flex items-center gap-2 opacity-30 text-[9px] font-black uppercase tracking-widest"><Cpu size={12} /> Rightify</div>
                  <div className="w-full space-y-6">
                    <label className={`w-full h-40 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'}`}>
                      {uploadImage && <img src={uploadImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="" />}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <ImageIcon size={20} className="opacity-40" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 text-center">Load Meme</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    
                    {/* Make it right button - Persistent Visibility, Explicit Colors */}
                    <button 
                      onClick={architectMeme} 
                      disabled={!uploadImage || isGenerating} 
                      className={`w-full py-4 font-black uppercase text-[10px] tracking-[0.5em] disabled:opacity-30 active:translate-y-1 transition-all ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
                    >
                      {isGenerating ? <><RefreshCw size={14} className="animate-spin inline mr-2" /> Processing...</> : "Make it right"}
                    </button>
                    
                    {error && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest">{error}</p>}
                    
                    {generatedMeme && (
                      <div className="space-y-4 animate-fade-in flex flex-col items-end w-full group">
                        <div className="relative cursor-zoom-in w-full" onClick={() => setShowModal(true)}>
                          <img src={generatedMeme} className={`w-full h-auto border-r-8 border-current shadow-2xl transition-all duration-700 grayscale group-hover:grayscale-0 ${darkMode ? 'border-white' : 'border-black'}`} alt=""/>
                          <div className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 size={14} className="text-white" /></div>
                        </div>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          downloadArtifact();
                        }} className="mt-4 text-[9px] font-black uppercase border-b border-current pb-1 opacity-40 hover:opacity-100 transition-opacity">Save</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <ChatApp db={db} auth={auth} appId={appId} darkMode={darkMode} />
            )}
          </div>
        )}

        <footer className="flex flex-col items-end gap-12 mt-auto pb-6 pt-20">
          <button onClick={() => setDarkMode(!darkMode)} className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20 hover:opacity-100 transition-opacity flex items-center gap-2">
            {darkMode ? <Sun size={12}/> : <Moon size={12}/>} Mode
          </button>
          
          <div className={`flex flex-col items-end text-right border-r-[8px] pr-6 transition-all duration-1000 border-current border-opacity-10`}>
            <p className="text-[18px] md:text-[22px] font-mono font-black italic tracking-tight leading-none mb-2">IF YOU’RE HERE,</p>
            <p className="text-[18px] md:text-[22px] font-mono font-black italic tracking-tight leading-none">YOU ALREADY KNOW WHY.</p>
          </div>
          
          <div className="flex gap-10">
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="hover:scale-150 transition-all duration-500 opacity-40 hover:opacity-100">
              <Zap size={22} fill="currentColor" stroke="none" />
            </a>
            <button onClick={() => setShowXNote(true)} className="hover:scale-150 transition-all duration-500 opacity-40 hover:opacity-100">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-[1px] w-16 opacity-20 bg-current" />
             <span className="text-[9px] font-black uppercase tracking-[1.5em] opacity-10 font-mono">RIGHT</span>
          </div>
        </footer>
      </div>

      {showXNote && (
        <div className="fixed inset-0 z-[110] flex justify-end backdrop-blur-md bg-black/40 p-4 md:p-12" onClick={() => setShowXNote(false)}>
           <div className={`w-full max-w-sm h-fit my-auto p-10 border-r-[12px] shadow-2xl animate-scale-up ${darkMode ? 'bg-black border-white/20 text-white' : 'bg-white border-black/10 text-black'}`} onClick={e => e.stopPropagation()}>
              <X size={20} className="mb-8 cursor-pointer opacity-40 hover:opacity-100" onClick={() => setShowXNote(false)}/>
              <h4 className="text-xl font-black uppercase italic mb-6">X // Signal_Update</h4>
              <p className="text-sm font-bold opacity-60 leading-relaxed">Right People will make the right community for this coin.</p>
              <div className="h-[1px] w-20 bg-current opacity-20 mt-8" />
           </div>
        </div>
      )}

      {showModal && generatedMeme && (
        <div className="fixed inset-0 z-[100] flex justify-end backdrop-blur-xl bg-black/60 p-4 md:p-12 lg:p-24" onClick={() => setShowModal(false)}>
           <div className="w-full max-w-5xl h-fit my-auto bg-black border-r-[24px] border-white/10 p-4 shadow-2xl relative animate-scale-up" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowModal(false)} className="absolute -top-12 right-0 text-white/40 uppercase font-black text-[10px] tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                Close <X size={14}/>
              </button>
              <img src={generatedMeme} className="w-full h-auto" alt="" />
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: translateX(30px) scale(0.98); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .rc-spin-slow { animation: rc-spin 45s linear infinite; transform-origin: center; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .noise-overlay { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        body::-webkit-scrollbar, .no-scrollbar::-webkit-scrollbar { display: none; }
        body, .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; cursor: crosshair; }
        .text-current-bg { color: ${darkMode ? '#080808' : '#fcfcfc'}; }
      `}} />
    </div>
  );
};

export default App;