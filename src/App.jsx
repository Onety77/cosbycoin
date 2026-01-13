import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo,
  useCallback
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
  ShieldAlert,
  BarChart3,
  HeartHandshake,
  CheckCircle2,
  TrendingUp,
  Lock,
  Unlock,
  Wallet,
  History,
  ArrowUpRight,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Link as LinkIcon,
  Calendar
} from 'lucide-react';


// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyB_gNokFnucM2nNAhhkRRnPsPNBAShYlMs",
  authDomain: "it-token.firebaseapp.com",
  projectId: "it-token",
  storageBucket: "it-token.firebasestorage.app",
  messagingSenderId: "804328953904",
  appId: "1:804328953904:web:e760545b579bf2527075f5"
};

// Singleton initialization to prevent "app already exists" errors
const getRightApp = () => {
  if (getApps().length === 0) return initializeApp(firebaseConfig);
  return getApp();
};

const rightCoinAppInstance = getRightApp();
const auth = getAuth(rightCoinAppInstance);
const db = getFirestore(rightCoinAppInstance);
const appId = 'it-token-os';

const SOL_CA = "So11111111111111111111111111111111111111112";

/**
 * FIXED: Environment Variable Access
 * We use a protective wrapper to handle environments where import.meta is missing.
 */
const ADMIN_PASSWORD = (() => {
  try {
    // Check import.meta.env first (Vite standard)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SECTION) {
      return import.meta.env.VITE_SECTION;
    }
    // Fallback to process.env (Node/Webpack standard)
    if (typeof process !== 'undefined' && process.env?.VITE_SECTION) {
      return process.env.VITE_SECTION;
    }
  } catch (e) {}
  return ""; // Default to empty if not found
})();

const apiKey = (() => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_GEMINI) return import.meta.env.VITE_APP_GEMINI;
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env?.VITE_APP_GEMINI) return process.env.VITE_APP_GEMINI;
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

const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.rpc.extrnode.com',
  'https://rpc.ankr.com',
  'https://solana-rpc.publicnode.com'
];

const GOV_WALLET_ADDRESSES = {
  DEV: "D8n8Dy6DWC9691mR4NroSA9TdxXBxDV6Rr639RapanS4",
  CHARITY: "D8n8Dy6DWC9691mR4NroSA9TdxXBxDV6Rr639RapanS4",
  MARKETING: "MARKETING_WALLET_ADDRESS_TBA"
};

