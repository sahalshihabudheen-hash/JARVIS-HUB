import { useState, useEffect, useRef, TouchEvent } from "react";
import { Link } from "react-router-dom";
import { Play, Info, Star } from "lucide-react";
import { MediaItem, getBackdropUrl } from "@/lib/tmdb";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  items: MediaItem[];
  isLoading?: boolean;
}

const HeroSection = ({ items, isLoading }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const pendingIndex = useRef<number | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const featured = items.slice(0, 5);
  const current = featured[displayIndex];

  const changeSlide = (index: number) => {
    if (index === currentIndex || animating) return;
    setAnimating(true);
    pendingIndex.current = index;
    setCurrentIndex(index);
    // After fade-out (500ms), swap content and fade back in
    setTimeout(() => {
      setDisplayIndex(index);
      setAnimating(false);
      pendingIndex.current = null;
    }, 500);
  };

  const goToSlide = (index: number) => changeSlide(index);

  const goNext = () => {
    const next = (currentIndex + 1) % featured.length;
    changeSlide(next);
  };

  const goPrev = () => {
    const prev = (currentIndex - 1 + featured.length) % featured.length;
    changeSlide(prev);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(goNext, 8000);
    return () => clearInterval(interval);
  }, [featured.length, currentIndex]);

  if (isLoading) {
    return (
      <div className="relative h-[70vh] md:h-[85vh] shimmer">
        <div className="absolute inset-0 gradient-hero" />
      </div>
    );
  }

  if (!current) return null;

  const title = current.title || current.name || "Untitled";
  const type = current.media_type || "movie";
  const year = (current.release_date || current.first_air_date || "").split("-")[0];
  const rating = current.vote_average?.toFixed(1);
  const linkPath = type === "movie" ? `/movie/${current.id}` : `/tv/${current.id}`;
  const watchPath = type === "movie" ? `/watch/movie/${current.id}` : `/tv/${current.id}`;

  return (
    <section 
      className="relative h-[70vh] md:h-[85vh] overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div className={cn(
        "absolute inset-0 transition-all duration-500 ease-in-out",
        animating ? "opacity-0 scale-105" : "opacity-100 scale-100"
      )}>
        <img
          src={getBackdropUrl(current.backdrop_path)}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Glow Effect */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 gradient-glow opacity-50 animate-pulse-glow" />

      {/* Content */}
      <div className="container relative h-full flex items-end pb-20 md:pb-32">
        <div className={cn(
          "max-w-2xl transition-all duration-500 ease-in-out",
          animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          {/* Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-highlight text-background text-xs font-semibold uppercase tracking-wider">
              Featured
            </span>
            {rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{rating}</span>
              </div>
            )}
            {year && <span className="text-sm text-muted-foreground">{year}</span>}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
            {current.overview}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link to={watchPath}>
              <Button size="lg" className="hover-glow">
                <Play className="w-5 h-5 mr-2 fill-current" />
                Watch Now
              </Button>
            </Link>
            <Link to={linkPath}>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-8 right-8 flex gap-2">
          {featured.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-foreground"
                  : "bg-muted-foreground/50 hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
