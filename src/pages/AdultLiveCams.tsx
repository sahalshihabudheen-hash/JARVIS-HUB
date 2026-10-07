import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Radio, Maximize2, ExternalLink,
  Users, Eye, Flame, Star, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";

// Chaturbate embed categories
// Format: https://chaturbate.com/embed_ifr/?bgcolor=black&disable_sound=0&tour=g4pe&tag={tag}
const CAM_CATEGORIES = [
  { id: "girls",      label: "🔥 Girls",      tag: "girls",           color: "from-pink-600 to-rose-500",   border: "border-pink-500/40",   active: "bg-pink-500/20"   },
  { id: "couples",    label: "💑 Couples",    tag: "couple",          color: "from-red-600 to-pink-500",    border: "border-red-500/40",    active: "bg-red-500/20"    },
  { id: "asian",      label: "🌸 Asian",      tag: "asian",           color: "from-fuchsia-600 to-pink-500",border: "border-fuchsia-500/40",active: "bg-fuchsia-500/20"},
  { id: "ebony",      label: "✨ Ebony",      tag: "ebony",           color: "from-purple-700 to-purple-500",border: "border-purple-500/40",active: "bg-purple-500/20" },
  { id: "latina",     label: "💃 Latina",     tag: "latina",          color: "from-orange-600 to-yellow-500",border: "border-orange-500/40",active: "bg-orange-500/20" },
  { id: "milf",       label: "👑 MILF",       tag: "milf",            color: "from-amber-600 to-orange-500",border: "border-amber-500/40",  active: "bg-amber-500/20"  },
  { id: "teen",       label: "🌺 Teen (18+)", tag: "18to21",          color: "from-green-600 to-teal-500",  border: "border-green-500/40",  active: "bg-green-500/20"  },
  { id: "bigboobs",   label: "💎 Big Boobs",  tag: "bigboobs",        color: "from-rose-600 to-red-500",    border: "border-rose-500/40",   active: "bg-rose-500/20"   },
  { id: "bbw",        label: "🍑 BBW",        tag: "bbw",             color: "from-violet-600 to-purple-500",border: "border-violet-500/40",active: "bg-violet-500/20" },
  { id: "blonde",     label: "⭐ Blonde",     tag: "blonde",          color: "from-yellow-600 to-amber-500",border: "border-yellow-500/40", active: "bg-yellow-500/20" },
  { id: "anal",       label: "🎯 Anal",       tag: "anal",            color: "from-red-700 to-orange-600",  border: "border-red-600/40",    active: "bg-red-600/20"    },
  { id: "squirt",     label: "💦 Squirt",     tag: "squirt",          color: "from-blue-600 to-cyan-500",   border: "border-blue-500/40",   active: "bg-blue-500/20"   },
  { id: "lovense",    label: "📳 Lovense",    tag: "lovense",         color: "from-teal-600 to-green-500",  border: "border-teal-500/40",   active: "bg-teal-500/20"   },
  { id: "trans",      label: "🏳️‍⚧️ Trans",      tag: "trans",           color: "from-indigo-600 to-blue-500", border: "border-indigo-500/40", active: "bg-indigo-500/20" },
  { id: "indian",     label: "🇮🇳 Indian",     tag: "indian",          color: "from-orange-700 to-amber-600",border: "border-orange-600/40", active: "bg-orange-600/20" },
  { id: "feet",       label: "🦶 Feet",       tag: "feet",            color: "from-pink-700 to-rose-600",   border: "border-pink-600/40",   active: "bg-pink-600/20"   },
];

// Alternative cam sites
const ALT_SITES = [
  { name: "Stripchat", url: "https://stripchat.com", desc: "HD cams, VR rooms available", badge: "🔴 LIVE", color: "border-red-500/30 hover:border-red-400/50" },
  { name: "BongaCams",  url: "https://bongacams.com", desc: "Free live cams, no signup", badge: "🟢 FREE", color: "border-green-500/30 hover:border-green-400/50" },
  { name: "CamSoda",    url: "https://camsoda.com",  desc: "Interactive toy models", badge: "🟡 HOT",  color: "border-yellow-500/30 hover:border-yellow-400/50" },
  { name: "MyFreeCams", url: "https://myfreecams.com",desc: "Girls only, huge library", badge: "⭐ TOP", color: "border-purple-500/30 hover:border-purple-400/50" },
];

const buildEmbedUrl = (tag: string) =>
  `https://chaturbate.com/embed_ifr/?bgcolor=black&disable_sound=0&tour=g4pe&campaign=9DHRB&tag=${tag}&disable_html5=1`;

