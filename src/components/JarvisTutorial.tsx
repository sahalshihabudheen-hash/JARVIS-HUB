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

// Module-level flag — resets on every full page reload (not SPA navigation)
// This makes the intro play every time the user loads/reloads the page
let introShownThisLoad = false;

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

// ─── Genre Button ──────────────────────────────────────────────────────────────
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
        "flex items-center justify-start gap-4 px-4 py-3 rounded-[14px] border transition-all duration-200",
        isSelected
          ? "bg-[#1f2937]/80 border-primary/50 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-primary/30"
          : "bg-[#111111]/80 border-white/10 hover:bg-[#1a1a1a] hover:border-white/20 text-white/80"
      )}
    >
      <span className="text-xl shrink-0 opacity-90">{genre.icon}</span>
      <span className="text-[13px] font-medium tracking-wide">{genre.name}</span>
    </button>
  );
};

// ─── Main Tutorial Component ───────────────────────────────────────────────────
const JarvisTutorial = () => {
  const { isActive, step, nextStep, setStep, completeTutorial, startTutorial } = useTutorial();
  const { user } = useAuth();
  const location = useLocation();
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
    if (!user || location.pathname === "/auth") return;
    if (introShownThisLoad || isActive || showPS2Intro) return;

    // Show intro shortly after arriving at home (gives page time to render)
    const t = setTimeout(() => {
      introShownThisLoad = true;   // prevent double-trigger within same load
      setShowPS2Intro(true);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname]);

  // ── Tutorial Steps ──
  const steps = [
    { target: null,             title: "Welcome",              description: "Hey there! I'm JARVIS, your AI assistant. Let me quickly show you around JARVIS HUB so you can start streaming right away.", icon: Activity },
    { target: "navbar-logo",    title: "Home",                 description: "This is the JARVIS HUB logo. Click it anytime to go back to the home page.", icon: Activity },
    { target: "navbar-links",   title: "Browse",               description: "Use these tabs to explore Movies, TV Shows, Anime, and your Watchlist.", icon: Layout },
    { target: "navbar-search",  title: "Search",               description: "Looking for something specific? Search for any movie, show, actor, or director here.", icon: Search },
    { target: null,             title: "Pick Your Genres",     description: "Select the genres you love! I'll personalize your home page based on what you pick.", icon: Cpu, interactive: "genres" },
    { target: "hero-watch-btn", title: "Watch Now",            description: "Hit this button to start watching instantly. It's the fastest way to jump into a movie or show.", icon: Cpu },
    { target: "watchlist-row",  title: "Your Watchlist",       description: "Tap the heart icon on any movie or show to save it to your watchlist for later.", icon: Heart },
    { target: "settings-btn",   title: "Settings",             description: "Customize your experience — change your region, manage preferences, and more.", icon: SettingsIcon },
    { target: null,             title: "You're All Set!",      description: "That's everything! Enjoy JARVIS HUB. I'll be here if you need me. Happy streaming!", icon: ShieldAlert },
  ];

  // ── Element tracking ──
  useEffect(() => {
    setTypingDone(false);
    const target = steps[step]?.target;
    if (!target) { setCoords(null); return; }
    const el = document.getElementById(target);
    if (el) {
      const r = el.getBoundingClientRect();
      setCoords({ x: r.left, y: r.top, width: r.width, height: r.height });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setCoords(null);
    }
  }, [step, isActive]);

  if (!user || location.pathname === "/auth") return null;

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
  const BALLOON_W = 340;
  const BALLOON_H = 380;
  const balloonStyle: React.CSSProperties = {};
  let nibPos = "bottom"; // nib points up from balloon top

  if (coords) {
    const spaceBelow = window.innerHeight - coords.y - coords.height;
    const spaceAbove = coords.y;

    if (spaceBelow >= BALLOON_H + 20) {
      // Place below target
      balloonStyle.top = Math.min(coords.y + coords.height + 16, window.innerHeight - BALLOON_H - 10);
      nibPos = "top";
    } else if (spaceAbove >= BALLOON_H + 20) {
      // Place above target
      balloonStyle.top = Math.max(10, coords.y - BALLOON_H - 16);
      nibPos = "bottom";
    } else {
      // fallback: force below with scroll-safe clamp
      balloonStyle.top = Math.min(coords.y + coords.height + 16, window.innerHeight - BALLOON_H - 10);
      nibPos = "top";
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
      {!coords && (
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
          className="rounded-2xl border border-primary/30 overflow-hidden"
          style={{
            background: "rgba(8, 20, 35, 0.97)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.8), 0 0 24px rgba(34,211,238,0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Top scanning accent */}
          <div className="h-[2px] w-full scanning-line" />

          <div className="p-5">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary text-[10px] font-black uppercase tracking-wider">
                  {step + 1} / {total}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="text-white/20 hover:text-white/50 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Skip Tour
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl border-2 border-primary/40 overflow-hidden bg-black/60 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <img src="/JARVIS2.gif" alt="JARVIS" className="w-full h-full object-cover scale-125" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-lg flex items-center justify-center border-2 border-[#080f1a]">
                  <Icon className="w-2.5 h-2.5 text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-none tracking-tight">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <div className="min-h-[72px] mb-4">
              <p className="text-white/75 text-sm leading-relaxed">
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
                    className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 border border-white/8"
                  >
                    Back
                  </Button>
                )}
                {step < total - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="h-8 px-5 text-[10px] font-black uppercase tracking-wider bg-primary text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95"
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSkip}
                    className="h-8 px-5 text-[10px] font-black uppercase tracking-wider bg-primary text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-95"
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
