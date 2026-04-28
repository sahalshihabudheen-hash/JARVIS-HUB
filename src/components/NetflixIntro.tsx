import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface NetflixIntroProps {
  onComplete: () => void;
}

const NetflixIntro = ({ onComplete }: NetflixIntroProps) => {
  const [phase, setPhase] = useState<"initial" | "letters" | "zoom" | "spectrum" | "fade">("initial");
  const [visible, setVisible] = useState(true);

  const letters = "JARVIS HUB".split("");

  useEffect(() => {
    // Stage 1: Absolute silence, then Letters start appearing
    const t1 = setTimeout(() => setPhase("letters"), 1000);
    
    // Stage 2: Logo zooms into the "Barcode/Spectrum" rays
    const t2 = setTimeout(() => setPhase("zoom"), 5500);
    
    // Stage 3: The Spectrum Peak
    const t3 = setTimeout(() => setPhase("spectrum"), 8500);
    
    // Stage 4: Fade out to reveal player
    const t4 = setTimeout(() => setPhase("fade"), 13000);
    
    // Stage 5: Final Cleanup
    const t5 = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 15000);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
    };
  }, [onComplete]);

  if (!visible) return null;

  return createPortal(
      "fixed inset-0 z-[300001] bg-black flex items-center justify-center overflow-hidden transition-all ease-in-out",
      phase === "fade" ? "opacity-0 invisible" : "opacity-100 visible"
    )}
    style={{ transitionDuration: '2000ms' }}
    >
      {/* Cinematic CRT Grain & Deep Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[100]" />
      <div className="absolute inset-0 bg-[#000105]" />

      {/* The Spectrum Rays (Denser & More Organic) */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center h-full w-full transition-all",
        phase === "spectrum" ? "opacity-100 scale-150 rotate-3" : "opacity-0 scale-100"
      )}
      style={{
        transitionDuration: "6000ms",
        transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
      }}>
        {Array.from({ length: 90 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[400%] blur-[3px] animate-pulse"
            style={{
              left: `${(i / 90) * 100}%`,
              background: `linear-gradient(to bottom, transparent, ${
                i % 4 === 0 ? '#22d3ee' : 
                i % 3 === 0 ? '#3b82f6' : 
                i % 5 === 0 ? '#ffffff' : '#0891b2'
              }, transparent)`,
              opacity: 0.1 + Math.random() * 0.7,
              transform: `translateY(${(Math.random() - 0.5) * 400}px) scaleX(${Math.random() * 4})`,
              transition: 'all 8s cubic-bezier(0.1, 0.9, 0.2, 1)',
              transitionDelay: `${i * 20}ms`
            }}
          />
        ))}
      </div>

      {/* The Cinematic Branding (Geometric Unfolding) */}
      <div className={cn(
        "relative flex items-center justify-center transition-all",
        phase === "zoom" ? "scale-[20] opacity-0 blur-3xl translate-z-[500px]" : "scale-100 translate-z-0"
      )} style={{ perspective: '1000px', transitionDuration: '4000ms', transitionTimingFunction: 'cubic-bezier(0.1, 0.9, 0.2, 1)' }}>
        {letters.map((char, i) => (
          <div
            key={i}
            className={cn(
              "relative font-display font-black tracking-[-0.05em] italic select-none",
              phase === "initial" ? "opacity-0 scale-y-0" : "opacity-100 scale-y-100"
            )}
            style={{
              fontSize: 'min(18vw, 14rem)',
              transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transitionDelay: `${i * 150 + 1200}ms`,
              marginRight: char === " " ? "4rem" : "-1rem",
              transformOrigin: i % 2 === 0 ? "top" : "bottom"
            }}
          >
            {/* 1. The Under-Shadow (N1-shadow type) */}
            <div 
              className="absolute inset-0 text-black z-0"
              style={{
                transform: 'scaleX(1.1) skewX(-15deg) translate(-10px, 5px)',
                opacity: phase === "initial" ? 0 : 0.6,
                filter: 'blur(8px)',
                transition: 'opacity 1.5s ease',
                transitionDelay: `${i * 150 + 1800}ms`
              }}
            >
              {char}
            </div>

            {/* 2. The Internal Shadow-Wipe (Diagonal Geometry) */}
            <div 
              className="absolute inset-0 z-[5] overflow-hidden"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                opacity: phase === "initial" ? 0 : 0.4,
                transition: 'opacity 1s ease',
                transitionDelay: `${i * 150 + 2200}ms`
              }}
            >
              <div className="absolute inset-0 bg-black blur-[15px]" style={{ transform: 'translateX(-20%) rotate(-10deg)' }} />
            </div>

            {/* 3. The Main Geometry (E1-base/T1 style) */}
            <span className={cn(
              "relative z-10 transition-all duration-1000",
              i < 6 ? "text-white" : "text-cyan-400"
            )}
            style={{
               transitionDelay: `${i * 150 + 1500}ms`,
               filter: phase === "letters" ? 'brightness(1.5) drop-shadow(0 0 40px currentColor)' : 'brightness(1) drop-shadow(0 0 20px currentColor)'
            }}>
              {char}
            </span>

            {/* 4. The Top Reflection (F1 style) */}
            <div 
               className="absolute top-0 left-0 w-full h-[20%] bg-white/20 blur-[1px] z-20 pointer-events-none"
               style={{
                 transformOrigin: 'top',
                 transform: phase === "initial" ? 'scaleY(0)' : 'scaleY(1)',
                 transition: 'transform 0.5s ease',
                 transitionDelay: `${i * 150 + 2500}ms`
               }}
            />
          </div>
        ))}
      </div>

      {/* Letterbox Bars */}
      <div className="absolute top-0 left-0 w-full h-[15vh] bg-black z-[150]" />
      <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-black z-[150]" />

      {/* Sound Source */}
      <audio autoPlay>
        <source src="/ps2_start_up.mp3" type="audio/mpeg" />
      </audio>

      <style>{`
        @keyframes letter-shadow {
          from { opacity: 0; transform: scale(0.8) skewX(0); }
          to { opacity: 0.3; transform: scale(1.1) skewX(-20deg); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default NetflixIntro;
