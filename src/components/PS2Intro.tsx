import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── Cinematic Timing ────────────────────────────────────────────────────────────
const T = {
  ORB_PULSE:   500,
  SCAN_START:  1500,
  LOGO_REVEAL: 2800,
  TEXT_REVEAL: 3500,
  FADE_OUT:    5000,
  COMPLETE:    5800,
};

const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startIntro = () => {
    const audio = new Audio("/ps2_start_up.mp3");
    audio.volume = 0.5;
    audioRef.current = audio;
    audio.play().catch(e => console.error("Audio play failed:", e));
    setHasStarted(true);
  };

  useEffect(() => {
    if (!hasStarted) return;

    const timers = [
      setTimeout(() => setPhase(1), T.ORB_PULSE),
      setTimeout(() => setPhase(2), T.SCAN_START),
      setTimeout(() => setPhase(3), T.LOGO_REVEAL),
      setTimeout(() => setPhase(4), T.TEXT_REVEAL),
      setTimeout(() => setPhase(5), T.FADE_OUT),
      setTimeout(() => { 
        setVisible(false); 
        onComplete(); 
      }, T.COMPLETE),
    ];

    return () => {
      timers.forEach(clearTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onComplete, hasStarted]);

  if (!visible || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] overflow-hidden bg-black select-none pointer-events-auto"
      style={{ 
        opacity: phase >= 5 ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* ── Background: Deep Infinite Space ── */}
      <div className="absolute inset-0 bg-[#02040a]">
        {/* Animated Glow Gradients */}
        <div 
          className="absolute inset-0 transition-opacity duration-2000"
          style={{
            opacity: phase >= 1 ? 0.4 : 0,
            background: `
              radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1) 0%, transparent 60%),
              radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%)
            `
          }} 
        />
      </div>


      {/* ── Initial Start Screen ── */}
      {!hasStarted && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-md animate-fade-in">
          <div className="text-center space-y-12 max-w-sm px-6">
            <div className="relative group cursor-pointer" onClick={startIntro}>
               <div className="absolute inset-0 bg-blue-500/30 blur-[60px] animate-pulse rounded-full" />
               <div className="relative w-28 h-28 mx-auto rounded-full border border-white/20 flex items-center justify-center p-1 bg-white/5 backdrop-blur-2xl transition-all duration-700 group-hover:scale-110 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                 <div className="w-full h-full rounded-full overflow-hidden border border-white/10 shadow-inner">
                   <img src="/JARVIS2.gif" alt="Initialize Core" className="w-full h-full object-cover brightness-110" />
                 </div>
               </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-white font-display font-black tracking-tighter text-4xl uppercase leading-tight">
                   JARVIS <span className="text-blue-400">HUB</span>
                </h2>
                <div className="w-12 h-0.5 bg-blue-500/50 rounded-full" />
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.5em] font-sans">
                 Secure Link Ready
              </p>
            </div>

            <button
               onClick={startIntro}
               className="group relative px-12 py-4 bg-transparent transition-all active:scale-95"
            >
               <div className="absolute inset-0 bg-blue-600 rounded-full group-hover:bg-blue-500 transition-all duration-300 shadow-[0_0_30px_rgba(37,99,235,0.4)]" />
               <span className="relative text-white font-display font-black uppercase text-[11px] tracking-[0.4em]">
                  Initialize Stream
               </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Central Orb & Scan ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        
        {/* The Core Orb */}
        <div 
          className="relative transition-all duration-1000 ease-out"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 3 ? "scale(0.8) translateY(-40px)" : "scale(1) translateY(0)",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/40 blur-[100px] animate-pulse-glow" />
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[1px] border-white/20 p-1 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
             <div className="w-full h-full rounded-full border border-white/10 overflow-hidden shadow-inner bg-black">
                <img src="/JARVIS2.gif" alt="JARVIS Core" className="w-full h-full object-cover scale-110" />
             </div>
             
             {/* Sweeping Scan Line */}
             {phase >= 2 && (
               <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 shadow-[0_0_20px_#3b82f6] z-20 animate-scanline" />
             )}
          </div>
        </div>

        {/* Brand Text crystallization */}
        <div 
          className="text-center mt-12 transition-all duration-1000 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h1 className="font-display font-black tracking-tighter text-[min(14vw,92px)] leading-none text-white">
            JARVIS <span className="text-blue-500 transition-all duration-1000" style={{ textShadow: phase >= 4 ? "0 0 40px rgba(59,130,246,0.6)" : "none" }}>HUB</span>
          </h1>
          
          <div 
            className="mt-6 flex items-center justify-center gap-6 text-[10px] md:text-sm font-bold tracking-[0.8em] uppercase text-white/30 transition-all duration-1000"
            style={{ 
              opacity: phase >= 4 ? 1 : 0, 
              transform: phase >= 4 ? "translateY(0)" : "translateY(10px)" 
            }}
          >
            <span className="w-12 h-px bg-white/10" />
            Cinema Protocol Active
            <span className="w-12 h-px bg-white/10" />
          </div>
        </div>
      </div>

      {/* ── CRT Static Overlay (Minimal) ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay bg-repeat bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <style>{`
        @keyframes scanline {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-scanline {
          animation: scanline 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CinematicIntro;
