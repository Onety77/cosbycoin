import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp
} from 'lucide-react';

// Using the provided API key logic for Vercel/Environment compatibility
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
  const [error, setError] = useState(null);
  const [view, setView] = useState('landing'); 
  const [showLore, setShowLore] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper to fetch local reference image and convert to base64
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
    
    try {
      // Fetch the sacred reference fish image
      const referenceFishBase64 = await getBase64FromUrl('fish.jpg');
      
      const prompt = `You are the master artist of the Rainbow Fish Cult ($RFC). 
      Use the provided reference fish image (the one with iridescent scales and vibrant colors) as the absolute source of truth for style, color palette, and textures.
      Transform the provided person's profile picture into a shimmering, artsy, cult-like deity. 
      Integrate the specific rainbow scales, translucent fins, and bioluminescent glow from the reference fish onto the person. 
      The result should be a high-fashion, avant-garde digital painting. 
      Make it look hand-crafted and unique.`;

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              { 
                inlineData: { 
                  mimeType: "image/jpeg", 
                  data: referenceFishBase64 // The reference fish
                } 
              },
              { 
                inlineData: { 
                  mimeType: "image/png", 
                  data: base64Data.split(',')[1] // The user pfp
                } 
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      };

      let retries = 5;
      let delay = 1000;

      while (retries > 0) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }
          );

          if (!response.ok) throw new Error('API failed');
          const result = await response.json();
          const generatedBase64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

          if (generatedBase64) {
            setProcessedImage(`data:image/png;base64,${generatedBase64}`);
            setIsProcessing(false);
            return;
          } else {
            throw new Error('No image returned');
          }
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await sleep(delay);
          delay *= 2;
        }
      }
    } catch (err) {
      console.error(err);
      setError("The cosmic current is too strong or the API key is missing. Try again later.");
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
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0f0f0] selection:bg-cyan-500/50 overflow-x-hidden font-serif">
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .blob-shape { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
          .blob-shape-2 { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          .hand-drawn-border { border: 2px solid white; border-radius: 255px 15px 225px 15px/15px 225px 15px 255px; }
          @keyframes shimmer-fast {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .shimmer-text {
            background: linear-gradient(90deg, #22d3ee, #f472b6, #fbbf24, #22d3ee);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer-fast 4s linear infinite;
          }
          .art-shadow { box-shadow: 15px 15px 0px rgba(255, 255, 255, 0.05); }
        `}
      </style>

      {/* Artsy Background Overlay */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: `url('bg.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          mixBlendMode: 'color-dodge'
        }}
      />
      
      {/* Floating Aesthetic Blobs */}
      <div className="fixed top-[-5%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] blob-shape animate-float" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-pink-500/10 blur-[150px] blob-shape-2 animate-float" style={{ animationDelay: '-3s' }} />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-10 md:px-12">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setView('landing')}>
          <div className="relative">
            <img src="logo.png" alt="RFC" className="w-12 h-12 md:w-16 md:h-16 object-contain group-hover:scale-110 transition-transform duration-700 -rotate-12" />
          </div>
          <span className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase shimmer-text">
            $RFC
          </span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <a href="#" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-cyan-400 transition-all border-b border-transparent hover:border-cyan-400">
            <TrendingUp className="w-3 h-3" /> BUY
          </a>
          <a href="#" className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-pink-400 transition-all border-b border-transparent hover:border-pink-400">
            <MessageCircle className="w-3 h-3" /> COMMUNITY
          </a>
          <button 
            onClick={() => setShowLore(true)}
            className="hidden md:block p-3 bg-white/5 border border-white/20 hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase tracking-widest blob-shape"
          >
            THE LORE
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center min-h-[75vh]">
        {view === 'landing' ? (
          <div className="text-center max-w-5xl py-12">
            <h2 className="text-[10px] font-bold tracking-[0.6em] uppercase text-cyan-400 mb-6 flex items-center justify-center gap-4">
              <span className="w-12 h-[1px] bg-cyan-400/30" /> REFRACTING SINCE THE BEGINNING <span className="w-12 h-[1px] bg-cyan-400/30" />
            </h2>
            <h1 className="text-6xl md:text-[10rem] font-black italic leading-[0.8] mb-12 tracking-tighter relative group">
              <span className="relative z-10 block -rotate-1 group-hover:rotate-0 transition-transform duration-500">RAINBOW</span>
              <span className="block translate-x-4 md:translate-x-12 rotate-1 shimmer-text opacity-90 group-hover:translate-x-0 transition-transform duration-500">FISH CULT.</span>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-pink-500/5 blur-[120px] -z-10" />
            </h1>
            
            <p className="text-lg md:text-3xl font-light italic text-white/40 max-w-2xl mx-auto mb-16 leading-tight">
              "A hydrodynamic collective of glowing mistakes. We don't swim, we shimmer."
            </p>

            {/* Hand-drawn CA */}
            <div className="flex flex-col items-center gap-4 mb-16">
              <div 
                onClick={copyToClipboard}
                className="group relative cursor-pointer px-6 md:px-10 py-5 bg-white/5 border-2 border-dashed border-white/20 -rotate-1 hover:rotate-0 transition-all flex items-center gap-4 hover:bg-cyan-400 hover:text-black hover:border-solid art-shadow"
                style={{ borderRadius: '40px 120px 40px 120px / 120px 40px 120px 40px' }}
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-40">The Sacred Address</span>
                  <span className="font-mono text-sm md:text-base break-all font-bold">{CONTRACT_ADDRESS}</span>
                </div>
                <div className="p-2 border-2 border-current rounded-full">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setView('fishify')}
              className="group relative px-12 md:px-20 py-8 md:py-10 bg-white text-black text-2xl md:text-4xl font-black uppercase tracking-[0.1em] transition-all hover:scale-105 hover:-rotate-1 shadow-[15px_15px_0px_rgba(34,211,238,0.4)]"
              style={{ borderRadius: '150px 30px 150px 30px / 30px 150px 30px 150px' }}
            >
              <span className="relative z-10 flex items-center gap-6">
                JOIN THE CULT <Sparkles className="w-8 h-8 md:w-12 md:h-12 animate-spin duration-[4s]" />
              </span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-6xl flex flex-col gap-8 md:gap-16 py-10">
            {/* Back Button */}
            <button 
              onClick={() => setView('landing')}
              className="self-start group flex items-center gap-3 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all -rotate-1 hover:rotate-0"
            >
              <div className="p-3 border border-white/20 rounded-full group-hover:bg-white group-hover:text-black">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span>Back to Surface</span>
            </button>

            <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
              {/* Transformation Lab */}
              <div className="w-full md:w-1/2 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase -rotate-1 shimmer-text">ASCENSION</h2>
                  <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] mt-2 italic">Refract your likeness. Enter the shoal.</p>
                </div>

                <div 
                  className={`relative aspect-square transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer group art-shadow
                    ${image ? 'border-transparent' : 'border-4 border-dashed border-white/10 hover:border-pink-400 hover:bg-pink-400/5'}`}
                  style={{ borderRadius: '60% 40% 70% 30% / 30% 60% 40% 70%' }}
                  onClick={() => !image && fileInputRef.current.click()}
                >
                  {image ? (
                    <img src={image} className="w-full h-full object-cover" alt="Source" />
                  ) : (
                    <div className="text-center p-12">
                      <Upload className="w-12 h-12 mx-auto mb-6 text-white/10 group-hover:text-pink-400 group-hover:scale-110 transition-all" />
                      <p className="text-xl font-bold italic tracking-tighter">OFFER LIKENESS</p>
                    </div>
                  )}
                  {image && !isProcessing && (
                    <button onClick={(e) => { e.stopPropagation(); reset(); }} className="absolute bottom-6 right-6 p-4 bg-black/90 rounded-full hover:bg-red-500 text-white transition-all shadow-xl">
                      <RefreshCcw className="w-6 h-6" />
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                <button
                  disabled={!image || isProcessing}
                  onClick={() => fishifyImage(image)}
                  className={`w-full py-8 text-2xl font-black uppercase tracking-[0.2em] transition-all
                    ${!image || isProcessing 
                      ? 'bg-white/5 text-white/10' 
                      : 'bg-white text-black hover:bg-cyan-400 hover:scale-[1.02] active:scale-95'}`}
                  style={{ borderRadius: '20px 100px 20px 100px / 100px 20px 100px 20px' }}
                >
                  {isProcessing ? "SHIMMERING..." : "FISHIFY ME"}
                </button>
              </div>

              {/* The Resulting Glow */}
              <div className="w-full md:w-1/2 flex justify-center relative animate-in fade-in slide-in-from-right-8 duration-1000">
                <div 
                  className="relative aspect-square w-full max-w-md bg-white/5 overflow-hidden flex items-center justify-center p-6 shadow-[30px_30px_0px_rgba(244,114,182,0.15)]"
                  style={{ borderRadius: '40% 60% 30% 70% / 70% 30% 60% 40%' }}
                >
                  {processedImage ? (
                    <div className="relative w-full h-full group">
                      <img src={processedImage} className="w-full h-full object-cover rounded-3xl" alt="Cult PFP" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                        <a 
                          href={processedImage} 
                          download="cult-fish-rfc.png"
                          className="px-10 py-5 bg-cyan-400 text-black font-black uppercase tracking-widest text-sm hover:scale-110 transition-transform shadow-2xl"
                          style={{ borderRadius: '50px 10px 50px 10px' }}
                        >
                          <Download className="w-5 h-5 inline mr-3" /> CLAIM YOUR GLOW
                        </a>
                        <p className="text-[10px] uppercase font-black text-white bg-black px-4 py-1">Saved to depths</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center opacity-20 italic p-8">
                      {isProcessing ? (
                        <div className="space-y-6">
                          <Waves className="w-20 h-20 mx-auto animate-pulse text-cyan-400" />
                          <p className="text-2xl font-black animate-pulse">GROWING FINS...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Fish className="w-20 h-20 mx-auto opacity-10" />
                          <p className="text-xl font-bold uppercase tracking-widest">Awaiting Refraction</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lore Overlay */}
      {showLore && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div 
            className="max-w-2xl w-full bg-[#0a0a0a] border-4 border-white p-10 md:p-16 relative overflow-y-auto max-h-[85vh] -rotate-1 art-shadow"
            style={{ borderRadius: '80px 20px 80px 20px / 20px 80px 20px 80px' }}
          >
            <button onClick={() => setShowLore(false)} className="absolute top-8 right-8 p-3 hover:bg-white hover:text-black rounded-full transition-all border border-white/20">
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-cyan-500 rounded-full -rotate-12"><BookOpen className="w-8 h-8 text-black" /></div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter shimmer-text">THE GUPPY GOSPEL</h2>
            </div>
            
            <div className="space-y-8 text-lg md:text-xl text-white/70 leading-relaxed font-light italic">
              <p>
                The $RFC was founded in a puddle of spilled iridescent ink and cosmic boredom. We believe that if you aren't <span className="text-white font-bold underline decoration-pink-400">glowing</span>, you're essentially invisible to the universe.
              </p>
              <p>
                Sharks follow blood; we follow <span className="text-cyan-400 font-bold uppercase">Shimmer</span>. In the $RFC, we don't believe in "to the moon"—we believe in "to the deepest trench where the bioluminescence is loudest."
              </p>
              <p>
                Our creed is simple: <span className="text-yellow-400 font-bold">Glub. Glub. Shimmer. Win.</span> If you find yourself swimming in circles, at least make those circles look like a masterpiece.
              </p>
              <p className="pt-8 text-[10px] uppercase tracking-[0.5em] opacity-30 border-t border-white/10">
                Notice: We are not responsible for sudden scales appearing on your digital persona.
              </p>
            </div>
            
            <button 
              onClick={() => setShowLore(true)}
              className="mt-12 w-full py-6 bg-white text-black font-black uppercase tracking-widest text-xl hover:bg-pink-400 transition-colors rotate-1"
            >
              I AM READY TO GLOW
            </button>
          </div>
        </div>
      )}

      {/* Artsy Footer */}
      <footer className="relative z-10 py-20 px-8 flex flex-col items-center gap-12 border-t border-white/5 mt-20">
        <div className="flex gap-12 opacity-20 hover:opacity-100 transition-all">
          <a href="#" className="hover:scale-150 hover:text-cyan-400 transition-all rotate-12"><Fish /></a>
          <a href="#" className="hover:scale-150 hover:text-pink-400 transition-all -rotate-12"><Shield /></a>
          <button onClick={() => setShowLore(true)} className="hover:scale-150 hover:text-yellow-400 transition-all rotate-6"><Info /></button>
        </div>
        <div className="text-[10px] uppercase tracking-[0.6em] font-black opacity-10 text-center">
          $RFC • SHIMMER OR DIE • NO REFUNDS ON GLOW • © 2026
        </div>
      </footer>
    </div>
  );
};

export default App;