import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Activity, Search, Layout, Heart, Settings as SettingsIcon, ShieldAlert, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import { useTutorial } from "@/context/TutorialContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import "@/tutorial.css";

const Typewriter = ({ text, speed = 20, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <span>{displayedText}</span>;
};

const Spotlight = ({ x, y, width, height, padding = 10 }: { x: number, y: number, width: number, height: number, padding?: number }) => {
  const rect = {
    top: y - padding,
    left: x - padding,
    width: width + padding * 2,
    height: height + padding * 2
  };

  return (
    <div className="fixed inset-0 z-[1400] pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" style={{
        clipPath: `polygon(
          0% 0%, 
          0% 100%, 
          ${rect.left}px 100%, 
          ${rect.left}px ${rect.top}px, 
          ${rect.left + rect.width}px ${rect.top}px, 
          ${rect.left + rect.width}px ${rect.top + rect.height}px, 
          ${rect.left}px ${rect.top + rect.height}px, 
          ${rect.left}px 100%, 
          100% 100%, 
          100% 0%
        )`
      }} />
      <div 
        className="absolute border-2 border-primary shadow-[0_0_30px_rgba(34,211,238,0.5)] rounded-2xl animate-pulse"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }}
      />
    </div>
  );
};

const GenreButton = ({ genre }: { genre: any }) => {
  const { selectedGenres, updateSelectedGenres } = useTutorial();
  const isSelected = selectedGenres.includes(genre.id);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelected) {
      updateSelectedGenres(selectedGenres.filter(id => id !== genre.id));
    } else {
      updateSelectedGenres([...selectedGenres, genre.id]);
    }
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 group relative overflow-hidden",
        isSelected 
          ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105" 
          : "bg-white/5 border-white/10 hover:border-white/30"
      )}
    >
      <span className="text-xl group-hover:scale-125 transition-transform duration-500">{genre.icon}</span>
      <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/90">{genre.name}</span>
    </button>
  );
};

