import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { MediaItem, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: MediaItem;
  mediaType?: "movie" | "tv";
  className?: string;
  showRating?: boolean;
}

const MediaCard = ({ item, mediaType, className, showRating = true }: MediaCardProps) => {
  const type = mediaType || item.media_type || "movie";
  const title = item.title || item.name || "Untitled";
  const year = (item.release_date || item.first_air_date || "").split("-")[0];
  const rating = item.vote_average?.toFixed(1) || "N/A";
  const linkPath = type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;

  return (
    <Link
      to={linkPath}
      className={cn(
        "group relative block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover",
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
        <img
          src={getImageUrl(item.poster_path)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-glow transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
          </div>
        </div>

        {/* Rating Badge */}
        {showRating && item.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md glass text-xs font-medium">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{rating}</span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-highlight/90 text-background text-xs font-medium uppercase">
          {type === "tv" ? "TV" : "Movie"}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-card">
        <h3 className="font-medium text-sm truncate group-hover:text-highlight transition-colors">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-muted-foreground mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
};

export default MediaCard;
