import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Film, Gamepad2, ChevronRight, Flame, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const AdultSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const isOwner = user?.email?.toLowerCase() === "admin@gmail.com" || user?.email?.toLowerCase() === "superadmin@gmail.com";
    const hasAuthorizedAccess = user && (user.hasAdultAccess || user.isAdmin || isOwner);

    // Prevent direct access from browser history, bookmarks, or refresh unless authorized
    if (!(window as any).__jarvis_internal) {
      navigate("/", { replace: true });
      return;
    }

    if (!user || (!user.hasAdultAccess && !user.isAdmin && !isOwner)) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-red-500/30 overflow-hidden">
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(37,99,235,0.05),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.05),transparent_40%)]" />
        <div className="absolute inset-0 mesh-gradient opacity-10" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 sm:pt-32 pb-8 container max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6 sm:mb-8">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-red-500">Secure Access Point</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter italic mb-4 sm:mb-6 leading-[0.9]">
            CHOOSE YOUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600">
              PROTOCOL
            </span>
          </h1>
          <p className="max-w-xl text-white/40 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
            Welcome to the JARVIS HUB premium adult terminal. Select a media protocol to initialize your encrypted session.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
          {/* Catalog Card */}
          <div 
            onClick={() => navigate("/adult/catalog")}
            className="group relative h-[240px] sm:h-[340px] rounded-[2rem] border border-white/5 bg-[#050505] overflow-hidden cursor-pointer hover:border-red-500/30 transition-all duration-700 hover:-translate-y-1 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute inset-0 p-7 sm:p-10 flex flex-col justify-end gap-4 z-20">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30 mb-2 group-hover:scale-110 transition-transform duration-500">
                <Film className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white mb-1.5 uppercase tracking-tight">Catalog</h3>
                <p className="text-white/40 text-xs sm:text-sm leading-relaxed max-w-xs group-hover:text-white/60 transition-colors">
                  Stream premium adult content. Thousands of HD videos.
                </p>
              </div>
              <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px] opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                Enter Catalog <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-30 transition-opacity">
              <Flame className="w-24 h-24 sm:w-28 sm:h-28 text-red-500/20 -rotate-12" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          </div>

          {/* Interactive/Games Card */}
          <div 
            onClick={() => navigate("/adult/games")}
            className="group relative h-[240px] sm:h-[340px] rounded-[2rem] border border-white/5 bg-[#050505] overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all duration-700 hover:-translate-y-1 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute inset-0 p-7 sm:p-10 flex flex-col justify-end gap-4 z-20">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mb-2 group-hover:scale-110 transition-transform duration-500">
                <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white mb-1.5 uppercase tracking-tight">Interactive</h3>
                <p className="text-white/40 text-xs sm:text-sm leading-relaxed max-w-xs group-hover:text-white/60 transition-colors">
                  Play immersive HTML5 simulations. Browser engine enabled.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px] opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                Boot Simulation <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-30 transition-opacity">
              <Sparkles className="w-24 h-24 sm:w-28 sm:h-28 text-blue-500/20 -rotate-12" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-white/20 uppercase tracking-[0.3em] font-black text-[9px] animate-pulse">
           <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
           Secure • Encrypted • Private
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdultSelection;

