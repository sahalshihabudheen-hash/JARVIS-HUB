import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaItem } from "@/lib/tmdb";
import MediaCard from "./MediaCard";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  mediaType?: "movie" | "tv";
  className?: string;
  isLoading?: boolean;
}

const MediaRow = ({ title, items, mediaType, className, isLoading }: MediaRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className={cn("py-6", className)}>
        <h2 className="text-xl md:text-2xl font-display font-bold mb-4 px-4 md:px-0">{title}</h2>
        <div className="flex gap-3 md:gap-4 overflow-hidden px-4 md:px-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36 md:w-44">
              <div className="aspect-[2/3] rounded-xl shimmer" />
              <div className="mt-3 h-4 w-3/4 rounded shimmer" />
              <div className="mt-2 h-3 w-1/2 rounded shimmer" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items?.length) return null;

  return (
    <section className={cn("py-6 relative group/row", className)}>
      <h2 className="text-xl md:text-2xl font-display font-bold mb-4 px-4 md:px-0">{title}</h2>
      
      {/* Scroll Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 translate-y-4 z-10 hidden md:flex opacity-0 group-hover/row:opacity-100 transition-opacity bg-background/80 hover:bg-background"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 translate-y-4 z-10 hidden md:flex opacity-0 group-hover/row:opacity-100 transition-opacity bg-background/80 hover:bg-background"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-0"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-36 md:w-44 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <MediaCard item={item} mediaType={mediaType} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MediaRow;