const JarvisTutorial = () => {
  const { isActive, step, nextStep, setStep, completeTutorial, startTutorial } = useTutorial();
  const { user } = useAuth();
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [coords, setCoords] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  const steps = [
    {
      target: null,
      title: "System Initialization",
      description: "Welcome to JARVIS HUB. Protocol Alpha-1 is now active. I am J.A.R.V.I.S., your local intelligence unit. I will guide you through your new command center.",
      icon: Activity
    },
    {
      target: "navbar-logo",
      title: "The HUB Core",
      description: "This is your central neural link. Tapping here will always return you to the main dashboard sector.",
      icon: Activity
    },
    {
      target: "navbar-links",
      title: "Sector Navigation",
      description: "Access specialized data streams: Movies, TV Shows, and Anime. My neural network prioritizes high-bandwidth mirrors for these categories.",
      icon: Layout
    },
    {
      target: "navbar-search",
      title: "Global Intelligence",
      description: "Scan the entire HUB database. Search for titles, actors, or directors to find specific data points instantly.",
      icon: Search
    },
    {
      target: null,
      title: "Priority Calibration",
      description: "Select your preferred genre frequencies. I will prioritize these data streams in your personalized HUB layout.",
      icon: Cpu,
      interactive: "genres"
    },
    {
      target: "watchlist-row",
      title: "Tactical Watchlist",
      description: "Mark your targets for future surveillance. Use the heart icon on any media card to add it to your priority watchlist.",
      icon: Heart
    },
    {
      target: null,
      title: "Stealth Protocol",
      description: "I recommend using a Stealth Shield (Ad Blocker) or the Brave Sector. Most mirrors contain aggressive pop-up scripts that I cannot fully neutralize.",
      icon: ShieldAlert
    },
    {
      target: "settings-btn",
      title: "Deep Configuration",
      description: "Fine-tune your experience. Adjust regional focus, UI theme protocols, and security settings here.",
      icon: SettingsIcon
    },
    {
      target: null,
      title: "Authorization Verified",
      description: "Calibration successful. All protocols are green. You are now authorized for full HUB immersion. Terminating assistant...",
      icon: ShieldAlert
    }
  ];

  useEffect(() => {
    if (!user) return;
    const hasSeenTutorial = localStorage.getItem("jarvis_tutorial_complete");
    if (!hasSeenTutorial && !isActive) {
      setTimeout(() => startTutorial(), 3000);
    }
  }, [user]);

  useEffect(() => {
    setIsTypingComplete(false);
    
    const currentStep = steps[step];
    if (currentStep?.target) {
      const element = document.getElementById(currentStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setCoords(null);
      }
    } else {
      setCoords(null);
    }
  }, [step, isActive]);

  if (!user || !isActive) return null;

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const isBelow = coords ? (coords.y + coords.height + 400 < window.innerHeight) : false;
  const balloonTop = coords 
    ? (isBelow ? coords.y + coords.height + 30 : coords.y - 340)
    : 0;
  const balloonLeft = coords
    ? Math.min(Math.max(20, coords.x + coords.width/2 - 160), window.innerWidth - 340)
    : 0;

  return createPortal(
    <div className="fixed inset-0 z-[1500] pointer-events-none select-none">
      {coords && (
        <Spotlight 
          x={coords.x} 
          y={coords.y} 
          width={coords.width} 
          height={coords.height} 
        />
      )}

      {/* Backdrop for non-target steps */}
      {!coords && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="absolute inset-0 grid-overlay opacity-20" />
        </div>
      )}

      <div className={cn(
        "absolute transition-all duration-500 pointer-events-auto",
        coords 
          ? "z-[1600]" 
          : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      )}
      style={coords ? {
        top: balloonTop,
        left: balloonLeft
      } : {}}
      >
        <div className="tour-balloon border-primary/40 glow-yellow relative">
          {/* Progress Indicator */}
          <div className="absolute -top-3 -right-3 px-3 py-1 bg-primary text-black text-[10px] font-black rounded-full shadow-lg z-10">
            {step + 1}/{steps.length}
          </div>

          {/* Tour Nib (Arrow) */}
          {coords && (
            <div 
              className={cn(
                "tour-nib z-[-1]",
                isBelow ? "-top-2 left-1/2 -translate-x-1/2 rotate-45" : "-bottom-2 left-1/2 -translate-x-1/2 rotate-[225deg]"
              )}
            />
          )}

          <div className="flex items-start gap-4 mb-4">
            <div className="tour-header-icon bg-primary/20 border border-primary/40">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">J.A.R.V.I.S Unit-01</div>
              <h3 className="text-lg font-display font-bold text-white tracking-tight">{currentStep.title}</h3>
            </div>
          </div>

          <p className="text-white/80 text-sm leading-relaxed mb-6">
            <Typewriter 
              text={currentStep.description} 
              onComplete={() => setIsTypingComplete(true)}
            />
          </p>

          {/* Interactive Genre Selection Section */}
          {currentStep.interactive === "genres" && isTypingComplete && (
            <div className="grid grid-cols-5 gap-2 mb-6 animate-scale-in">
                {[
                  { id: 28, name: "Action", icon: "⚔️" },
                  { id: 878, name: "Sci-Fi", icon: "🚀" },
                  { id: 27, name: "Horror", icon: "👻" },
                  { id: 35, name: "Comedy", icon: "😂" },
                  { id: 53, name: "Thriller", icon: "🔪" },
                ].map((g) => (
                  <GenreButton key={g.id} genre={g} />
                ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn("tour-dot", i === step && "active")}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {step > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep(step - 1)}
                  className="text-white/60 hover:text-white hover:bg-white/10 text-xs px-3 h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              
              {step < steps.length - 1 ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={completeTutorial}
                    className="text-white/40 hover:text-white/60 text-[10px] uppercase tracking-widest px-2"
                  >
                    Skip
                  </Button>
                  <Button 
                    onClick={nextStep}
                    size="sm"
                    className="bg-primary hover:bg-white text-black font-bold text-xs px-4 h-9 glow-yellow"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={completeTutorial}
                  size="sm"
                  className="bg-primary hover:bg-white text-black font-bold text-xs px-6 h-9 glow-yellow"
                >
                  Enter Hub
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* JARVIS Avatar in corner for personality */}
      {!coords && (
        <div className="absolute bottom-8 right-8 pointer-events-none animate-fade-in flex flex-col items-end gap-3 z-[1600]">
           <div className="w-24 h-24 rounded-full border-2 border-primary/50 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.3)] bg-black">
              <img src="/JARVIS2.gif" alt="JARVIS" className="w-full h-full object-cover opacity-80" />
           </div>
           <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] font-display">Neural Link Established</div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default JarvisTutorial;

