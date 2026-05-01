import { Link, useNavigate } from "react-router-dom";
import { Play, Eye, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { toggleAdultWatchlist, isInAdultWatchlist } from "@/lib/adult-watchlist";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AdultCardProps {
  video: {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    views: number | string;
    rating: string | number;
    added?: string;
    source?: string;
  };
  className?: string;
}

/** Build a list of preview-frame thumbnail URLs to cycle through on hover.
 *  Pornhub stores thumbnails at different timestamps; we derive them by
 *  swapping the last numeric segment. For other sources we just return
 *  the main thumb so the cycling still "works" (same image). */
function getPreviewFrames(thumbnail: string): string[] {
  if (!thumbnail) return [];

  // Pornhub CDN thumbnails look like: .../1920/<id>/<frame>.jpg
  // We try frames 2-6 (index-based) by tweaking the last numeric filename
  const phMatch = thumbnail.match(/^(https?:\/\/[^?]+\/)(\d+)(\.jpg.*)$/i);
  if (phMatch) {
    const [, base, num, ext] = phMatch;
    const frameNum = parseInt(num, 10);
    // generate up to 6 frames around the original
    const frames: string[] = [];
    for (let i = 0; i < 6; i++) {
      frames.push(`${base}${frameNum + i * 2}${ext}`);
    }
    return frames;
  }

  // For any CDN that uses numbered filenames (redtube, eporner similar patterns)
  const numMatch = thumbnail.match(/^(.*?)(\d{1,4})(\.jpg.*)$/i);
  if (numMatch) {
    const [, pre, num, suf] = numMatch;
    const n = parseInt(num, 10);
    return [
      thumbnail,
      `${pre}${n + 2}${suf}`,
      `${pre}${n + 4}${suf}`,
      `${pre}${n + 6}${suf}`,
    ];
  }

  return [thumbnail];
}

const AdultCard = ({ video, className }: AdultCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previewFrame, setPreviewFrame] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewFrames = getPreviewFrames(video.thumbnail);

  // Detect touch/mobile device
  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  useEffect(() => {
    setIsSaved(isInAdultWatchlist(video.id, user?.uid));
  }, [video.id, user?.uid]);

  // Start cycling preview frames after a short delay
  const startPreview = useCallback(() => {
    hoverDelayRef.current = setTimeout(() => {
      setIsHovered(true);
      setPreviewFrame(0);
      if (previewFrames.length > 1) {
        hoverTimerRef.current = setInterval(() => {
          setPreviewFrame((f) => (f + 1) % previewFrames.length);
        }, 600); // cycle every 600ms — feels like YT scrub
      }
    }, 300); // 300ms hover delay before preview starts
  }, [previewFrames.length]);

  const stopPreview = useCallback(() => {
    if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
    if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
    setIsHovered(false);
    setPreviewFrame(0);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
      if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
    };
  }, []);

  const handleWatchLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleAdultWatchlist({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration,
    }, user?.uid);
    setIsSaved(added);
    toast(added ? "Added to Watch Later" : "Removed from Watch Later", {
      icon: added ? (
        <BookmarkCheck className="w-4 h-4 text-green-500" />
      ) : (
        <Bookmark className="w-4 h-4" />
      ),
    });
  };

  const watchUrl = `/hub/watch/${video.id}?source=${video.source || "pornhub"}`;
  const activeThumbnail = previewFrames[previewFrame] ?? video.thumbnail;
  const proxiedThumb = (src: string) =>
    `/api/image?url=${encodeURIComponent(src)}`;

  return (
    <>
      <div
        className={cn(
          "group relative block rounded-2xl overflow-hidden transition-all duration-700 hover:scale-[1.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#050505] border border-white/5 cursor-pointer",
          className
        )}
        onMouseEnter={!isTouchDevice ? startPreview : undefined}
        onMouseLeave={!isTouchDevice ? stopPreview : undefined}
        onClick={() => navigate(watchUrl)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && navigate(watchUrl)}
      >
        {/* Premium Prism Border (Hover) */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-[5] overflow-hidden">
          <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0,rgba(236,72,153,0.1)_25%,transparent_50%,rgba(168,85,247,0.1)_75%,transparent_100%)] animate-[spin_5s_linear_infinite]" />
        </div>

        {/* ── Thumbnail area ── */}
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {/* Main / cycling preview thumbnail */}
          <img
            src={proxiedThumb(isHovered ? activeThumbnail : video.thumbnail)}
            alt={video.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              isHovered ? "scale-[1.1]" : "scale-100 group-hover:scale-110"
            )}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = proxiedThumb(video.thumbnail);
            }}
          />

          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {/* Preview progress bar */}
          {isHovered && previewFrames.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
              <div
                className="h-full bg-pink-500 transition-all duration-500 shadow-[0_0_10px_#ec4899]"
                style={{
                  width: `${((previewFrame + 1) / previewFrames.length) * 100}%`,
                }}
              />
            </div>
          )}

          {/* "PREVIEW" badge */}
          {isHovered && (
            <div className="absolute top-3 left-3 z-20 animate-in zoom-in-95 fade-in duration-300">
              <span className="px-2.5 py-1 rounded-lg bg-pink-600/90 backdrop-blur-md text-[8px] font-black tracking-[0.2em] uppercase text-white shadow-xl border border-white/20">
                Live Preview
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent transition-opacity duration-500",
              isHovered ? "opacity-80" : "opacity-40 group-hover:opacity-60"
            )}
          />

          {/* Desktop play button overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-500 z-10",
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-90"
            )}
          >
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl transition-transform hover:scale-110">
              <Play className="w-6 h-6 text-white fill-current ml-1 drop-shadow-lg" />
            </div>
          </div>

          {/* Rating Badge */}
          {video.rating && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              <button
                onClick={handleWatchLater}
                className={cn(
                  "p-2 rounded-xl backdrop-blur-md border transition-all duration-300",
                  isSaved
                    ? "bg-pink-500/20 text-pink-500 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                    : "bg-black/40 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-[10px] font-black text-yellow-400 bg-black/40 border border-yellow-500/20 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                <span>{video.rating}%</span>
              </div>
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-[9px] font-black text-white/90 bg-black/60 border border-white/10 z-10 tracking-widest shadow-lg">
            {video.duration}
          </div>
        </div>

        {/* ── Info row ── */}
        <div className="p-5 space-y-3 bg-[#050505] relative z-10">
          <h3 className="font-display font-bold text-sm line-clamp-1 leading-snug group-hover:text-pink-400 transition-colors tracking-tight">
            {video.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-blue-500" />
                <span>{video.views}</span>
              </div>
              {video.source && (
                <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] text-white/20">
                  {video.source.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-pink-500/50 group-hover:text-pink-500 transition-colors">
               <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-widest">Premium</span>
            </div>
          </div>
        </div>
      </div>


      {/* ── Mobile full-screen preview modal ── */}
      {mobilePreviewOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md md:hidden animate-in fade-in duration-200"
          onClick={() => setMobilePreviewOpen(false)}
        >
          {/* Close hint */}
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4 font-bold">
            Tap anywhere to close
          </p>

          {/* Thumbnail cycle for mobile preview */}
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-4">
            <MobilePreviewCycler
              frames={previewFrames}
              proxy={proxiedThumb}
              mainThumb={video.thumbnail}
            />

            {/* Watch now overlay */}
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <Link
                to={watchUrl}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white text-sm font-bold shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:bg-red-500 transition-colors active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Now
              </Link>
            </div>
          </div>

          <p className="text-xs text-white/50 mt-4 px-8 text-center line-clamp-2 max-w-xs">
            {video.title}
          </p>
        </div>
      )}
    </>
  );
};

/** Inner component that cycles frames in the mobile preview modal */
function MobilePreviewCycler({
  frames,
  proxy,
  mainThumb,
}: {
  frames: string[];
  proxy: (src: string) => string;
  mainThumb: string;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (frames.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % frames.length), 700);
    return () => clearInterval(t);
  }, [frames.length]);

  return (
    <div className="relative aspect-video w-full bg-black">
      <img
        src={proxy(frames[idx] ?? mainThumb)}
        alt="Preview"
        className="w-full h-full object-cover"
        onError={(e) =>
          ((e.currentTarget as HTMLImageElement).src = proxy(mainThumb))
        }
      />
      {/* progress bar */}
      {frames.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
          <div
            className="h-full bg-red-500 transition-all duration-600"
            style={{ width: `${((idx + 1) / frames.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default AdultCard;
