import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── Refined Animation Timing (Synced precisely with ps2_start_up.mp3) ────────────────
const T = {
  STARS_BRIGHT: 300,
  GLOW_INIT:    1200,
  GRID_FADE:    2800,
  TOWERS_RISE:  3800,
  LOGO_HOLO:    7400,
  LOGO_SOLID:  10200,
  FADE_SHUT:   12500,
  TERM_LINK:   13800,
};

// ─── Static Data Builders ────────────────────────────────────────────────────────────
function buildStars(n: number) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: 0.5 + Math.random() * 2,
    o: 0.1 + Math.random() * 0.9,
    d: Math.random() * 5, // twinkle speed
  }));
}

function buildTowers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: (i / count) * 100 + (Math.random() - 0.5) * 4,
    h: 5 + Math.random() * 75,
    w: 1.5 + Math.random() * 8,
    delay: Math.random() * 3200,
    hue: 195 + Math.random() * 45, // electric blue → deep purple
    opacity: 0.15 + Math.random() * 0.7,
  }));
}

const STARS = buildStars(280);
const TOWERS = buildTowers(220);

// ─── Component ───────────────────────────────────────────────────────────────────────
const PS2Intro = ({ onComplete }: { onComplete: () => void }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const startIntro = () => {
    const audio = new Audio("/ps2_start_up.mp3");
    audio.volume = 1.0;
    audioRef.current = audio;
    audio.play().catch((err) => console.error("Audio playback failed:", err));
    setHasStarted(true);
  };

  useEffect(() => {
    if (!hasStarted) return;

    // Phase schedule
    const timers = [
      setTimeout(() => setPhase(1), T.STARS_BRIGHT),
      setTimeout(() => setPhase(2), T.GLOW_INIT),
      setTimeout(() => setPhase(3), T.GRID_FADE),
      setTimeout(() => setPhase(4), T.TOWERS_RISE),
      setTimeout(() => setPhase(5), T.LOGO_HOLO),
      setTimeout(() => setPhase(6), T.LOGO_SOLID),
      setTimeout(() => setPhase(7), T.FADE_SHUT),
      setTimeout(() => { 
        setVisible(false); 
        onComplete(); 
      }, T.TERM_LINK),
    ];

    return () => {
      timers.forEach(clearTimeout);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [onComplete, hasStarted]);

  if (!visible || typeof document === 'undefined') return null;

  // Booleans for cleaner JSX
  const showGlow   = phase >= 2;
  const showGrid   = phase >= 3;
  const riseTowers = phase >= 4;
  const showLogo   = phase >= 5;
  const fullLogo   = phase >= 6;
  const fading     = phase >= 7;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] overflow-hidden bg-black select-none pointer-events-auto"
      style={{ 
        opacity: fading ? 0 : 1,
        transition: "opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* ── Background: Deep Infinite Space ── */}
      <div className="absolute inset-0 bg-[#010206]">
        <div 
          className="absolute inset-0" 
          style={{
            background: `
              radial-gradient(circle at 10% 10%, rgba(20, 50, 150, 0.1) 0%, transparent 40%)
            `
          }} 
        />
      </div>

      {/* ── Nebula Energy Field ── */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen animate-pulse"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(40, 100, 255, 0.15) 0%, transparent 70%)",
          filter: "blur(120px)"
        }}
      />

      {/* ── Initial Connection Overlay ── */}
      {!hasStarted && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 pointer-events-auto backdrop-blur-sm animate-fade-in">
          <div className="text-center space-y-8 max-w-sm px-6">
            <div className="relative group">
               <div className="absolute inset-0 bg-cyan-500/20 blur-3xl animate-pulse group-hover:bg-cyan-500/40" />
               <div className="relative w-24 h-24 mx-auto rounded-3xl border border-white/10 flex items-center justify-center p-4 bg-white/5 backdrop-blur-xl group-hover:scale-110 transition-transform duration-500 cursor-pointer shadow-2xl" onClick={startIntro}>
                 <img src="/JARVIS2.gif" alt="Initialize Core" className="w-full h-full object-contain brightness-125" />
               </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-white font-display font-black tracking-tighter text-3xl uppercase leading-tight italic">
                 Jarvis <span className="text-cyan-400">Hub</span>
              </h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] font-sans">
                 Click to Continue
              </p>
            </div>

            <button
               onClick={startIntro}
               className="group relative px-10 py-4 bg-transparent transition-all active:scale-95"
            >
               <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-cyan-400/10 group-hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.5)]" />
               <span className="relative text-white font-display font-black uppercase text-[10px] tracking-[0.8em] group-hover:text-cyan-400 transition-colors">
                  Click to Continue
               </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Parallax Starfield ── */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white shadow-[0_0_8px_white]"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              opacity: phase > 0 ? s.o : 0,
              transition: `opacity ${1 + Math.random() * 2}s ease`,
              animation: `ps2StarFade ${s.d + 1}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>


      {/* ── Central Beacon Glow ── */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
        style={{ transitionDuration: '3000ms' }}
        style={{
          width: showGlow ? "min(120vw, 1400px)" : 0,
          height: showGlow ? "min(80vh, 1000px)" : 0,
          opacity: showGlow ? 0.6 : 0,
          background: "radial-gradient(ellipse at center, rgba(34, 211, 238, 0.15) 0%, transparent 68%)",
          filter: "blur(60px)"
        }}
      />

      {/* ── Monolithic Towers (The Classic PS2 Vibe) ── */}
      <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden">
        {TOWERS.map((t, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-t-[2px] border-x border-white/5"
            style={{
              left: `${t.x}%`,
              width: t.w,
              height: riseTowers ? `${t.h}vh` : 0,
              background: `linear-gradient(to top, hsla(${t.hue}, 80%, 40%, ${t.opacity}) 0%, hsla(${t.hue}, 80%, 20%, ${t.opacity * 0.4}) 70%, transparent 100%)`,
              boxShadow: riseTowers ? `0 0 25px hsla(${t.hue}, 100%, 50%, 0.15)` : "none",
              transition: `height ${1.2 + t.delay/2000}s cubic-bezier(0.16, 1, 0.3, 1) ${t.delay}ms`,
            }}
          />
        ))}
      </div>

      {/* ── Central Beacon Glow ── */}

      {/* ── JARVIS HUB Center Logo ── */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center gap-6 md:gap-8"
        style={{
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? "translateY(0) scale(1)" : "translateY(40px) scale(0.9)",
          transition: "all 2s cubic-bezier(0.2, 0.8, 0.2, 1)",
          pointerEvents: "none"
        }}
      >
        {/* Holographic Ring */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-2xl animate-pulse" />
          <div 
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-[3px] border-white/20 overflow-hidden shadow-2xl transition-all duration-1000"
            style={{
              borderColor: fullLogo ? "rgba(34, 211, 238, 0.8)" : "rgba(255,255,255,0.2)",
              boxShadow: fullLogo ? "0 0 50px rgba(34, 211, 238, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.3)" : "none",
              transform: fullLogo ? "rotate(0)" : "rotate(-12deg)"
            }}
          >
            <img src="/JARVIS2.gif" alt="JARVIS Core" className="w-full h-full object-cover scale-110" />
            
            {/* Holographic Scanline Over Image */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center">
          <h1 
            className="font-display font-black tracking-tighter text-[min(16vw,84px)] leading-none transition-all duration-1000"
            style={{
              textShadow: fullLogo ? "0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(34, 211, 238, 0.4)" : "none"
            }}
          >
            <span className="text-white">JARVIS</span>
            <span className="text-cyan-400 ml-2">HUB</span>
          </h1>
          <div 
            className="mt-4 flex items-center justify-center gap-4 text-[10px] md:text-sm font-bold tracking-[0.6em] uppercase text-white/40 transition-all duration-1000"
            style={{ opacity: fullLogo ? 1 : 0, transform: fullLogo ? "translateY(0)" : "translateY(10px)" }}
          >
            <span className="w-8 md:w-12 h-px bg-white/10" />
            Premium Movie Experience
            <span className="w-8 md:w-12 h-px bg-white/10" />
          </div>
        </div>
      </div>



      {/* ── CRT Static Overlay (Subtle) ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* ── Styles ── */}
      <style>{`
        @keyframes ps2StarFade {
          from { opacity: 0.2; transform: scale(0.95); }
          to   { opacity: 0.9; transform: scale(1.05); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PS2Intro;
