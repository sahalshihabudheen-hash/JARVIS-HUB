import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getContinueWatching, WatchProgress, clearWatchProgress } from "@/lib/vidlink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const ContinueWatching = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchProgress[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProgress = () => {
      const watchList = getContinueWatching(user?.uid);
      setItems(watchList);
    };

    loadProgress();
    
    // Listen for updates
    window.addEventListener("storage", loadProgress);
    return () => window.removeEventListener("storage", loadProgress);
  }, [user?.uid]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (items.length === 0) return null;

  const getWatchPath = (item: WatchProgress) => {
    if (item.type === "movie") {
      return `/watch/movie/${item.id}`;
    }
    const season = item.last_season_watched || "1";
    const episode = item.last_episode_watched || "1";
    return `/watch/tv/${item.id}/${season}/${episode}`;
  };

  const getProgressPercent = (item: WatchProgress) => {
    return Math.round((item.progress.watched / item.progress.duration) * 100);
  };

  return (
    <section className="py-8 relative group/section">
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tighter uppercase italic">
            Continue <span className="text-primary/80">Watching</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-full px-4 text-[10px] font-bold uppercase tracking-widest"
            onClick={() => {
              if (confirm("Clear all watch history?")) {
                clearWatchProgress();
                setItems([]);
              }
            }}
          >
            <X className="w-3 h-3 mr-2" />
            Clear All
          </Button>

          {/* Scroll Controls */}
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar px-4 md:px-0 pb-4 scroll-smooth"
        >
          {items.map((item) => (
            <Link
              key={item.id}
              to={getWatchPath(item)}
              className="group flex-shrink-0 w-72 md:w-[400px] rounded-2xl overflow-hidden glass border border-white/10 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/w780${item.backdrop_path || item.poster_path}`}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.6)] scale-75 group-hover:scale-100 transition-all">
                    <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                  </div>
                </div>

                {/* Progress Bar (Netflix Style Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 backdrop-blur-md">
                  <div
                    className="h-full bg-primary shadow-[0_0_15px_#22d3ee] transition-all duration-1000"
                    style={{ width: `${getProgressPercent(item)}%` }}
                  />
                </div>

                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/70">
                  {item.type}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-xs font-bold text-white/40 uppercase tracking-wider">
                  <span>
                    {item.type === "tv" && item.last_season_watched && item.last_episode_watched
                      ? `Season ${item.last_season_watched} • Ep ${item.last_episode_watched}`
                      : `${getProgressPercent(item)}% watched`}
                  </span>
                  <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
                    RESUME <Play className="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContinueWatching;
