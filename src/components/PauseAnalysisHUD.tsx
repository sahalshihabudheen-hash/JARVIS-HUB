import { motion, AnimatePresence } from "framer-motion";
import { Activity, User, Info, Crosshair, Cpu, ShieldAlert } from "lucide-react";

interface PauseAnalysisHUDProps {
  isVisible: boolean;
  movieTitle: string;
  cast?: any[];
}

const PauseAnalysisHUD = ({ isVisible, movieTitle, cast }: PauseAnalysisHUDProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[100] pointer-events-none overflow-hidden"
        >
          {/* Scanning Overlay */}
          <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-[2px]" />
          
          {/* Corner HUD Elements */}
          <div className="absolute top-10 left-10 space-y-6">
            <motion.div 
              initial={{ x: -100 }} 
              animate={{ x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Analysis Protocol</h4>
                <p className="text-xl font-display font-black text-white italic tracking-tighter">SCENE ACTIVE</p>
              </div>
            </motion.div>

            <motion.div 
               initial={{ x: -100 }} 
               animate={{ x: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-2"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Crosshair className="w-3 h-3 text-red-500" /> Target Identified
              </div>
              <div className="h-px w-48 bg-gradient-to-r from-red-500/50 to-transparent" />
              <p className="text-lg font-black text-white">{movieTitle}</p>
            </motion.div>
          </div>

          <div className="absolute top-10 right-10 text-right">
             <motion.div 
              initial={{ x: 100 }} 
              animate={{ x: 0 }}
              className="space-y-1"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Temporal Stamp</p>
              <p className="text-2xl font-mono text-white/80">{new Date().toLocaleTimeString()}</p>
            </motion.div>
          </div>

          {/* Cast Analysis Overlay */}
          {cast && cast.length > 0 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-32 left-10 right-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Personnel Identification</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pointer-events-auto">
                {cast.slice(0, 8).map((actor, i) => (
                  <motion.div
                    key={actor.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-shrink-0 w-40 p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-white/5">
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                        alt={actor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-transparent" />
                    </div>
                    <p className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1">{actor.name}</p>
                    <p className="text-[9px] text-cyan-400/60 font-bold uppercase tracking-widest mt-1 line-clamp-1 italic">{actor.character}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Decorative HUD Elements */}
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-1/2 left-4 h-32 w-[2px] bg-blue-500/20" />
             <div className="absolute top-1/2 right-4 h-32 w-[2px] bg-blue-500/20" />
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-blue-500/20" />
             
             {/* Reticle focus dots */}
             <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400/40 rounded-full" />
             <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-cyan-400/40 rounded-full" />
             <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-cyan-400/40 rounded-full" />
             <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-cyan-400/40 rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PauseAnalysisHUD;
