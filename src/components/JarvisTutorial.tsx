import { useState, useEffect } from "react";
import { X, Play, Shield, Globe, Terminal, ChevronRight, MousePointer2 } from "lucide-react";
import { Button } from "./ui/button";
import { useTutorial } from "@/context/TutorialContext";
import { cn } from "@/lib/utils";

const JarvisTutorial = () => {
  const { isActive, step, nextStep, completeTutorial, startTutorial } = useTutorial();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("jarvis_tutorial_complete");
    if (!hasSeenTutorial && !isActive) {
      setTimeout(() => startTutorial(), 2000);
    }
  }, []);

  if (!isActive) return null;

  // Step 0: Welcome Modal
  if (step === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-lg glass border border-primary/20 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <img src="/JARVIS2.gif" alt="JARVIS" className="w-16 h-16 rounded-full" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tighter mb-4">
              System Initialization
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Welcome, user. I am JARVIS. Let me show you how to navigate this terminal securely. We will start with a live demonstration.
            </p>
            <Button onClick={nextStep} className="rounded-full px-8 hover-glow transition-all">
              Begin Training
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Genre Preferences
  if (step === 5) {
    const genres = [
      { id: 28, name: "Action", icon: "⚔️" },
      { id: 878, name: "Sci-Fi", icon: "🚀" },
      { id: 27, name: "Horror", icon: "👻" },
      { id: 35, name: "Comedy", icon: "😂" },
      { id: 53, name: "Thriller", icon: "🔪" },
      { id: 10749, name: "Romance", icon: "❤️" },
      { id: 18, name: "Drama", icon: "🎭" },
      { id: 16, name: "Animation", icon: "🎨" },
      { id: 14, name: "Fantasy", icon: "🔮" },
      { id: 9648, name: "Mystery", icon: "🔍" },
    ];

    const { selectedGenres, updateSelectedGenres } = useTutorial();

    const toggleGenre = (genreId: number) => {
      if (selectedGenres.includes(genreId)) {
        updateSelectedGenres(selectedGenres.filter(id => id !== genreId));
      } else {
        updateSelectedGenres([...selectedGenres, genreId]);
      }
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-2xl glass border border-primary/20 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tighter mb-2">
              Preference Calibration
            </h2>
            <p className="text-muted-foreground mb-8">
              Select your preferred data streams to optimize the terminal dashboard.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8 w-full">
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGenre(g.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300",
                    selectedGenres.includes(g.id) 
                      ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  )}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{g.name}</span>
                </button>
              ))}
            </div>

            <Button 
                onClick={nextStep} 
                disabled={selectedGenres.length === 0}
                className="rounded-full px-8 hover-glow transition-all"
            >
              Continue Calibration
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Completion Modal
  if (step === 6) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-lg glass border border-primary/20 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tighter mb-4">
              Training & Calibration Complete
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Protocol Alpha-1 is successful. Regional data and personalized genre streams have been prioritized. Dismissing assistant...
            </p>
            <Button onClick={completeTutorial} className="rounded-full px-8 hover-glow bg-green-600 hover:bg-green-500">
              Initialize Hub
              <Globe className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pointer steps are handled inside the components themselves for accuracy
  return null;
};

export const TutorialPointer = ({ 
  title, 
  description, 
  className, 
  activeStep, 
  onAction 
}: { 
  title: string; 
  description: string; 
  className?: string;
  activeStep: number;
  onAction?: () => void;
}) => {
  const { isActive, step, nextStep } = useTutorial();
  
  if (!isActive || step !== activeStep) return null;

  return (
    <div className={cn("absolute z-[100] pointer-events-none animate-bounce-subtle", className)}>
      <div className="relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="glass border border-primary/40 p-4 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] min-w-[200px] pointer-events-auto">
             <div className="flex items-center gap-2 mb-1">
               <MousePointer2 className="w-4 h-4 text-primary" />
               <span className="text-xs font-bold text-primary uppercase tracking-wider">{title}</span>
             </div>
             <p className="text-[11px] text-white leading-relaxed">{description}</p>
             {onAction && (
                <button 
                  onClick={onAction}
                  className="mt-2 text-[10px] text-primary hover:underline uppercase tracking-tighter"
                >
                  I've done this
                </button>
             )}
          </div>
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-primary/40 mt-[-1px]" />
        </div>
        <div className="w-4 h-4 rounded-full bg-primary animate-ping" />
        <div className="w-4 h-4 rounded-full bg-primary absolute inset-0" />
      </div>
    </div>
  );
};

export default JarvisTutorial;
