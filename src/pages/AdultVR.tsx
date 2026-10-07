import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { searchVideos } from "@/lib/hub";
import {
  ChevronLeft, Play, Eye, Clock, Zap, Star, Globe,
  ChevronRight, RefreshCw, ExternalLink, Maximize2
} from "lucide-react";

const VR_CATEGORIES = [
  { label: "🥽 All VR",         value: "vr porn",                icon: "🥽", color: "from-blue-600 to-cyan-500" },
  { label: "👀 POV VR",         value: "vr pov",                 icon: "👀", color: "from-purple-600 to-blue-500" },
  { label: "🌸 Asian VR",       value: "vr japanese asian",      icon: "🌸", color: "from-pink-600 to-rose-500" },
  { label: "👩‍❤️‍👩 Lesbian VR",     value: "vr lesbian",             icon: "💕", color: "from-rose-600 to-pink-500" },
  { label: "🔥 Hardcore VR",    value: "vr hardcore",            icon: "🔥", color: "from-red-600 to-orange-500" },
  { label: "👑 MILF VR",        value: "vr milf",                icon: "👑", color: "from-amber-600 to-yellow-500" },
  { label: "📐 180° VR",        value: "180 vr porn",            icon: "📐", color: "from-teal-600 to-green-500" },
  { label: "🌀 360° VR",        value: "360 vr porn",            icon: "🌀", color: "from-indigo-600 to-violet-500" },
  { label: "🍑 Anal VR",        value: "vr anal",                icon: "🍑", color: "from-orange-600 to-red-500" },
  { label: "🤖 VR Game",        value: "vr porn game",           icon: "🤖", color: "from-cyan-600 to-blue-600" },
  { label: "🌺 Hentai VR",      value: "vr hentai anime",        icon: "🌺", color: "from-fuchsia-600 to-pink-600" },
  { label: "⚡ Brazzers VR",    value: "brazzers vr",            icon: "⚡", color: "from-yellow-600 to-orange-600" },
];

const VR_HEADSETS = [
  { name: "Meta Quest", short: "META", note: "Quest 2/3/Pro" },
  { name: "PlayStation VR", short: "PSVR", note: "PS4/PS5" },
  { name: "HTC Vive", short: "VIVE", note: "PC VR" },
  { name: "Valve Index", short: "INDEX", note: "SteamVR" },
  { name: "Bigscreen Beyond", short: "BIG", note: "Ultra thin" },
  { name: "Apple Vision Pro", short: "AVP", note: "Premium" },
];

const VR_TIPS = [
  { tip: "Use a VR headset for the best 180°/360° experience" },
  { tip: "Look for videos tagged '180° SBS' for side-by-side stereo" },
  { tip: "Download in 4K for crystal clear VR quality" },
  { tip: "YouTube VR app supports 360° playback on all headsets" },
];

const AdultVR = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(VR_CATEGORIES[0]);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["vr-videos", selectedCategory.value, page],
    queryFn: () => searchVideos(selectedCategory.value, page),
  });

  const videos = data?.videos || [];

  const handleCategoryChange = (cat: typeof VR_CATEGORIES[0]) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      {/* Animated VR background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.06),transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 sm:pt-24 pb-16 container max-w-7xl mx-auto px-3 sm:px-6">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <button onClick={() => navigate("/adult/catalog")} className="flex items-center gap-2 text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-5 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Catalog
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-3xl">
                  🥽
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase italic tracking-tighter">
                    VR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Porn</span> Zone
                  </h1>
                  <span className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[9px] font-black text-blue-300 uppercase tracking-widest">
                    180° • 360° • 4K
                  </span>
                </div>
                <p className="text-white/35 text-xs sm:text-sm mt-1">Immersive VR experiences — compatible with all headsets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Headset compatibility bar */}
        <div className="mb-8 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 overflow-x-auto">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-400/70 mb-3">🎮 Compatible Headsets</p>
          <div className="flex gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
            {VR_HEADSETS.map((h) => (
              <div key={h.name} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-blue-500/20 bg-blue-500/5 flex-shrink-0">
                <span className="text-[11px] font-black text-blue-300 uppercase">{h.short}</span>
                <span className="text-[9px] text-white/30">{h.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category grid */}
        <div className="mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">🎬 VR Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {VR_CATEGORIES.map((cat) => {
              const isActive = selectedCategory.value === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "relative group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border transition-all duration-300 active:scale-95",
                    isActive
                      ? "border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "border-white/8 bg-white/[0.02] hover:border-blue-500/30 hover:bg-blue-500/5"
                  )}
                >
                  {isActive && (
                    <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20", cat.color)} />
                  )}
                  <span className="text-2xl relative z-10">{cat.icon}</span>
                  <span className={cn(
                    "text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-center leading-tight relative z-10",
                    isActive ? "text-white" : "text-white/50 group-hover:text-white"
                  )}>
                    {cat.label.replace(/^\S+\s/, "")}
                  </span>
                  {isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* VR Tips strip */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {VR_TIPS.map((t, i) => (
            <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-blue-400 text-[10px]">💡</span>
              <span className="text-[10px] text-white/30 whitespace-nowrap">{t.tip}</span>
            </div>
          ))}
        </div>

        {/* Video Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">{selectedCategory.label}</h2>
              {!isLoading && <span className="text-[10px] text-white/30">{videos.length} videos</span>}
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/8 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all"
            >
              <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} /> Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="text-5xl">🥽</span>
              <p className="text-white/30 font-black uppercase tracking-widest text-sm">No VR content found</p>
              <button onClick={() => refetch()} className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest">Try Again</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {videos.map((video: any) => (
                <div
                  key={video.id}
                  onClick={() => navigate(`/hub/watch/${video.id}`)}
                  className="group relative rounded-2xl overflow-hidden border border-white/8 bg-white/[0.02] cursor-pointer hover:border-blue-500/40 transition-all hover:-translate-y-0.5"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={video.default_thumb || video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* VR Badge */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-blue-600/90 text-[8px] font-black text-white uppercase tracking-widest">
                      🥽 VR
                    </div>
                    {/* Duration */}
                    {video.duration && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 text-[9px] font-bold text-white">
                        {video.duration}
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600/80 flex items-center justify-center backdrop-blur">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-[11px] font-bold text-white/80 line-clamp-2 leading-tight mb-1.5">{video.title}</p>
                    <div className="flex items-center gap-2 text-[9px] text-white/30">
                      {video.views && <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{video.views}</span>}
                      {video.rating && <span className="flex items-center gap-0.5 text-yellow-500/70"><Star className="w-2.5 h-2.5" />{video.rating}%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {videos.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-[11px] font-black text-blue-300">
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdultVR;
