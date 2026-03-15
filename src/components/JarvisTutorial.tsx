import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Activity, Search, Layout, Heart, Settings as SettingsIcon, ShieldAlert, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import { useTutorial } from "@/context/TutorialContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import "@/tutorial.css";

const Typewriter = ({ text, speed = 15, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
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

const Spotlight = ({ x, y, width, height, padding = 15 }: { x: number, y: number, width: number, height: number, padding?: number }) => {
  const rect = {
    top: y - padding,
    left: x - padding,
    width: width + padding * 2,
    height: height + padding * 2
  };

  return (
    <div className="fixed inset-0 z-[1400] pointer-events-none">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px]" style={{
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
        className="absolute border-2 border-[#FFD700] shadow-[0_0_40px_rgba(255,215,0,0.3)] rounded-2xl animate-pulse overflow-hidden"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }}
      >
        <div className="scanning-line opacity-40" />
      </div>
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
  const location = useLocation();
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [coords, setCoords] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const clickSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bgMusic.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-sci-fi-ambient-loop-96.mp3");
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.15;

    clickSound.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-tech-break-click-1140.mp3");
    clickSound.current.volume = 0.4;

    return () => {
      if (bgMusic.current) {
        bgMusic.current.pause();
        bgMusic.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && bgMusic.current) {
      bgMusic.current.play().catch(e => console.log("Audio play blocked by browser", e));
    } else if (!isActive && bgMusic.current) {
      bgMusic.current.pause();
    }
  }, [isActive]);

  const playClick = () => {
    if (clickSound.current) {
      clickSound.current.currentTime = 0;
      clickSound.current.play().catch(() => {});
    }
  };

  const handleNext = () => {
    playClick();
    nextStep();
  };

  const handleBack = () => {
    playClick();
    setStep(step - 1);
  };

  const handleSkip = () => {
    playClick();
    completeTutorial();
  };

  const steps = [
    {
      target: null, // Global intro
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
      target: null, // Interactive genre selection
      title: "Priority Calibration",
      description: "Select your preferred genre frequencies. I will prioritize these data streams in your personalized HUB layout.",
      icon: Cpu,
      interactive: "genres"
    },
    {
      target: "hero-watch-btn",
      title: "Direct Data Entry",
      description: "My sensors indicate this is the most efficient initialization point. Use the primary link to start your visual stream immediately.",
      icon: Cpu
    },
    {
      target: "watchlist-row",
      title: "Tactical Watchlist",
      description: "Mark your targets for future surveillance. Use the heart icon on any media card to add it to your priority watchlist.",
      icon: Heart
    },
    {
      target: "shield-toggle-btn",
      title: "Stealth Protocol",
      description: "Maintain 'Locked' status for maximum ad-interception. Toggle only when manual player control is required.",
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

  // Auto-start logic refined
  useEffect(() => {
    // Only attempt to start if we are logged in, NOT on auth page, and tutorial not complete
    if (!user || location.pathname === "/auth") return;
    
    const hasSeenTutorial = localStorage.getItem("jarvis_tutorial_complete");
    if (!hasSeenTutorial && !isActive) {
      const timer = setTimeout(() => {
        // Double check condition before starting
        if (!localStorage.getItem("jarvis_tutorial_complete")) {
           startTutorial();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, location.pathname, isActive, startTutorial]);

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

  // Strict render check
  if (!user || !isActive || location.pathname === "/auth") return null;

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const isBelow = coords ? (coords.y + coords.height + 450 < window.innerHeight) : false;
  const balloonTop = coords 
    ? (isBelow ? coords.y + coords.height + 40 : coords.y - 380)
    : 0;
  const balloonLeft = coords
    ? Math.min(Math.max(20, coords.x + coords.width/2 - 175), window.innerWidth - 370)
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
        <div className="tour-balloon border-primary/40 shadow-[0_0_40px_rgba(34,211,238,0.2)] relative overflow-hidden backdrop-blur-xl">
          {/* Scanning Line Effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-primary/30 scanning-line z-0" />

          {/* Tour Nib (Arrow) */}
          {coords && (
            <div 
              className={cn(
                "tour-nib z-[1]",
                isBelow ? "-top-2 left-1/2 -translate-x-1/2 rotate-45" : "-bottom-2 left-1/2 -translate-x-1/2 rotate-[225deg]"
              )}
            />
          )}
          
          {/* Progress Indicator */}
          <div className="absolute top-4 right-4 px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black rounded flex items-center gap-1 backdrop-blur-md z-10 transition-all">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            {step + 1} / {steps.length}
          </div>

          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="relative group">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-primary/50 bg-black/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-500">
                <img src="/JARVIS2.gif" alt="JARVIS" className="w-full h-full object-cover scale-150 opacity-90" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-lg border-2 border-[#0d0d0d] animate-bounce-slow">
                <Icon className="w-3.5 h-3.5 text-black" />
              </div>
            </div>
            <div>
              <div className="text-[9px] font-black text-primary uppercase tracking-[0.3em] opacity-80">Neural Interface</div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight leading-none mt-1 shadow-black text-shadow-sm">{currentStep.title}</h3>
            </div>
          </div>

          <div className="relative mb-5 min-h-[4rem] z-10">
            <div className="text-white/90 text-sm leading-relaxed font-medium">
              <Typewriter 
                text={currentStep.description} 
                onComplete={() => setIsTypingComplete(true)}
              />
            </div>
          </div>

          {/* Interactive Genre Selection Section */}
          {currentStep.interactive === "genres" && isTypingComplete && (
            <div className="grid grid-cols-5 gap-2 mb-6 animate-scale-in relative z-10">
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

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10">
            <div className="flex gap-1.5 items-center">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1 h-1 rounded-full transition-all duration-500",
                    i === step ? "bg-primary w-4 shadow-[0_0_8px_rgba(34,211,238,0.7)]" : "bg-white/10"
                    )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="text-white/40 hover:text-white hover:bg-white/5 text-[9px] font-black uppercase tracking-widest px-3 h-7 border border-white/5"
                >
                  Back
                </Button>
              )}
              
              {step < steps.length - 1 ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSkip}
                    className="text-white/30 hover:text-white/50 text-[9px] font-black uppercase tracking-widest px-2"
                  >
                    Skip
                  </Button>
                  <Button 
                    onClick={handleNext}
                    size="sm"
                    className="bg-primary hover:bg-white text-black font-black text-[10px] uppercase tracking-[0.1em] px-4 h-7 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 transform active:scale-95"
                  >
                    Next
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleSkip}
                  size="sm"
                  className="bg-primary hover:bg-white text-black font-black text-[10px] uppercase tracking-[0.1em] px-6 h-7 shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                >
                  Initialize
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

