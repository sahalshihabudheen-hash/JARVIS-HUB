import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { Activity, Search, Layout, Heart, Settings as SettingsIcon, ShieldAlert, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import { useTutorial } from "@/context/TutorialContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import "@/tutorial.css";
import PS2Intro from "./PS2Intro";
import { useIsMobile } from "@/hooks/use-mobile";

// Session flag to determine if we should play the startup sequence
// Returns true if: User just opened the tab (navigate/back_forward) AND hasn't seen intro yet in this tab.
// Returns false if: User performed a 'reload' (refresh).
const shouldShowStartup = (isLoggedIn: boolean) => {
  if (typeof window === 'undefined') return false;
  
  const hasSeenInTab = sessionStorage.getItem("jarvis_intro_played") === "true";
  if (hasSeenInTab) return false;

  try {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
      // If they refreshed while logged in, skip the intro for this tab session.
      if (isLoggedIn) {
        sessionStorage.setItem("jarvis_intro_played", "true");
        return false;
      }
    }
  } catch (e) {
    console.error("Nav timing check failed", e);
  }

  return true;
};

// ─── Typewriter Effect ─────────────────────────────────────────────────────────
const Typewriter = ({ text, speed = 18, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setDisplayed("");
    setIdx(0);
  }, [text]);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed((p) => p + text[idx]);
        setIdx((p) => p + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      onComplete?.();
    }
  }, [idx, text, speed, onComplete]);

  return <span>{displayed}</span>;
};

// ─── Spotlight Overlay ─────────────────────────────────────────────────────────
const Spotlight = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => {
  const pad = 12;
  const top = y - pad;
  const left = x - pad;
  const width = w + pad * 2;
  const height = h + pad * 2;

  return createPortal(
    <div className="fixed inset-0 z-[1450] pointer-events-none">
      {/* Dark mask with hole */}
      <div
        className="absolute inset-0 bg-black/80"
        style={{
          clipPath: `polygon(0 0,0 100%,${left}px 100%,${left}px ${top}px,${left + width}px ${top}px,${left + width}px ${top + height}px,${left}px ${top + height}px,${left}px 100%,100% 100%,100% 0)`,
        }}
      />
      {/* Glowing border around the target */}
      <div
        className="absolute rounded-xl border-2 border-primary"
        style={{
          top,
          left,
          width,
          height,
          boxShadow: "0 0 0 4px rgba(34,211,238,0.15), 0 0 30px rgba(34,211,238,0.4)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
    </div>,
    document.body
  );
};

const GenreButton = ({ genre }: { genre: { id: number; name: string; icon: string } }) => {
  const { selectedGenres, updateSelectedGenres } = useTutorial();
  const isSelected = selectedGenres.includes(genre.id);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        updateSelectedGenres(
          isSelected ? selectedGenres.filter((id) => id !== genre.id) : [...selectedGenres, genre.id]
        );
      }}
      className={cn(
        "group relative overflow-hidden flex items-center justify-start gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-[12px] md:rounded-[16px] border transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.97]",
        isSelected
          ? "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/50 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          : "bg-[#111]/80 backdrop-blur-md border-white/5 hover:bg-[#1a1c23]/90 hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(34,211,238,0.1)] text-white/70"
      )}
    >
      {/* Glow background behind whole button when selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 rounded-[16px] blur-xl opacity-50" />
      )}
      
      {/* Icon container */}
      <div className={cn(
        "relative z-10 flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl transition-all duration-300 shrink-0",
        isSelected ? "bg-primary/20 shadow-[0_0_12px_rgba(34,211,238,0.4)]" : "bg-white/5 group-hover:bg-primary/10"
      )}>
        <span className="text-base md:text-xl opacity-90 group-hover:scale-110 transition-transform duration-300">{genre.icon}</span>
      </div>

      <span className={cn(
        "relative z-10 text-[11px] md:text-[13px] font-bold tracking-wide transition-colors duration-300",
        isSelected ? "text-white" : "group-hover:text-white"
      )}>
        {genre.name}
      </span>

      {/* Pulsing indicator dot when selected */}
      {isSelected && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
      )}
    </button>
  );
};

