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
    <div className={cn(
      "fixed inset-0 z-[300001] bg-black flex items-center justify-center overflow-hidden transition-all duration-2000 ease-in-out",
      phase === "fade" ? "opacity-0 invisible" : "opacity-100 visible"
    )}>
      {/* Cinematic CRT Grain & Deep Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[100]" />
      <div className="absolute inset-0 bg-[#000105]" />

      {/* The Spectrum Rays (Denser & More Organic) */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center h-full w-full transition-all duration-[6s] cubic-bezier(0.2, 0, 0, 1)",
        phase === "spectrum" ? "opacity-100 scale-150 rotate-3" : "opacity-0 scale-100"
      )}>
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

      {/* Sequential Letter Animation (The Netflix Code Style) */}
      <div className={cn(
        "relative flex items-center justify-center transition-all duration-[4s] ease-[cubic-bezier(0.1, 0.9, 0.2, 1)]",
        phase === "zoom" ? "scale-[20] opacity-0 blur-3xl" : "scale-100"
      )}>
        {letters.map((char, i) => (
          <div
            key={i}
            className={cn(
              "relative text-8xl md:text-[14rem] font-display font-black tracking-[-0.05em] italic select-none inline-block",
              phase === "initial" ? "opacity-0 translate-y-12" : "opacity-100 translate-y-0"
            )}
            style={{
              transition: 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
              transitionDelay: `${i * 120 + 1500}ms`,
              marginRight: char === " " ? "4rem" : "-1rem"
            }}
          >
            {/* The Main Letter */}
            <span className={cn(
              "relative z-10",
              i < 6 ? "text-white" : "text-cyan-400"
            )}
            style={{
               textShadow: i < 6 ? '0 0 30px rgba(255,255,255,0.4)' : '0 0 50px rgba(34,211,238,0.5)'
            }}>
              {char}
            </span>

            {/* Cinematic Shadow (Unfolding effect) */}
            <div 
              className="absolute inset-0 text-black opacity-30 blur-[2px] z-0"
              style={{
                transform: 'skewX(-20deg) scaleY(1.2) translateY(5px)',
                transition: 'opacity 1s ease',
                transitionDelay: `${i * 150 + 1800}ms`
              }}
            >
              {char}
            </div>
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
