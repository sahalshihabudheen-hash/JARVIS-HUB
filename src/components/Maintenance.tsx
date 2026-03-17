import { Settings, LogOut } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const Maintenance = () => {
  const { logout } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt to play audio on mount (may be blocked by browser until user interacts)
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log("Audio play blocked until interaction:", e));
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <audio 
        ref={audioRef}
        src="/mixkit-construction-place-and-bulldozer-ambiance-800.wav" 
        loop 
      />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center relative backdrop-blur-sm">
            <Settings className="w-12 h-12 text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Text Area */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight uppercase">
          Under<br />Maintenance
        </h1>
        
        <p className="text-xl md:text-2xl font-medium text-white/70 mb-8 italic">
          JARVIS is working faster than you think
        </p>
        
        <div className="w-full space-y-4 mb-12">
          <p className="text-white/40 text-[15px] max-w-xs mx-auto leading-relaxed">
            We're upgrading our systems to serve you better. Please check back soon.
          </p>
          
          {/* Progress Bar Container */}
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
            <div className="absolute top-0 bottom-0 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-shimmer" 
                 style={{ width: '40%', left: '-40%', animation: 'loading-progress 2s infinite linear' }} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">
            If you believe you should have access, contact the administrator
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-widest group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes loading-progress {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
      
      {/* Visual Accents */}
      <div className="absolute bottom-10 left-10 w-32 h-32 border-l border-b border-blue-500/10" />
      <div className="absolute top-10 right-10 w-32 h-32 border-r border-t border-blue-500/10" />
    </div>
  );
};

export default Maintenance;
