import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Radio, ExternalLink, Play,
  Users, Eye, RefreshCw, X, ShieldCheck, Sparkles, Volume2
} from "lucide-react";

interface CamModel {
  id: number;
  username: string;
  avatarUrl?: string;
  snapshotUrl?: string;
  previewUrl?: string;
  modelsCountry?: string;
  viewersCount?: number;
  broadcastHD?: boolean;
  broadcastVR?: boolean;
  stream?: {
    url?: string;
    urls?: Record<string, string>;
  };
  languages?: string[];
  gender?: string;
}

const CAM_CATEGORIES = [
  { id: "female",     label: "🔥 Girls",       gender: "female",      tag: "" },
  { id: "couples",    label: "💑 Couples",     gender: "couple",      tag: "" },
  { id: "asian",      label: "🌸 Asian",       gender: "female",      tag: "asian" },
  { id: "ebony",      label: "✨ Ebony",       gender: "female",      tag: "ebony" },
  { id: "latina",     label: "💃 Latina",      gender: "female",      tag: "latina" },
  { id: "milf",       label: "👑 MILF",        gender: "female",      tag: "milf" },
  { id: "teen",       label: "🌺 18-21",       gender: "female",      tag: "teen" },
  { id: "bigboobs",   label: "💎 Big Tits",    gender: "female",      tag: "bigboobs" },
  { id: "anal",       label: "🎯 Anal",        gender: "female",      tag: "anal" },
  { id: "squirt",     label: "💦 Squirt",      gender: "female",      tag: "squirt" },
  { id: "trans",      label: "🏳️‍⚧️ Trans",       gender: "trans",       tag: "" },
  { id: "vr",         label: "🥽 VR Cams",     gender: "female",      tag: "vr" },
];

const PLATFORMS = [
  { name: "Stripchat", url: "https://stripchat.com", desc: "HD cams, interactive toys & VR rooms", badge: "TOP RATED", color: "from-red-600 to-rose-600" },
  { name: "Chaturbate", url: "https://chaturbate.com", desc: "World's largest free cam community", badge: "POPULAR", color: "from-amber-600 to-orange-600" },
  { name: "BongaCams", url: "https://bongacams.com", desc: "Thousands of international models", badge: "FREE HD", color: "from-emerald-600 to-teal-600" },
  { name: "CamSoda", url: "https://camsoda.com", desc: "Ultra-modern HD interactive cam shows", badge: "HOT", color: "from-purple-600 to-indigo-600" },
];

