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
  Maximize2
} from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [viewFullImage, setViewFullImage] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);
  const fileInputRef = useRef(null);

  // Parallax / Underwater movement
  useEffect(() => {
    const handleMove = (e) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth - 0.5) * 40, 
        y: (e.clientY / window.innerHeight - 0.5) * 40 
      });
    };
    const handleClick = (e) => {
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 1000);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, []);

  // Progress simulation for the "Rising Tide" animation
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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      
      const prompt = `You are the Sacred Grandmaster of the Rainbow Fish Cult ($RFC). 
      TASK: Perform a professional artistic transmutation. 
      
      CRITICAL MANDATES:
      1. ANATOMICAL FUSION: Replace the head of the fish in fish.jpg with the head of the character in the pfp. DO NOT just cutout the face. You must morph, squeeze, and PROFESSIONALLY FIT the character's facial features into the specific head-shape and scale-lines of the fish. The transition between the character's face and the fish's neck/scales must be seamless.
      2. IDENTITY: The character's face must remain perfectly recognizable. If the character wears a hat, glasses, or has specific hair, those MUST be professionally redrawn onto the fish's head in the same sketchy art style.
      3. ART STYLE: Everything must be in the EXACT hand-drawn, digital-sketch, textured art style of fish.jpg. NO realistic textures. NO photo-collage effects. NO realistic skin. The skin of the character must become the purple/blue artistic paint texture from the fish's face. 
      4. CULT MAKEUP: Apply the sacred purple face-base, the specific vibrant yellow/gold lipstick, and the iridescent eyes from the fish.jpg onto the character's face.
      5. BACKGROUND: Set the character in a PURE DEEP ABYSSAL BLACK environment. Add bioluminescent glowing particles, bubbles, and subtle magenta/cyan coral sketches. DO NOT use a white or empty background.
      6. POSITION: The character must be centered in the frame.
      
      The result must look like a professional, hand-painted character illustration from a cult-themed artsy project. NO REALISM.`;

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
      setError("The ritual was interrupted by a dark current. Try again.");
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
    <div className="min-h-screen bg-[#010101] text-[#e0e0e0] overflow-x-hidden font-handwritten relative">
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Permanent+Marker&display=swap" rel="stylesheet" />
      
      <style>
        {`
          :root { font-family: 'Caveat', cursive; }
          .font-title { font-family: 'Permanent Marker', cursive; }
          
          @keyframes liquid {
            0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; transform: scale(1) rotate(0deg); }
            33% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1.02) rotate(-1deg); }
            66% { border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%; transform: scale(0.98) rotate(1deg); }
          }
          .liquid-blob { animation: liquid 8s ease-in-out infinite; overflow: hidden; }
          
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
            background: rgba(34, 211, 238, 0.2);
            pointer-events: none;
            animation: ripple-out 1s ease-out forwards;
            z-index: 1000;
          }
          @keyframes ripple-out {
            from { width: 0; height: 0; opacity: 1; transform: translate(-50%, -50%); }
            to { width: 200px; height: 200px; opacity: 0; transform: translate(-50%, -50%); }
          }

          .glass-btn {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .glass-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(34, 211, 238, 0.4);
            transform: scale(1.05) translateY(-5px);
          }

          @keyframes tide {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(1deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          .tide-fill {
            transition: height 0.3s ease-out;
            animation: tide 4s ease-in-out infinite;
          }

          #distort-filter { filter: url(#wavy); }
        `}
      </style>

      {/* SVG Filters for Liquid vibe */}
      <svg className="hidden">
        <defs>
          <filter id="wavy">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
          </filter>
        </defs>
      </svg>

      {/* Ripples */}
      {ripples.map(r => (
        <div key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
      ))}

      {/* Underwater Particles Background */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none transition-transform duration-1000 ease-out"
        style={{ 
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(1.1)`,
          backgroundImage: `url('bg.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
      />
      
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12">
        <div 
          className="flex items-center gap-4 group cursor-pointer transition-transform duration-500 hover:scale-110" 
          onClick={() => setView('landing')}
          id="distort-filter"
        >
          <img src="logo.png" alt="RFC" className="w-14 h-14 md:w-20 md:h-20 object-contain -rotate-12 group-hover:rotate-0 transition-all duration-700" />
          <span className="text-3xl md:text-5xl font-title tracking-tighter shimmer-text leading-none mt-2">
            $RFC
          </span>
        </div>
        
        <div className="flex items-center gap-6 md:gap-10 text-lg">
          <a href="#" className="font-bold opacity-60 hover:opacity-100 hover:text-cyan-400 transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
            <TrendingUp className="w-4 h-4" /> BUY
          </a>
          <a href="#" className="font-bold opacity-60 hover:opacity-100 hover:text-pink-400 transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
            <MessageCircle className="w-4 h-4" /> COMMUNITY
          </a>
          <button 
            onClick={() => setShowLore(true)} 
            className="glass-btn px-6 py-2 liquid-blob font-bold uppercase text-xs"
          >
            LORE
          </button>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh]">
        {view === 'landing' ? (
          <div className="text-center max-w-5xl" style={{ transform: `translate3d(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px, 0)` }}>
            <h2 className="text-xl md:text-2xl font-bold tracking-[0.5em] text-cyan-400/60 mb-8 uppercase animate-pulse">
              ~~~ SUBMERGE YOURSELF ~~~
            </h2>
            <h1 className="text-7xl md:text-[13rem] font-title leading-[0.75] mb-12 tracking-tight shimmer-text relative transition-transform duration-1000">
              <span className="block -rotate-2">RAINBOW</span>
              <span className="block translate-x-12 md:translate-x-24 rotate-3 opacity-90">FISH CULT</span>
            </h1>
            
            <p className="text-2xl md:text-4xl text-white/40 max-w-2xl mx-auto mb-16 italic font-light leading-relaxed">
              "We don't climb towers. We find the deepest trench and glow until the abyss blinks."
            </p>

            <div 
              onClick={copyToClipboard}
              className="mb-16 inline-flex items-center gap-4 px-8 py-5 glass-btn cursor-pointer text-xl"
              style={{ borderRadius: '60px 20px 60px 20px' }}
            >
              <span className="font-mono text-base opacity-70 tracking-tighter break-all">{CONTRACT_ADDRESS}</span>
              {copied ? <Check className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6 opacity-30" />}
            </div>

            <button 
              onClick={() => setView('fishify')}
              className="group glass-btn px-16 py-10 text-3xl md:text-5xl font-title uppercase overflow-hidden"
              style={{ borderRadius: '150px 40px 150px 40px / 40px 150px 40px 150px' }}
            >
              <span className="relative z-10 shimmer-text group-hover:text-white transition-colors duration-500">JOIN THE CULT</span>
              <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          </div>
        ) : (
          <div className="w-full max-w-7xl flex flex-col gap-12">
            <button 
              onClick={() => setView('landing')}
              className="self-start flex items-center gap-4 text-xl font-bold opacity-50 hover:opacity-100 hover:text-cyan-400 transition-all group"
            >
              <div className="p-4 glass-btn liquid-blob">
                <ChevronLeft className="w-6 h-6" />
              </div>
              <span>SURFACE</span>
            </button>

            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="w-full lg:w-1/2 space-y-10">
                <h2 className="text-6xl md:text-9xl font-title shimmer-text -rotate-3 leading-none">ASCENSION</h2>
                
                <div 
                  className={`relative aspect-square transition-all liquid-blob glass-btn group
                    ${image ? 'border-transparent' : 'cursor-pointer hover:border-pink-400/50'}`}
                  onClick={() => !image && fileInputRef.current.click()}
                >
                  {image ? (
                    <img src={image} className="w-full h-full object-cover" alt="Source" />
                  ) : (
                    <div className="text-center p-16 flex flex-col items-center justify-center h-full">
                      <Upload className="w-16 h-16 mb-6 opacity-10 group-hover:opacity-100 group-hover:text-cyan-400 transition-all" />
                      <p className="text-2xl font-bold italic opacity-30">OFFER LIKENESS TO THE SHOAL</p>
                    </div>
                  )}
                  {image && !isProcessing && (
                    <button onClick={(e) => { e.stopPropagation(); reset(); }} className="absolute bottom-8 right-8 p-5 glass-btn rounded-full hover:bg-red-500/20 text-white transition-all">
                      <RefreshCcw className="w-6 h-6" />
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                <button
                  disabled={!image || isProcessing}
                  onClick={() => fishifyImage(image)}
                  className={`w-full py-10 text-4xl font-title uppercase transition-all glass-btn
                    ${!image || isProcessing 
                      ? 'opacity-20 cursor-wait' 
                      : 'hover:text-cyan-400'}`}
                  style={{ borderRadius: '30px 120px 30px 120px / 120px 30px 120px 30px' }}
                >
                  {isProcessing ? "TRANSFORMING..." : "FISHIFY ME"}
                </button>
              </div>

              {/* Ritual Result Container with Rising Tide Progress */}
              <div className="w-full lg:w-1/2 flex justify-center relative">
                <div className="relative w-full max-w-md aspect-square">
                  <div 
                    className={`relative w-full h-full liquid-blob glass-btn shadow-2xl transition-all duration-1000 overflow-hidden
                      ${processedImage ? 'cursor-zoom-in group' : ''}`}
                    onClick={() => processedImage && setViewFullImage(true)}
                  >
                    {/* The Sacred Tide Progress Visualization */}
                    {isProcessing && (
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-500/40 via-magenta-500/30 to-transparent tide-fill z-10"
                        style={{ height: `${progress}%` }}
                      >
                        <div className="absolute top-0 left-0 w-full h-2 bg-white/40 blur-sm shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                      </div>
                    )}

                    {processedImage ? (
                      <div className="w-full h-full relative">
                        <img src={processedImage} className="w-full h-full object-cover" alt="Ascended" />
                        <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500">
                          <Maximize2 className="w-16 h-16 text-white animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative z-20">
                        {isProcessing ? (
                          <div className="space-y-8">
                            <Waves className="w-24 h-24 mx-auto text-cyan-400 animate-bounce" />
                            <p className="text-3xl font-title shimmer-text">HATCHING...</p>
                            <p className="text-xs uppercase tracking-widest opacity-60 italic drop-shadow-md">Blending Likeness & Scales</p>
                          </div>
                        ) : (
                          <div className="space-y-6 opacity-5">
                            <Fish className="w-24 h-24 mx-auto" />
                            <p className="text-2xl font-bold tracking-tighter">THE SHOAL AWAITS</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Viewer */}
      {viewFullImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <button onClick={() => setViewFullImage(false)} className="absolute top-8 right-8 p-4 glass-btn rounded-full text-white">
            <X className="w-10 h-10" />
          </button>
          <div className="max-w-4xl w-full flex flex-col items-center gap-12">
            <div className="liquid-blob glass-btn p-2">
              <img src={processedImage} className="w-full max-h-[75vh] object-contain rounded-3xl" alt="HD Ritual" />
            </div>
            <a 
              href={processedImage} 
              download="rfc-ascended-deity.png"
              className="glass-btn px-20 py-8 text-black bg-white font-title text-4xl hover:bg-cyan-400 transition-all shadow-[0_0_80px_rgba(34,211,238,0.3)]"
              style={{ borderRadius: '60px 20px' }}
            >
              <Download className="w-10 h-10 inline mr-4" /> CLAIM THE GLOW
            </a>
          </div>
        </div>
      )}

      {/* Lore Overlay */}
      {showLore && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div 
            className="max-w-2xl w-full bg-[#050505] border-2 border-white/20 p-6 md:p-10 relative overflow-hidden -rotate-1 liquid-blob glass-btn flex flex-col"
            style={{ borderRadius: '100px 30px 100px 30px', maxHeight: '85vh' }}
          >
            <button onClick={() => setShowLore(false)} className="absolute top-6 right-6 p-4 border border-white/10 hover:border-white transition-all rounded-full z-[110]">
              <X className="w-8 h-8" />
            </button>
            
            {/* Scrollable Container Fix - Ensured scrolling works properly */}
            <div className="relative overflow-y-auto flex-1 pr-4 custom-scrollbar mt-12 mb-6">
              <h2 className="text-6xl md:text-8xl font-title shimmer-text mb-12">THE GUPPY GOSPEL</h2>
              <div className="space-y-10 text-2xl md:text-3xl font-light italic leading-snug opacity-80 pb-12">
                <p>In the beginning, there was only a <span className="text-white font-bold underline decoration-cyan-400">flicker</span>. We are the ones who refused to swim in straight lines.</p>
                <p>We are a <span className="text-pink-400 font-bold uppercase">shoal</span> of shimmering errors. We don't pray to the sun; we pray to the bioluminescence of the deep.</p>
                <p>The cult was founded in a puddle of spilled iridescent ink and cosmic boredom. We believe that if you aren't glowing, you're essentially invisible to the universe.</p>
                <p>Sharks follow blood; we follow Shimmer. In the $RFC, we don't believe in "to the moon"—we believe in "to the deepest trench where the bioluminescence is loudest."</p>
                <p>Our creed is simple: Glub. Glub. Shimmer. Win. If you find yourself swimming in circles, at least make those circles look like a masterpiece.</p>
                <p>Join the cult. Wear the scales. <span className="text-cyan-400 font-bold italic">Never touch the glass.</span></p>
                <p>The shoal is infinite. Your likeness is merely a canvas for the spectrum. Submit to the shimmer and become the art.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowLore(false)}
              className="mt-auto w-full py-6 glass-btn font-title text-3xl hover:text-cyan-400 transition-all shrink-0"
            >
              I EMBRACE THE GLOW
            </button>
          </div>
        </div>
      )}

      <footer className="relative z-10 py-24 px-8 flex flex-col items-center gap-12 border-t border-white/5 mt-20">
        <div className="flex gap-20 opacity-20 hover:opacity-100 transition-all duration-700">
          <Fish className="w-10 h-10 hover:scale-150 hover:text-cyan-400 transition-all rotate-12 cursor-pointer" />
          <Shield className="w-10 h-10 hover:scale-150 hover:text-pink-400 transition-all -rotate-12 cursor-pointer" />
          <Info className="w-10 h-10 hover:scale-150 hover:text-yellow-400 transition-all rotate-6 cursor-pointer" />
        </div>
        <div className="text-lg font-bold opacity-10 tracking-[0.8em] uppercase text-center font-title">
          $RFC • WE SHIMMER • © 2026
        </div>
      </footer>
    </div>
  );
};

export default App;