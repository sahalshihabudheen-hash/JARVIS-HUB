import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, X } from "lucide-react";
import { getContinueWatching, WatchProgress, clearWatchProgress } from "@/lib/vidlink";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const ContinueWatching = () => {
  const [items, setItems] = useState<WatchProgress[]>([]);

  useEffect(() => {
    const loadProgress = () => {
      const watchList = getContinueWatching();
      setItems(watchList);
    };

    loadProgress();
    
    // Listen for updates
    window.addEventListener("storage", loadProgress);
    return () => window.removeEventListener("storage", loadProgress);
  }, []);

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
    <section className="py-6">
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-display font-bold">Continue Watching</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            clearWatchProgress();
            setItems([]);
          }}
        >
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-0">
        {items.map((item) => (
          <Link
            key={item.id}
            to={getWatchPath(item)}
            className="group flex-shrink-0 w-72 md:w-80 rounded-xl overflow-hidden bg-card hover:bg-secondary/50 transition-colors"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w780${item.backdrop_path || item.poster_path}`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                  <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-full gradient-primary"
                  style={{ width: `${getProgressPercent(item)}%` }}
                />
              </div>
            </div>

            <div className="p-3">
              <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.type === "tv" && item.last_season_watched && item.last_episode_watched
                  ? `S${item.last_season_watched} E${item.last_episode_watched}`
                  : `${getProgressPercent(item)}% watched`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatching;
