import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  Film, 
  Tv, 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  Zap,
  ChevronRight,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DownloadSource {
  name: string;
  quality: string;
  type: string;
  icon: any;
  getUrl: (id: string, type: 'movie' | 'tv', s?: number, e?: number) => string;
}

const SOURCES: DownloadSource[] = [
  { 
    name: "Source Alpha", 
    quality: "4K/1080p", 
    type: "Direct", 
    icon: Zap,
    getUrl: (id, type) => `https://vidsrc.to/embed/${type}/${id}`
  },
  { 
    name: "Source Beta", 
    quality: "HD / Mobile", 
    type: "Mirror", 
    icon: Smartphone,
    getUrl: (id, type) => `https://embed.su/embed/${type}/${id}`
  },
  { 
    name: "Source Gamma", 
    quality: "BlueRay", 
    type: "High Speed", 
    icon: Monitor,
    getUrl: (id, type) => `https://vidsrc.xyz/embed/${type}/${id}`
  }
];

import { searchMulti } from "@/lib/tmdb";

const Downloads = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchMulti(query);
      setResults(data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'));
      
      if (data.results.length === 0) {
        toast.info("Target search yielded no results in the database.");
      }
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Transmission Failure: Node search unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const openDownload = (source: DownloadSource, media: any) => {
    const url = source.getUrl(media.id.toString(), media.media_type as 'movie' | 'tv');
    toast.success(`Initializing Download: ${source.name}`, {
      description: "Redirecting to high-speed download gateway."
    });
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-blue-500/30">
      <Navbar />
      
      {/* ── Cinematic Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-repeat opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <main className="container max-w-7xl mx-auto pt-32 pb-20 px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Download className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Offline Access Hub</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter italic mb-4">
            DOWNLOAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">CORE</span>
          </h1>
          <p className="max-w-xl text-white/40 text-sm md:text-base font-medium">
            Acquire high-fidelity media assets for local playback. Select your target node to begin initialization.
          </p>
        </div>

        {/* Search Engine */}
        <div className="max-w-3xl mx-auto mb-20 animate-scale-in">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-cyan-400/20 to-blue-600/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 flex items-center shadow-2xl">
              <div className="pl-6 flex items-center text-white/20">
                <Search className="w-6 h-6" />
              </div>
              <input 
                type="text"
                placeholder="Search movies or shows for download..."
                className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-lg font-bold placeholder:text-white/10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] px-8 h-14 font-black uppercase tracking-widest text-[11px] transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Search"}
              </Button>
            </div>
          </form>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {results.map((item, idx) => (
            <div 
              key={item.id} 
              className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Media Card */}
              <div className="relative aspect-[2/3] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-blue-500/50">
                {item.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                    alt={item.title || item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/10">
                    <Film className="w-12 h-12" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Poster</span>
                  </div>
                )}
                
                {/* Overlay with Download Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <div className="space-y-4">
                     <div className="flex flex-col gap-2">
                       {SOURCES.map((source) => (
                         <button
                           key={source.name}
                           onClick={() => openDownload(source, item)}
                           className="w-full flex items-center justify-between gap-3 bg-white/10 hover:bg-blue-600 text-white p-3 rounded-xl backdrop-blur-md transition-all group/btn active:scale-95"
                         >
                           <div className="flex items-center gap-2">
                             <source.icon className="w-3.5 h-3.5 text-blue-400 group-hover/btn:text-white transition-colors" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{source.name}</span>
                           </div>
                           <ChevronRight className="w-3 h-3 text-white/30" />
                         </button>
                       ))}
                     </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                  {item.media_type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                </div>
              </div>

              {/* Media Title */}
              <div className="mt-4 px-2">
                <h3 className="font-bold text-[13px] md:text-sm text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {item.title || item.name}
                </h3>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">
                  {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'} • {item.media_type}
                </p>
              </div>
            </div>
          ))}

          {results.length === 0 && !loading && query && (
            <div className="col-span-full py-32 flex flex-col items-center text-center gap-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                <Search className="w-10 h-10 text-white/10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white/40 uppercase tracking-widest">Target Not Found</h3>
                <p className="text-white/20 text-sm mt-2 max-w-xs">The requested media asset could not be located in the current sector.</p>
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        {!query && results.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 animate-fade-in">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all group">
              <Zap className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-lg font-bold text-white mb-2">High-Speed Core</h4>
              <p className="text-sm text-white/30 leading-relaxed">Direct links to global mirrors optimized for maximum bandwidth utilization.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all group">
              <Smartphone className="w-8 h-8 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-lg font-bold text-white mb-2">Mobile Ready</h4>
              <p className="text-sm text-white/30 leading-relaxed">Specialized formats for offline viewing on iOS, Android, and tablets.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all group">
              <Monitor className="w-8 h-8 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-lg font-bold text-white mb-2">Ultra Definition</h4>
              <p className="text-sm text-white/30 leading-relaxed">Source assets available in 4K UHD and BluRay quality with full audio tracks.</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Downloads;
