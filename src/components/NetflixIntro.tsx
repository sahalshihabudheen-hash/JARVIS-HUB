import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface NetflixIntroProps {
  onComplete: () => void;
}

const NetflixIntro = ({ onComplete }: NetflixIntroProps) => {
  const [phase, setPhase] = useState<"initial" | "zoom" | "spectrum" | "fade">("initial");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Stage 1: Initial Logo Appears
    const t1 = setTimeout(() => setPhase("zoom"), 100);
    
    // Stage 2: Logo zooms into the "Barcode/Spectrum" rays
    const t2 = setTimeout(() => setPhase("spectrum"), 1400);
    
    // Stage 3: Fade out to reveal player
    const t3 = setTimeout(() => setPhase("fade"), 3200);
    
    // Stage 4: Cleanup
    const t4 = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (!visible) return null;

  return createPortal(
    <div className={cn(
      "fixed inset-0 z-[100000] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-1000",
      phase === "fade" ? "opacity-0" : "opacity-100"
    )}>
      {/* Cinematic CRT Grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50" />

      {/* The Spectrum Rays (Netflix style light streaks) */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center h-full w-full transition-all duration-1000",
        phase === "spectrum" ? "opacity-100 scale-150 rotate-3" : "opacity-0 scale-100"
      )}>
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-[200%] blur-[2px] animate-pulse"
            style={{
              left: `${(i / 45) * 100}%`,
              background: `linear-gradient(to bottom, transparent, ${i % 3 === 0 ? '#22d3ee' : i % 2 === 0 ? '#3b82f6' : '#ffffff'}, transparent)`,
              opacity: 0.1 + Math.random() * 0.4,
              transform: `translateY(${(Math.random() - 0.5) * 100}px) scaleX(${Math.random() * 2})`,
              transition: 'all 2s ease-out',
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* The Central Brand Logo */}
      <div className={cn(
        "relative transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1)",
        phase === "zoom" ? "scale-[15] opacity-0 blur-md" : phase === "spectrum" ? "scale-[20] opacity-0" : "scale-100 opacity-100"
      )}>
        <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter italic">
          <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">JARVIS</span>
          <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)] ml-2">HUB</span>
        </h1>
        
        {/* Subtle Underline Progress */}
        <div className={cn(
          "h-1 bg-cyan-400 mt-4 rounded-full transition-all duration-1000",
          phase === "initial" ? "w-0 mx-auto" : "w-full"
        )} />
      </div>

      {/* Ambient Sound (Ta-dum cinematic impact) */}
      <audio autoPlay>
        <source src="https://assets.mixkit.co/active_storage/sfx/2861/2861-preview.mp3" type="audio/mpeg" />
      </audio>

      <style>{`
        @keyframes spectrum {
          0% { transform: scaleY(1) translateY(0); opacity: 0.1; }
          50% { transform: scaleY(1.5) translateY(-50px); opacity: 0.3; }
          100% { transform: scaleY(1) translateY(0); opacity: 0.1; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default NetflixIntro;
