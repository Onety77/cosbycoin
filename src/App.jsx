import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Twitter, ArrowUpRight, Trophy, Zap, MessageCircle, Heart, Repeat, Ban, TrendingUp, AlertTriangle, X as XIcon, Terminal, Power, Copy, Check, ScanLine, Activity, Globe, Shield, Radar, DollarSign, BarChart3 } from 'lucide-react';

/* --- 1. CONFIGURATION --- */
// PASTE YOUR TOKEN CONTRACT ADDRESS HERE TO SEE LIVE DATA
const TOKEN_CA = "Coming Soon..."; 

/* --- 2. MASTER STYLES (GOD MODE) --- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Jacquard+12&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

    :root {
      --bg-color: #050505;
      --text-color: #f0f0f0;
      --accent: #ccff00; /* Acid Green */
      --accent-dim: rgba(204, 255, 0, 0.1);
      --secondary: #ff00ff; /* Cyber Magenta */
      --glass: rgba(10, 10, 10, 0.8);
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      overflow-x: hidden;
      cursor: crosshair;
      user-select: none;
      font-feature-settings: "ss01", "ss02";
      margin: 0;
      padding: 0;
    }

    /* SCROLLBAR HIDDEN FOR CINEMATIC FEEL */
    ::-webkit-scrollbar { width: 0px; background: transparent; }

    .font-anton { font-family: 'Anton', sans-serif; letter-spacing: -0.02em; }
    .font-mono { font-family: 'Space Mono', monospace; }
    .font-gothic { font-family: 'Jacquard 12', cursive; }

    /* NOISE TEXTURE - HIGH RES */
    .noise {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none; z-index: 50; opacity: 0.04;
      background: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
    }

    /* BACKGROUND DRIFTERS */
    @keyframes drift {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
        50% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0.6; }
        100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
    }
    .w-drifter {
        animation: drift var(--duration) ease-in-out infinite;
        will-change: transform, opacity;
    }

    /* CLICK EXPLOSION */
    @keyframes pop-fade {
      0% { transform: translate(-50%, -50%) scale(0.5) rotate(0deg); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(2.0) rotate(var(--rot)); opacity: 0; }
    }
    .click-w {
      position: fixed; pointer-events: none; z-index: 9999;
      font-weight: 900; text-shadow: 0 0 15px var(--accent);
      animation: pop-fade 0.5s ease-out forwards;
    }

    /* SCANLINE SWEEP ANIMATION */
    @keyframes scanline-anim {
        0% { top: -100%; opacity: 0; }
        50% { opacity: 1; }
        100% { top: 200%; opacity: 0; }
    }
    .scanline {
        animation: scanline-anim 2s linear infinite;
    }

    /* CARD HOVER PHYSICS */
    .intel-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        background: rgba(10, 10, 10, 0.6);
        border: 1px solid #222;
    }
    .intel-card:hover {
        transform: translateY(-5px) scale(1.02);
        border-color: var(--accent);
        background: #000;
        box-shadow: 0 10px 30px -10px rgba(204, 255, 0, 0.15);
    }

    /* TEXT FADE IN FOR WISDOM NODE */
    @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(5px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .text-fade { animation: fade-in-up 0.3s ease-out forwards; }
  `}</style>
);

/* --- 3. AUDIO KERNEL --- */
const AudioKernel = {
    ctx: null,
    init: () => {
        try {
            if (!AudioKernel.ctx) AudioKernel.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (AudioKernel.ctx.state === 'suspended') AudioKernel.ctx.resume().catch(() => {});
        } catch (e) {
            console.warn("Audio init failed", e);
        }
    },
    playFx: (freq, type = 'sine', duration = 0.1, vol = 0.1) => {
        if (!AudioKernel.ctx) return;
        try {
            const osc = AudioKernel.ctx.createOscillator();
            const gain = AudioKernel.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, AudioKernel.ctx.currentTime);
            gain.gain.setValueAtTime(vol, AudioKernel.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, AudioKernel.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(AudioKernel.ctx.destination);
            osc.start();
            osc.stop(AudioKernel.ctx.currentTime + duration);
        } catch (e) {
            // Silently fail if audio context is unhappy
        }
    },
    triggerClick: () => {
        AudioKernel.init();
        AudioKernel.playFx(200, 'triangle', 0.05, 0.1);
    }
};

/* --- 4. DATA MATRIX --- */
const INTEL_LOGS = [
  { id: 1, handle: "@Jeremybtc", pfp: "/pfp1.jpg", content: "Manifesting big W’s in november 🙏", stats: { l: 9, r: 1 }, url: "https://x.com/Jeremybtc/status/1983924895927996450?s=20", highlight: false },
  { id: 2, handle: "@a1lon9", pfp: "/pfp2.jpg", content: "W Shadow", stats: { l: 189, r: 11 }, url: "https://x.com/a1lon9/status/1963049475858985395?s=20", highlight: true },
  { id: 3, handle: "@_Shadow36", pfp: "/pfp3.jpg", content: "W", stats: { l: 33, r: 13 }, url: "https://x.com/_Shadow36/status/1991230419971273111?s=20", highlight: true },
  { id: 4, handle: "@_Shadow36", pfp: "/pfp3.jpg", content: "Absolute w", stats: { l: 117, r: 24 }, url: "https://x.com/_Shadow36/status/1983657988532666614?s=20", highlight: true },
  { id: 5, handle: "@Dior100x", pfp: "/pfp4.jpg", content: "W intern", stats: { l: 21, r: 4 }, url: "https://x.com/Dior100x/status/1983623701963927984?s=20", highlight: false },
  { id: 6, handle: "@Pumpfun", pfp: "/pfp5.jpg", content: "W's in the chat", stats: { l: 95, r: 8 }, url: "https://x.com/Pumpfun/status/1968806240667959415?s=20", highlight: true },
  { id: 7, handle: "@moonshot", pfp: "/pfp6.jpg", content: "Major W", stats: { l: 28, r: 2 }, url: "https://x.com/moonshot/status/1979269684269846813?s=20", highlight: false },
  { id: 8, handle: "@Pumpfun", pfp: "/pfp5.jpg", content: "W", stats: { l: 41, r: 3 }, url: "https://x.com/Pumpfun/status/1969085770590794031?s=20", highlight: false },
  { id: 9, handle: "@solana", pfp: "/pfp7.jpg", content: "big W.\n\ncongrats on the raise!", stats: { l: 34, r: 1 }, url: "https://x.com/solana/status/1953492788353618245?s=20", highlight: false },
  { id: 10, handle: "@its_braz", pfp: "/pfp8.jpg", content: "W stream ❤️", stats: { l: 45, r: 2 }, url: "https://x.com/its_braz/status/1992617053535326502?s=20", highlight: false },
  { id: 11, handle: "@solana", pfp: "/pfp7.jpg", content: "W\nW\nW\nW\nW\n\nam I doing this right", stats: { l: 75, r: 6 }, url: "https://x.com/solana/status/1955997644729540673?s=20", highlight: true },
  { id: 13, handle: "@_Shadow36", pfp: "/pfp3.jpg", content: "Huge W", stats: { l: 56, r: 3 }, url: "https://x.com/_Shadow36/status/1993741950634127705?s=20", highlight: true },
  { id: 14, handle: "@_Shadow36", pfp: "/pfp3.jpg", content: "Fuckin W", stats: { l: 108, r: 4 }, url: "https://x.com/_Shadow36/status/1993104819092156824?s=20", highlight: true }
];

const FACTS = [
    "Winning is 10% luck, 90% aesthetic.",
    "The letter 'W' is structurally impossible to topple.",
    "Zero Ls were detected in the making of this protocol.",
    "Gravity is just the earth trying to hold you down. Jump.",
    "A double U is literally twice the value of a single U.",
    "History is written by the winners. Write your own.",
    "There is no second best. There is only W.",
    "The blockchain never forgets a win.",
    "Diamond hands are forged in the fires of volatility.",
    "If you're reading this, you're already early."
];

/* --- 5. TACTICAL COMPONENTS --- */

// LIVE PRICE TICKER (NOW WITH REAL DATA)
const LiveStatsTicker = () => {
    const [stats, setStats] = useState({ price: null, mcap: null, change: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using DexScreener API
                const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CA}`);
                const data = await res.json();
                
                if (data.pairs && data.pairs.length > 0) {
                    const pair = data.pairs[0];
                    setStats({
                        price: pair.priceUsd,
                        mcap: pair.fdv, // Fully Diluted Valuation usually acts as MC
                        change: pair.priceChange.h24
                    });
                }
                setLoading(false);
            } catch (e) {
                console.error("Failed to fetch market data", e);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    // Format Helpers
    const formatPrice = (p) => p ? `$${parseFloat(p).toFixed(8)}` : "---";
    const formatMC = (m) => m ? `$${(m / 1000000).toFixed(2)}M` : "---";
    const formatChange = (c) => c ? `${c > 0 ? '+' : ''}${c}%` : "---";
    const changeColor = stats.change && stats.change >= 0 ? "text-[var(--accent)]" : "text-red-500";

    return (
        <div className="w-full bg-black border-y border-neutral-900 py-3 overflow-hidden flex justify-center relative z-20">
            <div className="flex gap-8 md:gap-16 font-mono text-xs text-neutral-500 uppercase tracking-widest animate-pulse whitespace-nowrap">
                <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-[var(--accent)]'}`}/> 
                    Status: {loading ? "SCANNING..." : "LIVE UPLINK"}
                </span>
                
                <span className="flex items-center gap-2">
                    Price: <span className="text-white font-bold">{loading ? "CALCULATING..." : formatPrice(stats.price)}</span>
                </span>
                
                <span className="flex items-center gap-2">
                    24H: <span className={`font-bold ${changeColor}`}>{loading ? "---" : formatChange(stats.change)}</span>
                </span>

                <span className="flex items-center gap-2">
                    M.CAP: <span className="text-white font-bold">{loading ? "---" : formatMC(stats.mcap)}</span>
                </span>
            </div>
        </div>
    );
};

