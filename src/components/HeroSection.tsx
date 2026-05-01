import { useState, useEffect, useRef, TouchEvent } from "react";
import { Link } from "react-router-dom";
import { Play, Info, Star } from "lucide-react";
import { MediaItem, getBackdropUrl } from "@/lib/tmdb";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useTutorial } from "@/context/TutorialContext";

interface HeroSectionProps {
  items: MediaItem[];
  isLoading?: boolean;
}

const HeroSection = ({ items, isLoading }: HeroSectionProps) => {
  const { isActive, step, nextStep } = useTutorial();
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
  const watchPath = type === "movie" ? `/watch/movie/${current.id}` : `/watch/tv/${current.id}/1/1`;

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
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse-glow" />

      {/* Content */}
      <div className="container relative h-full flex items-end pb-20 md:pb-32 z-20">
        <div className={cn(
          "max-w-3xl transition-all duration-1000 ease-out",
          animating ? "opacity-0 translate-y-8 scale-95" : "opacity-100 translate-y-0 scale-100"
        )}>
          {/* Badge */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-highlight/20 backdrop-blur-md border border-highlight/30 text-highlight text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              Featured Intelligence
            </div>
            {rating && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span>{rating}</span>
              </div>
            )}
            {year && <span className="text-xs font-black text-white/40 uppercase tracking-widest">{year}</span>}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-8xl font-display font-black mb-6 leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-white/60 text-sm md:text-lg leading-relaxed mb-8 line-clamp-3 max-w-2xl font-medium italic">
            {current.overview}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-6">
            <Link to={watchPath} className="group/btn relative">
              {/* Prism Border Effect */}
              <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,transparent_0,rgba(59,130,246,0.5)_25%,transparent_50%,rgba(147,51,234,0.5)_75%,transparent_100%)] animate-[spin_3s_linear_infinite] opacity-0 group-hover/btn:opacity-100 transition-opacity blur-[2px]" />
              <Button 
                id="hero-watch-btn"
                size="lg" 
                className="relative h-16 px-10 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-[0.2em] text-xs transition-transform active:scale-95 shadow-2xl"
                onClick={() => {
                  if (isActive && step === 2) nextStep();
                }}
              >
                <Play className="w-5 h-5 mr-3 fill-current" />
                Watch Now
              </Button>
            </Link>
            <Link to={linkPath}>
              <Button 
                id="hero-more-info-btn"
                size="lg" 
                variant="outline" 
                className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-black uppercase tracking-[0.2em] text-xs text-white/70 hover:text-white"
              >
                <Info className="w-5 h-5 mr-3" />
                Data Archive
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
