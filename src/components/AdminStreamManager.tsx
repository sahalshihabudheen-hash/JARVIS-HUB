import { useState, useEffect } from "react";
import { Search, Plus, Trash2, ExternalLink, Film, Tv, Link2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  saveCustomStream,
  deleteCustomStream,
  listCustomStreams,
  CustomStream,
  StreamType,
} from "@/lib/custom-streams";
import { searchMulti, getImageUrl } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/tmdb";
import { useAuth } from "@/context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "add" | "manage";

// ─── Component ────────────────────────────────────────────────────────────────

const AdminStreamManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("add");

  // ── Add stream state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const [streamUrl, setStreamUrl] = useState("");
  const [streamType, setStreamType] = useState<StreamType>("iframe");
  const [language, setLanguage] = useState("ml");
  const [quality, setQuality] = useState("720p");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ── Manage streams state ──────────────────────────────────────────────────
  const [streams, setStreams] = useState<CustomStream[]>([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState(false);

  // ─── Search TMDB ──────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      setIsSearching(true);
      try {
        const res = await searchMulti(searchQuery);
        setSearchResults(res.results.filter(r => r.media_type === "movie" || r.media_type === "tv").slice(0, 8));
      } catch { setSearchResults([]); }
      finally { setIsSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ─── Load streams list ────────────────────────────────────────────────────
  const loadStreams = async () => {
    setIsLoadingStreams(true);
    try {
      const list = await listCustomStreams();
      setStreams(list);
    } catch { toast.error("Failed to load streams"); }
    finally { setIsLoadingStreams(false); }
  };

  useEffect(() => {
    if (activeTab === "manage") loadStreams();
  }, [activeTab]);

  // ─── Save stream ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedMedia) { toast.error("Select a movie/show first"); return; }
    if (!streamUrl.trim()) { toast.error("Paste a stream URL"); return; }
    setIsSaving(true);
    try {
      await saveCustomStream({
        tmdbId: selectedMedia.id,
        mediaType: (selectedMedia.media_type as "movie" | "tv") || "movie",
        title: selectedMedia.title || selectedMedia.name || "Unknown",
        posterPath: selectedMedia.poster_path || undefined,
        streamUrl: streamUrl.trim(),
        streamType,
        language,
        quality,
        note: note.trim() || undefined,
        addedBy: user?.email || "admin",
      });
      toast.success(`✅ Stream saved for "${selectedMedia.title || selectedMedia.name}"`, {
        style: { background: "#0a1628", border: "1px solid #22c55e", color: "#22c55e" }
      });
      // Reset
      setSelectedMedia(null);
      setSearchQuery("");
      setStreamUrl("");
      setNote("");
    } catch (e) {
      toast.error("Failed to save stream");
    }
    setIsSaving(false);
  };

  // ─── Delete stream ─────────────────────────────────────────────────────────
  const handleDelete = async (stream: CustomStream) => {
    try {
      await deleteCustomStream(stream.mediaType, stream.tmdbId);
      toast.success(`Removed stream for "${stream.title}"`);
      setStreams(prev => prev.filter(s => s.id !== stream.id));
    } catch {
      toast.error("Failed to delete stream");
    }
  };

  // ─── Stream type configs ───────────────────────────────────────────────────
  const streamTypeOptions: { id: StreamType; label: string; hint: string }[] = [
    { id: "iframe",  label: "Embed/iFrame", hint: "Any embed URL (e.g. from player sites)" },
    { id: "mp4",    label: "MP4 Direct",   hint: "Direct .mp4 / .mkv link" },
    { id: "hls",    label: "HLS Stream",   hint: ".m3u8 playlist URL" },
    { id: "magnet", label: "Magnet Link",  hint: "magnet:?xt=... (torrent)" },
  ];

  const langOptions = [
    { id: "ml", label: "Malayalam 🇮🇳" },
    { id: "en", label: "English" },
    { id: "hi", label: "Hindi" },
    { id: "ta", label: "Tamil" },
    { id: "te", label: "Telugu" },
  ];

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
      
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <Link2 className="text-green-400 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white/90 tracking-tight">Custom Streams</h2>
            <p className="text-xs text-white/40 mt-0.5">Add or manage manual stream links for movies and shows</p>
          </div>
        </div>
        <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          {(["add", "manage"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === t ? "bg-green-500/20 text-green-400" : "text-white/30 hover:text-white/60"
              )}
            >
              {t === "add" ? "Add New" : "Manage"}
            </button>
          ))}
        </div>
      </div>

      {/* ── ADD TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === "add" && (
        <div className="p-6 space-y-6">

          {/* Step 1: Search Movie */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-[10px] flex items-center justify-center font-black">1</span>
              Search Movie / TV Show
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedMedia(null); }}
                placeholder="Type movie name... (e.g. Aadujeevitham)"
                className="pl-9 bg-black/40 border-white/10 focus-visible:ring-green-500/50 rounded-xl h-11"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedMedia && (
              <div className="mt-2 rounded-xl border border-white/5 overflow-hidden bg-black/60 backdrop-blur-md">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedMedia(item); setSearchQuery(item.title || item.name || ""); setSearchResults([]); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/[0.03] last:border-0"
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      {item.poster_path
                        ? <img src={getImageUrl(item.poster_path, "w92")} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">{item.media_type === "tv" ? <Tv className="w-4 h-4 text-white/10" /> : <Film className="w-4 h-4 text-white/10" />}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.title || item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-1.5 py-0.5 rounded border",
                          item.media_type === "movie" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        )}>{item.media_type}</span>
                        <span className="text-[11px] text-white/30">{item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}</span>
                        <span className="text-[11px] text-white/20">ID: {item.id}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Media Badge */}
            {selectedMedia && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-300">{selectedMedia.title || selectedMedia.name}</p>
                  <p className="text-[10px] text-green-500/60 uppercase tracking-widest">TMDB #{selectedMedia.id} · {selectedMedia.media_type}</p>
                </div>
                <button onClick={() => { setSelectedMedia(null); setSearchQuery(""); }} className="text-white/20 hover:text-white/60 transition-colors text-xs">✕</button>
              </div>
            )}
          </div>

          {/* Step 2: Stream URL */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-[10px] flex items-center justify-center font-black">2</span>
              Paste Stream URL
            </label>
            <Input
              value={streamUrl}
              onChange={e => setStreamUrl(e.target.value)}
              placeholder="https://... or magnet:?xt=..."
              className="bg-black/40 border-white/10 focus-visible:ring-green-500/50 rounded-xl h-11 font-mono text-sm"
            />
            <p className="text-[10px] text-white/20 mt-1.5 leading-relaxed">
              Supports any valid video URL, including direct links and embed players.
            </p>
          </div>

          {/* Step 3: Stream Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-[10px] flex items-center justify-center font-black">3</span>
              Stream Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {streamTypeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setStreamType(opt.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    streamType === opt.id
                      ? "bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                      : "bg-black/30 border-white/5 hover:border-white/10"
                  )}
                >
                  <p className={cn("text-xs font-bold", streamType === opt.id ? "text-green-300" : "text-white/60")}>{opt.label}</p>
                  <p className="text-[9px] text-white/20 mt-0.5 leading-tight">{opt.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Language + Quality + Note */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-sm text-white focus:ring-green-500/50 focus:outline-none"
              >
                {langOptions.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Quality</label>
              <select
                value={quality}
                onChange={e => setQuality(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-sm text-white focus:ring-green-500/50 focus:outline-none"
              >
                {["CAM", "HDCam", "480p", "720p", "1080p", "4K"].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Note (optional)</label>
              <Input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. From Telegram"
                className="bg-black/40 border-white/10 focus-visible:ring-green-500/50 rounded-xl h-10 text-sm"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !selectedMedia || !streamUrl.trim()}
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] disabled:opacity-30"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" /> Save Custom Stream</>
            )}
          </Button>

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-400/80 leading-relaxed">
              Once saved, this stream will be available for all users on the content's watch page.
            </p>
          </div>
        </div>
      )}

      {/* ── MANAGE TAB ──────────────────────────────────────────────────────── */}
      {activeTab === "manage" && (
        <div className="p-6">
          {isLoadingStreams ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
              <p className="text-xs text-white/20 uppercase tracking-widest">Loading streams...</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Link2 className="w-7 h-7 text-white/10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No custom streams yet</p>
                <p className="text-xs text-white/10 mt-1">Add a stream in the "Add New" tab</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-4">{streams.length} custom streams saved</p>
              {streams.map(stream => (
                <div key={stream.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-green-500/20 transition-all group">
                  {/* Poster */}
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/5">
                    {stream.posterPath
                      ? <img src={getImageUrl(stream.posterPath, "w92")} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          {stream.mediaType === "tv" ? <Tv className="w-4 h-4 text-white/10" /> : <Film className="w-4 h-4 text-white/10" />}
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{stream.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded border bg-green-500/10 border-green-500/20 text-green-400">{stream.language}</span>
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded border bg-white/5 border-white/10 text-white/40">{stream.quality}</span>
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded border bg-blue-500/10 border-blue-500/20 text-blue-400">{stream.streamType}</span>
                    </div>
                    <p className="text-[10px] text-white/20 mt-1 font-mono truncate">{stream.streamUrl}</p>
                    {stream.note && <p className="text-[10px] text-white/30 mt-0.5 italic">{stream.note}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={stream.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                      title="Test link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(stream)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                      title="Delete stream"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStreamManager;