const AdultLiveCams = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(CAM_CATEGORIES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [showAltSites, setShowAltSites] = useState(false);

  const handleCategoryChange = (cat: typeof CAM_CATEGORIES[0]) => {
    setActiveCategory(cat);
    setIframeKey(k => k + 1); // force iframe reload
  };

  const refreshCams = () => setIframeKey(k => k + 1);

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.08),transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 sm:pt-24 pb-16 container max-w-7xl mx-auto px-3 sm:px-6">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button onClick={() => navigate("/adult/catalog")} className="flex items-center gap-2 text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-5 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Catalog
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-3xl">
                  📡
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase italic tracking-tighter">
                    Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Cams</span>
                  </h1>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-[9px] font-black text-red-300 uppercase tracking-widest">Live Now</span>
                  </div>
                </div>
                <p className="text-white/35 text-xs sm:text-sm mt-1">Real people, live streams — thousands online now</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              <button
                onClick={refreshCams}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all active:scale-95"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
              <button
                onClick={() => setShowAltSites(s => !s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all active:scale-95"
              >
                More Sites {showAltSites ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Alt sites panel */}
        {showAltSites && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
            {ALT_SITES.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex flex-col gap-2 p-4 rounded-2xl border bg-white/[0.02] hover:bg-white/5 transition-all group",
                  site.color
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{site.name}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/10">{site.badge}</span>
                </div>
                <p className="text-[10px] text-white/30 leading-tight">{site.desc}</p>
                <span className="text-[9px] text-white/20 group-hover:text-white/40 uppercase tracking-widest flex items-center gap-1">
                  Open <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Category scroll bar */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {CAM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all active:scale-95",
                activeCategory.id === cat.id
                  ? cn("text-white", cat.active, cat.border)
                  : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:bg-white/8"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main cam embed + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-4">

          {/* Cam iframe */}
          <div className={cn(
            "relative rounded-3xl overflow-hidden border bg-black transition-all",
            activeCategory.border
          )}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">LIVE — {activeCategory.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-white/30 uppercase tracking-widest">Powered by Chaturbate</span>
                <button
                  onClick={() => setIsFullscreen(f => !f)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/40 hover:text-white transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* The iframe */}
            <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
              <iframe
                key={iframeKey}
                src={buildEmbedUrl(activeCategory.tag)}
                className="absolute inset-0 w-full h-full border-0"
                scrolling="yes"
                allowFullScreen
                title={`Live Cams - ${activeCategory.label}`}
              />
            </div>

            {/* Footer note */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 bg-white/[0.01]">
              <span className="text-[9px] text-white/20">Content from Chaturbate — 18+ only</span>
              <a
                href={`https://chaturbate.com/?tag=${activeCategory.tag}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] text-white/30 hover:text-white/60 transition-colors"
              >
                Open Full Site <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.02]">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">📊 Live Stats</p>
              <div className="space-y-2">
                {[
                  { label: "Models Online", value: "6,000+", icon: "👩" },
                  { label: "Viewers Active", value: "120K+", icon: "👀" },
                  { label: "Free Rooms", value: "4,200+", icon: "🆓" },
                  { label: "HD Streams", value: "3,800+", icon: "📺" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40 flex items-center gap-1.5">{s.icon} {s.label}</span>
                    <span className="text-[10px] font-black text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick category grid */}
            <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.02]">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">🔥 Hot Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {CAM_CATEGORIES.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "py-2 rounded-xl text-[9px] font-black uppercase tracking-wide border transition-all active:scale-95",
                      activeCategory.id === cat.id
                        ? cn("text-white", cat.active, cat.border)
                        : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white hover:bg-white/8"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* How to tips */}
            <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.02]">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">💡 Tips</p>
              <div className="space-y-2 text-[10px] text-white/30 leading-relaxed">
                <p>• Scroll inside the embed to browse rooms</p>
                <p>• Click any room thumbnail to watch live</p>
                <p>• Green dot = model is online now</p>
                <p>• Use "Full Site" link for best experience</p>
                <p>• 100% free — no account needed to watch</p>
              </div>
            </div>

            {/* Other cam sites quick links */}
            <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.02]">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">🌐 More Platforms</p>
              <div className="space-y-2">
                {ALT_SITES.map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-2 px-3 rounded-xl border border-white/5 hover:border-white/15 hover:bg-white/5 transition-all group"
                  >
                    <div>
                      <p className="text-[11px] font-black text-white">{site.name}</p>
                      <p className="text-[9px] text-white/25">{site.badge}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-sm font-black text-white uppercase">LIVE — {activeCategory.label}</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-black uppercase tracking-widest"
            >
              ✕ Exit Fullscreen
            </button>
          </div>
          <iframe
            key={`fs-${iframeKey}`}
            src={buildEmbedUrl(activeCategory.tag)}
            className="flex-1 w-full border-0"
            scrolling="yes"
            allowFullScreen
            title="Live Cams Fullscreen"
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdultLiveCams;
