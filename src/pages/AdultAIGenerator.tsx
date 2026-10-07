import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import {
  Sparkles, Download, RefreshCw, Wand2, Image as ImageIcon, ChevronLeft,
  Shuffle, Lock, Zap, Star, Grid3x3, Maximize2, X, Copy, Check, ChevronDown, ChevronUp
} from "lucide-react";

// ── Pollinations.ai — free, no API key, NSFW enabled ──────────────────────────
const buildImageUrl = (prompt: string, model: string, w: number, h: number, seed: number) => {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&model=${model}&seed=${seed}&nologo=true&enhance=true`;
};

const MODELS = [
  { id: "flux",        label: "Flux",        badge: "⚡ Best",  desc: "Highest quality, most realistic" },
  { id: "turbo",       label: "Turbo",       badge: "🚀 Fast",  desc: "Quick generation, great detail" },
  { id: "dreamshaper", label: "Dreamshaper", badge: "🌸 Anime", desc: "Anime & fantasy art style" },
  { id: "flux-realism",label: "Flux Real",   badge: "📸 Hyper", desc: "Ultra-photorealistic output" },
];

const STYLE_PRESETS = [
  { label: "Realistic",    suffix: "photorealistic, hyper-detailed, 8k, professional photography, soft lighting, beautiful" },
  { label: "Anime",        suffix: "anime style, detailed illustration, vibrant colors, high quality anime art" },
  { label: "Fantasy",      suffix: "fantasy art, digital painting, ethereal lighting, magical atmosphere, artstation" },
  { label: "Oil Paint",    suffix: "oil painting style, classical art, rich colors, masterpiece, renaissance style" },
  { label: "Cyberpunk",    suffix: "cyberpunk, neon lights, futuristic, digital art, blade runner aesthetic" },
  { label: "Watercolor",   suffix: "watercolor painting, soft brushstrokes, pastel tones, artistic, beautiful" },
];

const QUICK_PROMPTS = [
  { label: "🌸 Anime Girl",     prompt: "beautiful anime girl, nude, long hair, soft lighting, high quality anime art" },
  { label: "💎 Elegant Woman",  prompt: "elegant beautiful woman, nude, artistic, tasteful, studio lighting, professional" },
  { label: "🔥 Fantasy Queen",  prompt: "fantasy queen, nude, long flowing hair, magical aura, ethereal lighting, digital art" },
  { label: "🌊 Beach Scene",    prompt: "beautiful woman nude on beach, sunset lighting, artistic photography, natural" },
  { label: "⚡ Cyberpunk Girl", prompt: "cyberpunk woman, nude, neon lights, futuristic city background, digital art" },
  { label: "🌙 Moonlight",      prompt: "beautiful woman nude in moonlight, night, soft glow, romantic, artistic" },
  { label: "🌺 Nature",         prompt: "beautiful woman nude in nature, forest, sunlight, artistic, tasteful photography" },
  { label: "👸 Princess",       prompt: "beautiful princess nude, royal bedroom, soft lighting, fantasy art, detailed" },
  { label: "🎨 Art Nouveau",    prompt: "art nouveau style woman nude, floral background, elegant, vintage poster art" },
  { label: "💫 Galaxy Girl",    prompt: "beautiful woman nude, galaxy and stars background, cosmic art, glowing, ethereal" },
  { label: "🐉 Dragon Rider",   prompt: "fantasy warrior woman nude, dragon companion, epic scene, detailed digital art" },
  { label: "🌸 Hentai Style",   prompt: "high quality hentai anime, beautiful character, detailed illustration, vibrant colors" },
];

const BODY_TAGS = [
  "big breasts", "small breasts", "curvy", "slim", "athletic",
  "long legs", "big butt", "toned body", "petite", "tall",
  "long hair", "short hair", "blonde", "brunette", "redhead",
  "fair skin", "dark skin", "tan skin",
];

const ASPECT_RATIOS = [
  { label: "Portrait",  w: 512, h: 768,  icon: "▭" },
  { label: "Square",    w: 512, h: 512,  icon: "■" },
  { label: "Landscape", w: 768, h: 512,  icon: "▬" },
  { label: "Tall",      w: 448, h: 896,  icon: "║" },
];

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  seed: number;
  timestamp: number;
}

// Collapsible section wrapper for mobile
const Section = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{title}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

const AdultAIGenerator = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [selectedModel, setSelectedModel] = useState("flux");
  const [selectedRatio, setSelectedRatio] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [lightboxImg, setLightboxImg] = useState<GeneratedImage | null>(null);
  const [batchCount, setBatchCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

  const buildFinalPrompt = () => {
    const tags = selectedTags.length > 0 ? `, ${selectedTags.join(", ")}` : "";
    const style = STYLE_PRESETS[selectedStyle].suffix;
    const base = prompt.trim() || "beautiful woman, nude";
    return `${base}${tags}, ${style}, NSFW, explicit, high quality`;
  };

  const generate = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const ratio = ASPECT_RATIOS[selectedRatio];
    const finalPrompt = buildFinalPrompt();
    const newImgs: GeneratedImage[] = [];
    for (let i = 0; i < batchCount; i++) {
      const seed = Math.floor(Math.random() * 999999999);
      const id = `${Date.now()}-${i}-${seed}`;
      const url = buildImageUrl(finalPrompt, selectedModel, ratio.w, ratio.h, seed);
      newImgs.push({ id, url, prompt: finalPrompt, model: selectedModel, seed, timestamp: Date.now() });
    }
    setGallery(prev => [...newImgs, ...prev]);
    setTimeout(() => setIsGenerating(false), 1500);
  }, [isGenerating, prompt, selectedStyle, selectedModel, selectedRatio, selectedTags, batchCount]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const randomizePrompt = () => {
    const rp = QUICK_PROMPTS[Math.floor(Math.random() * QUICK_PROMPTS.length)];
    setPrompt(rp.prompt);
  };

  const downloadImage = async (img: GeneratedImage) => {
    try {
      const res = await fetch(img.url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `jarvis-ai-${img.seed}.jpg`;
      a.click();
    } catch {
      window.open(img.url, "_blank");
    }
  };

  const copyPrompt = (p: string) => {
    navigator.clipboard.writeText(p);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeFromGallery = (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
    if (lightboxImg?.id === id) setLightboxImg(null);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.06),transparent_50%)]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 sm:pt-24 pb-24 sm:pb-16 container max-w-6xl mx-auto px-3 sm:px-4">

        {/* ── Header ── */}
        <div className="mb-6 sm:mb-10">
          <button
            onClick={() => navigate("/adult/catalog")}
            className="flex items-center gap-2 text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-6 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-30 animate-pulse" />
                <div className="relative p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                  <Wand2 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black uppercase italic tracking-tighter text-white leading-tight">
                  JARVIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI</span> Studio
                </h1>
                <p className="text-white/35 text-[10px] sm:text-xs font-medium mt-0.5 truncate">
                  Text → Nude AI Art • Free • No Limits
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 self-start sm:ml-auto flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-black text-green-400 uppercase tracking-widest whitespace-nowrap">Free • Unlimited</span>
            </div>
          </div>
        </div>

        {/* ── Two-column on desktop, single column on mobile ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-4 sm:gap-6">

          {/* ── LEFT: Controls ── */}
          <div className="space-y-3 sm:space-y-4">

            {/* Prompt box */}
            <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe what you want... e.g. beautiful woman, nude, soft lighting..."
                rows={3}
                className="w-full bg-transparent text-white text-sm placeholder:text-white/20 resize-none outline-none leading-relaxed"
              />
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 flex-wrap">
                <button
                  onClick={randomizePrompt}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/8 hover:border-purple-500/30 text-white/40 hover:text-purple-300 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <Shuffle className="w-3 h-3" /> Random
                </button>
                <button
                  onClick={() => copyPrompt(buildFinalPrompt())}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <span className="ml-auto text-[10px] text-white/20">{prompt.length} chars</span>
              </div>
            </div>

            {/* Quick Prompts — scrollable horizontal on mobile */}
            <Section title="⚡ Quick Prompts">
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => setPrompt(qp.prompt)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-[10px] font-bold text-left border transition-all active:scale-95",
                      prompt === qp.prompt
                        ? "bg-purple-600/30 border-purple-500/50 text-purple-200"
                        : "bg-white/[0.03] border-white/8 text-white/50 hover:bg-purple-500/10 hover:border-purple-500/20 hover:text-white"
                    )}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Body Tags */}
            <Section title="💪 Body & Style Tags">
              <div className="flex flex-wrap gap-2">
                {BODY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border transition-all active:scale-95",
                      selectedTags.includes(tag)
                        ? "bg-pink-600/30 border-pink-500/50 text-pink-200"
                        : "bg-white/[0.03] border-white/8 text-white/40 hover:bg-pink-500/10 hover:border-pink-500/20 hover:text-white"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Section>

            {/* Art Style */}
            <Section title="🎨 Art Style" defaultOpen={true}>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((style, i) => (
                  <button
                    key={style.label}
                    onClick={() => setSelectedStyle(i)}
                    className={cn(
                      "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all active:scale-95",
                      selectedStyle === i
                        ? "bg-purple-600/30 border-purple-500/50 text-purple-200"
                        : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:border-white/15"
                    )}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* AI Model */}
            <Section title="🤖 AI Model" defaultOpen={false}>
              <div className="space-y-2">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all active:scale-[0.98]",
                      selectedModel === m.id
                        ? "bg-purple-600/20 border-purple-500/50"
                        : "bg-white/[0.02] border-white/8 hover:bg-white/5 hover:border-white/15"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black text-white uppercase">{m.label}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">{m.badge}</span>
                      </div>
                      <p className="text-[10px] text-white/30 mt-0.5 truncate">{m.desc}</p>
                    </div>
                    {selectedModel === m.id && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </Section>

            {/* Ratio & Count — side by side on mobile */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">📐 Ratio</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ASPECT_RATIOS.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setSelectedRatio(i)}
                      className={cn(
                        "py-2 rounded-xl text-center border transition-all active:scale-95",
                        selectedRatio === i
                          ? "bg-purple-600/30 border-purple-500/50 text-purple-200"
                          : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:border-white/15"
                      )}
                    >
                      <div className="text-sm">{r.icon}</div>
                      <div className="text-[8px] font-black uppercase mt-0.5">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5">
                  <Grid3x3 className="w-3 h-3" /> Count
                </label>
                <div className="flex flex-col gap-1.5">
                  {[1, 2, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setBatchCount(n)}
                      className={cn(
                        "w-full py-2.5 rounded-xl text-[11px] font-black border transition-all active:scale-95",
                        batchCount === n
                          ? "bg-purple-600/30 border-purple-500/50 text-purple-200"
                          : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white"
                      )}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={isGenerating}
              className={cn(
                "w-full py-5 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]",
                isGenerating
                  ? "bg-purple-700/40 border border-purple-500/30 text-purple-300/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]"
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating{batchCount > 1 ? ` ${batchCount} images` : ""}...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate {batchCount > 1 ? `${batchCount} Images` : "Image"}
                  <Zap className="w-4 h-4 text-yellow-300" />
                </>
              )}
            </button>

            {/* Note */}
            <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <Lock className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-white/30 leading-relaxed">
                100% AI-generated art. No real people. Powered by Pollinations.ai.
              </p>
            </div>
          </div>

          {/* ── RIGHT: Gallery ── */}
          <div>
            {gallery.length === 0 ? (
              <div className="h-full min-h-[280px] sm:min-h-[500px] rounded-3xl border border-white/8 bg-white/[0.02] flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                  <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white/10 relative" />
                </div>
                <div>
                  <p className="text-white/30 font-black uppercase tracking-widest text-sm">Gallery is empty</p>
                  <p className="text-white/15 text-xs mt-1">Pick a prompt and hit Generate ✨</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                  {["Realistic", "Anime", "Fantasy"].map(s => (
                    <span key={s} className="px-3 py-1 rounded-full border border-white/8 text-white/20 text-[10px] font-bold uppercase">{s}</span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Gallery header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    {gallery.length} image{gallery.length > 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => { setGallery([]); setLoadedIds(new Set()); }}
                    className="text-[10px] text-white/20 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {/* Image grid — 2 cols always, images have touch-friendly action bar */}
                <div className={cn(
                  "grid gap-3",
                  gallery.length === 1 ? "grid-cols-1 max-w-xs mx-auto sm:max-w-none" : "grid-cols-2"
                )}>
                  {gallery.map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded-2xl overflow-hidden border border-white/8 bg-white/[0.02] aspect-[3/4]"
                    >
                      {/* Loading skeleton */}
                      {!loadedIds.has(img.id) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/10 animate-pulse flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 text-white/20 animate-spin" />
                        </div>
                      )}
                      <img
                        src={img.url}
                        alt="AI Generated"
                        className={cn(
                          "w-full h-full object-cover transition-all duration-500",
                          loadedIds.has(img.id) ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setLoadedIds(prev => new Set([...prev, img.id]))}
                        onError={() => setLoadedIds(prev => new Set([...prev, img.id]))}
                      />

                      {/* Always-visible bottom action bar (touch-friendly) */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-2">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setLightboxImg(img)}
                            className="flex-1 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-[9px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            <Maximize2 className="w-3 h-3" /> View
                          </button>
                          <button
                            onClick={() => downloadImage(img)}
                            className="flex-1 py-2 rounded-xl bg-purple-600/80 backdrop-blur-sm border border-purple-400/20 text-[9px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            <Download className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={() => removeFromGallery(img.id)}
                            className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 active:scale-95 transition-all flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Model badge top-left */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white/50">
                          {img.model}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox — full safe area on mobile */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            {/* Close row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Seed: {lightboxImg.seed}</span>
              </div>
              <button
                onClick={() => setLightboxImg(null)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest active:scale-95"
              >
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>

            {/* Image */}
            <img
              src={lightboxImg.url}
              alt="AI Art"
              className="w-full rounded-3xl border border-white/10 max-h-[70vh] object-contain"
            />

            {/* Download */}
            <button
              onClick={() => downloadImage(lightboxImg)}
              className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" /> Download Image
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdultAIGenerator;
