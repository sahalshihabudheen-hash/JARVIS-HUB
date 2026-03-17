import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Play, Trash2, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getWatchProgress, clearWatchProgress, WatchProgress } from "@/lib/vidlink";
import { cn } from "@/lib/utils";

const History = () => {
  const [history, setHistory] = useState<WatchProgress[]>([]);

  useEffect(() => {
    const progressMap = getWatchProgress();
    // Convert map to array and sort by last updated
    const sortedHistory = Object.values(progressMap)
      .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));
    setHistory(sortedHistory);
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your entire watch history? This cannot be undone.")) {
      clearWatchProgress();
      setHistory([]);
      toast.success("History cleared successfully");
    }
  };

  const formatPercentage = (watched: number, duration: number) => {
    return Math.min(Math.round((watched / duration) * 100), 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container pt-28 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold tracking-tighter flex items-center gap-3">
              <HistoryIcon className="w-10 h-10 text-primary animate-pulse" />
              Watch History
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Resume your recently watched movies and TV shows from where you left off.
            </p>
          </div>

          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="border-red-500/20 text-red-400 hover:bg-red-400/10 hover:border-red-500/50 transition-all rounded-full px-6"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <HistoryIcon className="w-10 h-10 text-muted-foreground opacity-20" />
            </div>
            <h2 className="text-xl font-bold mb-2">No history protocols found</h2>
            <p className="text-muted-foreground mb-8">You haven't watched anything yet.</p>
            <Button asChild className="rounded-full px-8 hover-glow transition-all">
              <Link to="/">Explore Content</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {history.map((item) => {
              const progress = item.progress;
              const percentage = formatPercentage(progress.watched, progress.duration);
              const isTV = item.type === "tv";
              const watchLink = isTV 
                ? `/watch/tv/${item.id}/${item.last_season_watched || 1}/${item.last_episode_watched || 1}`
                : `/watch/movie/${item.id}`;

              return (
                <div 
                  key={`${item.type}-${item.id}`}
                  className="group relative glass border border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : `https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                      <div 
                        className="h-full bg-primary shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link 
                        to={watchLink}
                        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(34,211,238,0.8)] scale-75 group-hover:scale-100 transition-all"
                      >
                        <Play className="w-8 h-8 fill-primary-foreground ml-1" />
                      </Link>
                    </div>

                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/80">
                      {item.type}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs font-medium text-white/40">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Stopped at {formatTime(progress.watched)}</span>
                        </div>
                        <span>{percentage}% watched</span>
                      </div>

                      {isTV && item.last_season_watched && (
                        <div className="px-3 py-2 rounded-xl bg-primary/5 border border-primary/10 text-[11px] text-primary font-bold uppercase tracking-widest text-center">
                          Season {item.last_season_watched}, Episode {item.last_episode_watched}
                        </div>
                      )}
                      
                      <Button asChild size="sm" className="w-full rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group/btn mt-2">
                        <Link to={watchLink} className="flex items-center gap-2">
                          Resume Playback
                          <Play className="w-3 h-3 fill-current" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default History;
