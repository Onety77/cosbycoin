import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Twitter, ArrowUpRight, Trophy, Zap, MessageCircle, Heart, Repeat, Ban, TrendingUp, AlertTriangle, X as XIcon, Terminal, Power, Copy, Check, ScanLine, Activity, Globe, Shield, Radar } from 'lucide-react';

/* --- 1. MASTER STYLES (GOD MODE) --- */
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

    /* SCANLINE SWEEP */
    @keyframes scanline {
        0% { transform: translateY(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(200%); opacity: 0; }
    }
    .scan-overlay {
        position: absolute; top: 0; left: 0; right: 0; height: 100px;
        background: linear-gradient(to bottom, transparent, var(--accent), transparent);
        opacity: 0.1; pointer-events: none;
        animation: scanline 4s linear infinite;
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

/* --- 2. AUDIO KERNEL --- */
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

/* --- 3. DATA MATRIX --- */
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

/* --- 4. TACTICAL COMPONENTS --- */

const LiveStatsTicker = () => (
    <div className="w-full bg-black border-y border-neutral-900 py-3 overflow-hidden flex justify-center relative z-20">
        <div className="flex gap-12 font-mono text-xs text-neutral-500 uppercase tracking-widest animate-pulse">
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[var(--accent)] rounded-full"/> Status: ONLINE</span>
            <span className="flex items-center gap-2">Price: $0.0000W</span>
            <span className="flex items-center gap-2">Holders: <span className="text-white">DIAMOND</span></span>
            <span className="flex items-center gap-2">Market Cap: <span className="text-[var(--accent)]">INFINITE</span></span>
        </div>
    </div>
);

const ContractBadge = () => {
    const [copied, setCopied] = useState(false);
    const ca = "0xW000000000000000000000000000000000000000"; 
    
    const copyToClip = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(ca);
            AudioKernel.triggerClick();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed", err);
            // Fallback for some environments
            const textArea = document.createElement("textarea");
            textArea.value = ca;
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
                        <span className="font-mono text-xs md:text-sm text-neutral-300 group-hover:text-white transition-colors">{ca.substring(0, 6)}...{ca.substring(ca.length - 6)}</span>
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
                    className="group relative px-6 py-2 bg-transparent overflow-hidden"
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

    // RESTORED: Scroll Listener for Parallax
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
            // RESTORED: Parallax Effect
            style={{ transform: `translateY(${scrollY * 0.2}px)` }} 
        >
            {nodes.map(n => (
                <div 
                    key={n.id} 
                    className="absolute font-anton text-[#111] w-drifter select-none"
                    style={{
                        left: `${n.left}%`, top: `${n.top}%`,
                        fontSize: `${n.size}rem`,
                        opacity: 0.3, 
                        '--duration': n.duration, '--dx': n.dx, '--dy': n.dy, '--rot': n.rot,
                        animationDelay: n.delay
                    }}
                >W</div>
            ))}
        </div>
    );
};

/* --- 5. SECTIONS --- */

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
                    <span className="text-[var(--accent)]">NO ROADMAP. NO APOLOGIES. JUST UP ONLY.</span>
                </p>

                <ContractBadge />

                {/* FINAL "ENTER ARENA" BUTTON DESIGN */}
                <div className="mt-8 relative group cursor-pointer" onClick={onEnter}>
                    {/* Decorative Brackets */}
                    <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-neutral-800 group-hover:bg-[var(--accent)] transition-colors"/>
                    <div className="absolute -right-4 top-0 bottom-0 w-[2px] bg-neutral-800 group-hover:bg-[var(--accent)] transition-colors"/>
                    
                    <button className="relative px-12 py-4 bg-transparent border-y border-neutral-800 group-hover:border-[var(--accent)] transition-all overflow-hidden">
                        <span className="relative z-10 font-mono text-sm font-bold uppercase tracking-[0.3em] text-white group-hover:text-[var(--accent)] transition-colors flex items-center gap-3">
                            Initialize Protocol <ScanLine size={16} className="hidden group-hover:block animate-pulse"/>
                        </span>
                        {/* Hover Scan Fill */}
                        <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-10 transition-opacity duration-200"/>
                        {/* Scanline Sweep */}
                        <div className="scanline absolute left-0 top-0 w-full h-[1px] bg-[var(--accent)] opacity-0 group-hover:opacity-100 z-20"/>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-0 w-full">
                <LiveStatsTicker />
            </div>
        </section>
    );
};

// VELOCITY SENSITIVE MARQUEE
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

