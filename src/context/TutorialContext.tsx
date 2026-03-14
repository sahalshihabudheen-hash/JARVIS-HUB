import React, { createContext, useContext, useState, useEffect } from "react";

interface TutorialContextType {
  isActive: boolean;
  step: number;
  startTutorial: () => void;
  nextStep: () => void;
  completeTutorial: () => void;
  setStep: (step: number) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [step, setStepState] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("jarvis_tutorial_complete");
    const isReturningFromAction = localStorage.getItem("jarvis_tutorial_step");
    
    if (isReturningFromAction) {
      setIsActive(true);
      setStepState(parseInt(isReturningFromAction));
    } else if (!hasSeenTutorial) {
      // Auto-start for new users could be here, but we'll trigger it from Index
    }
  }, []);

  const startTutorial = () => {
    setIsActive(true);
    setStepState(0);
    localStorage.removeItem("jarvis_tutorial_complete");
  };

  const setStep = (s: number) => {
    setStepState(s);
    localStorage.setItem("jarvis_tutorial_step", s.toString());
  };

  const nextStep = () => {
    const next = step + 1;
    setStep(next);
  };

  const completeTutorial = () => {
    setIsActive(false);
    setStepState(0);
    localStorage.setItem("jarvis_tutorial_complete", "true");
    localStorage.removeItem("jarvis_tutorial_step");
  };

  return (
    <TutorialContext.Provider value={{ isActive, step, startTutorial, nextStep, completeTutorial, setStep }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
