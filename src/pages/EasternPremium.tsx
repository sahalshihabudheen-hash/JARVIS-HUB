import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AdultCard from "@/components/AdultCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchVideos } from "@/lib/hub";
import { 
  Search, 
  Flame, 
  Globe, 
  Zap, 
  Filter, 
  ChevronRight, 
  Star, 
  ShieldAlert, 
  Play,
  Heart,
  LayoutGrid,
  History
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const EasternPremium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("jav");
  const [source, setSource] = useState<"pornhub" | "avgle">("avgle");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  useEffect(() => {
    const isOwner = user?.email?.toLowerCase() === "admin@gmail.com";
    if (!user || (!user.hasAdultAccess && !user.isAdmin && !isOwner)) {
      navigate("/");
    }
  }, [user, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["eastern-videos", query, page, source],
    queryFn: async () => {
      return searchVideos(query, page, source);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQuery(searchInput.trim());
      setPage(1);
    }
    scrollToResults();
  };

  const javSeries = [
    { label: "SAME-024", value: "SAME-024" },
    { label: "HMN-464", value: "HMN-464" },
    { label: "TPPN-243", value: "TPPN-243" },
    { label: "BDA-181", value: "BDA-181" },
    { label: "JUFE-376", value: "JUFE-376" },
    { label: "URKK-087", value: "URKK-087" },
    { label: "MEYD-788", value: "MEYD-788" },
    { label: "AQSH-102", value: "AQSH-102" },
    { label: "DASS-165", value: "DASS-165" },
    { label: "PPPE-125", value: "PPPE-125" },
    { label: "BDO KIE", value: "bdo kie" },
    { label: "NEBO", value: "NEBO-" },
    { label: "RKI", value: "RKI-" },
    { label: "JUFE", value: "JUFE-" },
    { label: "WAAA", value: "WAAA-" },
    { label: "SNIS", value: "SNIS-" },
    { label: "IPX", value: "IPX-" },
    { label: "SSNI", value: "SSNI-" },
    { label: "MIDE", value: "MIDE-" },
  ];

  const koreanNiches = [
    { label: "Korean BJ", value: "korean bj" },
    { label: "K-Adult Movie", value: "korean adult movie" },
    { label: "Korean Amateur", value: "korean amateur" },
    { label: "Korean Dance", value: "korean dance adult" },
    { label: "Korean Massage", value: "korean massage" },
    { label: "K-Drama Adult", value: "korean drama adult" },
  ];

  const popularEasternTags = [
    "Japanese", "Korean", "Chinese", "Uncensored", "Censored", "Cosplay", "Schoolgirl", "Housewife", "Massage", "Subtitled"
  ];

  const videos = (data?.videos || []).map((v: any) => ({
    id: v.video_id || v.id || Math.random().toString(),
    title: v.title || "Untitled Video",
    url: v.url || "#",
    thumbnail: v.default_thumb || v.thumbnail || "",
    duration: v.duration || "",
    views: typeof v.views === "number" ? v.views.toLocaleString() : (v.views || ""),
    rating: v.rating || "",
    added: v.publish_date || v.added || "",
    source: v.source || "pornhub",
  })).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 selection:text-red-200 relative overflow-hidden">
      {/* Red Mesh Aesthetic */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(220,38,38,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      
      <Navbar />

      <main className="relative pt-28 pb-16 z-10">
        <div className="container px-4 md:px-6">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                <Globe className="w-4 h-4" />
                Eastern Premium Gateway
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white uppercase italic">
                EASTERN <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-orange-400">HUB</span>
              </h1>
              <p className="text-white/40 text-sm md:text-lg max-w-xl font-medium leading-relaxed italic">
                Advanced synchronized uplink to premium Japanese and Korean adult databases. High-fidelity JAV series and K-Adult niche discovery.
              </p>
            </div>

            <div className="w-full md:w-96 space-y-4">
              <form onSubmit={handleSearch} className="relative group/search">
                <div className="absolute inset-0 bg-red-500/20 blur-xl opacity-0 group-hover/search:opacity-100 transition-opacity duration-500 rounded-full" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/search:text-red-400 transition-colors z-10" />
                <Input
                  type="text"
                  placeholder="Enter JAV Code (e.g. SNIS-000)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="relative pl-12 pr-4 h-14 bg-black/60 backdrop-blur-2xl border-white/10 rounded-2xl focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder:text-white/20 transition-all font-bold"
                />
              </form>

              <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-2xl">
                {[
                  { id: "avgle", label: "AVG (JAV)", color: "bg-red-600" },
                  { id: "pornhub", label: "PH (Global)", color: "bg-orange-500" }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSource(s.id as any); setPage(1); }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                      source === s.id ? `${s.color} text-white shadow-lg` : "text-white/30 hover:text-white/60"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/adult')} 
                  variant="outline" 
                  className="flex-1 rounded-xl h-12 border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
                >
                  Return to Main Hub
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-12 border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest"
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Stealth ON
                </Button>
              </div>
            </div>
          </div>

          {/* JAV & Korean Categories Ribbon */}
          <div className="mb-12 space-y-8">
             <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-500 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> JAV Premium Series
                  </h3>
                  <div className="h-px flex-1 mx-6 bg-gradient-to-r from-red-500/20 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {javSeries.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setQuery(s.value); setPage(1); scrollToResults(); }}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                        query === s.value
                          ? "bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                          : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/10"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Korean Premium Niche
                  </h3>
                  <div className="h-px flex-1 mx-6 bg-gradient-to-r from-blue-500/20 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {koreanNiches.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setQuery(s.value); setPage(1); scrollToResults(); }}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                        query === s.value
                          ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                          : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/10"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* Results Grid Header */}
          <div ref={resultsRef} className="flex items-center justify-between mb-10 scroll-mt-28">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600/20 rounded-2xl border border-red-600/30">
                <LayoutGrid className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter">
                  {query.toUpperCase()} <span className="text-white/20">Datastream</span>
                </h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Sorted by Eastern Popularity</p>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-video rounded-2xl shimmer bg-white/5" />
                  <div className="h-4 w-3/4 bg-white/5 rounded-lg shimmer" />
                  <div className="h-3 w-1/2 bg-white/5 rounded-lg shimmer" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-32 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
               <ShieldAlert className="w-16 h-16 text-white/10 mx-auto mb-6" />
               <h3 className="text-xl font-bold text-white/40 uppercase tracking-widest">No matching datastreams found</h3>
               <p className="text-sm text-white/20 mt-2 italic">Try a different JAV code or broader search term</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                {videos.map((video) => (
                  <div key={video.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AdultCard video={video} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-8 mt-16">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="rounded-2xl px-10 h-14 border-white/10 bg-white/5 font-black uppercase tracking-widest text-xs hover:bg-white/10"
                >
                  Previous
                </Button>
                <div className="px-8 h-14 flex items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-black text-sm tracking-[0.2em]">
                  NODE {page}
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="rounded-2xl px-10 h-14 border-white/10 bg-white/5 font-black uppercase tracking-widest text-xs hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Bottom Featured Tags */}
          <div className="mt-24 p-12 rounded-[3rem] bg-gradient-to-br from-red-600/10 via-transparent to-transparent border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe className="w-64 h-64 text-red-500" />
             </div>
             <div className="relative z-10">
                <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-8 italic">Global Eastern Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {popularEasternTags.map(tag => (
                    <Button 
                      key={tag} 
                      variant="ghost" 
                      onClick={() => { setQuery(tag); setPage(1); scrollToResults(); }}
                      className="rounded-xl px-6 h-10 bg-white/5 border border-white/5 hover:border-red-500/30 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      #{tag}
                    </Button>
                  ))}
                </div>
             </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EasternPremium;
