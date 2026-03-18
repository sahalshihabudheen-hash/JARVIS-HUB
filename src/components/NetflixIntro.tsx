import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface NetflixIntroProps {
  onComplete: () => void;
}

const NetflixIntro = ({ onComplete }: NetflixIntroProps) => {
  const [phase, setPhase] = useState<"initial" | "logo-fade" | "zoom-hit" | "spectrum-peak" | "outro">("initial");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Stage 1: Absolute silence, then Logo fades in elegantly
    const t1 = setTimeout(() => setPhase("logo-fade"), 800);
    
    // Stage 2: The "Hit" - Sudden Zoom & Sound Peak
    const t2 = setTimeout(() => setPhase("zoom-hit"), 3200);
    
    // Stage 3: The Spectrum - Rays flying like light speed
    const t3 = setTimeout(() => setPhase("spectrum-peak"), 5200);
    
    // Stage 4: Outro Fade
    const t4 = setTimeout(() => setPhase("outro"), 9500);
    
    // Stage 5: Final Cleanup
    const t5 = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 11500);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
    };
  }, [onComplete]);

  if (!visible) return null;

  return createPortal(
    <div className={cn(
      "fixed inset-0 z-[300000] bg-black flex items-center justify-center overflow-hidden transition-all duration-2000 ease-in-out",
      phase === "outro" ? "opacity-0 scale-110" : "opacity-100 scale-100"
    )}>
      {/* 1. Cinematic Backdrop Layers */}
      <div className="absolute inset-0 bg-[#000105]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[60]" />
      
      {/* 2. Deep Ambient Glow */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-[3s]",
        phase !== "initial" ? "opacity-40" : "opacity-0",
        "bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08)_0%,transparent_70%)]"
      )} />

      {/* 3. The Pro Spectrum Rays (Denser & More Organic) */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center h-full w-full transition-all duration-[4s] cubic-bezier(0.2, 0, 0, 1)",
        phase === "spectrum-peak" ? "opacity-100 scale-150" : "opacity-0 scale-100"
      )}>
        {Array.from({ length: 85 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[1.5px] h-[400%] blur-[2px] animate-pulse"
            style={{
              left: `${(i / 85) * 100}%`,
              background: `linear-gradient(to bottom, transparent, ${
                i % 4 === 0 ? '#22d3ee' : 
                i % 3 === 0 ? '#3b82f6' : 
                i % 5 === 0 ? '#ffffff' : '#0891b2'
              }, transparent)`,
              opacity: 0.1 + Math.random() * 0.6,
              transform: `translateY(${(Math.random() - 0.5) * 400}px) scaleX(${Math.random() * 4})`,
              transition: 'all 5s cubic-bezier(0.1, 0.9, 0.2, 1)',
              transitionDelay: `${i * 10}ms`
            }}
          />
        ))}
      </div>

      {/* 4. The Branding (Cinematic Zoom) */}
      <div className={cn(
        "relative flex flex-col items-center transition-all duration-[2.5s] ease-[cubic-bezier(0.4, 0, 0.2, 1)]",
        phase === "initial" ? "opacity-0 scale-90 blur-xl" :
        phase === "logo-fade" ? "opacity-100 scale-100 blur-none" :
        phase === "zoom-hit" ? "scale-[12] opacity-0 blur-3xl" :
        "scale-[20] opacity-0 blur-none"
      )}>
        <h1 className="text-8xl md:text-[14rem] font-display font-black tracking-[-0.05em] italic select-none">
          <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">JARVIS</span>
          <span className="text-cyan-400 drop-shadow-[0_0_60px_rgba(34,211,238,0.5)] ml-6">HUB</span>
        </h1>
        
        {/* Holographic Underglow Progress */}
        <div className={cn(
          "h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-12 transition-all duration-[4s] shadow-[0_0_30px_#22d3ee]",
          phase === "initial" ? "w-0 opacity-0" : "w-[60vw] opacity-100"
        )} />
        
        <p className={cn(
          "mt-8 text-[10px] md:text-sm font-bold tracking-[1em] uppercase text-white/30 transition-all duration-1000",
          phase === "logo-fade" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Initializing Cinema Node
        </p>
      </div>

      {/* 5. Letterbox Bars (Top/Bottom) */}
      <div className="absolute top-0 left-0 w-full h-[12vh] bg-black z-[100]" />
      <div className="absolute bottom-0 left-0 w-full h-[12vh] bg-black z-[100]" />

      {/* 6. Sound Source */}
      <audio autoPlay>
        <source src="/ps2_start_up.mp3" type="audio/mpeg" />
      </audio>

      <style>{`
        @keyframes spectrum-float {
          0% { transform: scaleY(1) translateY(0); opacity: 0.1; }
          50% { transform: scaleY(2.5) translateY(-150px); opacity: 0.5; }
          100% { transform: scaleY(1) translateY(0); opacity: 0.1; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default NetflixIntro;
