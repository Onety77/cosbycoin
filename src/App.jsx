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
  Volume2,
  VolumeX,
  SkipForward
} from 'lucide-react';

// --- CONFIGURATION ---
// Using environment variables as required for the execution environment
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

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- CHAT COMPONENT ---
const ChatApp = ({ darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); 
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
  const CA_INTERNAL = "3vsKvFYRbn5Mrfk5mJsxEDto2UwmrcWtqvC5o7SYpump";

  // RULE 3 - Mandatory Auth Pattern
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

  // Sync Messages with Auth Guard
  useEffect(() => {
    if (!user || !db) return;
    
    // Path: /artifacts/{appId}/public/data/{collectionName}
    const msgCollection = collection(db, 'artifacts', appId, 'public', 'data', 'trollbox_messages');
    
    // RULE 2 - Simple collection query with in-memory sorting
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
      setError("Uplink failed. Check connection."); 
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
          <p className="text-[10px] opacity-50 uppercase mt-1">Establishing Forum Node...</p>
        </div>
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value.toUpperCase())} 
              placeholder="ALIAS" 
              className={`w-full bg-transparent border-b-2 border-current py-3 outline-none text-2xl font-black italic tracking-tighter transition-all ${darkMode ? 'focus:border-white' : 'focus:border-black'}`}
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase opacity-40 block mb-3 tracking-widest">Avatar Selection</span>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_LIST.map(av => (
                <button key={av.id} onClick={() => setUserAvatar(av.url)} className={`aspect-square border-2 transition-all p-0.5 ${userAvatar === av.url ? 'border-red-600 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                  <img src={av.url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase opacity-40 block mb-3 tracking-widest">Color Signature</span>
            <div className="flex gap-3">
              {COLOR_LIST.map(c => (
                <button key={c.id} onClick={() => setUserColor(c.hex)} className={`w-8 h-8 rounded-full border-2 transition-all ${userColor === c.hex ? 'border-white scale-125 shadow-md' : 'border-transparent opacity-40'}`} style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleJoin} className="w-full py-4 bg-red-700 text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-red-600 transition-all mt-6 shadow-xl border border-white/10 italic">
          Join the Protest
        </button>
        {error && <p className="text-red-500 text-[10px] uppercase font-black mt-4 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full font-mono relative select-none" onClick={() => { setContextMenu(null); setActiveMenu(null); }}>
      <div className="bg-black text-white px-4 py-2 flex items-center justify-between border-b border-white/10">
        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic animate-pulse flex items-center gap-2">
          <ShieldAlert size={12}/> HACK_LIVE
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 cursor-pointer group" onClick={() => copyToClipboard(CA_INTERNAL)}>
            <span className="text-[9px] opacity-40 group-hover:opacity-100 uppercase tracking-tighter transition-opacity">CA: {CA_INTERNAL.slice(0, 10)}...</span>
            <Copy size={10} className={`${copiedCA ? 'text-green-500' : 'opacity-20'}`} />
          </div>
          <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu ? null : 'settings'); }} className="opacity-40 hover:opacity-100 transition-opacity"><Settings size={14}/></button>
        </div>
      </div>

      <div 
        ref={scrollRef} 
        onScroll={(e) => { const { scrollTop, scrollHeight, clientHeight } = e.currentTarget; setShowScrollDown(scrollHeight - scrollTop - clientHeight > 300); }}
        className={`flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar scroll-smooth relative ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}
      >
        {messages.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-2">
            <Terminal size={40} />
            <p className="text-[10px] uppercase tracking-widest">Listening for signals...</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.uid === user?.uid;
          const hasReactions = msg.reactions && Object.values(msg.reactions).some(v => v > 0);
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in group/msg`}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, msg }); }}
              onTouchStart={(e) => { touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; longPressTimer.current = setTimeout(() => { setContextMenu({ x: e.touches[0].clientX, y: e.touches[0].clientY, msg }); }, 600); }}
              onTouchMove={(e) => { if (Math.abs(e.touches[0].clientX - touchStartPos.current.x) > 10 || Math.abs(e.touches[0].clientY - touchStartPos.current.y) > 10) clearTimeout(longPressTimer.current); }}
              onTouchEnd={() => clearTimeout(longPressTimer.current)}
              onDoubleClick={() => handleReaction(msg.id, 'heart')}
            >
              <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img src={msg.avatar} className="w-4 h-4 object-cover border border-current opacity-70" alt="" />
                <span className="text-[10px] font-black uppercase italic tracking-tighter" style={{ color: msg.color }}>{msg.user}</span>
                <span className="text-[7px] opacity-10 hidden group-hover/msg:inline uppercase">{msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
              </div>
              <div 
                className={`relative px-4 py-2 max-w-[90%] border-r-4 text-[11px] font-bold shadow-sm cursor-pointer transition-all ${
                  isMe ? 'bg-[#2b506f] text-white border-red-600' : (darkMode ? 'bg-white/5 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300 shadow-black/5')
                }`}
              >
                  {msg.replyTo && <div className="text-[9px] opacity-40 mb-2 border-l-2 border-current pl-2 italic bg-black/5 p-1 truncate">@{msg.replyTo.user}: {msg.replyTo.text}</div>}
                  <p className="break-words whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              {hasReactions && (
                <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {Object.entries(msg.reactions).map(([key, count]) => count > 0 && (
                    <button key={key} onClick={(e) => { e.stopPropagation(); handleReaction(msg.id, key); }} className="bg-black/10 px-1.5 py-0.5 rounded text-[8px] font-black flex items-center gap-1 hover:bg-black/20 transition-all">
                      {key === 'heart' ? '❤️' : '👌'} <span>{count}</span>
                    </button>
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
          <input 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder={isSending ? "UPLINKING..." : "ENTER_SIGNAL..."} 
            disabled={isSending} 
            className={`flex-1 bg-transparent border-b-2 py-2 px-1 text-sm font-black italic outline-none transition-all ${darkMode ? 'border-white/20 focus:border-white' : 'border-black/20 focus:border-black'}`} 
          />
          <button type="submit" disabled={!inputText.trim() || isSending} className={`p-2 transition-all ${isSending ? 'opacity-20' : 'hover:text-red-600'}`}><SendHorizontal size={20} /></button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [isHacked, setIsHacked] = useState(false);
  const [isCosbyMode, setIsCosbyMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [glitchText, setGlitchText] = useState("BITCOIN FORUM");

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

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isCosbyMode ? 'bg-[#1a1b1e] text-white' : 'bg-[#e5e5e8] text-[#000000]'} font-sans antialiased overflow-x-hidden`}>
      {/* Top Navigation */}
      <nav className="bg-[#2b506f] text-white text-[10px] py-2.5 px-4 flex flex-wrap justify-between items-center border-b border-[#1a3144] sticky top-0 z-40 shadow-lg">
        <div className="flex gap-4 sm:gap-6 font-bold uppercase tracking-wider">
          <a href="#" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"><Globe size={13} /> Home</a>
          <a href="https://web.archive.org/web/20111025203348/http://bitcointalk.org/" target="_blank" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"><History size={13} /> Archive (2011)</a>
          <a href="https://bitcointalk.org/index.php?topic=49253.0" target="_blank" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"><ShieldAlert size={13} /> The Hack Thread</a>
          <a href="https://www.itnews.com.au/news/bitcoin-forum-hijacked-by-frustrated-donor-276685" target="_blank" className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors"><FileText size={13} /> News Coverage</a>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <a href="https://x.com" target="_blank" className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded hover:bg-black/60 transition-all border border-white/10">
            <Twitter size={12} fill="currentColor" /> X.COM
          </a>
          <span className="opacity-50 italic hidden lg:inline">Established Oct 25, 2011</span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="p-6 max-w-6xl mx-auto mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <motion.div 
              animate={isHacked ? { rotate: [0, -4, 4, 0], scale: [1, 1.03, 1] } : {}} 
              transition={{ duration: 0.6, repeat: isHacked ? Infinity : 0, repeatDelay: 4 }} 
              className="relative group cursor-help"
            >
              <img src="logo.png" alt="CosbyCoin Logo" className="w-24 h-24 md:w-40 md:h-40 object-contain drop-shadow-2xl grayscale hover:grayscale-0 transition-all duration-500" onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=CosbyCoin"; }} />
              {isHacked && <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay animate-pulse rounded-full" />}
            </motion.div>
            <div className="space-y-1">
              <h1 className={`text-4xl md:text-6xl font-black tracking-tighter flex flex-col leading-none ${isCosbyMode ? 'text-white' : 'text-[#2b506f]'}`}>
                <span className={`${isHacked ? 'line-through opacity-10 text-xl' : ''} transition-all duration-700 ease-in-out`}>BITCOIN FORUM</span>
                <AnimatePresence>
                  {isHacked && (
                    <motion.span initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="text-red-600 italic flex items-center gap-3">
                      <Terminal size={40} className="hidden sm:block" /> {glitchText}
                    </motion.span>
                  )}
                </AnimatePresence>
              </h1>
              <p className={`text-sm md:text-lg italic font-medium max-w-md ${isCosbyMode ? 'text-gray-400' : 'text-gray-600'}`}>
                "The most important altcoin you've never heard of... until now."
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setIsCosbyMode(!isCosbyMode)} 
              className={`px-8 py-4 rounded-sm font-black text-sm uppercase tracking-widest border-2 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none ${
                isCosbyMode 
                ? 'bg-red-700 border-white text-white hover:bg-red-600' 
                : 'bg-white border-[#2b506f] text-[#2b506f] hover:bg-gray-50'
              }`}
            >
              {isCosbyMode ? "Cosby Mode: Active" : "Restore History"}
            </button>
            <p className="text-[10px] text-center opacity-40 font-black uppercase tracking-widest animate-pulse">Click to Hijack the Narrative</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24 mt-8">
        {/* The Manifesto Section */}
        <section className={`border-4 p-1 mb-10 shadow-xl transition-all ${isCosbyMode ? 'bg-gray-900 border-red-900/50' : 'bg-[#f6f6f6] border-[#c4c4c4]'}`}>
          <div className="bg-[#55708b] text-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] flex justify-between items-center shadow-inner">
            <span>Official Status: Unauthorized Access Detected</span>
            <AlertTriangle size={16} className="text-yellow-400" />
          </div>
          <div className={`p-8 border-t-2 transition-colors ${isCosbyMode ? 'bg-black/40 border-gray-800' : 'bg-white border-[#c4c4c4]'}`}>
            <h2 className="text-3xl md:text-5xl font-black text-[#b52a2a] mb-6 uppercase italic tracking-tighter">
              The 2011 "Pre-Doge" Legacy
            </h2>
            <div className={`space-y-6 text-base md:text-xl leading-relaxed font-medium ${isCosbyMode ? 'text-gray-300' : 'text-gray-800'}`}>
              <p>Before Dogecoin ever existed, there was <strong>CosbyCoin</strong>. The first memecoin, and it wasn't even intentional.</p>
              <p>In 2011, a Bitcointalk forum donor hijacked the entire site, replacing every instance of “Bitcoin” with “CosbyCoin” and swapping images with Bill Cosby’s face.</p>
              <div className="relative py-6 px-10 border-l-8 border-red-600 bg-red-600/5 italic text-2xl md:text-3xl font-black text-red-700">
                <span className="absolute top-0 left-2 text-6xl opacity-10 font-serif">"</span>
                Bitcoin was itself turned into a meme on the site we get all of our lore from.
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Forum Feed */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-[700px]">
            <h3 className={`text-2xl font-black border-b-4 pb-3 mb-6 flex items-center gap-3 italic ${isCosbyMode ? 'text-white border-white' : 'text-[#2b506f] border-[#2b506f]'}`}>
              <MessageSquare size={28} /> Live Forum Reaction
            </h3>
            <div className={`flex-1 border-4 rounded-lg shadow-2xl relative overflow-hidden transition-all duration-500 ${isCosbyMode ? 'bg-gray-950 border-gray-800 ring-4 ring-red-900/20' : 'bg-white border-[#c4c4c4]'}`}>
               <ChatApp darkMode={isCosbyMode} />
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            <div className={`border-4 rounded-sm shadow-xl overflow-hidden transition-colors ${isCosbyMode ? 'bg-gray-900 border-gray-700' : 'bg-[#f0f4f7] border-[#c4c4c4]'}`}>
              <div className="bg-[#2b506f] text-white p-4 font-black text-sm uppercase tracking-[0.2em] shadow-md italic">Evidence Vault</div>
              <div className="p-6 space-y-6">
                <EvidenceCard title="Terminology Index" desc="CosbyCoin remains the only altcoin ever officially listed on the Bitcointalk terminology page." link="https://bitcointalk.org/index.php?topic=2533.0" isCosbyMode={isCosbyMode} />
                <EvidenceCard title="The IT News Report" desc="Deep dive into how a frustrated donor turned the crypto world upside down in 2011." link="https://www.itnews.com.au/news-bitcoin-forum-hijacked-by-frustrated-donor-276685" isCosbyMode={isCosbyMode} />
                <a href="https://x.com" target="_blank" className={`flex items-center justify-center gap-3 w-full py-5 rounded font-black text-sm transition-all border-4 shadow-lg active:shadow-none active:translate-y-1 ${isCosbyMode ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-black text-white border-black hover:opacity-90'}`}>
                  <Twitter size={20} fill="currentColor" /> JOIN THE CONVERSATION
                </a>
              </div>
            </div>

            <div className={`p-6 shadow-xl border-l-8 border-red-600 transition-colors ${isCosbyMode ? 'bg-gray-950 text-gray-400' : 'bg-white text-gray-700'}`}>
              <h4 className="font-black flex items-center gap-2 mb-3 text-red-600 uppercase italic underline decoration-4 underline-offset-4 tracking-tighter text-xl">
                <Zap size={22} className="fill-current"/> Historical Impact
              </h4>
              <p className="text-sm font-medium leading-relaxed">
                The 2011 hack proved that narrative is more powerful than code. CosbyCoin isn't just a token; it's a historical artifact that broke the "pure" Bitcoin narrative years before memecoins were even a category.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Retro OS Popups */}
      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] p-1 shadow-[10px_10px_0px_rgba(0,0,0,0.2)] pointer-events-auto max-w-[360px] w-full">
              <div className="bg-[#000080] text-white flex justify-between items-center px-2 py-1 text-xs font-bold mb-1">
                <span className="flex items-center gap-2"><Terminal size={12}/> System Alert: Protocol Swap</span>
                <button onClick={() => setShowPopup(false)} className="bg-[#c0c0c0] text-black px-1.5 leading-none border border-black text-[10px] hover:bg-red-600 hover:text-white transition-colors">X</button>
              </div>
              <div className="bg-white border border-[#808080] p-6 flex flex-col items-center gap-6">
                <img src="popup.jpg" alt="Original Hack Coin" className="w-56 h-56 object-cover border-4 border-black shadow-lg" onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=History+Alert"; }} />
                <div className="text-center">
                  <p className="text-[14px] font-black text-black uppercase leading-tight mb-2 italic">
                    "I have replaced your Bitcoin with history."
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Official 2011 Forum Hijack Visual</p>
                </div>
                <button onClick={() => setShowPopup(false)} className="bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] px-12 py-3 text-sm font-black active:border-[#808080] active:border-r-white active:border-b-white transition-all">OK</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Site Footer */}
      <footer className={`text-center py-16 text-xs border-t-8 transition-colors ${isCosbyMode ? 'bg-black text-white/30 border-red-900' : 'bg-[#1a3144] text-white/50 border-[#0d1a24]'}`}>
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <p className="font-black uppercase tracking-[0.4em] text-sm">© 2011-2026 CosbyCoin Foundation. The Original Hijack.</p>
          <div className="flex justify-center gap-6 opacity-40">
             <span className="hover:opacity-100 cursor-help">EST. OCT 2011</span>
             <span className="hover:opacity-100 cursor-help">FORUM DONOR PROTEST</span>
             <span className="hover:opacity-100 cursor-help">ANTI-MODERATION LEGACY</span>
          </div>
          <p className="mt-4 italic font-medium">"History cannot be moderated. Pudding cannot be stopped."</p>
        </div>
      </footer>

      {/* CRT Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
};

const EvidenceCard = ({ title, desc, link, isCosbyMode }) => (
  <div className={`p-5 border-2 rounded shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${isCosbyMode ? 'bg-black/40 border-gray-700 hover:border-red-600' : 'bg-white border-gray-200 hover:border-[#2b506f]'}`}>
    <h5 className={`font-black text-sm flex items-center justify-between gap-2 mb-3 uppercase italic ${isCosbyMode ? 'text-red-500' : 'text-[#2b506f]'}`}>
      {title} <ExternalLink size={16} />
    </h5>
    <p className={`text-[12px] mb-4 leading-relaxed font-medium ${isCosbyMode ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
    <a href={link} target="_blank" rel="noopener noreferrer" className={`text-xs font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4 ${isCosbyMode ? 'text-white' : 'text-blue-700'}`}>
      Verify the Truth →
    </a>
  </div>
);

export default App;