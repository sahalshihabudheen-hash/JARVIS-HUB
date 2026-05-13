import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { MediaItem, getImageUrl, getTrailerKey } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { useTutorial } from "@/context/TutorialContext";

interface MediaCardProps {
  item: MediaItem;
  mediaType?: "movie" | "tv";
  className?: string;
  showRating?: boolean;
}

const MediaCard = ({ item, mediaType, className, showRating = true }: MediaCardProps) => {
  const navigate = useNavigate();
  const { isActive, step, nextStep } = useTutorial();
  const type = mediaType || item.media_type || "movie";
  const title = item.title || item.name || "Untitled";
  const year = (item.release_date || item.first_air_date || "").split("-")[0];
  const rating = item.vote_average?.toFixed(1) || "N/A";
  const linkPath = type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;

  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(async () => {
      setIsHovered(true);
      if (!trailerKey) {
        const key = await getTrailerKey(type, item.id);
        if (key) setTrailerKey(key);
      }
    }, 600);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  return (
    <Link
      to={linkPath}
      className={cn(
        "group relative block rounded-2xl overflow-hidden transition-all duration-500 googletv-focus bg-card border border-white/5",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow Effect (Hover) */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[15] shadow-[0_0_30px_rgba(var(--primary),0.3)]" />

      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
        <img
          src={getImageUrl(item.poster_path)}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            isHovered && trailerKey ? "opacity-0" : "opacity-100 group-hover:scale-110"
          )}
          loading="lazy"
        />

        {/* Video Preview */}
        {isHovered && trailerKey && (
          <div className="absolute inset-0 bg-black animate-in fade-in duration-500 z-10 pointer-events-none overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&origin=${window.location.origin}`}
              className="w-[300%] h-[300%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isActive && step === 1) nextStep();
              navigate(type === "movie" ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}/1/1`);
            }}
            className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20 transform scale-75 group-hover:scale-100 transition-transform duration-500 hover:bg-primary/40 pointer-events-auto"
          >
            <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
          </button>
        </div>

        {/* Rating Badge */}
        {showRating && item.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md glass text-[10px] font-bold z-20">
            <Star className="w-3 h-3 fill-white text-white" />
            <span>{rating}</span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-white/80 text-[9px] font-bold uppercase tracking-wider border border-white/10 z-20">
          {type === "tv" ? "TV" : "Movie"}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-card relative z-20 border-t border-white/5">
        <h3 className="font-medium text-xs truncate text-white/90 group-hover:text-white transition-colors">
          {title}
        </h3>
        {year && (
          <p className="text-[10px] text-white/40 mt-0.5">{year}</p>
        )}
      </div>
    </Link>

  );
};

export default MediaCard;
