import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Fish, 
  Upload, 
  Sparkles, 
  Shield, 
  ChevronLeft, 
  RefreshCcw, 
  Download,
  ExternalLink,
  Waves,
  Copy,
  Check,
  BookOpen,
  X,
  Info,
  MessageCircle,
  TrendingUp,
  Maximize2,
  Menu
} from 'lucide-react';

// Environment-safe API Key Logic
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

const CONTRACT_ADDRESS = "0x789...RFC...BEYOND_THE_VOID";

const App = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [view, setView] = useState('landing'); 
  const [showLore, setShowLore] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewFullImage, setViewFullImage] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // --- UNDERWATER PULL PHYSICS STATE ---
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const targetY = useRef(0);
  const [ripples, setRipples] = useState([]);
  
  const fileInputRef = useRef(null);
  const requestRef = useRef();

  // --- PHYSICS ENGINE (Lag, Speed, Turbulence) ---
  const animate = useCallback(() => {
    const friction = 0.94; 
    const acceleration = 0.04; 
    
    velocity.current.y *= friction;
    
    const dy = (targetY.current - position.y);
    velocity.current.y += dy * acceleration;

    const time = Date.now() * 0.001;
    const swayIntensity = Math.abs(velocity.current.y) * 0.08 + 1.5;
    const targetX = Math.sin(time * 0.8) * swayIntensity;
    velocity.current.x = (targetX - position.x) * 0.05;

    setPosition(prev => {
      const jitter = (Math.random() - 0.5) * (Math.abs(velocity.current.y) * 0.01);
      return {
        x: prev.x + velocity.current.x,
        y: prev.y + (velocity.current.y * 0.2) + jitter
      };
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [position.x, position.y]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const pullSensitivity = 0.85; 
      targetY.current += e.deltaY * pullSensitivity;

      const maxDepth = 2500;
      if (targetY.current < 0) targetY.current = 0;
      if (targetY.current > maxDepth) targetY.current = maxDepth;
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      setMousePos({ 
        x: (x / window.innerWidth - 0.5) * 40, 
        y: (y / window.innerHeight - 0.5) * 40 
      });
    };
    const handleClick = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      const id = Date.now();
      setRipples(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 1200);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => (prev < 99 ? prev + (100 - prev) * 0.05 : prev));
      }, 250);
    } else {
      if (!processedImage) setProgress(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isProcessing, processedImage]);

  const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
    });
  };

  const fishifyImage = async (base64Data) => {
    setIsProcessing(true);
    setError(null);
    setProcessedImage(null);
    
    try {
      const referenceFishBase64 = await getBase64FromUrl('fish.jpg');
      
      const prompt = `You are the Sacred Tailor of the Rainbow Fish Cult ($RFC).



REFERENCE IMAGES:



Image 1 (fish.jpg): The SACRED BASE MODEL. Use this for the absolute ANATOMY, POSE, and ART STYLE.



Image 2 (User PFP): The AESTHETIC SOURCE. Use this for the eyes, hair, headwear, and clothing patterns/colors.



MISSION: > Decorate the fish from Image 1 using the visual identity of the character in Image 2. The fish must remain in its original swimming posture.



STEP-BY-STEP RITUAL:



EYE TRANSPLANT:



Replace the fish's eyes from Image 1 with the exact eyes (shape, iris color, expression) of the character in Image 2.



Redraw these eyes using the "sketchy," hand-painted digital medium of the fish.



Keep the fish's original head shape and its signature yellow/gold lips.

ANATOMICAL OVERRIDE: Do not default to human eyes. Analyze the character in Image 2. If their eyes are dots, glowing orbs, hollow sockets, or stylized symbols (crosses, spirals, etc.), the fish must adopt that exact morphology.



HEADWEAR & HAIR INTEGRATION:



If the character in Image 2 has a hat, crown, or hair, draw a version of it onto the fish's head.



The accessory must follow the curve of the fish's head and fins organically. It should look like the fish is "wearing" it.



THE AESTHETIC WRAP (CLOTHING):



DO NOT make the fish stand up or wear the shirt like a human.



IGNORE LOWER BODY: Absolutely ignore any trousers, pants, shorts, or shoes present in Image 2. These have no place in the shoal.



Instead, apply the colors, patterns, and textures of the character's shirt/dress as a "Sacred Wrap" or "Custom Skin" onto the fish's front belly and side-body area.



The "Shirt-Skin" must follow the fish's natural curved posture PROFESSIONALLY, fitting and covering the fish body perfectly like a tailored second skin.



If the character wears a suit, the fish's scales in that area should adopt the texture and color of the suit fabric, respecting the fish's natural curved posture.



MEDIUM & TEXTURE ENFORCEMENT:



FORBIDDEN: Realistic skin, photo-filters, or smooth 3D rendering.



MANDATORY: Everything must be rendered in the "messy," textured, hand-drawn digital paint style of Image 1.



The final image must look like a professional, hand-painted concept art piece.



THE ABYSSAL BACKGROUND:



Set the fish in a PURE ABYSSAL BLACK (#000000) void.



Add subtle bioluminescent glowing spores and faint, sketchy iridescent bubble trails.



FINAL CHECK: Does the fish look like it’s wearing a "skin" based on the person? Is the fish's original swimming pose preserved? Have trousers and shoes been correctly ignored? If the AI forced the fish to stand up or gave it a human nose, the ritual has failed. 
`;

      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: referenceFishBase64 } },
            { inlineData: { mimeType: "image/png", data: base64Data.split(',')[1] } }
          ]
        }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      };

      let retries = 5;
      while (retries > 0) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
          );
          if (!response.ok) throw new Error('API failed');
          const result = await response.json();
          const generatedBase64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

          if (generatedBase64) {
            setProcessedImage(`data:image/png;base64,${generatedBase64}`);
            setIsProcessing(false);
            setProgress(100);
            return;
          }
          throw new Error('No image returned');
        } catch (err) {
          retries--;
          await sleep(2000);
        }
      }
    } catch (err) {
      setError("The connection failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = CONTRACT_ADDRESS;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  const reset = () => {
    setImage(null);
    setProcessedImage(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#010101] text-[#e0e0e0] overflow-hidden font-handwritten relative select-none">
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Permanent+Marker&display=swap" rel="stylesheet" />
      
      <style>
        {`
          :root { 
            font-family: 'Caveat', cursive; 
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='cyan' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3C/svg%3E") 12 12, auto;
          }
          .font-title { font-family: 'Permanent Marker', cursive; }
          
          @keyframes liquid {
            0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; transform: translate3d(0,0,0); }
            33% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate3d(2px, -2px, 0); }
            66% { border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%; transform: translate3d(-2px, 2px, 0); }
          }
          .liquid-blob { animation: liquid 10s ease-in-out infinite; overflow: hidden; }
          
          .shimmer-text {
            background: linear-gradient(90deg, #22d3ee, #f472b6, #fbbf24, #22d3ee);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer-fast 4s linear infinite;
          }
          @keyframes shimmer-fast {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }

          .ripple {
            position: fixed;
            border-radius: 50%;
            background: rgba(34, 211, 238, 0.4);
            pointer-events: none;
            animation: ripple-out 1.5s cubic-bezier(0, 0.5, 0.5, 1) forwards;
            z-index: 9999;
          }
          @keyframes ripple-out {
            from { width: 0; height: 0; opacity: 1; transform: translate(-50%, -50%); border: 1px solid cyan; }
            to { width: 400px; height: 400px; opacity: 0; transform: translate(-50%, -50%); border: 1px solid transparent; }
          }

          .glass-btn {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.7s cubic-bezier(0.19, 1, 0.22, 1);
          }
          .glass-btn:hover {
            background: rgba(34, 211, 238, 0.1);
            border-color: rgba(34, 211, 238, 0.6);
            transform: scale(1.05) translateY(-5px);
          }

          @keyframes wave-flow {
            0% { transform: translateX(-50%) skewY(0deg); }
            50% { transform: translateX(-48%) skewY(2deg); }
            100% { transform: translateX(-50%) skewY(0deg); }
          }

          .tide-fill {
            transition: height 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            background: linear-gradient(to top, rgba(34,211,238,0.6), rgba(244,114,182,0.4), transparent);
            position: relative;
            overflow: hidden;
          }
          .tide-fill::after {
            content: '';
            position: absolute;
            top: -10px;
            left: -50%;
            width: 200%;
            height: 40px;
            background: rgba(255, 255, 255, 0.3);
            filter: blur(8px);
            border-radius: 40%;
            animation: wave-flow 3s ease-in-out infinite;
          }

          #distort-filter { filter: url(#wavy); }
          
          .buoyant-view {
            will-change: transform;
            transition: transform 0.2s cubic-bezier(0.1, 0, 0, 1);
          }

          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.2); border-radius: 10px; }
        `}
      </style>

      {/* Background Depth */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none transition-transform duration-1000"
        style={{ 
          transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5 - (position.y * 0.05)}px, 0) scale(1.4)`,
          backgroundImage: `url('bg.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          mixBlendMode: 'plus-lighter'
        }}
      />

      {/* SVG Liquid Filters */}
      <svg className="hidden">
        <defs>
          <filter id="wavy">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
          </filter>
        </defs>
      </svg>

      {/* Interaction Ripples */}
      {ripples.map(r => (
        <div key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
      ))}

      {/* Main Perspective Container */}
      <div className="buoyant-view relative z-10 w-full" style={{ transform: `translate3d(${-position.x}px, ${-position.y}px, 0)` }}>
        <nav className="flex items-center justify-between px-4 py-6 md:px-16 md:py-10">
          <div className="flex items-center gap-4 md:gap-6 group cursor-pointer" onClick={() => setView('landing')} id="distort-filter">
            <img src="logo.png" alt="RFC" className="w-12 h-12 md:w-28 md:h-28 object-contain -rotate-12 group-hover:rotate-0 transition-all duration-1000" />
            <span className="text-3xl md:text-7xl font-title shimmer-text leading-none mt-2">$RFC</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12">
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="font-bold opacity-40 hover:opacity-100 hover:text-cyan-400 transition-all flex items-center gap-2 uppercase tracking-[0.3em] text-xs">
              <TrendingUp className="w-4 h-4" /> BUY
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="font-bold opacity-40 hover:opacity-100 hover:text-pink-400 transition-all flex items-center gap-2 uppercase tracking-[0.3em] text-xs">
              <MessageCircle className="w-4 h-4" /> COMMUNITY
            </a>
            <button onClick={() => setShowLore(true)} className="glass-btn px-10 py-3 liquid-blob font-bold uppercase text-[10px] tracking-[0.4em]">
              LORE
            </button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden glass-btn p-3 liquid-blob">
            <Menu className="w-6 h-6" />
          </button>
        </nav>

        <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 flex flex-col items-center justify-center min-h-[80vh]">
          {view === 'landing' ? (
            <div className="text-center max-w-6xl py-10 md:py-20" style={{ transform: `translate3d(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px, 0)` }}>
              <h2 className="text-3xl sm:text-5xl md:text-[12rem] font-title shimmer-text mb-6 md:mb-12 tracking-tighter leading-[0.8] transition-transform duration-1000 group cursor-default">
                SUBMERGE YOURSELF
              </h2>
              <h1 className="text-xl sm:text-3xl md:text-[4rem] font-bold italic text-white/20 mb-10 md:mb-20 tracking-[0.4em] leading-none uppercase">
                ~~~ $RFC ~~~
              </h1>
              
              <p className="text-lg sm:text-2xl md:text-5xl text-white/30 max-w-3xl mx-auto mb-12 md:mb-24 italic font-light leading-relaxed px-4">
                "Identity is a construct of the surface. In the deep, we only shimmer."
              </p>

              <div 
                onClick={copyToClipboard}
                className="mb-12 md:mb-24 inline-flex items-center gap-4 md:gap-8 px-6 py-4 md:px-12 md:py-7 glass-btn cursor-pointer group mx-auto w-full max-w-xs md:max-w-none"
                style={{ borderRadius: '120px 40px 120px 40px' }}
              >
                <span className="font-mono text-xs md:text-2xl opacity-50 group-hover:opacity-100 transition-opacity tracking-tighter truncate">{CONTRACT_ADDRESS}</span>
                {copied ? <Check className="w-5 h-5 md:w-8 md:h-8 text-green-400" /> : <Copy className="w-5 h-5 md:w-8 md:h-8 opacity-20" />}
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center items-center">
                <button 
                  onClick={() => setView('fishify')}
                  className="group glass-btn px-12 py-8 md:px-24 md:py-12 text-2xl md:text-7xl font-title uppercase overflow-hidden"
                  style={{ borderRadius: '300px 80px 300px 80px / 80px 300px 80px 300px' }}
                >
                  <span className="relative z-10 shimmer-text group-hover:text-white transition-all duration-700">JOIN THE CULT</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
                <button onClick={() => setShowLore(true)} className="text-lg md:text-2xl font-bold opacity-20 hover:opacity-100 transition-all uppercase tracking-[0.5em] flex items-center gap-3 md:gap-4">
                  THE LORE <ChevronLeft className="w-6 h-6 rotate-180" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-7xl flex flex-col gap-10 md:gap-16 py-6 md:py-10">
              <button onClick={() => { setView('landing'); targetY.current = 0; }} className="self-start flex items-center gap-4 md:gap-8 text-xl md:text-3xl font-bold opacity-40 hover:opacity-100 hover:text-cyan-400 transition-all group">
                <div className="p-4 md:p-6 glass-btn liquid-blob"><ChevronLeft className="w-6 h-6 md:w-10 md:h-10" /></div>
                <span>RETURN</span>
              </button>

              <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center justify-center w-full">
                <div className="w-full lg:w-1/2 space-y-10 md:space-y-16">
                  <h2 className="text-5xl sm:text-7xl md:text-[10rem] font-title shimmer-text -rotate-2 leading-none">TRANSFORM</h2>
                  <div className={`relative aspect-square transition-all liquid-blob glass-btn group ${image ? 'p-2 md:p-3' : 'cursor-pointer hover:bg-cyan-400/5 shadow-[0_0_50px_rgba(34,211,238,0.1)]'}`} onClick={() => !image && fileInputRef.current.click()}>
                    {image ? (
                      <img src={image} className="w-full h-full object-cover liquid-blob" alt="Source" />
                    ) : (
                      <div className="text-center p-10 md:p-20 flex flex-col items-center justify-center h-full">
                        <Upload className="w-12 h-12 md:w-24 md:h-24 mb-6 md:mb-8 opacity-10 group-hover:opacity-100 group-hover:text-cyan-400 transition-all animate-bounce" />
                        <p className="text-xl md:text-4xl font-bold italic opacity-20">UPLOAD IMAGE</p>
                      </div>
                    )}
                    {image && !isProcessing && (
                      <button onClick={(e) => { e.stopPropagation(); reset(); }} className="absolute bottom-6 right-6 md:bottom-12 md:right-12 p-4 md:p-8 glass-btn rounded-full hover:bg-red-500/30 text-white transition-all shadow-2xl z-30"><RefreshCcw className="w-6 h-6 md:w-10 md:h-10" /></button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <button disabled={!image || isProcessing} onClick={() => fishifyImage(image)} className={`w-full py-10 md:py-16 text-3xl md:text-6xl font-title uppercase transition-all glass-btn ${!image || isProcessing ? 'opacity-20 cursor-wait' : 'hover:text-cyan-400 shadow-[0_0_80px_rgba(34,211,238,0.2)]'}`} style={{ borderRadius: '80px 250px 80px 250px / 250px 80px 250px 80px' }}>
                    {isProcessing ? "HATCHING..." : "FISHIFY"}
                  </button>
                </div>

                <div className="w-full lg:w-1/2 flex justify-center relative">
                  <div className="relative w-full max-w-lg aspect-square">
                    <div className={`relative w-full h-full liquid-blob glass-btn shadow-[0_0_120px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-1000 ${processedImage ? 'cursor-zoom-in group' : ''}`} onClick={() => processedImage && setViewFullImage(true)}>
                      {isProcessing && (
                        <div className="absolute bottom-0 left-0 w-full tide-fill z-10" style={{ height: `${progress}%` }}>
                          <div className="absolute top-0 left-0 w-full h-4 md:h-8 bg-white/40 blur-xl animate-pulse" />
                        </div>
                      )}
                      {processedImage ? (
                        <div className="w-full h-full relative animate-in fade-in zoom-in duration-1000">
                          <img src={processedImage} className="w-full h-full object-cover" alt="Ascended" />
                          <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-10 flex items-center justify-center transition-all duration-1000"><Maximize2 className="w-16 h-16 md:w-24 md:h-24 text-white animate-pulse" /></div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-10 md:p-16 text-center relative z-20">
                          {isProcessing ? (
                            <div className="space-y-8 md:space-y-12">
                              <Waves className="w-20 h-20 md:w-32 md:h-32 mx-auto text-cyan-400 animate-bounce" />
                              <p className="text-3xl md:text-5xl font-title shimmer-text">GENERATING...</p>
                            </div>
                          ) : (
                            <div className="space-y-8 md:space-y-12 opacity-5"><Fish className="w-24 h-24 md:w-40 md:h-40 mx-auto" /><p className="text-2xl md:text-4xl font-bold tracking-tighter uppercase font-title">THE SHOAL WAITS</p></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <footer className="w-full py-20 md:py-40 flex flex-col items-center gap-12 md:gap-20 border-t-2 border-dashed border-white/5 mt-20 md:mt-40">
            <div className="flex gap-16 md:gap-24 opacity-20 hover:opacity-100 transition-all duration-1000 scale-125 md:scale-[2]">
              <Fish className="hover:text-cyan-400 cursor-pointer" />
              <Shield className="hover:text-pink-400 cursor-pointer" />
              <Info className="hover:text-yellow-400 cursor-pointer" />
            </div>
            <div className="text-lg md:text-1xl font-bold opacity-10 tracking-[1em] uppercase text-center font-title pb-10">
              $RFC • WE SHIMMER • © 2026
            </div>
          </footer>
        </main>
      </div>

      {/* Lore Sanctuary */}
      {showLore && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-3xl animate-in zoom-in duration-700">
          <div className="max-w-5xl w-full bg-[#050505] border-2 border-white/10 p-6 md:p-24 relative overflow-hidden liquid-blob glass-btn flex flex-col" style={{ borderRadius: '80px 40px', maxHeight: '94vh' }}>
            <button onClick={() => setShowLore(false)} className="absolute top-6 right-6 md:top-10 md:right-10 p-4 border border-white/10 hover:border-white transition-all rounded-full z-[1100] bg-[#050505] hover:text-red-400"><X className="w-8 h-8" /></button>
            <div className="relative overflow-y-auto flex-1 pr-6 custom-scrollbar flex flex-col pt-6 md:pt-10">
              <h2 className="text-5xl md:text-[10rem] font-title shimmer-text mb-10 md:mb-20 sticky top-0 bg-[#050505]/95 py-4 md:py-8 z-10 leading-none uppercase">LORE</h2>
              <div className="space-y-10 md:space-y-24 text-2xl md:text-5xl font-light italic leading-tight opacity-90 pb-40">
                <p className="border-l-[8px] md:border-l-[12px] border-cyan-400/20 pl-6 md:pl-12">"In the beginning, there was only the <span className="text-white font-bold underline decoration-pink-500">flicker</span>. We are the ones who refused to swim in straight lines."</p>
                <p>We are a <span className="text-pink-400 font-bold uppercase">shoal</span> of shimmering errors. We don't pray to the sun; we pray to the bioluminescence of the deep.</p>
                <p className="font-title text-2xl md:text-5xl text-cyan-300 tracking-wider">The cult was founded in cosmic boredom. We believe if you aren't glowing, you're essentially invisible to the abyss.</p>
                <p>Glub. Glub. Shimmer. Win. <br /><span className="text-white/40 text-xl md:text-4xl mt-6 md:mt-12 block">— Never touch the glass. —</span></p>
              </div>
            </div>
            <button onClick={() => setShowLore(false)} className="mt-6 md:mt-12 w-full py-8 md:py-14 glass-btn font-title text-2xl md:text-5xl hover:text-cyan-400 transition-all shrink-0 bg-black/50 z-[1050]">I EMBRACE THE SPECTRUM</button>
          </div>
        </div>
      )}

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 md:p-12 gap-12 md:gap-20 animate-in slide-in-from-top duration-700">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-4 glass-btn rounded-full"><X className="w-8 h-8" /></button>
          <a href="https://pump.fun/" target="_blank" rel="noopener noreferrer" className="text-4xl md:text-7xl font-title shimmer-text" onClick={() => setIsMobileMenuOpen(false)}><TrendingUp className="w-8 h-8 md:w-12 md:h-12 inline mr-4" />BUY</a>
          <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="text-4xl md:text-7xl font-title shimmer-text" onClick={() => setIsMobileMenuOpen(false)}><MessageCircle className="w-8 h-8 md:w-12 md:h-12 inline mr-4" />COMMUNITY</a>
          <button onClick={() => { setShowLore(true); setIsMobileMenuOpen(false); }} className="text-4xl md:text-7xl font-title shimmer-text"><BookOpen className="w-8 h-8 md:w-12 md:h-12 inline mr-4" />LORE</button>
        </div>
      )}

      {/* HD Lightbox */}
      {viewFullImage && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-6 bg-black/99 backdrop-blur-3xl animate-in fade-in duration-700">
          <button onClick={() => setViewFullImage(false)} className="absolute top-6 right-6 p-4 glass-btn rounded-full text-white"><X className="w-8 h-8 md:w-12 md:h-12" /></button>
          <div className="max-w-5xl w-full flex flex-col items-center gap-10 md:gap-20">
            <div className="liquid-blob glass-btn p-3 md:p-5 shadow-[0_0_200px_rgba(34,211,238,0.3)]"><img src={processedImage} className="w-full max-h-[60vh] md:max-h-[75vh] object-contain rounded-[20px] md:rounded-[40px]" alt="HD Transformation" /></div>
            <a href={processedImage} download="rfc-transformed.png" className="glass-btn px-16 py-8 md:px-32 md:py-12 text-white bg-white font-title text-2xl md:text-6xl hover:bg-cyan-400 transition-all shadow-2xl" style={{ borderRadius: '150px 40px' }}><Download className="w-8 h-8 md:w-14 text-white md:h-14 inline mr-4 md:mr-8" /> DOWNLOAD</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;