import { useState, useEffect } from "react";
import { X, Play, Shield, Globe, Terminal, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const steps = [
  {
    title: "System Initialization",
    content: "Welcome to JARVIS HUB, user. I am your interface assistant. Let me walk you through your new media terminal.",
    icon: <Terminal className="w-6 h-6 text-primary" />,
  },
  {
    title: "Secure Streaming",
    content: "Our system uses multiple Mirror Servers. If one server is slow, simply switch to Mirror 1 or Mirror 2 for optimized bandwidth.",
    icon: <Globe className="w-6 h-6 text-primary" />,
  },
  {
    title: "Stealth Shield",
    content: "To block aggressive ad-scripts, always engage the 'Stealth Shield' once playback begins. This locks the interface against accidental redirects.",
    icon: <Shield className="w-6 h-6 text-primary" />,
  },
  {
    title: "Direct Access",
    content: "You can now click 'Watch Now' on any card to bypass detail protocols and launch the stream directly.",
    icon: <Play className="w-6 h-6 text-primary" />,
  },
];

const JarvisTutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("jarvis_tutorial_complete");
    if (!hasSeenTutorial) {
      setTimeout(() => setIsOpen(true), 1500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const completeTutorial = () => {
    setIsOpen(false);
    localStorage.setItem("jarvis_tutorial_complete", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass border border-primary/20 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-scale-in">
        <button 
          onClick={completeTutorial}
          className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <img src="/JARVIS2.gif" alt="JARVIS" className="w-16 h-16 rounded-full" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            {steps[currentStep].icon}
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tighter">
              {steps[currentStep].title}
            </h2>
          </div>

          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6" />

          <p className="text-muted-foreground text-lg leading-relaxed mb-10 min-h-[80px]">
            {steps[currentStep].content}
          </p>

          <div className="flex items-center justify-between w-full">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-8 bg-primary" : "w-2 bg-white/10"
                  }`} 
                />
              ))}
            </div>

            <Button onClick={handleNext} className="rounded-full px-8 hover-glow group transition-all">
              {currentStep === steps.length - 1 ? "Initialize Hub" : "Continue"}
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
           <span className="text-[10px] text-primary/40 uppercase tracking-[0.5em] font-medium">
             Protocol Alpha-1 // JARVIS Intelligence System
           </span>
        </div>
      </div>
    </div>
  );
};

export default JarvisTutorial;
