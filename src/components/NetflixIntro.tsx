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
    // Stage 1: Initial Logo Appears (Sync with PS2 initial hum)
    const t1 = setTimeout(() => setPhase("zoom"), 800);
    
    // Stage 2: Logo zooms into the "Barcode/Spectrum" rays (Sync with PS2 rising towers)
    const t2 = setTimeout(() => setPhase("spectrum"), 2800);
    
    // Stage 3: Fade out to reveal player (Sync with PS2 exit)
    const t3 = setTimeout(() => setPhase("fade"), 5500);
    
    // Stage 4: Cleanup
    const t4 = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 6500);

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
      "fixed inset-0 z-[200000] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-1000",
      phase === "fade" ? "opacity-0" : "opacity-100"
    )}>
      {/* Cinematic CRT Grain & Deep Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />

      {/* The Spectrum Rays (Netflix style light streaks) */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center h-full w-full transition-all duration-2000 easing-out",
        phase === "spectrum" ? "opacity-100 scale-150 rotate-3" : "opacity-0 scale-100"
      )}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[300%] blur-[3px] animate-pulse"
            style={{
              left: `${(i / 60) * 100}%`,
              background: `linear-gradient(to bottom, transparent, ${i % 3 === 0 ? '#22d3ee' : i % 2 === 0 ? '#3b82f6' : '#ffffff'}, transparent)`,
              opacity: 0.2 + Math.random() * 0.5,
              transform: `translateY(${(Math.random() - 0.5) * 200}px) scaleX(${Math.random() * 3})`,
              transition: 'all 3s cubic-bezier(0.16, 1, 0.3, 1)',
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* The Central Brand Logo */}
      <div className={cn(
        "relative transition-all duration-[2000ms] cubic-bezier(0.8, 0, 0.2, 1)",
        phase === "zoom" ? "scale-[25] opacity-0 blur-xl" : phase === "spectrum" ? "scale-[30] opacity-0" : "scale-100 opacity-100"
      )}>
        <h1 className="text-8xl md:text-[12rem] font-display font-black tracking-tighter italic select-none">
          <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">JARVIS</span>
          <span className="text-cyan-400 drop-shadow-[0_0_50px_rgba(34,211,238,0.5)] ml-4">HUB</span>
        </h1>
        
        {/* Holographic Scanline */}
        <div className={cn(
          "h-1 bg-cyan-400 mt-8 rounded-full transition-all duration-[1500ms] shadow-[0_0_20px_#22d3ee]",
          phase === "initial" ? "w-0 mx-auto" : "w-full"
        )} />
      </div>

      {/* PS2 Startup Sound Impact */}
      <audio autoPlay>
        <source src="/ps2_start_up.mp3" type="audio/mpeg" />
      </audio>

      <style>{`
        @keyframes spectrum {
          0% { transform: scaleY(1) translateY(0); opacity: 0.1; }
          50% { transform: scaleY(2) translateY(-100px); opacity: 0.4; }
          100% { transform: scaleY(1) translateY(0); opacity: 0.1; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default NetflixIntro;