const TacticalChart = () => (
    <div className="break-inside-avoid w-full bg-[#080808] border border-neutral-800 relative overflow-hidden group mb-8">
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
        
        {/* Mock Chart Visualization */}
        <div className="relative h-[300px] w-full flex items-center justify-center overflow-hidden">
            {/* Grid */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }}></div>
            
            {/* Radar Sweep */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-dim)] to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-700"/>
            
            <div className="relative z-10 text-center">
                <Radar size={48} className="text-[var(--accent)] mx-auto mb-4 opacity-50 animate-spin-slow"/>
                <p className="font-mono text-xs text-neutral-500">ESTABLISHING UPLINK...</p>
            </div>
        </div>
    </div>
);

const IntelLog = ({ data }) => (
    <div className="break-inside-avoid mb-6 intel-card p-5 relative overflow-hidden group cursor-pointer" onClick={() => window.open(data.url, '_blank')}>
        {/* Header */}
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

        {/* Content */}
        <div className="font-mono text-sm text-neutral-300 leading-relaxed mb-4 border-l-2 border-neutral-800 pl-3 group-hover:border-[var(--accent)] transition-colors">
            {data.content}
        </div>

        {/* Footer Stats */}
        <div className="flex gap-4 pt-3 border-t border-dashed border-neutral-800 font-mono text-xs text-neutral-600">
            <span className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart size={12}/> {data.stats.l}</span>
            <span className="flex items-center gap-1 hover:text-green-500 transition-colors"><Repeat size={12}/> {data.stats.r}</span>
        </div>
    </div>
);

// RESTORED: Wisdom Node with Interaction
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
            className="break-inside-avoid mb-6 p-6 bg-[var(--accent)] text-black relative group cursor-pointer select-none transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
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
    const [filter, setFilter] = useState('ALL'); // 'ALL' or 'ALPHA'

    // Filter logic
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
                        className={`px-4 py-1 border font-mono text-xs font-bold uppercase transition-colors ${filter === 'ALL' ? 'border-[var(--accent)] bg-[var(--accent)] text-black' : 'border-neutral-800 text-neutral-500 hover:text-white'}`}
                     >
                        All Signals
                     </button>
                     <button 
                        onClick={() => setFilter('ALPHA')}
                        className={`px-4 py-1 border font-mono text-xs font-bold uppercase transition-colors ${filter === 'ALPHA' ? 'border-[var(--accent)] bg-[var(--accent)] text-black' : 'border-neutral-800 text-neutral-500 hover:text-white'}`}
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
            {/* Footer Graphics */}
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,var(--accent-dim),transparent_70%)] opacity-20 pointer-events-none"/>
            
            <div className="max-w-[1600px] mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                <div>
                    <div className="font-anton text-[15vw] md:text-[12vw] leading-[0.8] text-[#111] select-none hover:text-[var(--accent)] transition-colors duration-500 cursor-default">
                        KEEP<br/><span className="text-white">WINNING</span>
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

