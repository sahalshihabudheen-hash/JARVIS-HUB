import { Link } from "react-router-dom";
import { Play, Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
            to={`/watch/adult/${video.id}`}
            className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-glow transform scale-75 group-hover:scale-100 transition-transform duration-300 pointer-events-auto"
          >
            <Play className="w-6 h-6 text-white fill-current ml-1" />
          </Link>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md glass text-[10px] font-medium">
          <Clock className="w-3 h-3" />
          <span>{video.duration}</span>
        </div>

        {/* Rating Badge */}
        {video.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md glass text-xs font-medium text-yellow-400">
            <span>{video.rating}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-400 transition-colors h-10" title={video.title}>
          {video.title}
        </h3>
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{video.views}</span>
          </div>
          {video.added && <span>{video.added}</span>}
        </div>
      </div>
    </div>
  );
};

export default AdultCard;