// ─── Main Tutorial Component ───────────────────────────────────────────────────
const JarvisTutorial = () => {
  const { isActive, step, nextStep, setStep, completeTutorial, startTutorial } = useTutorial();
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [typingDone, setTypingDone] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showPS2Intro, setShowPS2Intro] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const clickSfxRef = useRef<HTMLAudioElement | null>(null);

  // ── Audio setup ──
  useEffect(() => {
    bgMusicRef.current = new Audio("/aylex-evolution.mp3");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.18;

    clickSfxRef.current = new Audio("/meme-click.mp3");
    clickSfxRef.current.volume = 0.8;

    return () => {
      bgMusicRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      bgMusicRef.current?.play().catch(() => {});
    } else {
      bgMusicRef.current?.pause();
    }
  }, [isActive]);

  const playClick = () => {
    if (clickSfxRef.current) {
      clickSfxRef.current.currentTime = 0;
      clickSfxRef.current.play().catch(() => {});
    }
  };

  // ── Auto-start: PS2 intro on every page load when user is logged in ──
  useEffect(() => {
    if (!user || location.pathname === "/auth" || location.pathname === "/admin") return;
    if (!shouldShowStartup(!!user) || isActive || showPS2Intro) return;

    // Show intro shortly after arriving at home (gives page time to render)
    const t = setTimeout(() => {
      sessionStorage.setItem("jarvis_intro_played", "true");
      setShowPS2Intro(true);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname]);

  // ── Tutorial Steps ──
  const steps = [
    { target: null,             title: "Welcome",              description: "Hey there! I'm JARVIS, your AI assistant. Let me quickly show you around JARVIS HUB so you can start streaming right away.", icon: Activity },
    { target: "navbar-logo",    title: "Home",                 description: "This is the JARVIS HUB logo. Click it anytime to go back to the home page.", icon: Activity },
    { target: isMobile ? "menu-btn-mobile" : "navbar-links",   title: "Browse",               description: "Use these tabs to explore Movies, TV Shows, Anime, and your Watchlist.", icon: Layout },
    { target: isMobile ? "search-btn-mobile" : "navbar-search",  title: "Search",               description: "Looking for something specific? Search for any movie, show, actor, or director here.", icon: Search },
    { target: null,             title: "Pick Your Genres",     description: "Select the genres you love! I'll personalize your home page based on what you pick.", icon: Cpu, interactive: "genres" },
    { target: "hero-watch-btn", title: "Watch Now",            description: "Hit this button to start watching instantly. It's the fastest way to jump into a movie or show.", icon: Cpu },
    { target: "watchlist-row",  title: "Your Watchlist",       description: "Tap the heart icon on any movie or show to save it to your watchlist for later.", icon: Heart },
    { target: isMobile ? "settings-btn-mobile" : "settings-btn",   title: "Settings",             description: "Customize your experience — change your region, manage preferences, and more.", icon: SettingsIcon },
    { target: null,             title: "You're All Set!",      description: "That's everything! Enjoy JARVIS HUB. I'll be here if you need me. Happy streaming!", icon: ShieldAlert },
  ];

  // ── Element tracking ──
  useEffect(() => {
    setTypingDone(false);
    
    const updateCoords = () => {
      const target = steps[step]?.target;
      if (!target) { setCoords(null); return; }
      const el = document.getElementById(target);
      if (el) {
        const r = el.getBoundingClientRect();
        setCoords({ x: r.left, y: r.top, width: r.width, height: r.height });
      } else {
        setCoords(null);
      }
    };

    updateCoords();

    // Re-calculate on resize
    window.addEventListener("resize", updateCoords);
    
    // Scroll to target if first time
    const target = steps[step]?.target;
    if (target) {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return () => window.removeEventListener("resize", updateCoords);
  }, [step, isActive, isMobile]);

  if (!user || location.pathname === "/auth" || location.pathname === "/admin") return null;

  // Show PS2 intro before tutorial
  if (showPS2Intro) {
    return (
      <PS2Intro
        onComplete={() => {
          setShowPS2Intro(false);
          // Only start tutorial if user hasn't completed it
          if (!localStorage.getItem("jarvis_tutorial_complete")) {
            startTutorial();
          }
        }}
      />
    );
  }

  if (!isActive) return null;

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const total = steps.length;

  // ── Balloon position ──
  const BALLOON_W = isMobile ? Math.min(320, window.innerWidth - 32) : 380;
  // Reduce height on mobile to keep it compact
  const BALLOON_H = currentStep.interactive === "genres" ? (isMobile ? 520 : 540) : (isMobile ? 320 : 430);
  const balloonStyle: React.CSSProperties = {};
  let nibPos = "bottom";

  if (coords) {
    const spaceBelow = window.innerHeight - coords.y - coords.height;
    const spaceAbove = coords.y;

    if (spaceBelow >= BALLOON_H + 20) {
      balloonStyle.top = Math.min(coords.y + coords.height + 16, window.innerHeight - BALLOON_H - 10);
      nibPos = "top";
    } else if (spaceAbove >= BALLOON_H + 20) {
      balloonStyle.top = Math.max(10, coords.y - BALLOON_H - 16);
      nibPos = "bottom";
    } else {
      // For mobile if no space, place at bottom or top with clamp
      if (isMobile) {
        balloonStyle.bottom = 20;
        nibPos = "none";
      } else {
        balloonStyle.top = Math.min(coords.y + coords.height + 16, window.innerHeight - BALLOON_H - 10);
        nibPos = "top";
      }
    }

    // Clamp top to always be on-screen
    if (typeof balloonStyle.top === "number") {
      balloonStyle.top = Math.max(10, Math.min(balloonStyle.top, window.innerHeight - BALLOON_H - 10));
    }

    // Horizontal alignment: center on target but clamp to screen
    const idealLeft = coords.x + coords.width / 2 - BALLOON_W / 2;
    balloonStyle.left = Math.max(16, Math.min(idealLeft, window.innerWidth - BALLOON_W - 16));
  }

  const handleNext = () => { playClick(); nextStep(); };
  const handleBack = () => { playClick(); setStep(step - 1); };
  const handleSkip = () => { playClick(); completeTutorial(); };

  return createPortal(
    <div className="fixed inset-0 z-[1500] pointer-events-none select-none">

      {/* ── Spotlight on target ── */}
      {coords && <Spotlight x={coords.x} y={coords.y} w={coords.width} h={coords.height} />}

      {/* ── Full dark backdrop for non-target steps ── */}
      {!coords && (
        <div className="absolute inset-0 bg-black/88 backdrop-blur-sm">
          <div className="absolute inset-0 grid-overlay opacity-10" />
        </div>
      )}

      {/* ── JARVIS Avatar (bottom-right, only on non-target steps) ── */}
      {!coords && !isMobile && (
        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 animate-fade-in z-[1600]">
          <div className="w-20 h-20 rounded-full border-2 border-primary/60 overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.4)] bg-black">
            <img src="/JARVIS2.gif" alt="JARVIS" className="w-full h-full object-cover" />
          </div>
          <div className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">Online</div>
        </div>
      )}

      {/* ── Tour Balloon ── */}
      <div
        className="absolute pointer-events-auto z-[1600]"
        style={
          coords
            ? { ...balloonStyle, width: BALLOON_W }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: BALLOON_W,
              }
        }
      >
        {/* Nib (arrow) */}
        {coords && nibPos === "top" && (
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-[9px] w-4 h-4 bg-[#0a1a2a] border-l border-t border-primary/40 rotate-45"
          />
        )}
        {coords && nibPos === "bottom" && (
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-[9px] w-4 h-4 bg-[#0a1a2a] border-r border-b border-primary/40 rotate-45"
          />
        )}

        {/* Card */}
        <div
          className="rounded-[24px] border border-primary/40 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(8, 20, 35, 0.98) 0%, rgba(4, 10, 18, 0.95) 100%)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(34,211,238,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            backdropFilter: "blur(30px)",
          }}
        >
          {/* Top scanning accent */}
          <div className="h-[2px] w-full scanning-line" />

          <div className={cn("p-4 md:p-5", isMobile && "max-h-[85vh] overflow-y-auto")}>
            {/* Step counter */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-1.5 px-2 py-0.5 md:py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary text-[9px] md:text-[10px] font-black uppercase tracking-wider">
                  {step + 1} / {total}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="text-white/20 hover:text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Skip Tour
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="relative shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-primary/40 overflow-hidden bg-black/60 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <img src="/JARVIS2.gif" alt="JARVIS" className="w-full h-full object-cover scale-125" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-primary rounded-lg flex items-center justify-center border-2 border-[#080f1a]">
                  <Icon className="w-2 md:w-2.5 h-2 md:h-2.5 text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white leading-none tracking-tight">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <div className="min-h-[60px] md:min-h-[72px] mb-3 md:mb-4">
              <p className="text-white/75 text-[13px] md:text-sm leading-relaxed">
                <Typewriter
                  text={currentStep.description}
                  onComplete={() => setTypingDone(true)}
                />
              </p>
            </div>

            {/* Genre Selector */}
            {currentStep.interactive === "genres" && typingDone && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { id: 28, name: "Action", icon: "⚔️" },
                  { id: 878, name: "Sci-Fi", icon: "🚀" },
                  { id: 27, name: "Horror", icon: "👻" },
                  { id: 35, name: "Comedy", icon: "😂" },
                  { id: 53, name: "Thriller", icon: "🔪" },
                  { id: 10749, name: "Romance", icon: "❤️" },
                  { id: 18, name: "Drama", icon: "🎭" },
                  { id: 16, name: "Animation", icon: "🎨" },
                ].map((g) => (
                  <GenreButton key={g.id} genre={g} />
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/8 gap-3">
              {/* Progress dots */}
              <div className="flex gap-1 items-center">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-400"
                    style={{
                      width: i === step ? 16 : 5,
                      height: 5,
                      background: i === step ? "hsl(190 100% 50%)" : "rgba(255,255,255,0.12)",
                      boxShadow: i === step ? "0 0 8px rgba(34,211,238,0.6)" : "none",
                    }}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {step > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-7 md:h-8 px-2 md:px-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 border border-white/8"
                  >
                    Back
                  </Button>
                )}
                {step < total - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="h-7 md:h-8 px-4 md:px-5 text-[9px] md:text-[10px] font-black uppercase tracking-wider bg-primary text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95"
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSkip}
                    className="h-7 md:h-8 px-4 md:px-5 text-[9px] md:text-[10px] font-black uppercase tracking-wider bg-primary text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-95"
                  >
                    Initialize ✓
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JarvisTutorial;
