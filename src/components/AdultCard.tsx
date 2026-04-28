import { Link, useNavigate } from "react-router-dom";
import { Play, Eye, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { toggleAdultWatchlist, isInAdultWatchlist } from "@/lib/adult-watchlist";
import { toast } from "sonner";

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
    setIsSaved(isInAdultWatchlist(video.id));
  }, [video.id]);

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
    });
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
          "group relative block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-card-hover bg-card border border-white/5 cursor-pointer",
          className
        )}
        onMouseEnter={!isTouchDevice ? startPreview : undefined}
        onMouseLeave={!isTouchDevice ? stopPreview : undefined}
        onClick={() => navigate(watchUrl)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && navigate(watchUrl)}
      >
        {/* ── Thumbnail area ── */}
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {/* Main / cycling preview thumbnail */}
          <img
            src={proxiedThumb(isHovered ? activeThumbnail : video.thumbnail)}
            alt={video.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              isHovered ? "scale-[1.06]" : "scale-100 group-hover:scale-105"
            )}
            loading="lazy"
            // Fall back to original thumb if preview frame 404s
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = proxiedThumb(
                video.thumbnail
              );
            }}
          />

          {/* Preview progress bar — shown when cycling */}
          {isHovered && previewFrames.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{
                  width: `${((previewFrame + 1) / previewFrames.length) * 100}%`,
                }}
              />
            </div>
          )}

          {/* "PREVIEW" badge */}
          {isHovered && (
            <div className="absolute top-2 left-2 z-20 animate-in fade-in duration-200">
              <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-[9px] font-black tracking-widest uppercase text-white shadow-lg">
                Preview
              </span>
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent transition-opacity duration-300",
              isHovered ? "opacity-70" : "opacity-0 group-hover:opacity-40"
            )}
          />

          {/* Desktop play button overlay */}
          <div
            className={cn(
              "absolute inset-0 items-center justify-center hidden md:flex transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate(watchUrl);
              }}
              className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-glow transform scale-75 group-hover:scale-100 transition-transform duration-300 hover:bg-red-500 cursor-pointer"
            >
              <Play className="w-6 h-6 text-white fill-current ml-1" />
            </div>
          </div>

          {/* ── Mobile Eye button ── always visible on touch devices ── */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobilePreviewOpen(true);
            }}
            className={cn(
              "absolute bottom-10 right-2 z-30 md:hidden",
              "w-9 h-9 rounded-full glass border border-white/20 flex items-center justify-center",
              "bg-black/60 backdrop-blur-sm shadow-lg",
              "active:scale-95 transition-transform"
            )}
            aria-label="Preview video"
          >
            <Eye className="w-4 h-4 text-white/90" />
          </button>

          {/* Top-right: watchlist + rating */}
          {video.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
              <button
                onClick={handleWatchLater}
                className={cn(
                  "p-2 rounded-lg glass transition-all duration-300",
                  isSaved
                    ? "bg-red-500/20 text-red-500 border-red-500/30"
                    : "hover:bg-white/10 text-white/60"
                )}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md glass text-[10px] font-black text-yellow-500 bg-yellow-500/10 border-yellow-500/20">
                <span>{video.rating}%</span>
              </div>
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md glass text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-sm z-10">
            {video.duration}
          </div>
        </div>

        {/* ── Info row ── */}
        <div className="p-4 space-y-2 bg-gradient-to-b from-transparent to-white/[0.02]">
          <h3 className="font-medium text-sm line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{video.views}</span>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              <Play className="w-4 h-4 fill-current" />
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