// --- GOVERNANCE MODULE ---
export const GovernanceModule = ({ db, auth, appId, darkMode, tokenCA }) => {
  const [votes, setVotes] = useState({ c1: 0, c2: 0, m1: 0, m2: 0 });
  const [solPrice, setSolPrice] = useState(0);
  const [tokenData, setTokenData] = useState({ price: "$0.00", symbol: "IT" });
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState({ dev: 0, charity: 0, marketing: 0 });
  const [ledgerData, setLedgerData] = useState({
    allocatedBalance: 0,
    notice: "Creator rewards are mirrored below. Voting unlocks upon reaching budget targets. All moves community governed.",
    charityTask: { id1: 'c1', name1: '', link1: '', img1: '', id2: 'c2', name2: '', link2: '', img2: '', target: 5 },
    marketingTask: { id1: 'm1', name1: '', id2: 'm2', name2: '', target: 10 },
    history: []
  });

  const fetchPrice = useCallback(async () => {
    if (!tokenCA || tokenCA.length < 32) return;
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenCA}`);
      if (!response.ok) return;
      const result = await response.json();
      if (result.pairs && result.pairs[0]) {
        setTokenData({
          price: `$${parseFloat(result.pairs[0].priceUsd).toFixed(6)}`,
          symbol: result.pairs[0].baseToken.symbol
        });
      }
    } catch (err) { console.error("Price fetch failed", err); }
  }, [tokenCA]);

  const fetchSolBalance = useCallback(async (address) => {
    if (!address || address.includes("_TBA")) return 0;
    for (const endpoint of RPC_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Math.floor(Math.random() * 1000000),
            method: "getBalance",
            params: [address, { commitment: "confirmed" }]
          })
        });
        const data = await response.json();
        if (data.result && typeof data.result.value !== 'undefined') {
          return Number(data.result.value) / 1e9;
        }
      } catch (err) { continue; }
    }
    return 0;
  }, []);

  const updateAllData = useCallback(async () => {
    const [d, c, m] = await Promise.all([
      fetchSolBalance(GOV_WALLET_ADDRESSES.DEV),
      fetchSolBalance(GOV_WALLET_ADDRESSES.CHARITY),
      fetchSolBalance(GOV_WALLET_ADDRESSES.MARKETING)
    ]);
    setBalances({ dev: d, charity: c, marketing: m });
    fetchPrice();
    
    try {
      const resp = await fetch('https://api.jup.ag/price/v2?ids=' + SOL_CA);
      const data = await resp.json();
      const val = data.data?.[SOL_CA]?.price;
      if (val) setSolPrice(Number(val));
    } catch (e) {}
  }, [fetchSolBalance, fetchPrice]);

  useEffect(() => {
    updateAllData();
    const interval = setInterval(updateAllData, 30000);
    return () => clearInterval(interval);
  }, [updateAllData]);

  useEffect(() => {
    if (!db || !auth) return;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const govDoc = doc(db, 'artifacts', appId, 'public', 'data', 'governance', 'state');
      const unsubSnap = onSnapshot(govDoc, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.votes) setVotes(data.votes);
          setLedgerData(prev => ({
            ...prev,
            ...data,
            allocatedBalance: Number(data.allocatedBalance) || 0,
            history: data.history || []
          }));
        } else {
          setDoc(govDoc, { 
            votes: { c1: 0, c2: 0, m1: 0, m2: 0 }, 
            allocatedBalance: 0, 
            notice: ledgerData.notice, 
            charityTask: ledgerData.charityTask, 
            marketingTask: ledgerData.marketingTask, 
            history: [] 
          });
        }
        setLoading(false);
      }, (err) => {
        console.error("Ledger Sync Failure", err);
        setLoading(false);
      });
      return () => unsubSnap();
    });
    return () => unsubAuth();
  }, [db, auth, appId]);

  const handleVote = async (category, taskId) => {
    if (!auth?.currentUser) return;
    const storageKey = `right_vote_${category}`;
    const previousVote = localStorage.getItem(storageKey);
    const govDoc = doc(db, 'artifacts', appId, 'public', 'data', 'governance', 'state');
    try {
      if (previousVote === taskId) {
        // Toggle Off
        await updateDoc(govDoc, { [`votes.${taskId}`]: increment(-1) });
        localStorage.removeItem(storageKey);
      } else if (previousVote) {
        // Switch Vote: pick only one per category
        await updateDoc(govDoc, { 
          [`votes.${previousVote}`]: increment(-1),
          [`votes.${taskId}`]: increment(1)
        });
        localStorage.setItem(storageKey, taskId);
      } else {
        // Fresh Vote
        await updateDoc(govDoc, { [`votes.${taskId}`]: increment(1) });
        localStorage.setItem(storageKey, taskId);
      }
    } catch (e) { console.error("Vote failed", e); }
  };

  const ProgressCard = ({ title, balance, target, icon: Icon, color }) => {
    const val = Number(balance) || 0;
    const progress = Math.min((val / target) * 100, 100);
    const isUnlocked = val >= target;

    return (
      <div className={`p-5 border-l-4 mb-3 transition-all ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
        <div className="flex justify-between items-start mb-3 text-left text-current">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
              <Icon size={16} style={{ color: isUnlocked ? color : 'inherit' }} />
            </div>
            <div>
              <h4 className="text-[8px] font-black uppercase tracking-widest opacity-40">{title}</h4>
              <p className="text-lg font-black italic tracking-tighter leading-none mt-1">{val.toFixed(2)} SOL</p>
              <p className="text-[7px] opacity-20 font-bold mt-1">USD ≈ ${(val * solPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 text-[7px] font-black uppercase px-2 py-1 rounded transition-colors ${isUnlocked ? 'bg-green-500 text-black' : 'opacity-20 bg-current'}`}>
            {isUnlocked ? <Unlock size={8} /> : <Lock size={8} />} {isUnlocked ? 'Decision Open' : 'Funding'}
          </div>
        </div>
        <div className="space-y-1">
          <div className={`w-full h-1 overflow-hidden rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
            <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%`, backgroundColor: color }} />
          </div>
          <div className="flex justify-between text-[6px] font-black uppercase opacity-20">
            <span>Goal: {target} SOL</span>
            <span>{progress.toFixed(0)}% Complete</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="w-full h-64 flex flex-col items-center justify-center opacity-20 font-mono text-center">
      <Activity size={32} className="animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Intercepting Ledger...</p>
    </div>
  );

  return (
    <div className="w-full space-y-10 animate-fade-in font-mono pb-10 select-none">
      <div className="flex justify-between items-end border-b border-current border-opacity-10 pb-4 text-left">
        <div className="flex items-center gap-3"><BarChart3 size={18} className="opacity-40" /><h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">The Ledger</h3></div>
        <div className="text-right leading-none">
          <p className="text-[8px] font-black uppercase opacity-30">Current Value</p>
          <p className="text-sm font-black italic text-green-500">{String(tokenData.price)}</p>
        </div>
      </div>

      <div className="flex flex-col items-start w-full gap-2 p-3 border border-[#f59e0b]/20 bg-[#f59e0b]/5">
         <div className="flex items-center gap-2">
            <img src="/pfps/mask.jpg" className="w-4 h-4 object-cover grayscale rounded-full border border-[#f59e0b]" alt="" />
            <span className="text-[7px] font-black uppercase tracking-widest text-[#f59e0b]">Official Notice</span>
         </div>
         <p className="text-[8px] font-bold uppercase leading-tight opacity-70 tracking-tighter text-left">
           {ledgerData.notice}
         </p>
      </div>

      <div className="space-y-4">
        <div className={`p-6 border-r-8 mb-4 border-[#f59e0b] relative flex flex-col gap-6 ${darkMode ? 'bg-[#f59e0b]/5 shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 'bg-[#f59e0b]/10'}`}>
          <div className="text-left">
             <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic leading-none">I. Fee Balance</span>
             <p className="text-2xl font-black italic tracking-tighter leading-none mt-1">{Number(balances.dev || 0).toFixed(2)} SOL</p>
          </div>
          <div className="text-left">
             <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic leading-none">II. Allocated</span>
             <p className="text-2xl font-black italic tracking-tighter leading-none mt-1">{Number(ledgerData.allocatedBalance || 0).toFixed(2)} SOL</p>
          </div>
          <div className="absolute top-4 right-4 opacity-10"><Shield size={24}/></div>
        </div>

        <ProgressCard title="Charity Choice" balance={balances.charity} target={ledgerData.charityTask.target} icon={HeartHandshake} color="#10b981" />
        <ProgressCard title="Strategy Growth" balance={balances.marketing} target={ledgerData.marketingTask.target} icon={TrendingUp} color="#3b82f6" />
      </div>
      
      <div className="space-y-12 pt-4">
        {/* Charity Ballot */}
        <div className={`space-y-4 ${Number(balances.charity) < ledgerData.charityTask.target ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
           <span className="text-[9px] font-black uppercase tracking-widest border-b border-current border-opacity-10 pb-2 block text-left flex items-center justify-between">
              Choice Distribution <span>{Number(balances.charity) < ledgerData.charityTask.target ? <Lock size={10}/> : 'Open'}</span>
           </span>
           <div className="grid grid-cols-2 gap-3">
              {[ {id: 'c1', name: ledgerData.charityTask.name1, link: ledgerData.charityTask.link1, img: ledgerData.charityTask.img1}, {id: 'c2', name: ledgerData.charityTask.name2, link: ledgerData.charityTask.link2, img: ledgerData.charityTask.img2} ].map(item => (
                <div key={item.id} className={`p-3 border-2 flex flex-col transition-all group ${localStorage.getItem('right_vote_charity') === item.id ? 'border-[#10b981] bg-[#10b981]/5' : 'border-white/5 bg-white/[0.02]'}`}>
                   {item.img && <img src={item.img} className="w-full h-16 object-cover grayscale group-hover:grayscale-0 transition-all mb-3 border border-current border-opacity-10" alt="" />}
                   <div className="flex justify-between items-center mb-2 text-left">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-current bg-opacity-10 hover:bg-opacity-20 transition-all text-current">
                         <ExternalLink size={10} />
                      </a>
                      <span className="text-[7px] font-black uppercase opacity-30">Link</span>
                   </div>
                   <div className="text-[10px] font-black truncate uppercase mb-4 text-right">{item.name || '---'}</div>
                   <button onClick={() => handleVote('charity', item.id)} className={`w-full py-1.5 border border-current border-opacity-20 hover:bg-current hover:text-current-bg transition-all text-[8px] font-black uppercase flex justify-between px-2`}>
                     {localStorage.getItem('right_vote_charity') === item.id ? 'REMOVE' : 'PICK'} <span>{Number(votes[item.id]) || 0}</span>
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Marketing Ballot */}
        <div className={`space-y-4 ${Number(balances.marketing) < ledgerData.marketingTask.target ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
           <span className="text-[9px] font-black uppercase tracking-widest border-b border-current border-opacity-10 pb-2 block text-left flex items-center justify-between">
              Growth Selection <span>{Number(balances.marketing) < ledgerData.marketingTask.target ? <Lock size={10}/> : 'Open'}</span>
           </span>
           <div className="grid grid-cols-2 gap-3">
              {[ {id: 'm1', name: ledgerData.marketingTask.name1}, {id: 'm2', name: ledgerData.marketingTask.name2} ].map(item => (
                <div key={item.id} className={`p-4 border-2 flex flex-col text-right transition-all group ${localStorage.getItem('right_vote_marketing') === item.id ? 'border-[#3b82f6] bg-[#3b82f6]/5' : 'border-white/5 bg-white/[0.02]'}`}>
                   <span className="text-[7px] font-black uppercase opacity-30 mb-4 text-right">Strategy</span>
                   <div className="text-[10px] font-black truncate uppercase mb-4">{item.name || '---'}</div>
                   <button onClick={() => handleVote('marketing', item.id)} className={`w-full py-2 border border-current border-opacity-20 hover:bg-current hover:text-current-bg transition-all text-[8px] font-black uppercase flex justify-between px-2`}>
                     {localStorage.getItem('right_vote_marketing') === item.id ? 'REMOVE' : 'APPLY'} <span>{Number(votes[item.id]) || 0}</span>
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-current border-opacity-10 text-left">
        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-left opacity-40">Verified Signals</h4>
        {ledgerData.history && ledgerData.history.length > 0 ? ledgerData.history.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-3 border-b border-current border-opacity-5 group/hist transition-all">
            <div className="text-left">
              <span className="text-[6px] opacity-30 uppercase font-black">{item.date} // {item.type}</span>
              <p className="text-[9px] font-black uppercase tracking-tighter mt-0.5">{item.task}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] font-black italic leading-none">{item.amount}</p>
                <p className="text-[6px] text-green-500 font-black uppercase italic mt-1 flex items-center gap-1 leading-none"><CheckCircle size={8}/> Confirmed</p>
              </div>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 border border-current border-opacity-10 rounded hover:bg-current hover:text-current-bg transition-all opacity-40 group-hover/hist:opacity-100">
                  <ArrowUpRight size={12}/>
                </a>
              )}
            </div>
          </div>
        )) : (
          <p className="text-[8px] opacity-20 uppercase font-bold text-center py-4 italic tracking-widest">No verified signals logged</p>
        )}
      </div>
    </div>
  );
};

// --- CHAT MODULE ---
export const ChatApp = ({ db, auth, appId, darkMode, setView }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); 
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
  const CA_INTERNAL = "3vsKvFYRbn5Mrfk5mJsxEDto2UwmrcWtqvC5o7SYpump";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(e => console.error("Auth Failure", e));
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
    }, (err) => console.error("Signal Sync Error", err));
    return () => unsubscribe();
  }, [user, db, appId]);

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
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) playPromise.catch(() => setIsMuted(true));
    audioRef.current.onended = () => setTrackIndex((prev) => (prev + 1) % CHAT_PLAYLIST.length);
  }, [isSetup, isMuted, trackIndex]);

  const scrollToBottom = (behavior = 'smooth') => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      setCopiedCA(true);
      setTimeout(() => setCopiedCA(false), 2000);
    } catch (e) {}
    document.body.removeChild(el);
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
        text, uid: user.uid, user: username, color: userColor, avatar: userAvatar, replyTo: reply ? { user: reply.user, text: reply.text } : null, timestamp: serverTimestamp(), reactions: { heart: 0, up: 0 }
      });
      setTimeout(() => scrollToBottom(), 150);
    } catch (err) { setError("Send failed"); } finally { setIsSending(false); }
  };

  const handleJoin = () => {
    // Master Access Gateway
    if (username === "ADMIN") {
       // Check against env password
       if (password && ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
          // ENSURE setView is actually provided as a prop
          if (typeof setView === 'function') {
            setView('admin'); 
          } else {
            console.error("Master transition failed: setView prop missing.");
          }
          return;
       } else {
          return setError("Alias Restricted. Change name.");
       }
    }
    if (username.length < 2) return setError("Name too short");
    localStorage.setItem('right_alias', username);
    localStorage.setItem('right_color', userColor);
    localStorage.setItem('right_avatar', userAvatar);
    setIsSetup(true);
    setIsMuted(false);
  };

  if (!isSetup) {
    const isNewUser = !localStorage.getItem('right_alias');
    const isAdminTriggered = username === "ADMIN";

    return (
      <div className="flex flex-col items-end w-full animate-fade-in font-mono">
        <div className={`w-full p-8 border-2 border-dashed flex flex-col gap-8 ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}>
          <div className="text-right space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic">{isNewUser ? 'Identify yourself' : 'Update persona'}</h4>
            <input value={username} onChange={(e) => setUsername(e.target.value.toUpperCase())} placeholder="ALIAS" disabled={!isNewUser} className={`w-full bg-transparent border-b-2 border-current py-4 text-right outline-none text-2xl font-black italic tracking-tighter ${!isNewUser ? 'opacity-30' : ''}`} />
            
            {isAdminTriggered && isNewUser && (
               <div className="animate-fade-in pt-4">
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()} placeholder="CREDENTIALS REQUIRED" className="w-full bg-white/10 border p-3 text-right text-xs font-black outline-none tracking-widest" />
                  {(!ADMIN_PASSWORD || ADMIN_PASSWORD === "") && <p className="text-[7px] text-red-500 uppercase mt-2">Config Error: Env Variable Missing</p>}
               </div>
            )}
          </div>
          <div className="space-y-4">
             <span className="text-[8px] font-black uppercase tracking-widest opacity-30 block text-right">Avatar Selection</span>
             <div className="grid grid-cols-6 gap-2">
                {AVATAR_LIST.map(av => (
                  <button key={av.id} onClick={() => setUserAvatar(av.url)} className={`aspect-square border-2 transition-all ${userAvatar === av.url ? 'border-current scale-110' : 'border-transparent opacity-30 hover:opacity-100'}`}><img src={av.url} className="w-full h-full object-cover pointer-events-none" alt="" /></button>
                ))}
             </div>
          </div>
          <div className="space-y-4">
             <span className="text-[8px] font-black uppercase tracking-widest opacity-30 block text-right">Color Palette</span>
             <div className="flex justify-end gap-3">
                {COLOR_LIST.map(c => (
                  <button key={c.id} onClick={() => setUserColor(c.hex)} className={`w-6 h-6 rounded-full border-2 transition-all ${userColor === c.hex ? 'border-white scale-125' : 'border-transparent opacity-40'}`} style={{ backgroundColor: c.hex }} />
                ))}
             </div>
          </div>
          <button onClick={handleJoin} className="w-full py-4 bg-current text-current-bg font-black uppercase text-xs tracking-[0.4em] hover:opacity-80 transition-all">{isNewUser ? 'Establish Node' : 'Update Node'}</button>
          {error && <p className="text-red-500 text-[9px] uppercase font-black text-right">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[600px] animate-fade-in font-mono relative select-none" onClick={() => { setContextMenu(null); setActiveMenu(null); }}>
      <div 
        className={`sticky top-0 z-[60] w-full px-4 py-2 border-b flex items-center justify-between backdrop-blur-md cursor-pointer transition-colors ${darkMode ? 'bg-black/80 border-white/10 hover:bg-white/5' : 'bg-white/80 border-black/5 hover:bg-black/5'}`} 
        onClick={() => copyToClipboard(CA_INTERNAL)}
      >
          <span className="text-[8px] font-black text-[#f59e0b] uppercase tracking-widest italic animate-pulse flex items-center gap-2"><ShieldAlert size={10}/> Pinned Notice</span>
          <span className="text-[7px] opacity-40 truncate px-4 font-bold">{CA_INTERNAL}</span>
          <div className="flex items-center gap-2">
            <span className="text-[7px] font-black uppercase opacity-20">{copiedCA ? 'Copied' : ''}</span>
            <Copy size={10} className="opacity-20" />
          </div>
      </div>

      <div className={`flex justify-between items-center p-3 border-b mb-2 ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
         <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="opacity-40 hover:opacity-100 transition-opacity">{isMuted ? <VolumeX size={16}/> : <Volume2 size={16} className="text-green-500 animate-pulse" />}</button>
            <button onClick={(e) => { e.stopPropagation(); setTrackIndex(p => (p + 1) % CHAT_PLAYLIST.length); }} className="opacity-20 hover:opacity-100 transition-opacity"><SkipForward size={14}/></button>
            <div className="text-[8px] uppercase tracking-widest opacity-20 truncate max-w-[100px] ml-2">{isMuted ? 'Muted' : CHAT_PLAYLIST[trackIndex]?.title}</div>
         </div>
         <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu ? null : 'settings'); }} className="opacity-40 hover:opacity-100 transition-opacity"><Settings size={16}/></button>
      </div>

      {activeMenu === 'settings' && (
        <div className={`absolute top-12 right-4 z-[90] p-4 border-2 shadow-2xl flex flex-col gap-4 animate-fade-in ${darkMode ? 'bg-[#080808] border-white/10 text-white' : 'bg-white border-black/5 text-black'}`} onClick={e => e.stopPropagation()}>
           <button onClick={() => { setIsSetup(false); setActiveMenu(null); }} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"><Palette size={14}/> Appearance</button>
           <div className={`h-[1px] w-full opacity-10 bg-current`} />
           <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"><LogOut size={14}/> Log Out</button>
        </div>
      )}

      <div ref={scrollRef} onScroll={(e) => { const { scrollTop, scrollHeight, clientHeight } = e.currentTarget; setShowScrollDown(scrollHeight - scrollTop - clientHeight > 300); }} className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar relative scroll-smooth text-left">
        <div ref={adminRef} className="flex flex-col items-start animate-fade-in w-full mb-4">
           <div className="flex items-center gap-2 mb-1 text-left">
              <img src="/pfps/mask.jpg" className="w-4 h-4 object-cover rounded-sm border border-[#f59e0b]/30" alt="" />
              <span className="text-[8px] font-black uppercase tracking-tighter text-[#f59e0b]">Admin</span>
           </div>
           <div className={`relative px-4 py-3 max-w-[85%] border-r-4 text-xs font-bold shadow-md cursor-pointer border-[#f59e0b] ${darkMode ? 'bg-[#f59e0b]/5 text-[#f59e0b]' : 'bg-[#f59e0b]/10 text-amber-900'}`} onClick={() => copyToClipboard(CA_INTERNAL)}>
              <div className="text-[7px] opacity-40 mb-1 italic uppercase">Important Signal</div>
              <p className="break-words whitespace-pre-wrap leading-relaxed text-left">Official CA: {CA_INTERNAL}</p>
              <div className="mt-2 flex items-center gap-2 opacity-40 text-[7px] font-black uppercase">
                 <Copy size={8}/> Tap to copy
              </div>
           </div>
        </div>

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
              <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}><img src={msg.avatar} className="w-4 h-4 object-cover opacity-60 rounded-sm" alt="" /><span className="text-[8px] font-black uppercase" style={{ color: msg.color }}>{msg.user}</span></div>
              <div className={`relative px-4 py-3 max-w-[85%] border-r-4 text-xs font-bold transition-all shadow-sm ${isMe ? (darkMode ? 'bg-white text-black border-white shadow-white/5' : 'bg-black text-white border-black shadow-black/5') : (darkMode ? 'bg-white/5 text-white border-white/20' : 'bg-black/5 text-black border-black/10')}`}>
                 {msg.replyTo && <div className="text-[7px] opacity-40 mb-2 border-l-2 border-current pl-2 truncate italic bg-current bg-opacity-5 p-1">Replied to {msg.replyTo.user}: "{msg.replyTo.text}"</div>}
                 <p className="break-words whitespace-pre-wrap leading-relaxed text-left">{msg.text}</p>
              </div>
              {hasReactions && <div className={`flex gap-2 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>{Object.entries(msg.reactions).map(([key, count]) => count > 0 && <button key={key} onClick={(e) => { e.stopPropagation(); handleReaction(msg.id, key); }} className="bg-current bg-opacity-10 px-2 py-1 rounded-full text-[8px] flex items-center gap-1 font-black transition-all hover:scale-110 active:scale-125">{key === 'heart' ? '❤️' : '👌'} <span>{count}</span></button>)}</div>}
            </div>
          );
        })}
      </div>

      {showScrollDown && <button onClick={() => scrollToBottom()} className={`absolute bottom-24 right-6 z-[70] p-3 rounded-full shadow-2xl animate-bounce transition-opacity bg-current text-current-bg hover:opacity-80`}><ChevronDown size={20} strokeWidth={3}/></button>}

      {contextMenu && (
        <div className={`fixed z-[1000] p-1 border-2 shadow-2xl min-w-[140px] animate-scale-up ${darkMode ? 'bg-[#080808] border-white/10' : 'bg-white border-black/5'}`} style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: Math.min(contextMenu.x, window.innerWidth - 150) }} onClick={e => e.stopPropagation()}>
           <button onClick={() => { setReplyingTo(contextMenu.msg); setContextMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase hover:bg-current hover:text-current-bg transition-colors"><Reply size={12}/> Reply</button>
           <div className="h-[1px] w-full opacity-10 bg-current my-1" /><div className="flex p-1 gap-1"><button onClick={() => handleReaction(contextMenu.msg.id, 'heart')} className="flex-1 p-2 hover:bg-current hover:text-current-bg transition-colors flex justify-center text-xs">❤️</button><button onClick={() => handleReaction(contextMenu.msg.id, 'up')} className="flex-1 p-2 hover:bg-current hover:text-current-bg transition-colors flex justify-center text-xs">👌</button></div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-current border-opacity-5 relative z-[80]">
        {replyingTo && <div className="flex justify-between items-center bg-current bg-opacity-5 p-2 mb-2 border-r-4 border-current animate-fade-in"><span className="text-[8px] uppercase font-black italic opacity-60 truncate pr-6">Replying to {replyingTo.user}</span><X size={10} className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={() => setReplyingTo(null)} /></div>}
        <form onSubmit={handleSend} className="flex gap-2"><input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isSending ? "Sending..." : "Say something..."} disabled={isSending} className={`flex-1 bg-transparent border-b-2 py-3 px-2 text-right outline-none text-[11px] font-black italic transition-all ${darkMode ? 'border-white/10 focus:border-white text-white' : 'border-black/10 focus:border-black text-black'}`} /><button type="submit" disabled={!inputText.trim() || isSending} className={`p-3 border transition-all ${darkMode ? 'border-white/10 hover:bg-white hover:text-black' : 'border-black/10 hover:border-black hover:text-white'} disabled:opacity-20`}><SendHorizontal size={18} /></button></form>
      </div>
    </div>
  );
};


// --- MASTER ADMIN PANEL (God Mode) ---
const MasterAdminPanel = ({ db, appId, setView }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!db || !appId) return;
    const govDoc = doc(db, 'artifacts', appId, 'public', 'data', 'governance', 'state');
    
    const unsubscribe = onSnapshot(govDoc, (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else {
        // Safe initialization defaults to prevent UI crash
        setData({
          notice: "Creator rewards are mirrored below.",
          allocatedBalance: 0,
          history: [],
          charityTask: { id1: 'c1', name1: '', link1: '', img1: '', id2: 'c2', name2: '', link2: '', img2: '', target: 5 },
          marketingTask: { id1: 'm1', name1: '', id2: 'm2', name2: '', target: 10 },
          votes: { c1: 0, c2: 0, m1: 0, m2: 0 }
        });
      }
      setLoading(false);
    }, (err) => {
      console.error("Master Sync Error", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, appId]);

  const save = async (updates) => {
    setSaving(true);
    const govDoc = doc(db, 'artifacts', appId, 'public', 'data', 'governance', 'state');
    try {
      // Cast allocatedBalance to number if it's being updated
      if (updates.allocatedBalance !== undefined) {
        updates.allocatedBalance = Number(updates.allocatedBalance);
      }
      await updateDoc(govDoc, updates);
    } catch (e) {
      console.error("Save Error", e);
    }
    setSaving(false);
  };

  const handleResetSlot = async (taskId, category) => {
    const govDoc = doc(db, 'artifacts', appId, 'public', 'data', 'governance', 'state');
    const updates = { [`votes.${taskId}`]: 0 };
    if (category === 'charity') {
      updates.charityTask = {
        ...data.charityTask,
        [taskId === 'c1' ? 'name1' : 'name2']: '',
        [taskId === 'c1' ? 'link1' : 'link2']: '',
        [taskId === 'c1' ? 'img1' : 'img2']: ''
      };
    } else {
      updates.marketingTask = {
        ...data.marketingTask,
        [taskId === 'm1' ? 'name1' : 'name2']: ''
      };
    }
    await updateDoc(govDoc, updates);
  };

  if (loading || !data) return (
    <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
      <RefreshCw size={32} className="animate-spin opacity-40" />
      <p className="font-mono uppercase text-[10px] tracking-widest opacity-40">Connecting to Master Node...</p>
    </div>
  );

  return (
    <div className="w-full space-y-12 animate-fade-in font-mono pb-20 text-left">
      <header className="flex justify-between items-center border-b border-red-500/20 pb-4">
        <div className="flex items-center gap-3 text-red-500">
          <Cpu size={20}/>
          <h3 className="text-xl font-black italic uppercase">Admin</h3>
        </div>
        <button onClick={() => setView('home')} className="text-[9px] uppercase font-black opacity-40 hover:opacity-100 transition-opacity">Exit Panel</button>
      </header>

      {/* 1. OFFICIAL ANNOUNCEMENT */}
      <div className="p-6 border border-current border-opacity-10 bg-white/[0.02] space-y-4">
        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase opacity-40 flex items-center gap-2">
            <Activity size={10} /> Official Signal Announcement
          </label>
          <textarea 
            value={data.notice || ""} 
            onChange={e => setData({...data, notice: e.target.value})} 
            className="w-full bg-white/5 border border-current border-opacity-10 p-3 text-[10px] font-bold h-20 outline-none focus:border-red-500/50"
            placeholder="Update the announcement banner text..."
          />
        </div>
        <button 
          onClick={() => save({ notice: data.notice })} 
          className="w-full py-2 bg-white text-black font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
        >
          {saving ? <RefreshCw className="animate-spin" size={12}/> : <Save size={12}/>} Update Announcement
        </button>
      </div>

      {/* 2. ALLOCATED SOL CONTROL */}
      <div className="p-6 border border-current border-opacity-10 bg-white/[0.02] space-y-4">
        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase opacity-40 flex items-center gap-2">
            <Wallet size={10} /> Manual Allocation Amount
          </label>
          <input 
            type="number" 
            value={data.allocatedBalance === 0 ? "" : data.allocatedBalance} 
            placeholder="0.00"
            onChange={e => setData({...data, allocatedBalance: e.target.value === "" ? 0 : parseFloat(e.target.value)})} 
            className="w-full bg-white/5 border border-current border-opacity-10 p-3 text-xs font-black outline-none focus:border-red-500/50" 
          />
        </div>
        <button 
          onClick={() => save({ allocatedBalance: data.allocatedBalance })} 
          className="w-full py-2 bg-red-500 text-black font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-red-400 transition-all"
        >
          {saving ? <RefreshCw className="animate-spin" size={12}/> : <Save size={12}/>} Sync Allocation
        </button>
      </div>

      {/* 3. BALLOT MANAGEMENT */}
      <div className="space-y-8 border-t border-current border-opacity-10 pt-8">
        <div className="space-y-6">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Proposals Configuration</span>
          
          {/* Charity Proposals */}
          <div className="p-4 border border-dashed border-current border-opacity-20 space-y-6">
            <span className="text-[8px] font-black uppercase opacity-40">Charity Voting Section</span>
            <div className="space-y-8">
              {['c1', 'c2'].map(id => (
                <div key={id} className="space-y-3 border-b border-white/5 pb-6 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-black opacity-30 uppercase">Slot {id.toUpperCase()} (Votes: {data.votes?.[id] || 0})</span>
                    <button onClick={() => handleResetSlot(id, 'charity')} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={12}/></button>
                  </div>
                  <input 
                    placeholder="Charity Name" 
                    value={data.charityTask?.[id === 'c1' ? 'name1' : 'name2'] || ""} 
                    onChange={e => setData({...data, charityTask: {...data.charityTask, [id === 'c1' ? 'name1' : 'name2']: e.target.value}})} 
                    className="w-full bg-white/5 border border-current border-opacity-10 p-2 text-[9px] font-black outline-none focus:border-white/30" 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <LinkIcon size={10} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-20" />
                      <input 
                        placeholder="Link" 
                        value={data.charityTask?.[id === 'c1' ? 'link1' : 'link2'] || ""} 
                        onChange={e => setData({...data, charityTask: {...data.charityTask, [id === 'c1' ? 'link1' : 'link2']: e.target.value}})} 
                        className="w-full bg-white/5 border border-current border-opacity-10 p-2 pl-7 text-[8px] font-mono outline-none focus:border-white/30" 
                      />
                    </div>
                    <div className="relative">
                      <ImageIcon size={10} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-20" />
                      <input 
                        placeholder="Image URL" 
                        value={data.charityTask?.[id === 'c1' ? 'img1' : 'img2'] || ""} 
                        onChange={e => setData({...data, charityTask: {...data.charityTask, [id === 'c1' ? 'img1' : 'img2']: e.target.value}})} 
                        className="w-full bg-white/5 border border-current border-opacity-10 p-2 pl-7 text-[8px] font-mono outline-none focus:border-white/30" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => save({ charityTask: data.charityTask })} className="w-full py-2 bg-white/10 text-[9px] font-black uppercase hover:bg-white/20 transition-all">Update Charity Slots</button>
          </div>

          {/* Growth Proposals */}
          <div className="p-4 border border-dashed border-current border-opacity-20 space-y-6 text-left">
            <span className="text-[8px] font-black uppercase opacity-40">Growth Strategy Section</span>
            <div className="space-y-6">
              {['m1', 'm2'].map(id => (
                <div key={id} className="space-y-2 border-b border-white/5 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-black opacity-30 uppercase">Slot {id.toUpperCase()} (Votes: {data.votes?.[id] || 0})</span>
                    <button onClick={() => handleResetSlot(id, 'marketing')} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={12}/></button>
                  </div>
                  <input 
                    placeholder="Strategy Name/Description" 
                    value={data.marketingTask?.[id === 'm1' ? 'name1' : 'name2'] || ""} 
                    onChange={e => setData({...data, marketingTask: {...data.marketingTask, [id === 'm1' ? 'name1' : 'name2']: e.target.value}})} 
                    className="w-full bg-white/5 border border-current border-opacity-10 p-2 text-[9px] font-black outline-none focus:border-white/30" 
                  />
                </div>
              ))}
            </div>
            <button onClick={() => save({ marketingTask: data.marketingTask })} className="w-full py-2 bg-white/10 text-[9px] font-black uppercase hover:bg-white/20 transition-all">Update Growth Slots</button>
          </div>
        </div>
      </div>

      {/* 4. MANUAL HISTORY LOGGING */}
      <div className="space-y-4 border-t border-current border-opacity-10 pt-8">
        <div className="flex justify-between items-center text-left">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Verified History Log</span>
          <button 
            onClick={() => {
              const newEntry = { 
                date: new Date().toISOString().split('T')[0], 
                type: 'Manual', 
                task: 'NEW ENTRY', 
                amount: '0.0 SOL', 
                link: '' 
              };
              save({ history: [newEntry, ...(data.history || [])] });
            }} 
            className="text-[8px] font-black uppercase border border-current px-3 py-1 hover:bg-white hover:text-black transition-all"
          >
            + New Artifact
          </button>
        </div>
        
        <div className="space-y-4">
          {(data.history || []).map((item, i) => (
            <div key={i} className="flex flex-col gap-3 bg-white/5 p-4 border border-current border-opacity-10 text-left">
              <div className="flex gap-4 items-center">
                <div className="flex flex-col gap-1 w-24">
                  <label className="text-[6px] uppercase opacity-30 flex items-center gap-1"><Calendar size={8}/> Date</label>
                  <input 
                    value={item.date} 
                    onChange={e => { const h = [...data.history]; h[i].date = e.target.value; setData({...data, history: h}); }} 
                    className="w-full bg-transparent text-[8px] font-mono outline-none border-b border-white/10" 
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[6px] uppercase opacity-30">Task Description</label>
                  <input 
                    value={item.task} 
                    onChange={e => { const h = [...data.history]; h[i].task = e.target.value.toUpperCase(); setData({...data, history: h}); }} 
                    className="w-full bg-transparent text-[9px] font-black outline-none border-b border-white/10" 
                  />
                </div>
                <button onClick={() => { const h = [...data.history]; h.splice(i, 1); save({ history: h }); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded self-end">
                  <Trash2 size={14}/>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[6px] uppercase opacity-30">Amount SOL</label>
                  <input 
                    value={item.amount} 
                    onChange={e => { const h = [...data.history]; h[i].amount = e.target.value; setData({...data, history: h}); }} 
                    className="bg-transparent text-[9px] font-black outline-none border-b border-white/10 italic" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[6px] uppercase opacity-30 flex items-center gap-1"><LinkIcon size={8}/> Solscan Proof Link</label>
                  <input 
                    value={item.link || ""} 
                    onChange={e => { const h = [...data.history]; h[i].link = e.target.value; setData({...data, history: h}); }} 
                    className="bg-transparent text-[7px] font-mono outline-none border-b border-white/10 opacity-60 focus:opacity-100" 
                    placeholder="https://solscan.io/tx/..."
                  />
                </div>
              </div>
            </div>
          ))}
          
          {data.history?.length > 0 && (
            <button 
              onClick={() => save({ history: data.history })} 
              className="w-full py-3 bg-white text-black font-black text-[9px] uppercase hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              Force Sync Ledger History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home'); 
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showXNote, setShowXNote] = useState(false);
  const [logoPulse, setLogoPulse] = useState(false);
  const ca = "3vsKvFYRbn5Mrfk5mJsxEDto2UwmrcWtqvC5o7SYpump";

  // AI State Logic
  const [uploadImage, setUploadImage] = useState(null);
  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Sign in anonymously on mount to enable Firestore listeners
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
  }, []);

  const copyToClipboard = (textToCopy) => {
    const textArea = document.createElement("textarea");
    textArea.value = String(textToCopy);
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
      // RESTORED: Full Artistic Signal Logic
      const templateBase64 = await getBase64FromUrl('blank.jpg');
      
      const prompt = `Perform an Artistic Right Correction:
      1. Reference Image 1 (User Meme) and Image 2 (Wide Template).
      2. Use Image 2 as your rigid canvas for the final output size and ratio.
      3. EXTRACT ONLY THE MAIN SUBJECT from Image 1. 
      4. RE-DRAW the entire background of Image 1 on the Image 2 canvas in a messy, hand-drawn digital sketch style. It should feel artistic and sketchy, not a photo. and must fill the whole frame. 
      5. SHRINK the extracted subject from Image 1 a bit, only if it is too big. 
      6. PLACE this subject at the absolute far-right edge of the new sketchy canvas.
      7. Leave the remaining 70% of the image to the left completely empty of subjects, showing only the simplified sketchy background.
      8. On top of the newly drawn background, add a small, hand-written, sketchy text element that feels naturally placed in the composition.
      The text must include the word “right”, but must never be the same phrase twice.
      Generate a short powerful positive quote that subtly responds to the subject’s pose, mood, or context in the image.
      Use imperfect, ugly handwriting with hand-drawn energy, artsy and organic, matching the background’s color palette and texture.
      The placement should feel accidental yet intentional — like it was scribbled by a human after looking at the image.
      If the generated quote does not sound natural when read aloud, regenerate it.
      9. The goal is to make the subject look like they are fleeing to the far right. The final output must be a panoramic 4:1 artifact. 
      10. NO BORDER. IT IS CRUCIAL THAT THE OUPUT SIZE IS IMAGE 2 SIZE (WIDE TEMPLATE).`;

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
    } catch (err) {
      setError("Artifact creation failed. Retry.");
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
      <header className="flex flex-col items-end pt-12 mb-12 group cursor-pointer" onClick={handleLogoClick}>
        <div className="relative mb-8">
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

      <main className="flex flex-col items-end space-y-12 mb-20 w-full font-mono text-right">
        <div className="space-y-1 opacity-80 italic transition-all"><p>quietly built.</p><p className="opacity-75">slowly found.</p><p className="opacity-50">rightfully held.</p></div>
        
        <div className="flex flex-col items-end gap-3 mt-10">
          <button onClick={() => setView('world')} className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] px-6 py-3 border border-current hover:bg-current hover:text-current-bg transition-all ${darkMode ? 'border-white/20 hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-black/20 hover:bg-black hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.05)]'}`}>
            Make things right <MoveRight size={14} />
          </button>
          <button onClick={() => setView('governance')} className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] px-6 py-3 border border-current hover:bg-current hover:text-current-bg transition-all ${darkMode ? 'border-white/20 hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-black/20 hover:bg-black hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.05)]'}`}>
            The Ledger <BarChart3 size={14} />
          </button>
          <button onClick={() => setView('community')} className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] px-6 py-3 border border-current hover:bg-current hover:text-current-bg transition-all ${darkMode ? 'border-white/20 hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-black/20 hover:bg-black hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.05)]'}`}>
            Right Community <Users size={14} />
          </button>
        </div>

        <div className="w-full flex flex-col items-end group/ca w-full pt-10">
          <span className={`text-[8px] font-black uppercase tracking-[0.4em] mb-3 italic opacity-40`}>Official Address</span>
          <div onClick={() => copyToClipboard(ca)} className={`w-full cursor-pointer border-r-4 py-4 px-6 transition-all flex items-center justify-between ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'}`}>
            {copied ? <ShieldCheck size={18} className="text-green-500" /> : <Copy size={18} className="opacity-20" />}
            <span className="font-mono text-[11px] tracking-tighter opacity-40 group-hover/ca:opacity-100 uppercase truncate ml-4">{copied ? "COPIED" : ca.slice(0, 18) + "..."}</span>
          </div>
        </div>
      </main>
    </div>
  );

  if (view === 'admin') {
    return (
      <div className={`min-h-screen flex justify-end font-sans relative overflow-hidden ${darkMode ? 'bg-[#080808] text-white' : 'bg-[#fcfcfc] text-black'}`}>
        <div className={`w-full max-w-md flex flex-col p-12 text-right relative z-10 border-l ${darkMode ? 'border-white/5 bg-black/40 shadow-2xl' : 'border-black/5 bg-white/40 shadow-xl'} overflow-y-auto no-scrollbar scroll-smooth`}>
           <MasterAdminPanel db={db} appId={appId} setView={setView} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 flex justify-end font-sans relative overflow-hidden ${darkMode ? 'bg-[#080808] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      <div className="fixed inset-0 pointer-events-none noise-overlay opacity-[0.04]" />

      <div className={`w-full max-w-md md:max-w-sm lg:max-w-[340px] flex flex-col p-8 md:p-12 lg:p-14 text-right relative z-10 border-l ${darkMode ? 'border-white/5 bg-black/40 shadow-2xl' : 'border-black/5 bg-white/40 shadow-xl'} overflow-y-auto no-scrollbar scroll-smooth`}>
        
        {view === 'home' ? (
          <HomeView />
        ) : (
          <div className="animate-fade-in flex flex-col items-end w-full">
            <header className="w-full mb-10 flex justify-between items-center">
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity">
                <ArrowLeft size={12} /> Back
              </button>
              <img src="logo.png" alt="Logo" onClick={handleLogoClick} className={`w-8 h-8 object-contain cursor-pointer hover:scale-110 transition-transform`} />
            </header>

            {view === 'world' ? (
              <div className="w-full space-y-6">
                <label className={`w-full h-40 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'}`}>
                  {uploadImage && <img src={uploadImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="" />}
                  <div className="relative z-10 flex flex-col items-center gap-2 text-center text-current opacity-40 uppercase font-black text-[9px] tracking-widest">
                    <ImageIcon size={20} />
                    <span>Load Source</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                
                {/* RESTORED: Persistent Visibility for Enforce Bias button */}
                <button 
                  onClick={architectMeme} 
                  disabled={!uploadImage || isGenerating} 
                  className={`w-full py-4 bg-current text-current-bg font-black uppercase text-[10px] tracking-[0.5em] transition-all ${(!uploadImage || isGenerating) ? 'opacity-20' : 'hover:opacity-80 active:translate-y-1'}`}
                >
                  {isGenerating ? "Processing Artifact..." : "Enforce Right Bias"}
                </button>

                {generatedMeme && (
                  <div className="space-y-4 animate-fade-in flex flex-col items-end w-full group">
                    <div className="relative cursor-zoom-in w-full" onClick={() => setShowModal(true)}>
                      <img src={generatedMeme} className={`w-full h-auto border-r-8 border-current shadow-xl transition-all duration-700 grayscale group-hover:grayscale-0 ${darkMode ? 'border-white' : 'border-black'}`} alt="" />
                      <div className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 size={14} className="text-white" /></div>
                    </div>
                    <button onClick={() => { const link = document.createElement('a'); link.href = generatedMeme; link.download = 'artifact.png'; link.click(); }} className="mt-2 text-[9px] font-black uppercase border-b border-current pb-1 opacity-40 hover:opacity-100 transition-opacity">Save Artifact</button>
                  </div>
                )}
              </div>
            ) : view === 'governance' ? (
              <GovernanceModule db={db} auth={auth} appId={appId} darkMode={darkMode} tokenCA={ca} />
            ) : (
              <ChatApp db={db} auth={auth} appId={appId} darkMode={darkMode} setView={setView} />
            )}
          </div>
        )}

        <footer className="flex flex-col items-end gap-12 mt-auto pb-6 pt-20">
          <button onClick={toggleDarkMode} className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20 hover:opacity-100 transition-opacity flex items-center gap-2">
            {darkMode ? <Sun size={12}/> : <Moon size={12}/>} Mode
          </button>
          <div className="text-right border-r-[8px] pr-6 border-current border-opacity-10 font-mono font-black italic tracking-tight leading-none opacity-80 uppercase">
            <p className="text-[18px] md:text-[22px] mb-2">If you’re here,</p>
            <p className="text-[18px] md:text-[22px]">You already know why.</p>
          </div>
          <div className="flex gap-10">
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all"><Zap size={22} fill="currentColor" stroke="none" /></a>
            <button onClick={() => setShowXNote(true)} className="opacity-40 hover:opacity-100 transition-all">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4"><div className="h-[1px] w-16 opacity-20 bg-current" /><span className="text-[9px] font-black uppercase tracking-[1.5em] opacity-10 font-mono">RIGHT</span></div>
        </footer>
      </div>

      {showXNote && (
        <div className="fixed inset-0 z-[110] flex justify-end backdrop-blur-md bg-black/40 p-4 md:p-12" onClick={() => setShowXNote(false)}>
           <div className={`w-full max-w-sm h-fit my-auto p-10 border-r-[12px] shadow-2xl animate-scale-up ${darkMode ? 'bg-black border-white/20 text-white' : 'bg-white border-black/10 text-black'}`} onClick={e => e.stopPropagation()}>
              <X size={20} className="mb-8 cursor-pointer opacity-40 hover:opacity-100" onClick={() => setShowXNote(false)}/>
              <h4 className="text-xl font-black uppercase italic mb-6">X // Signal_Update</h4>
              <p className="text-sm font-bold opacity-60 leading-relaxed text-right uppercase tracking-tighter leading-tight">Right community will make the right X community and it will be updated.</p>
              <div className="h-[1px] w-20 bg-current opacity-20 mt-8" />
           </div>
        </div>
      )}

      {showModal && generatedMeme && (
        <div className="fixed inset-0 z-[100] flex justify-end backdrop-blur-xl bg-black/60 p-4 md:p-12 lg:p-24" onClick={() => setShowModal(false)}>
           <div className="w-full max-w-5xl h-fit my-auto bg-black border-r-[24px] border-white/10 p-4 shadow-2xl relative animate-scale-up" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowModal(false)} className="absolute -top-12 right-0 text-white/40 uppercase font-black text-[10px] tracking-widest flex items-center gap-2 hover:text-white transition-colors">Close <X size={14}/></button>
              <img src={generatedMeme} className="w-full h-auto" alt="" />
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: translateX(30px) scale(0.98); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .noise-overlay { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        body::-webkit-scrollbar, .no-scrollbar::-webkit-scrollbar { display: none; }
        body, .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .text-current-bg { color: ${darkMode ? '#080808' : '#fcfcfc'}; }
      `}} />
    </div>
  );
};

export default App;