/* --- 6. ARENA ENGINE --- */
const Arena = ({ onExit }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const [nodeCount, setNodeCount] = useState(0); 
    
    // Mutable State for Physics
    const state = useRef({
        nodes: [],
        pulses: [], 
        rotation: { x: 0, y: 0 },
        targetRotation: { x: 0, y: 0 },
        mouse: { x: 0, y: 0 },
        active: true
    });

    useEffect(() => {
        // Audio Start
        if (typeof AudioKernel !== 'undefined') {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.frequency.setValueAtTime(60, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                state.current.audio = { ctx, osc, gain };
            } catch (e) {
                console.warn("Arena audio init failed", e);
            }
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const NODE_COUNT = width < 768 ? 80 : 180;
        const CONNECTION_DIST = 100;
        const ROTATION_SPEED = 0.05;

        for (let i = 0; i < NODE_COUNT; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 200 + Math.random() * 200; 
            state.current.nodes.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                baseX: r * Math.sin(phi) * Math.cos(theta),
                baseY: r * Math.sin(phi) * Math.sin(theta),
                baseZ: r * Math.cos(phi),
                pulse: 0, 
                id: Math.random().toString(36).substr(2, 4).toUpperCase()
            });
        }

        const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
        const handleMouseMove = (e) => {
            const nx = (e.clientX / width) * 2 - 1;
            const ny = (e.clientY / height) * 2 - 1;
            state.current.targetRotation.y = nx * 2;
            state.current.targetRotation.x = -ny * 2;
        };
        const handleClick = () => {
            state.current.pulses.push({ r: 0, speed: 15, life: 1.0 });
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);

        const rotate3D = (x, y, z, rotX, rotY) => {
            let cosY = Math.cos(rotY), sinY = Math.sin(rotY), x1 = x * cosY - z * sinY, z1 = z * cosY + x * sinY;
            let cosX = Math.cos(rotX), sinX = Math.sin(rotX), y2 = y * cosX - z1 * sinX, z2 = z1 * cosX + y * sinX;
            return { x: x1, y: y2, z: z2 };
        };

        const loop = () => {
            if (!state.current.active) return;
            setNodeCount(prev => Math.min(prev + 11, NODE_COUNT * 442));
            state.current.rotation.x += (state.current.targetRotation.x - state.current.rotation.x) * ROTATION_SPEED;
            state.current.rotation.y += (state.current.targetRotation.y - state.current.rotation.y) * ROTATION_SPEED + 0.002;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;
            
            const projectedNodes = state.current.nodes.map(node => {
                if (node.pulse > 0) node.pulse -= 0.05;
                const r = rotate3D(node.baseX, node.baseY, node.baseZ, state.current.rotation.x, state.current.rotation.y);
                const scale = 800 / (800 + r.z + 400);
                const x2d = (r.x * scale) + centerX;
                const y2d = (r.y * scale) + centerY;
                state.current.pulses.forEach(p => {
                     const dist = Math.sqrt(node.baseX**2 + node.baseY**2 + node.baseZ**2);
                     if (Math.abs(dist - p.r) < 30) node.pulse = 1.0;
                });
                return { ...node, x2d, y2d, scale, z: r.z };
            });

            projectedNodes.sort((a, b) => b.z - a.z);

            ctx.lineWidth = 1;
            for (let i = 0; i < projectedNodes.length; i++) {
                const n1 = projectedNodes[i];
                for (let j = i + 1; j < projectedNodes.length; j++) {
                    const n2 = projectedNodes[j];
                    const dist = Math.sqrt((n1.x2d - n2.x2d)**2 + (n1.y2d - n2.y2d)**2);
                    if (dist < CONNECTION_DIST * n1.scale) {
                        const alpha = 1 - (dist / (CONNECTION_DIST * n1.scale));
                        ctx.strokeStyle = Math.max(n1.pulse, n2.pulse) > 0.1 ? `rgba(255, 255, 255, ${alpha})` : `rgba(204, 255, 0, ${alpha * 0.3})`;
                        ctx.beginPath(); ctx.moveTo(n1.x2d, n1.y2d); ctx.lineTo(n2.x2d, n2.y2d); ctx.stroke();
                    }
                }
            }

            projectedNodes.forEach(node => {
                const size = 3 * node.scale + (node.pulse * 5);
                ctx.fillStyle = node.pulse > 0.1 ? '#fff' : '#ccff00';
                ctx.beginPath(); ctx.arc(node.x2d, node.y2d, size, 0, Math.PI * 2); ctx.fill();
            });

            for (let i = state.current.pulses.length - 1; i >= 0; i--) {
                state.current.pulses[i].r += state.current.pulses[i].speed;
                state.current.pulses[i].life -= 0.01;
                if (state.current.pulses[i].life <= 0 || state.current.pulses[i].r > 1000) state.current.pulses.splice(i, 1);
            }
            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (state.current.audio) {
                try {
                    state.current.audio.osc.stop();
                    state.current.audio.ctx.close();
                } catch(e) {}
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[10000] bg-black cursor-crosshair overflow-hidden">
            <canvas ref={canvasRef} className="block w-full h-full" />
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div><div className="text-[var(--accent)] font-black font-anton text-2xl tracking-widest animate-pulse">THE HIVEMIND</div><div className="text-white font-mono text-xs opacity-70">GLOBAL CONSENSUS: 100%</div></div>
                    <div className="text-right font-mono text-xs text-[var(--accent)]"><div>ACTIVE NODES: {nodeCount}</div><div>LATENCY: 0ms</div></div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mix-blend-difference">
                    <div className="text-white font-mono text-xs tracking-[0.5em] mb-4 opacity-50">CLICK TO BROADCAST SIGNAL</div>
                </div>
                <div className="flex justify-between items-end">
                    <div className="font-mono text-xs text-neutral-500 max-w-xs">Connected to mainnet. You are Node #001. Do not break the chain.</div>
                    <button onClick={onExit} className="pointer-events-auto border border-white text-white hover:bg-white hover:text-black px-8 py-3 font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 backdrop-blur-md"><Power size={18} /> DISCONNECT</button>
                </div>
            </div>
        </div>
    );
};

/* --- 7. CORE APP --- */
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