const ContractBadge = () => {
    const [copied, setCopied] = useState(false);
    
    const copyToClip = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(TOKEN_CA);
            AudioKernel.triggerClick();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = TOKEN_CA;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div onClick={copyToClip} className="group relative mt-8 mb-4 cursor-pointer">
            <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-10 blur-md transition-opacity"/>
            <div className="relative flex items-center gap-3 bg-[#0a0a0a] border border-neutral-800 px-6 py-3 rounded-sm group-hover:border-[var(--accent)] transition-all">
                <div className="flex flex-col items-start">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Contract Address</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs md:text-sm text-neutral-300 group-hover:text-white transition-colors">
                            {TOKEN_CA.substring(0, 6)}...{TOKEN_CA.substring(TOKEN_CA.length - 6)}
                        </span>
                        {copied ? <Check size={14} className="text-[var(--accent)]"/> : <Copy size={14} className="text-neutral-600 group-hover:text-[var(--accent)]"/>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HUD = ({ scrolled }) => {
    return (
        <div className={`fixed top-0 left-0 w-full p-6 z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-black/80 backdrop-blur-md border-b border-white/5' : 'py-6'}`}>
            <div className="flex justify-between items-center max-w-[1920px] mx-auto">
                {/* LOGO (STATIC, NO SOUND) */}
                <div className="flex items-center gap-4 cursor-default">
                    <div className="relative">
                        <img 
                            src="/logo.png" 
                            alt="W" 
                            className={`h-12 w-auto object-contain transition-all duration-500 ${scrolled ? 'brightness-100' : 'brightness-125 drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]'}`}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                        <div className="hidden text-5xl font-black font-anton tracking-tighter text-white">W</div>
                    </div>
                    
                    {/* HUD DATA STREAM - Only visible when scrolled */}
                    <div className={`hidden md:block overflow-hidden transition-all duration-500 ${scrolled ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
                        <div className="font-mono text-[9px] text-[var(--accent)] leading-tight border-l-2 border-[var(--accent)] pl-2">
                            SYS: OPTIMAL<br/>
                            VIBE: PEAK<br/>
                            OBJ: WIN
                        </div>
                    </div>
                </div>

                {/* ACQUIRE BUTTON */}
                <button 
                    className="group relative px-6 py-2 bg-transparent overflow-hidden cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); window.open('https://app.uniswap.org/', '_blank'); }}
                >
                    <div className="absolute inset-0 border border-neutral-700 group-hover:border-[var(--accent)] transition-colors skew-x-[-12deg] bg-black"/>
                    <div className="relative flex items-center gap-2 font-mono text-xs font-bold text-neutral-300 group-hover:text-[var(--accent)] uppercase tracking-wider">
                        <span>Acquire</span>
                        <ArrowUpRight size={14} />
                    </div>
                </button>
            </div>
        </div>
    );
};

const DriftingBackground = () => {
    const [nodes, setNodes] = useState([]);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => requestAnimationFrame(() => setScrollY(window.scrollY));
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setNodes(Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 6 + 2, // rem
            duration: Math.random() * 20 + 20 + 's',
            delay: -Math.random() * 20 + 's',
            dx: (Math.random() - 0.5) * 50 + 'px',
            dy: (Math.random() - 0.5) * 50 + 'px',
            rot: (Math.random() - 0.5) * 90 + 'deg'
        })));
    }, []);

    return (
        <div 
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
            // PHYSICS: 0.5 Factor
            style={{ transform: `translateY(${scrollY * 0.5}px)` }} 
        >
            {nodes.map(n => (
                <div 
                    key={n.id} 
                    className="absolute font-anton text-[#111] w-drifter select-none"
                    style={{
                        left: `${n.left}%`, top: `${n.top}%`,
                        fontSize: `${n.size}rem`,
                        opacity: 0.5, 
                        '--duration': n.duration, '--dx': n.dx, '--dy': n.dy, '--rot': n.rot,
                        animationDelay: n.delay
                    }}
                >W</div>
            ))}
        </div>
    );
};

/* --- 6. SECTIONS --- */

const Hero = ({ onEnter }) => {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-32 z-10">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex items-center gap-2 px-3 py-1 bg-[#111] border border-[#222] rounded-full">
                    <div className="w-2 h-2 bg-[var(--accent)] animate-pulse rounded-full"/>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-[0.2em]">Broadcast Incoming</span>
                </div>

                <h1 className="relative font-anton text-[18vw] md:text-[14vw] leading-[0.85] uppercase tracking-tight text-white mix-blend-difference select-none hover-glitch transition-transform hover:scale-[1.02] duration-300 cursor-default">
                    JUST<br/>WIN
                </h1>

                <p className="mt-8 max-w-xl font-mono text-sm md:text-base text-neutral-400 px-6 leading-relaxed">
                    THE ONLY METRIC IS VICTORY. <br/>
                    <span className="text-[var(--accent)]">WE ARE THE SYSTEM, YOU ARE EITHER WINNING OR YOU ARE NOISE.</span>
                </p>

                <ContractBadge />

                <div className="mt-8 relative group cursor-pointer" onClick={onEnter}>
                    <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-neutral-800 group-hover:bg-[var(--accent)] transition-colors"/>
                    <div className="absolute -right-4 top-0 bottom-0 w-[2px] bg-neutral-800 group-hover:bg-[var(--accent)] transition-colors"/>
                    
                    <button className="relative px-12 py-4 bg-transparent border-y border-neutral-800 group-hover:border-[var(--accent)] transition-all overflow-hidden cursor-pointer">
                        <span className="relative z-10 font-mono text-sm font-bold uppercase tracking-[0.3em] text-white group-hover:text-[var(--accent)] transition-colors flex items-center gap-3">
                            Hyper Object <ScanLine size={16} className="hidden group-hover:block animate-pulse"/>
                        </span>
                        <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-10 transition-opacity duration-200"/>
                        <div className="scanline absolute left-0 top-0 w-full h-[1px] bg-[var(--accent)] opacity-0 group-hover:opacity-100 z-20 pointer-events-none"/>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-0 w-full">
                <LiveStatsTicker />
            </div>
        </section>
    );
};

const VelocityMarquee = () => {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef();
  const lastScrollY = useRef(0);
  const phrases = ["NO Ls ALLOWED", "OMEGA WIN", "W IS THE CODE"]; 

  const animate = useCallback(() => {
    const currentScrollY = window.scrollY;
    const velocity = Math.abs(currentScrollY - lastScrollY.current);
    lastScrollY.current = currentScrollY;
    const speed = 1 + (velocity * 0.5); 
    setOffset(prev => (prev - speed) % 1000); 
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return (
    <div className="bg-[var(--accent)] py-3 overflow-hidden border-y-4 border-black relative z-20 rotate-[-1deg] scale-105 my-12">
      <div className="flex whitespace-nowrap gap-12" style={{ transform: `translateX(${offset}px)` }}>
        {[...Array(30)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 font-mono text-xl font-bold text-black uppercase tracking-tighter">
            <span>{phrases[i % phrases.length]}</span>
            <Ban size={20} strokeWidth={3} />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- UPDATED TACTICAL CHART WITH LIVE EMBED ---
const TacticalChart = () => {
    // DexScreener embed URL for Solana
    const chartUrl = `https://dexscreener.com/solana/${TOKEN_CA}?embed=1&theme=dark&trades=0&info=0`;

    return (
        <div className="break-inside-avoid w-full bg-[#080808] border border-neutral-800 relative overflow-hidden group mb-8 h-[450px] flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-neutral-900 bg-[#0c0c0c]">
                <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12}/> Market Surveillance
                </span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/20"/>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/20"/>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                </div>
            </div>
            
            {/* LIVE CHART IFRAME */}
            <div className="relative flex-grow w-full bg-black">
                 <iframe 
                    src={chartUrl}
                    title="DexScreener Chart"
                    className="absolute inset-0 w-full h-full border-0"
                />
            </div>
        </div>
    );
};

const IntelLog = ({ data }) => (
    <div className="break-inside-avoid mb-6 intel-card p-5 relative overflow-hidden group cursor-pointer" onClick={() => window.open(data.url, '_blank')}>
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-900 rounded-sm overflow-hidden border border-neutral-800 group-hover:border-white transition-colors">
                    <img src={data.pfp} alt="User" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'}/>
                    <div className="w-full h-full flex items-center justify-center text-[var(--accent)] font-bold">W</div>
                </div>
                <div>
                    <div className="flex items-center gap-1">
                        <span className="font-mono text-sm font-bold text-white group-hover:text-[var(--accent)]">{data.handle}</span>
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"><Check size={8} className="text-black"/></div>
                    </div>
                    <div className="font-mono text-[10px] text-neutral-500">ENCRYPTED ID: {data.id}8492</div>
                </div>
            </div>
            <Twitter size={16} className="text-neutral-600 group-hover:text-white"/>
        </div>
        <div className="font-mono text-sm text-neutral-300 leading-relaxed mb-4 border-l-2 border-neutral-800 pl-3 group-hover:border-[var(--accent)] transition-colors">
            {data.content}
        </div>
        <div className="flex gap-4 pt-3 border-t border-dashed border-neutral-800 font-mono text-xs text-neutral-600">
            <span className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart size={12}/> {data.stats.l}</span>
            <span className="flex items-center gap-1 hover:text-green-500 transition-colors"><Repeat size={12}/> {data.stats.r}</span>
        </div>
    </div>
);

const WisdomNode = () => {
    const [index, setIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const handleNext = (e) => {
        e.stopPropagation();
        setAnimating(false);
        setTimeout(() => {
            setIndex((prev) => (prev + 1) % FACTS.length);
            setAnimating(true);
        }, 50);
    };

    return (
        <div 
            onClick={handleNext}
            className="break-inside-avoid mb-6 p-6 bg-[var(--accent)] text-black relative group cursor-pointer select-none transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] z-30"
        >
            <h3 className="font-anton text-3xl mb-2">WISDOM NODE</h3>
            <p className={`font-mono text-xs font-bold leading-relaxed min-h-[60px] ${animating ? 'text-fade' : ''}`}>
                {FACTS[index]}
            </p>
            <div className="absolute top-2 right-2 opacity-50"><Zap size={20}/></div>
            <div className="mt-4 text-[10px] font-mono uppercase opacity-60 flex items-center gap-2 border-t border-black/20 pt-2">
                Click to Decrypt <ArrowUpRight size={10}/>
            </div>
        </div>
    );
};

const Feed = () => {
    const [filter, setFilter] = useState('ALL'); 

    const displayedLogs = filter === 'ALL' 
        ? INTEL_LOGS 
        : INTEL_LOGS.filter(log => log.highlight);

    return (
        <section className="relative z-20 px-4 md:px-8 py-24 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-8">
                <div>
                    <h2 className="font-anton text-6xl md:text-8xl text-white mb-2">INTEL FEED</h2>
                    <p className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">Global Winning Consensus</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                     <button 
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-1 border font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${filter === 'ALL' ? 'border-[var(--accent)] bg-[var(--accent)] text-black' : 'border-neutral-800 text-neutral-500 hover:text-white'}`}
                     >
                        All Signals
                     </button>
                     <button 
                        onClick={() => setFilter('ALPHA')}
                        className={`px-4 py-1 border font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${filter === 'ALPHA' ? 'border-[var(--accent)] bg-[var(--accent)] text-black' : 'border-neutral-800 text-neutral-500 hover:text-white'}`}
                     >
                        Alpha Only
                     </button>
                </div>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                <TacticalChart />
                {displayedLogs.map(log => <IntelLog key={log.id} data={log} />)}
                <WisdomNode />
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="relative bg-black border-t border-neutral-900 py-24 px-6 overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,var(--accent-dim),transparent_70%)] opacity-20 pointer-events-none"/>
            <div className="max-w-[1600px] mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                <div>
                    <div className="group font-anton text-[15vw] md:text-[12vw] leading-[0.8] text-[#111] select-none transition-colors duration-500 cursor-default relative z-20 hover:text-[var(--accent)]">
                        KEEP<br/><span className="group-hover:text-[var(--accent)] text-white transition-colors duration-500">WINNING</span>
                    </div>
                </div>

                <div className="flex flex-col gap-8 text-right">
                    <div className="flex flex-col gap-2 font-mono text-sm font-bold text-neutral-400">
                        <a href="#" className="hover:text-[var(--accent)] hover:translate-x-[-5px] transition-all">X</a>
                        <a href="#" className="hover:text-[var(--accent)] hover:translate-x-[-5px] transition-all">COMMUNITY</a>
                        <a href="#" className="hover:text-[var(--accent)] hover:translate-x-[-5px] transition-all">CHART</a>
                    </div>
                    
                    <div className="font-mono text-[10px] text-neutral-600 max-w-xs">
                        COPYRIGHT © 2025 PROJECT W.<br/>
                        NO FINANCIAL ADVICE. JUST VIBES.<br/>
                        ALL RIGHTS RESERVED BY THE WINNERS.
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* --- 7. ARENA ENGINE --- */
const Arena = ({ onExit }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    
    // UI State for Score
    const [currentImpacts, setCurrentImpacts] = useState(0);
    const [bestImpacts, setBestImpacts] = useState(0);
    const [status, setStatus] = useState("IDLE");

    // Mutable Physics & Game State
    const state = useRef({
        // SAFETY FLAG: Controls the render loop
        active: true,

        // POSITION
        pos: { x: 0, y: 0 },
        // VELOCITY
        vel: { x: 0, y: 0 },
        // ROTATION
        rot: { x: 0, y: 0, z: 0 },
        rotVel: { x: 0.01, y: 0.02 },

        // INPUT
        mouse: { x: 0, y: 0 },
        prevMouse: { x: 0, y: 0 },
        isDragging: false,
        
        // VISUALS
        trail: [], 
        particles: [], 
        floatingTexts: [], 
        shake: 0, 
        
        frame: 0
    });

    const audioRef = useRef(null);

    // --- 3D MATH HELPER ---
    const project = (x, y, z, width, height, offsetX, offsetY) => {
        const scale = 500 / (500 + z); 
        const x2d = (x * scale) + (width / 2) + offsetX;
        const y2d = (y * scale) + (height / 2) + offsetY;
        return { x: x2d, y: y2d };
    };

    const rotateX = (x, y, z, angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return { x, y: y * cos - z * sin, z: y * sin + z * cos };
    };

    const rotateY = (x, y, z, angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return { x: x * cos - z * sin, y, z: x * sin + z * cos };
    };

    // --- AUDIO SYSTEM ---
    const initAudio = () => {
        if (!audioRef.current) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioContext();
                
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                gain.gain.value = 0;

                const impactGain = ctx.createGain();
                impactGain.connect(ctx.destination);
                impactGain.gain.value = 0.5;

                audioRef.current = { ctx, osc, gain, impactGain };
            } catch (e) {
                console.warn("Arena audio init failed - continuing without sound", e);
            }
        } else if (audioRef.current?.ctx?.state === 'suspended') {
            audioRef.current.ctx.resume().catch(() => {});
        }
    };

    const playBounce = (intensity) => {
        if (!audioRef.current) return;
        const { ctx, impactGain } = audioRef.current;
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        osc.connect(impactGain);
        
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        
        impactGain.gain.setValueAtTime(Math.min(intensity * 0.5, 0.5), t);
        impactGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        
        osc.start(t);
        osc.stop(t + 0.15);
    };

    const updateAudio = (speed) => {
        if (!audioRef.current) return;
        const { ctx, osc, gain } = audioRef.current;
        const t = ctx.currentTime;
        const vol = Math.min(0.1, speed * 0.005); 
        gain.gain.setTargetAtTime(vol, t, 0.1);
        osc.frequency.setTargetAtTime(60 + (speed * 5), t, 0.1);
    };

    // --- VISUAL FX HELPERS ---
    const spawnParticles = (x, y, color, count, speed) => {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * speed;
            state.current.particles.push({
                x, y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    };

    const spawnFloatingText = (x, y, text, color) => {
        state.current.floatingTexts.push({
            x, y, text, color, life: 1.0, dy: -2
        });
    };

    // --- MAIN GAME LOOP ---
    useEffect(() => {
        // *** CRITICAL FIX FOR LOCAL DEV ***
        // In strict mode, useEffect runs twice. The first cleanup sets active=false.
        // We MUST force it true again here, otherwise the second loop instantly dies.
        state.current.active = true;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Handle Retina/High-DPI displays to prevent blurriness
        // This ensures the canvas resolution matches the screen's pixel density
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        const handleResize = () => { 
            width = window.innerWidth; 
            height = window.innerHeight; 
            
            // Set actual size in memory (scaled to account for extra pixel density)
            // Note: We are keeping simple 1:1 mapping for physics simplicity here
            // to avoid hit-testing bugs, but ensuring full width/height is set.
            canvas.width = width; 
            canvas.height = height; 
        };

        // W GEOMETRY
        const baseW = 120;
        const h = 120;
        const d = 40; 
        const vRaw = [
            { x: -1.0, y: -0.8 }, { x: -0.8, y: -0.8 }, { x: -0.5, y: 0.5 },
            { x: 0.0, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: 0.8, y: -0.8 },
            { x: 1.0, y: -0.8 }, { x: 0.6, y: 0.8 }, { x: 0.0, y: -0.2 },
            { x: -0.6, y: 0.8 }
        ];
        const vertices = [];
        vRaw.forEach(v => vertices.push({ x: v.x * baseW, y: v.y * h, z: -d }));
        vRaw.forEach(v => vertices.push({ x: v.x * baseW, y: v.y * h, z: d }));
        const edges = [
            [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9], [9,0],
            [10,11], [11,12], [12,13], [13,14], [14,15], [15,16], [16,17], [17,18], [18,19], [19,10],
            [0,10], [1,11], [2,12], [3,13], [4,14], [5,15], [6,16], [7,17], [8,18], [9,19]
        ];

        // --- INPUT HANDLING ---
        const handleStart = (x, y) => {
            initAudio(); 
            
            const cx = (width / 2) + state.current.pos.x;
            const cy = (height / 2) + state.current.pos.y;
            const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
            
            if (dist < 150) {
                state.current.isDragging = true;
                state.current.prevMouse = { x, y };
                state.current.vel = { x: 0, y: 0 };
                state.current.rotVel = { x: 0, y: 0 };
                
                setCurrentImpacts(0);
                setStatus("AIMING");
            }
        };

        const handleMove = (x, y) => {
            if (state.current.isDragging) {
                const dx = x - state.current.prevMouse.x;
                const dy = y - state.current.prevMouse.y;
                
                state.current.pos.x += dx;
                state.current.pos.y += dy;
                state.current.rot.y += dx * 0.005;
                state.current.rot.x -= dy * 0.005;
                
                state.current.vel = { x: dx, y: dy };
                state.current.rotVel = { x: dy * 0.002, y: -dx * 0.002 };

                state.current.prevMouse = { x, y };
            }
        };

        const handleEnd = () => {
            if (state.current.isDragging) {
                state.current.isDragging = false;
                setStatus("IN FLIGHT");
            }
        };

        window.addEventListener('mousedown', e => handleStart(e.clientX, e.clientY));
        window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('touchstart', e => handleStart(e.touches[0].clientX, e.touches[0].clientY), {passive: false});
        canvas.addEventListener('touchmove', e => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); }, {passive: false});
        canvas.addEventListener('touchend', handleEnd);
        window.addEventListener('resize', handleResize);

        // --- RENDER & PHYSICS LOOP ---
        const render = () => {
            // Check flag. If unmounted, this stops immediately.
            if (!state.current.active) return;

            state.current.frame++;
            
            // 1. UPDATE PHYSICS
            let hitWall = false;
            let impactPos = { x: 0, y: 0 };
            let currentSpeed = 0;

            if (!state.current.isDragging) {
                // Apply Velocity
                state.current.pos.x += state.current.vel.x;
                state.current.pos.y += state.current.vel.y;
                
                // Friction
                state.current.vel.x *= 0.995; 
                state.current.vel.y *= 0.995;
                state.current.rotVel.x *= 0.98;
                state.current.rotVel.y *= 0.98;

                // Rotation
                state.current.rot.x += state.current.rotVel.x;
                state.current.rot.y += state.current.rotVel.y;
                state.current.rot.y += 0.005;

                const boundsX = width / 2 - 100;
                const boundsY = height / 2 - 100;

                // Wall Collision Logic
                // Left & Right
                if (state.current.pos.x > boundsX) {
                    hitWall = true;
                    state.current.pos.x = boundsX;
                    state.current.vel.x *= -0.85; 
                    impactPos = { x: width, y: height/2 + state.current.pos.y };
                    state.current.rotVel.y += (Math.random()-0.5) * 0.2;
                    currentSpeed = Math.abs(state.current.vel.x);
                } else if (state.current.pos.x < -boundsX) {
                    hitWall = true;
                    state.current.pos.x = -boundsX;
                    state.current.vel.x *= -0.85;
                    impactPos = { x: 0, y: height/2 + state.current.pos.y };
                    state.current.rotVel.y += (Math.random()-0.5) * 0.2;
                    currentSpeed = Math.abs(state.current.vel.x);
                }
                
                // Top & Bottom
                if (state.current.pos.y > boundsY) {
                    hitWall = true;
                    state.current.pos.y = boundsY;
                    state.current.vel.y *= -0.85;
                    impactPos = { x: width/2 + state.current.pos.x, y: height };
                    state.current.rotVel.x += (Math.random()-0.5) * 0.2;
                    currentSpeed = Math.abs(state.current.vel.y);
                } else if (state.current.pos.y < -boundsY) {
                    hitWall = true;
                    state.current.pos.y = -boundsY;
                    state.current.vel.y *= -0.85;
                    impactPos = { x: width/2 + state.current.pos.x, y: 0 };
                    state.current.rotVel.x += (Math.random()-0.5) * 0.2;
                    currentSpeed = Math.abs(state.current.vel.y);
                }
            }

            // 2. SCORING
            if (hitWall && currentSpeed > 0.5) {
                setCurrentImpacts(prev => {
                    const next = prev + 1;
                    setBestImpacts(currBest => Math.max(currBest, next));
                    return next;
                });
                setStatus("IMPACT");
                playBounce(currentSpeed);
                state.current.shake = 5 + currentSpeed;
                spawnParticles(impactPos.x, impactPos.y, '#ccff00', 15, 5 + currentSpeed);
                spawnFloatingText(impactPos.x, impactPos.y, "+1", '#ccff00');
            }

            updateAudio(Math.abs(state.current.vel.x) + Math.abs(state.current.vel.y));

            // 3. DRAWING
            let shakeX = 0;
            let shakeY = 0;
            if (state.current.shake > 0) {
                shakeX = (Math.random() - 0.5) * state.current.shake;
                shakeY = (Math.random() - 0.5) * state.current.shake;
                state.current.shake *= 0.9; 
                if(state.current.shake < 0.5) state.current.shake = 0;
            }

            ctx.save();
            ctx.translate(shakeX, shakeY);

            // Clear Background
            ctx.fillStyle = '#000';
            ctx.fillRect(-50, -50, width+100, height+100);

            // Draw Background Grid
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1;
            const paraX = -state.current.pos.x * 0.1;
            const paraY = -state.current.pos.y * 0.1;
            const gridSize = 50;
            const gridOffsetX = (paraX % gridSize);
            const gridOffsetY = (paraY % gridSize);

            ctx.beginPath();
            for (let x = gridOffsetX; x < width; x += gridSize) {
                ctx.moveTo(x, 0); ctx.lineTo(x, height);
            }
            for (let y = gridOffsetY; y < height; y += gridSize) {
                ctx.moveTo(0, y); ctx.lineTo(width, y);
            }
            ctx.stroke();

            // Draw Particles
            state.current.particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                p.size *= 0.95;
                if (p.life > 0) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                } else {
                    state.current.particles.splice(i, 1);
                }
            });

            // Draw Floating Text
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            state.current.floatingTexts.forEach((t, i) => {
                t.y += t.dy;
                t.life -= 0.02;
                t.dy *= 0.95;
                if (t.life > 0) {
                    ctx.fillStyle = t.color;
                    ctx.globalAlpha = t.life;
                    ctx.fillText(t.text, t.x, t.y);
                    ctx.globalAlpha = 1.0;
                } else {
                    state.current.floatingTexts.splice(i, 1);
                }
            });

            // Draw 3D Object (The W)
            const projectedPoints = vertices.map(v => {
                let r = rotateX(v.x, v.y, v.z, state.current.rot.x);
                r = rotateY(r.x, r.y, r.z, state.current.rot.y);
                return project(r.x, r.y, r.z, width, height, state.current.pos.x, state.current.pos.y);
            });

            if(state.current.frame % 2 === 0) {
                state.current.trail.push(projectedPoints);
                if (state.current.trail.length > 8) state.current.trail.shift();
            }

            state.current.trail.forEach((framePoints, index) => {
                ctx.strokeStyle = `rgba(204, 255, 0, ${index * 0.05})`; 
                ctx.lineWidth = 1;
                ctx.beginPath();
                edges.forEach(edge => {
                    const p1 = framePoints[edge[0]];
                    const p2 = framePoints[edge[1]];
                    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                });
                ctx.stroke();
            });

            ctx.strokeStyle = state.current.isDragging ? '#ffffff' : '#ccff00';
            ctx.lineWidth = 2;
            ctx.shadowBlur = state.current.isDragging ? 30 : 10;
            ctx.shadowColor = state.current.isDragging ? '#ffffff' : '#ccff00';

            ctx.beginPath();
            edges.forEach(edge => {
                const p1 = projectedPoints[edge[0]];
                const p2 = projectedPoints[edge[1]];
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            });
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            projectedPoints.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
            });

            ctx.restore();
            requestRef.current = requestAnimationFrame(render);
        };

        handleResize();
        requestRef.current = requestAnimationFrame(render);

        return () => {
            state.current.active = false; // STOP LOOP
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', handleResize);
            if (audioRef.current && audioRef.current.ctx) {
                try {
                    audioRef.current.osc.stop();
                    audioRef.current.ctx.close();
                } catch(e) {}
            }
        };
    }, []);

    // --- UI RENDER (MATCHING MASTER CODE LAYOUT) ---
    return (
        <div className="fixed inset-0 z-[10000] bg-black cursor-crosshair overflow-hidden w-full h-full">
            <canvas ref={canvasRef} className="block w-full h-full" />
            
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-8 flex flex-col justify-between">
                
                {/* TOP BAR */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[#ccff00] font-black font-anton text-2xl tracking-widest animate-pulse">HYPER-OBJECT</div>
                        <div className="text-white font-mono text-xs opacity-70">PHYSICS ENGINE: ACTIVE</div>
                    </div>
                    <div className="text-right font-mono text-xs text-[#ccff00]">
                        <div>IMPACTS: {currentImpacts}</div>
                        <div>BEST: {bestImpacts}</div>
                    </div>
                </div>

                {/* CENTER PROMPT */}
                {!state.current?.isDragging && currentImpacts === 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mix-blend-difference">
                        <div className="text-white font-mono text-xs tracking-[0.5em] mb-4 opacity-50">DRAG TO THROW</div>
                    </div>
                )}

                {/* BOTTOM BAR */}
                <div className="flex justify-between items-end">
                    <div className="font-mono text-xs text-neutral-500 max-w-xs">
                        STATUS: {status}. Ready for launch.
                    </div>
                    <button 
                        onClick={onExit} 
                        className="pointer-events-auto border border-white text-white hover:bg-white hover:text-black px-8 py-3 font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 backdrop-blur-md"
                    >
                        <Power size={18} /> DISCONNECT
                    </button>
                </div>
            </div>
        </div>
    );
};


/* --- 8. CORE APP --- */
const App = () => {
    const [scrolled, setScrolled] = useState(false);
    const [clicks, setClicks] = useState([]);
    const [inArena, setInArena] = useState(false); 

    // Scroll Logic
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Global Click Handler
    useEffect(() => {
        const handleClick = (e) => {
            AudioKernel.triggerClick();
            const id = Date.now();
            const rot = Math.random() * 60 - 30 + 'deg';
            setClicks(p => [...p, { id, x: e.clientX, y: e.clientY, rot }]);
            setTimeout(() => setClicks(p => p.filter(c => c.id !== id)), 600);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    if (inArena) {
        return (
            <>
                <GlobalStyles />
                <Arena onExit={() => setInArena(false)} />
            </>
        );
    }

    return (
        <div className="min-h-screen relative bg-black text-white">
            <GlobalStyles />
            <div className="noise" />
            <DriftingBackground />
            
            {/* Click Effects */}
            {clicks.map(c => (
                <div key={c.id} className="click-w text-4xl font-anton text-[var(--accent)]" style={{ left: c.x, top: c.y, '--rot': c.rot }}>W</div>
            ))}

            <HUD scrolled={scrolled} />
            
            <main>
                <Hero onEnter={() => setInArena(true)} />
                <VelocityMarquee />
                <Feed />
            </main>

            <Footer />
        </div>
    );
};

export default App;