import React, { createContext, useContext, useState, useEffect } from "react";

interface TutorialContextType {
  isActive: boolean;
  step: number;
  selectedGenres: number[];
  startTutorial: () => void;
  nextStep: () => void;
  completeTutorial: () => void;
  setStep: (step: number) => void;
  updateSelectedGenres: (genres: number[]) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [step, setStepState] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("jarvis_tutorial_complete");
    const isReturningFromAction = localStorage.getItem("jarvis_tutorial_step");
    const savedGenres = localStorage.getItem("user_selected_genres");
    
    if (savedGenres) {
      setSelectedGenres(JSON.parse(savedGenres));
    }

    if (isReturningFromAction) {
      setIsActive(true);
      setStepState(parseInt(isReturningFromAction));
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

  const updateSelectedGenres = (genres: number[]) => {
    setSelectedGenres(genres);
    localStorage.setItem("user_selected_genres", JSON.stringify(genres));
  };

  return (
    <TutorialContext.Provider value={{ 
      isActive, 
      step, 
      selectedGenres,
      startTutorial, 
      nextStep, 
      completeTutorial, 
      setStep,
      updateSelectedGenres
    }}>
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
