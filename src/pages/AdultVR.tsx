import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { searchVideos } from "@/lib/hub";
import AdultCard from "@/components/AdultCard";
import {
  ChevronLeft, RefreshCw, ChevronRight, Sparkles
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
  { name: "Apple Vision Pro", short: "AVP", note: "WebXR" },
];

const AdultVR = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(VR_CATEGORIES[0]);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["vr-videos", selectedCategory.value, page],
    queryFn: () => searchVideos(selectedCategory.value, page),
  });

  const rawVideos = data?.videos || [];

  const formattedVideos = rawVideos.map((v: any) => ({
    id: v.video_id || v.id,
    title: v.title,
    url: v.url,
    thumbnail: v.default_thumb || v.thumbnail || "",
    duration: v.duration,
    views: typeof v.views === "number" ? v.views.toLocaleString() : v.views,
    rating: v.rating,
    source: v.source || "pornhub",
  })).filter((v: any) => Boolean(v.id));

  const handleCategoryChange = (cat: typeof VR_CATEGORIES[0]) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      {/* Lightweight background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 sm:pt-24 pb-16 container max-w-7xl mx-auto px-3 sm:px-6">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/adult/catalog")}
            className="flex items-center gap-2 text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Catalog
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                🥽
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black uppercase italic tracking-tighter text-white">
                    VR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Porn</span> Zone
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[9px] font-black text-blue-300 uppercase tracking-widest">
                    180° • 360°
                  </span>
                </div>
                <p className="text-white/40 text-[11px] sm:text-xs font-medium mt-0.5">
                  Immersive virtual reality adult content — click any video to play
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all self-start sm:self-auto"
            >
              <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} /> Refresh
            </button>
          </div>
        </div>

        {/* Headsets bar */}
        <div className="mb-6 p-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest whitespace-nowrap px-2">Compatible:</span>
          {VR_HEADSETS.map((h) => (
            <div key={h.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-400/20 whitespace-nowrap">
              <span className="text-[10px] font-black text-white">{h.short}</span>
              <span className="text-[9px] text-white/40">({h.note})</span>
            </div>
          ))}
        </div>

        {/* Category Pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {VR_CATEGORIES.map((cat) => {
            const isActive = selectedCategory.value === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all active:scale-95",
                  isActive
                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:bg-white/8"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label.replace(/^\S+\s/, "")}</span>
              </button>
            );
          })}
        </div>

        {/* Video Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">{selectedCategory.label}</h2>
              {!isLoading && <span className="text-[10px] text-white/30">({formattedVideos.length} videos)</span>}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : formattedVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-3xl border border-white/5 bg-white/[0.02]">
              <span className="text-4xl">🥽</span>
              <p className="text-white/40 font-black uppercase tracking-widest text-xs">No VR streams found for this category</p>
              <button
                onClick={() => handleCategoryChange(VR_CATEGORIES[0])}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500"
              >
                View All VR
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {formattedVideos.map((video: any) => (
                <AdultCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {formattedVideos.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="px-3.5 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-[10px] font-black text-blue-300">
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
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
