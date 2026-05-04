import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  History, 
  TrendingUp, 
  Search, 
  ShieldCheck, 
  LayoutDashboard,
  LogOut,
  X,
  Sparkles,
  Mic,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useJarvisVoice } from "@/hooks/useJarvisVoice";

const JarvisOrb = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isListening, isWakeWordActive, startListening } = useJarvisVoice();

  useEffect(() => {
    // Initialize background listening for "Hey Jarvis"
    const timer = setTimeout(() => {
       startListening(true);
    }, 2000); // Wait for page load
    return () => clearTimeout(timer);
  }, [startListening]);

  const protocols = [
    { name: "Search Node", icon: Search, action: () => navigate("/search"), color: "text-blue-400" },
    { name: "Global Trending", icon: TrendingUp, action: () => navigate("/"), color: "text-green-400" },
    { name: "Access History", icon: History, action: () => navigate("/history"), color: "text-purple-400" },
    { name: "Admin Terminal", icon: LayoutDashboard, action: () => navigate("/admin"), color: "text-yellow-400", adminOnly: true },
    { name: "Privacy Sync", icon: ShieldCheck, action: () => navigate("/settings"), color: "text-cyan-400" },
  ];

  const filteredProtocols = protocols.filter(p => !p.adminOnly || user?.isAdmin);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Protocol Menu */}
      <div className={cn(
        "flex flex-col gap-2 transition-all duration-500 origin-bottom-right",
        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-10 pointer-events-none"
      )}>
        {filteredProtocols.map((protocol, i) => (
          <button
            key={protocol.name}
            onClick={() => {
              protocol.action();
              setIsOpen(false);
            }}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all hover:translate-x-[-8px] shadow-2xl"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
              {protocol.name}
            </span>
            <div className={cn("p-2 rounded-xl bg-white/5", protocol.color)}>
              <protocol.icon className="w-4 h-4" />
            </div>
          </button>
        ))}

        {/* Voice Command Button */}
        <button
          onClick={() => {
            startListening();
            setIsOpen(false);
          }}
          className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-blue-500/10 backdrop-blur-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all hover:translate-x-[-8px] shadow-[0_0_20px_rgba(59,130,246,0.2)]"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:text-blue-300 transition-colors">
            Vocal Uplink
          </span>
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 animate-pulse">
            <Mic className="w-4 h-4" />
          </div>
        </button>
        
        <button
          onClick={() => {
            signOut();
            setIsOpen(false);
          }}
          className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-red-500/10 backdrop-blur-2xl border border-red-500/20 hover:border-red-500/40 transition-all hover:translate-x-[-8px] mt-2"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400/60 group-hover:text-red-400 transition-colors">
            Terminate Session
          </span>
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
            <LogOut className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Main Orb */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 hover:scale-110 group",
          isOpen ? "rotate-180" : "animate-float"
        )}
      >
        {/* Outer Glows */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-colors" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border border-cyan-400/20 animate-[spin_4s_linear_infinite_reverse]" />
        
        {/* Core */}
        <div className={cn(
          "relative w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.5)] overflow-hidden transition-all duration-500",
          isOpen ? "bg-white/10" : "bg-black/40 backdrop-blur-md",
          (isListening || isWakeWordActive) && "border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.8)] scale-110"
        )}>
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (isListening || isWakeWordActive) ? (
             <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
          ) : (
            <div className="relative">
              <Zap className="w-6 h-6 text-blue-400 fill-current animate-pulse" />
              <div className="absolute inset-0 text-blue-400 blur-sm animate-pulse">
                <Zap className="w-6 h-6 fill-current" />
              </div>
            </div>
          )}
          
          {/* Internal Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Floating Tooltip */}
        {!isOpen && (
          <div className="absolute right-20 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Jarvis Online</span>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

export default JarvisOrb;
