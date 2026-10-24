import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import {
  Sparkles, Download, RefreshCw, Wand2, Image as ImageIcon, ChevronLeft,
  Shuffle, Lock, Zap, Star, Grid3x3, Maximize2, X, Copy, Check, ChevronDown, ChevronUp,
  Upload, SlidersHorizontal, AlertCircle, Trash2, Clock, CheckCircle2, Key
} from "lucide-react";

// ── Pollinations.ai URL builder ──────────────────────────────────────────────
const buildImageUrl = (prompt: string, model: string, w: number, h: number, seed: number, imageUrl?: string) => {
  const encoded = encodeURIComponent(prompt);
  let url = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&model=${model}&seed=${seed}&nologo=true&enhance=true`;
  if (imageUrl) {
    url += `&image=${encodeURIComponent(imageUrl)}`;
  }
  return url;
};

const MODELS = [
  { id: "flux",          label: "Flux",         badge: "⚡ Best",  desc: "Highest quality, best image preservation" },
  { id: "turbo",         label: "Turbo",        badge: "🚀 Fast",  desc: "Fast generation, high detail" },
  { id: "flux-realism",  label: "Flux Real",    badge: "📸 Hyper", desc: "Ultra-photorealistic textures & lighting" },
  { id: "flux-anime",    label: "Flux Anime",   badge: "🌸 Anime", desc: "Stylized anime/manga illustration" },
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
  { label: "🌸 Anime Scene",    prompt: "cinematic anime landscape with cherry blossoms, vibrant colors, Makoto Shinkai style" },
  { label: "🏎️ Cyberpunk Car",  prompt: "futuristic hypercar, glowing neon underglow, wet asphalt city street, cyberpunk aesthetic" },
  { label: "🔥 Fantasy Realm",  prompt: "epic fantasy castle on floating island, dragons in sky, glowing aurora, digital art" },
  { label: "🌊 Beach Sunset",   prompt: "luxurious sports coupe parked on tropical beach at sunset, golden reflections on waves" },
  { label: "⚡ Sci-Fi Mech",    prompt: "giant futuristic robot mech in hangar, steam, cinematic dramatic lighting, detailed concept art" },
  { label: "🌙 Cyber City",     prompt: "sprawling futuristic metropolis at night, neon skyscrapers, flying vehicles, blade runner style" },
  { label: "🎨 Retro 80s",      prompt: "synthwave 80s retro car cruising down grid highway, wireframe mountains, neon sunset" },
  { label: "💎 Concept Supercar", prompt: "aerodynamic concept supercar, metallic silver finish, automotive studio lighting, 8k render" },
];

const EDIT_PRESETS = [
  { label: "🚗 Change to Red", prompt: "Change the car paint color to glossy metallic candy red, keeping original headlights and wheel rims" },
  { label: "🖤 Matte Black Paint", prompt: "Change the exterior color to sleek satin matte black with glossy carbon fiber accents" },
  { label: "🌃 Cyberpunk City", prompt: "Place this exact vehicle on wet asphalt in a futuristic cyberpunk city at night with glowing neon reflections" },
  { label: "🏔️ Mountain Highway", prompt: "Place this exact car driving on a scenic coastal mountain road during golden hour sunset" },
  { label: "🏁 Racing Track", prompt: "Place this vehicle on a professional asphalt race track with high-speed motion blur" },
  { label: "🌸 Anime Cel-Shade", prompt: "Transform into a cinematic studio anime illustration with cel-shaded colors and vibrant sky" },
];

const BODY_TAGS = [
  "metallic paint", "matte black", "carbon fiber", "neon lights",
  "glossy finish", "studio lighting", "golden hour", "rain reflections",
  "cyberpunk", "anime style", "vintage retro", "hyper-detailed",
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
  sourceImageUrl?: string;
  isEdit?: boolean;
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

  // Mode: Text-to-Image vs Image-to-Image Edit
  const [activeTab, setActiveTab] = useState<"generate" | "edit">("generate");

  // Cooldown countdown timer (45 seconds for Pollinations free tier)
  const [cooldown, setCooldown] = useState(0);

  // Text-to-Image State
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [selectedModel, setSelectedModel] = useState("flux");
  const [selectedRatio, setSelectedRatio] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(1);

  // Image-to-Image Edit State
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [uploadedPublicUrl, setUploadedPublicUrl] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [pollenApiKey, setPollenApiKey] = useState(() => localStorage.getItem("pollinations_pollen_key") || "");
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [editModel, setEditModel] = useState("flux");
  const [isEditing, setIsEditing] = useState(false);
  const [editProgressStatus, setEditProgressStatus] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);
  const [lastEditedImage, setLastEditedImage] = useState<GeneratedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gallery & Lightbox
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [lightboxImg, setLightboxImg] = useState<GeneratedImage | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

  // Cooldown countdown tick
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Cleanup object URLs on unmount or replace
  useEffect(() => {
    return () => {
      if (sourcePreviewUrl) {
        URL.revokeObjectURL(sourcePreviewUrl);
      }
    };
  }, [sourcePreviewUrl]);

  // Handle file selection
  const handleFile = (file: File) => {
    setEditError(null);

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setEditError("Unsupported file format. Please upload JPG, PNG, or WebP.");
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setEditError("File size exceeds 10MB limit. Please choose a smaller image.");
      return;
    }

    if (sourcePreviewUrl) {
      URL.revokeObjectURL(sourcePreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setSourceFile(file);
    setSourcePreviewUrl(preview);
    setUploadedPublicUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearSourceImage = () => {
    if (sourcePreviewUrl) {
      URL.revokeObjectURL(sourcePreviewUrl);
    }
    setSourceFile(null);
    setSourcePreviewUrl(null);
    setUploadedPublicUrl(null);
    setEditError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Text-to-Image Generation
  const buildFinalPrompt = () => {
    const tags = selectedTags.length > 0 ? `, ${selectedTags.join(", ")}` : "";
    const style = STYLE_PRESETS[selectedStyle].suffix;
    const base = prompt.trim() || "futuristic concept car, automotive studio lighting";
    return `${base}${tags}, ${style}, high quality, detailed`;
  };

  const generate = useCallback(async () => {
    if (isGenerating || cooldown > 0) return;
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
    setCooldown(45); // Set 45s cooldown to match Pollinations free tier
    setTimeout(() => setIsGenerating(false), 1200);
  }, [isGenerating, cooldown, prompt, selectedStyle, selectedModel, selectedRatio, selectedTags, batchCount]);

  // Build high-fidelity Edit Prompt
  const buildFinalEditPrompt = () => {
    // Clean common typos automatically
    const cleanInstructions = editPrompt.trim()
      .replace(/\bchage\b/gi, "change")
      .replace(/\bcara\b/gi, "car")
      .replace(/\bgodd\b/gi, "good")
      .replace(/\bbaground\b/gi, "background");

    const subject = subjectName.trim() || "vehicle in the reference image";

    if (preserveStructure) {
      return `Exact same ${subject} from the reference image, strictly preserve identical body shape, panels, headlights, wheel rims, and angular contours. ${cleanInstructions}, automotive photography, hyper-detailed, photorealistic, 8k`;
    }

    return `${cleanInstructions}, ${subject}, photorealistic, high quality`;
  };

  // Image-to-Image Edit Execution
  const performImageEdit = async () => {
    if (isEditing || cooldown > 0) return;
    if (!sourceFile) {
      setEditError("Please upload an image to edit first.");
      return;
    }
    if (!editPrompt.trim()) {
      setEditError("Please enter editing instructions describing what to change.");
      return;
    }

    setIsEditing(true);
    setEditError(null);
    setEditProgressStatus("Uploading source image...");

    try {
      let publicImageUrl = uploadedPublicUrl;

      // Upload if not already uploaded
      if (!publicImageUrl) {
        const formData = new FormData();
        formData.append("image", sourceFile);

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status ${uploadRes.status}`);
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.url) {
          throw new Error("Could not retrieve uploaded image URL");
        }

        publicImageUrl = uploadData.url;
        setUploadedPublicUrl(publicImageUrl);
      }

      let editedUrl = "";
      const finalPrompt = buildFinalEditPrompt();
      const seed = Math.floor(Math.random() * 999999999);
      const id = `edit-${Date.now()}-${seed}`;

      // Always try the /api/edit-image route first.
      // The server uses POLLINATIONS_API_KEY env var automatically.
      // If user also typed their own key, it takes priority.
      setEditProgressStatus("Editing with Flux Kontext Pro...");
      const editFormData = new FormData();
      editFormData.append("image", sourceFile);
      editFormData.append("prompt", finalPrompt);
      editFormData.append("model", "black-forest-labs/flux.1-kontext-pro");
      if (pollenApiKey.trim()) {
        editFormData.append("apiKey", pollenApiKey.trim());
      }

      const editRes = await fetch("/api/edit-image", {
        method: "POST",
        body: editFormData,
      });

      if (editRes.ok) {
        const editData = await editRes.json();
        if (editData.url) {
          editedUrl = editData.url;
        }
      }

      // Fallback to free classic if server has no key configured
      if (!editedUrl) {
        setEditProgressStatus("Classic mode: generating AI variation...");
        editedUrl = buildImageUrl(finalPrompt, editModel, 768, 768, seed, publicImageUrl);
        setCooldown(45); // 45s cooldown on free tier
      }

      const editedImageItem: GeneratedImage = {
        id,
        url: editedUrl,
        prompt: finalPrompt,
        model: "flux-kontext-pro",
        seed,
        timestamp: Date.now(),
        sourceImageUrl: sourcePreviewUrl || publicImageUrl,
        isEdit: true,
      };

      setLastEditedImage(editedImageItem);
      setGallery(prev => [editedImageItem, ...prev]);
    } catch (err: any) {
      console.error("Image edit error:", err);
      setEditError(err?.message || "Failed to edit image. Please check your connection or wait for cooldown.");
    } finally {
      setIsEditing(false);
      setEditProgressStatus("");
    }
  };

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
    if (lastEditedImage?.id === id) setLastEditedImage(null);
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
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/adult/catalog")}
            className="flex items-center gap-2 text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-6 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Catalog
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
                  Text Generation & Image-to-Image Editing • Powered by Pollinations.ai
                </p>
              </div>
            </div>

            {/* Status & Cooldown Pill */}
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              {cooldown > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <Clock className="w-3 h-3 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Cooldown: {cooldown}s</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest whitespace-nowrap">AI Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mode Switcher Tabs ── */}
        <div className="mb-6 flex p-1.5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md max-w-md">
          <button
            onClick={() => setActiveTab("generate")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95",
              activeTab === "generate"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                : "text-white/40 hover:text-white"
            )}
          >
            <Sparkles className="w-4 h-4" /> Text to Image
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95",
              activeTab === "edit"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                : "text-white/40 hover:text-white"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" /> Edit Image (Img2Img)
          </button>
        </div>

        {/* ── MAIN CONTENT ── */}
        {activeTab === "generate" ? (
          /* ── TAB 1: TEXT TO IMAGE GENERATOR ── */
          <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-4 sm:gap-6">
            {/* LEFT: Controls */}
            <div className="space-y-3 sm:space-y-4">
              {/* Prompt box */}
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm">
                <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Your Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create... e.g. futuristic concept car, neon city street..."
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

              {/* Quick Prompts */}
              <Section title="⚡ Quick Prompts">
                <div className="grid grid-cols-2 gap-2">
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

              {/* Style Tags */}
              <Section title="💪 Aesthetics & Lighting">
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

              {/* Ratio & Count */}
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
                disabled={isGenerating || cooldown > 0}
                className={cn(
                  "w-full py-5 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]",
                  isGenerating || cooldown > 0
                    ? "bg-purple-700/40 border border-purple-500/30 text-purple-300/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="w-4 h-4 animate-pulse text-amber-300" />
                    Slot ready in {cooldown}s
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate {batchCount > 1 ? `${batchCount} Images` : "Image"}
                    <Zap className="w-4 h-4 text-yellow-300" />
                  </>
                )}
              </button>
            </div>

            {/* RIGHT: Gallery */}
            <div>{renderGallery()}</div>
          </div>
        ) : (
          /* ── TAB 2: IMAGE-TO-IMAGE EDITING MODE ── */
          <div className="grid grid-cols-1 lg:grid-cols-[440px,1fr] gap-4 sm:gap-6">
            {/* LEFT: Upload & Edit Controls */}
            <div className="space-y-4">
              {/* Image Upload Zone */}
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5 backdrop-blur-sm">
                <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" /> 1. Upload Source Image
                  </span>
                  {sourceFile && (
                    <button
                      onClick={clearSourceImage}
                      className="text-white/40 hover:text-red-400 text-[9px] uppercase font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </label>

                {/* Hidden input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />

                {!sourcePreviewUrl ? (
                  /* Drag & Drop Upload Target */
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[180px]",
                      isDragging
                        ? "border-purple-400 bg-purple-500/10 scale-[1.01]"
                        : "border-white/10 hover:border-purple-500/40 hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white">
                        Click or Drag & Drop Image Here
                      </p>
                      <p className="text-[10px] text-white/35 mt-1 font-medium">
                        Supports JPG, PNG, WebP (Max 10MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Image Preview Card */
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <div className="aspect-video relative overflow-hidden flex items-center justify-center bg-black/60">
                      <img
                        src={sourcePreviewUrl}
                        alt="Source Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px]">
                      <div className="truncate max-w-[200px]">
                        <p className="font-bold text-white truncate">{sourceFile?.name}</p>
                        <p className="text-white/40 text-[9px]">
                          {sourceFile ? (sourceFile.size / (1024 * 1024)).toFixed(2) + " MB" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-[9px] transition-all"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Editing Controls & Prompt Box */}
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5 backdrop-blur-sm space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wand2 className="w-3.5 h-3.5" /> 2. Editing Instructions
                  </span>
                </label>

                {/* Subject Name Input */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1.5 flex items-center justify-between">
                    <span>🏷️ Target Subject (e.g. Lamborghini Aventador, sports car)</span>
                    <span className="text-[9px] text-purple-300 font-bold">Helps preserve exact car model</span>
                  </label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={e => setSubjectName(e.target.value)}
                    placeholder="e.g. Lamborghini Aventador, Ferrari, sports car..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/25 outline-none focus:border-purple-400/50 transition-colors"
                  />
                </div>

                {/* Structure Preservation Switch */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-purple-400" /> Preserve Exact Geometry & Body Panels
                    </p>
                    <p className="text-[9px] text-white/35 mt-0.5">Keeps identical contours, headlights, spoiler, and wheel rims</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreserveStructure(p => !p)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 flex-shrink-0 ml-3",
                      preserveStructure ? "bg-purple-600" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-md transition-transform",
                      preserveStructure ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {/* Main Instruction Prompt */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1.5 block">
                    Desired Modifications:
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={e => setEditPrompt(e.target.value)}
                    placeholder="e.g. Change body color to glossy metallic ruby red, add studio automotive lighting..."
                    rows={3}
                    className="w-full bg-white/[0.02] border border-white/8 rounded-2xl p-3 text-white text-xs placeholder:text-white/20 resize-none outline-none focus:border-purple-500/40 leading-relaxed"
                  />
                </div>

                {/* Preset Suggestions */}
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">
                    ⚡ Quick Edit Ideas:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {EDIT_PRESETS.map((ep) => (
                      <button
                        key={ep.label}
                        onClick={() => setEditPrompt(ep.prompt)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-[9px] font-bold border transition-all active:scale-95",
                          editPrompt === ep.prompt
                            ? "bg-purple-600/30 border-purple-500/50 text-purple-200"
                            : "bg-white/[0.02] border-white/8 text-white/50 hover:bg-purple-500/10 hover:text-white"
                        )}
                      >
                        {ep.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pollinations Key & Exact Fidelity Switch */}
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-white">
                        Pollinations Edit Mode
                      </p>
                      <p className="text-[9px] text-white/40">
                        {pollenApiKey.trim()
                          ? "🟢 Pro Mode: Flux.1 Kontext Pro (Exact car & shape lock)"
                          : "⚡ Free Classic Mode (Generates artistic match with structure prompt)"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowKeySettings(s => !s)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[9px] font-bold transition-colors"
                  >
                    {showKeySettings ? "Hide Key" : pollenApiKey.trim() ? "Edit Key" : "+ Add Free Key"}
                  </button>
                </div>

                {showKeySettings && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      To lock the <strong className="text-white">exact vehicle body panels & pixels</strong>, enter your free Pollen API key from{" "}
                      <a
                        href="https://enter.pollinations.ai/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 underline font-semibold hover:text-purple-300"
                      >
                        enter.pollinations.ai/keys
                      </a>
                      . Without a key, the free classic engine creates an AI variation inspired by your car & prompt.
                    </p>
                    <input
                      type="password"
                      value={pollenApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPollenApiKey(val);
                        localStorage.setItem("pollinations_pollen_key", val);
                      }}
                      placeholder="Paste your Pollinations key (pk_... or sk_...)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 outline-none focus:border-purple-400/50 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Model Choice for Editing */}
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">
                  🤖 Editing Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setEditModel(m.id)}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition-all active:scale-95",
                        editModel === m.id
                          ? "bg-purple-600/20 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                          : "bg-white/[0.02] border-white/8 text-white/40 hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-black uppercase">{m.label}</span>
                        <span className="text-[8px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">{m.badge}</span>
                      </div>
                      <p className="text-[9px] text-white/30 truncate">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message Banner */}
              {editError && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{editError}</p>
                </div>
              )}

              {/* Edit Image Action Button */}
              <button
                onClick={performImageEdit}
                disabled={isEditing || !sourceFile || cooldown > 0}
                className={cn(
                  "w-full py-5 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]",
                  isEditing || !sourceFile || cooldown > 0
                    ? "bg-purple-700/40 border border-purple-500/30 text-purple-300/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]"
                )}
              >
                {isEditing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{editProgressStatus || "Editing Image..."}</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="w-4 h-4 animate-pulse text-amber-300" />
                    <span>Slot ready in {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Apply AI Edits</span>
                    <Zap className="w-4 h-4 text-yellow-300" />
                  </>
                )}
              </button>
            </div>

            {/* RIGHT: Before vs After & Result Showcase */}
            <div className="space-y-4">
              {lastEditedImage ? (
                /* Before & After Comparison Showcase */
                <div className="rounded-3xl border border-purple-500/30 bg-white/[0.02] p-5 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Latest Edit Result
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={performImageEdit}
                        disabled={isEditing || cooldown > 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-purple-400/40 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-all disabled:opacity-40"
                      >
                        <RefreshCw className={cn("w-3 h-3", isEditing && "animate-spin")} />
                        {cooldown > 0 ? `${cooldown}s` : "Regenerate"}
                      </button>
                      <button
                        onClick={() => downloadImage(lastEditedImage)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-[10px] font-black uppercase tracking-wider text-white transition-all"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>

                  {/* Side-by-Side comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Original Source */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 relative">
                      <div className="aspect-[4/3] flex items-center justify-center overflow-hidden">
                        <img
                          src={sourcePreviewUrl || lastEditedImage.sourceImageUrl}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-white/70">
                        Original
                      </span>
                    </div>

                    {/* Edited Result */}
                    <div className="rounded-2xl overflow-hidden border border-purple-500/40 bg-black/40 relative shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                      <div className="aspect-[4/3] flex items-center justify-center overflow-hidden relative">
                        <img
                          src={lastEditedImage.url}
                          alt="Edited AI"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-white">
                        AI Edited ✨
                      </span>
                      <button
                        onClick={() => setLightboxImg(lastEditedImage)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white/70 hover:text-white transition-all"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] text-white/40 flex items-center justify-between">
                    <p className="truncate max-w-[80%]">
                      <span className="text-white font-bold">Prompt:</span> {lastEditedImage.prompt}
                    </p>
                    <button
                      onClick={() => copyPrompt(lastEditedImage.prompt)}
                      className="text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Gallery of all results */}
              <div>{renderGallery()}</div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative w-full max-w-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  {lightboxImg.isEdit ? "Image-to-Image Edit" : `Seed: ${lightboxImg.seed}`}
                </span>
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

  // Helper function to render common gallery
  function renderGallery() {
    if (gallery.length === 0) {
      return (
        <div className="h-full min-h-[280px] sm:min-h-[450px] rounded-3xl border border-white/8 bg-white/[0.02] flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white/10 relative" />
          </div>
          <div>
            <p className="text-white/30 font-black uppercase tracking-widest text-sm">No creations yet</p>
            <p className="text-white/15 text-xs mt-1">
              {activeTab === "edit"
                ? "Upload an image and describe your changes ✨"
                : "Type a prompt and hit Generate ✨"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Gallery header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            {gallery.length} creation{gallery.length > 1 ? "s" : ""}
          </span>
          <button
            onClick={() => { setGallery([]); setLoadedIds(new Set()); setLastEditedImage(null); }}
            className="text-[10px] text-white/20 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Image grid */}
        <div className={cn(
          "grid gap-3",
          gallery.length === 1 ? "grid-cols-1 max-w-sm mx-auto sm:max-w-none" : "grid-cols-2"
        )}>
          {gallery.map((img) => (
            <div
              key={img.id}
              className="relative rounded-2xl overflow-hidden border border-white/8 bg-white/[0.02] aspect-[3/4]"
            >
              {!loadedIds.has(img.id) && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/10 animate-pulse flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white/20 animate-spin" />
                </div>
              )}
              <img
                src={img.url}
                alt="AI Output"
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  loadedIds.has(img.id) ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setLoadedIds(prev => new Set([...prev, img.id]))}
                onError={() => setLoadedIds(prev => new Set([...prev, img.id]))}
              />

              {/* Bottom action bar */}
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

              {/* Badge top-left */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                {img.isEdit && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-600 text-[8px] font-black uppercase tracking-wider text-white">
                    EDIT
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-white/60">
                  {img.model}
                </span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
};

export default AdultAIGenerator;
