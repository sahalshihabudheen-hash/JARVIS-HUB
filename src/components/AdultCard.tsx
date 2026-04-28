import { Link } from "react-router-dom";
import { Play, Eye, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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
  };
  className?: string;
}

const AdultCard = ({ video, className }: AdultCardProps) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isInAdultWatchlist(video.id));
  }, [video.id]);

  const handleWatchLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleAdultWatchlist({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration
    });
    setIsSaved(added);
    toast(added ? "Added to Watch Later" : "Removed from Watch Later", {
      icon: added ? <BookmarkCheck className="w-4 h-4 text-green-500" /> : <Bookmark className="w-4 h-4" />
    });
  };

  return (
    <div
      className={cn(
        "group relative block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover bg-card border border-white/5",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-secondary">
        <img
          src={`/api/image?url=${encodeURIComponent(video.thumbnail)}`}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Link 
            to={`/hub/watch/${video.id}?source=${(video as any).source || 'pornhub'}`}
            className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-glow transform scale-75 group-hover:scale-100 transition-transform duration-300 pointer-events-auto"
          >
            <Play className="w-6 h-6 text-white fill-current ml-1" />
          </Link>
        </div>

        {/* Rating Badge */}
        {video.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <button 
              onClick={handleWatchLater}
              className={cn(
                "p-2 rounded-lg glass transition-all duration-300",
                isSaved ? "bg-red-500/20 text-red-500 border-red-500/30" : "hover:bg-white/10 text-white/60"
              )}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md glass text-[10px] font-black text-yellow-500 bg-yellow-500/10 border-yellow-500/20">
              <span>{video.rating}%</span>
            </div>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md glass text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-sm">
          {video.duration}
        </div>
      </div>

      {/* Info */}
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
  );
};

export default AdultCard;