const AdultLiveCams = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(CAM_CATEGORIES[0]);
  const [hoveredModelId, setHoveredModelId] = useState<number | null>(null);
  const [activeModel, setActiveModel] = useState<CamModel | null>(null);

  // Fetch real-time active models from Stripchat's public webmaster API
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["live-cams", activeCategory.id],
    queryFn: async () => {
      let url = `https://go.stripchat.com/api/models?limit=48`;
      if (activeCategory.gender) {
        url += `&gender=${encodeURIComponent(activeCategory.gender)}`;
      }
      if (activeCategory.tag) {
        url += `&tag=${encodeURIComponent(activeCategory.tag)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch live cams");
      const json = await res.json();
      return (json.models || []) as CamModel[];
    },
    staleTime: 1000 * 30, // 30s cache
    refetchInterval: 1000 * 45, // auto refresh every 45s
  });

  const models = data || [];

  const handleOpenRoom = (model: CamModel) => {
    setActiveModel(model);
  };

  const getDirectRoomUrl = (username: string) => {
    return `https://stripchat.com/${encodeURIComponent(username)}`;
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.08),transparent_60%)]" />
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
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                  📡
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-black animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black uppercase italic tracking-tighter text-white">
                    Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Cams</span>
                  </h1>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[9px] font-black text-red-300 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    LIVE BROADCASTS
                  </span>
                </div>
                <p className="text-white/40 text-[11px] sm:text-xs font-medium mt-0.5">
                  Real webcam performers online right now — hover for live motion preview
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all self-start sm:self-auto active:scale-95"
            >
              <RefreshCw className={cn("w-3 h-3", (isLoading || isFetching) && "animate-spin")} />
              Refresh Cams
            </button>
          </div>
        </div>

        {/* Top Direct Platforms Bar */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {PLATFORMS.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-white">{platform.name}</span>
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                  {platform.badge}
                </span>
              </div>
              <p className="text-[10px] text-white/35 line-clamp-1 mb-2">{platform.desc}</p>
              <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Open Site <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </a>
          ))}
        </div>

        {/* Category Pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {CAM_CATEGORIES.map((cat) => {
            const isActive = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all active:scale-95",
                  isActive
                    ? "bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:bg-white/8"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Model Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">{activeCategory.label}</h2>
              {!isLoading && <span className="text-[10px] text-white/30">({models.length} active models)</span>}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-3xl border border-white/5 bg-white/[0.02]">
              <span className="text-4xl">📡</span>
              <p className="text-white/40 font-black uppercase tracking-widest text-xs">No models online in this tag</p>
              <button
                onClick={() => setActiveCategory(CAM_CATEGORIES[0])}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500"
              >
                Browse All Girls
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {models.map((model) => {
                const isHovered = hoveredModelId === model.id;
                const snapshot = model.snapshotUrl || model.avatarUrl;
                const preview = model.previewUrl || snapshot;

                return (
                  <div
                    key={model.id}
                    onClick={() => handleOpenRoom(model)}
                    onMouseEnter={() => setHoveredModelId(model.id)}
                    onMouseLeave={() => setHoveredModelId(null)}
                    className="group relative rounded-2xl overflow-hidden border border-white/8 bg-[#0a0a0a] cursor-pointer hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg"
                  >
                    {/* Image / Video preview */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
                      <img
                        src={isHovered && preview ? preview : snapshot}
                        alt={model.username}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-600/90 backdrop-blur-sm text-[8px] font-black uppercase tracking-wider text-white">
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          LIVE
                        </div>
                        {model.broadcastHD && (
                          <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[8px] font-black text-amber-300">
                            HD
                          </span>
                        )}
                        {model.broadcastVR && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-600/80 backdrop-blur-sm text-[8px] font-black text-white">
                            VR
                          </span>
                        )}
                      </div>

                      {/* Viewers Badge Bottom Left */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[9px] font-bold text-white/80">
                        <Users className="w-2.5 h-2.5 text-white/60" />
                        <span>{model.viewersCount || 1}</span>
                      </div>

                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Model Details */}
                    <div className="p-2.5 bg-gradient-to-t from-black to-[#0a0a0a]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-white truncate max-w-[80%]">
                          {model.username}
                        </p>
                        {model.modelsCountry && (
                          <span className="text-[10px] uppercase font-bold text-white/30">
                            {model.modelsCountry}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-white/35 mt-0.5 truncate">
                        {model.languages?.join(", ").toUpperCase() || "ENGLISH"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Model Stream Modal */}
      {activeModel && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveModel(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-[#0a0a0a] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    {activeModel.username}
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 uppercase">
                      LIVE STREAM
                    </span>
                  </h3>
                  <p className="text-[10px] text-white/40 flex items-center gap-1.5 mt-0.5">
                    <Users className="w-3 h-3" /> {activeModel.viewersCount || 100}+ watching
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModel(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stream Player View */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {activeModel.stream?.url ? (
                <video
                  src={activeModel.stream.url}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to preview animation if browser fails native HLS
                    (e.currentTarget as HTMLVideoElement).style.display = "none";
                  }}
                />
              ) : null}

              {/* Fallback image when video isn't directly supported */}
              <img
                src={activeModel.previewUrl || activeModel.snapshotUrl}
                alt={activeModel.username}
                className="w-full h-full object-contain absolute inset-0 -z-10"
              />
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white/40 text-[10px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Free Live Stream • Sound & Chat in Full Room</span>
              </div>

              <a
                href={getDirectRoomUrl(activeModel.username)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95"
              >
                Join Full Interactive Room <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdultLiveCams;
