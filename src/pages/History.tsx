import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Play, Trash2, Clock, Search as SearchIcon, Film, Tv, LayoutGrid, Palette, BrainCircuit, Rocket } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getWatchProgress, clearWatchProgress, WatchProgress, syncHistoryFromCloud, getSearchHistory, SearchHistoryItem, saveWatchProgressCloud } from "@/lib/vidlink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<WatchProgress[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllHistory = async () => {
      setIsLoading(true);
      if (user?.uid) {
        // Sync from cloud first
        const cloudHistory = await syncHistoryFromCloud(user.uid);
        const sortedHistory = Object.values(cloudHistory)
          .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));
        setHistory(sortedHistory);
        
        // Load search history
        const searches = await getSearchHistory(user.uid);
        setSearchHistory(searches);
      } else {
        const progressMap = getWatchProgress();
        const sortedHistory = Object.values(progressMap)
          .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));
        setHistory(sortedHistory);
      }
      setIsLoading(false);
    };

    loadAllHistory();
  }, [user?.uid]);

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear your entire watch history? This cannot be undone.")) {
      await clearWatchProgress(user?.uid);
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

  const animations = history.filter(item => item.isAnimation);
  const movies = history.filter(item => item.type === "movie" && !item.isAnimation);
  const tvShows = history.filter(item => item.type === "tv" && !item.isAnimation);

  const HistorySection = ({ 
    title, 
    items, 
    icon: Icon, 
    colorClass = "text-primary", 
    bgClass = "bg-primary" 
  }: { 
    title: string, 
    items: WatchProgress[], 
    icon: any, 
    colorClass?: string, 
    bgClass?: string 
  }) => (
    <div className="mb-20">
      <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
        <div className={cn("w-2 h-8 rounded-full shadow-[0_0_20px_var(--tw-shadow-color)]", bgClass)} />
        <h2 className="text-3xl font-display font-black tracking-tighter flex items-center gap-4 uppercase italic">
          <Icon className={cn("w-8 h-8", colorClass)} />
          {title}
          <span className="text-muted-foreground text-base font-medium not-italic lowercase opacity-40">({items.length} units)</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
        {items.map((item) => {
          const progress = item.progress;
          const percentage = formatPercentage(progress.watched, progress.duration);
          const isTV = item.type === "tv";
          const watchLink = isTV 
            ? `/watch/tv/${item.id}/${item.last_season_watched || 1}/${item.last_episode_watched || 1}`
            : `/watch/movie/${item.id}`;

          return (
            <div 
              key={`${item.type}-${item.id}`}
              className="group relative glass border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : `https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                  <div 
                    className="h-full transition-all duration-1000"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: colorClass.includes('pink') ? '#ec4899' : colorClass.includes('blue') ? '#3b82f6' : '#22d3ee',
                      boxShadow: `0 0 10px ${colorClass.includes('pink') ? '#ec4899' : colorClass.includes('blue') ? '#3b82f6' : '#22d3ee'}`
                    }}
                  />
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                  <Link 
                    to={watchLink}
                    className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(34,211,238,0.8)] scale-75 group-hover:scale-100 transition-all"
                  >
                    <Play className="w-8 h-8 fill-primary-foreground ml-1" />
                  </Link>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg line-clamp-1 mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(progress.watched)}</span>
                    </div>
                    <span className={colorClass}>{percentage}%</span>
                  </div>

                  {isTV && item.last_season_watched && (
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] text-white/60 font-black uppercase tracking-widest text-center">
                      S{item.last_season_watched} • E{item.last_episode_watched}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1 rounded-xl h-9 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary text-primary transition-all duration-300 font-bold uppercase tracking-wider text-[10px]">
                      <Link to={watchLink}>Resume</Link>
                    </Button>
                    
                    {percentage < 90 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const historyKey = user?.uid ? `vidLinkProgress_${user.uid}` : "vidLinkProgress";
                          const historyStr = localStorage.getItem(historyKey);
                          const historyObj = historyStr ? JSON.parse(historyStr) : {};
                          const mediaKey = `${item.id}`;
                          
                          if (historyObj[mediaKey]) {
                            historyObj[mediaKey].progress.watched = historyObj[mediaKey].progress.duration;
                            historyObj[mediaKey].last_updated = Date.now();
                            localStorage.setItem(historyKey, JSON.stringify(historyObj));
                            
                            const newHistory = (Object.values(historyObj) as WatchProgress[]).sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));
                            setHistory(newHistory);
                            
                            if (user?.uid) {
                              saveWatchProgressCloud(user.uid, historyObj[mediaKey]);
                            }
                            toast.success("Marked as finished");
                          }
                        }}
                        className="shrink-0 rounded-xl h-9 bg-white/5 border-white/10 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400 text-white/40 px-3 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container pt-32 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/10 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                <HistoryIcon className="w-8 h-8 text-primary shadow-glow" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic italic">
                Central <span className="text-primary italic animate-pulse">Archive</span>
              </h1>
            </div>
            <p className="text-muted-foreground max-w-xl text-sm md:text-base font-medium leading-relaxed uppercase tracking-wider opacity-60">
              Protocol: Synchronizing watch history across all devices. Resume your last operation from any node in the Jarvis network.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all rounded-full px-6 font-bold uppercase tracking-widest text-[10px] h-10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Purge Archive
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
            <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs animate-pulse text-center">Establishing Secure Uplink...<br/><span className="text-[10px] opacity-50 mt-2 block font-normal capitalize tracking-normal">Decrypting cloud history protocols</span></p>
          </div>
        ) : (
          <>
            {/* Search History Section (New) */}
            {searchHistory.length > 0 && (
              <div className="mb-24">
                <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
                  <div className="w-2 h-8 bg-yellow-500 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                  <h2 className="text-3xl font-display font-bold tracking-tighter uppercase italic flex items-center gap-4">
                    <SearchIcon className="w-8 h-8 text-yellow-500" />
                    Neural <span className="text-yellow-500/80">Search Fragments</span>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3 px-4 md:px-0">
                  {searchHistory.map((item, idx) => (
                    <Link 
                      key={idx}
                      to={`/search?q=${encodeURIComponent(item.query)}`}
                      className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-500/30 hover:bg-yellow-500/5 text-sm font-bold transition-all flex items-center gap-3 group hover:scale-105"
                    >
                      <Rocket className="w-4 h-4 text-white/20 group-hover:text-yellow-500 transition-colors" />
                      <span className="tracking-wide">{item.query}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in glass rounded-[40px] border border-white/10 shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5 shadow-inner animate-pulse">
                  <LayoutGrid className="w-12 h-12 text-muted-foreground opacity-20" />
                </div>
                <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter italic">Zero Protocols Found</h2>
                <p className="text-muted-foreground mb-10 max-w-sm mx-auto uppercase text-[10px] font-bold tracking-[0.2em] opacity-60 leading-relaxed">Your localized archive is currently empty.<br/>Initiate a stream to begin tracking your neural activities.</p>
                <Button asChild className="rounded-full px-12 h-14 hover-glow transition-all font-black uppercase tracking-[0.3em] text-xs">
                  <Link to="/">Begin Discovery</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {animations.length > 0 && <HistorySection title="Animated Prototypes" items={animations} icon={Palette} colorClass="text-pink-500" bgClass="bg-pink-500 shadow-pink-500/50" />}
                {movies.length > 0 && <HistorySection title="Cinematic Records" items={movies} icon={Film} colorClass="text-blue-500" bgClass="bg-blue-500 shadow-blue-500/50" />}
                {tvShows.length > 0 && <HistorySection title="Serialized Protocols" items={tvShows} icon={BrainCircuit} colorClass="text-cyan-500" bgClass="bg-cyan-500 shadow-cyan-500/50" />}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default History;
