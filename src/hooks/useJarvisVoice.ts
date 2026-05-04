import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useJarvisVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [isWaitingForCommand, setIsWaitingForCommand] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Microsoft Paul") || v.name.includes("Male")) 
                    || voices.find(v => v.lang.startsWith("en-GB"))
                    || voices[0];
    
    utterance.voice = jarvisVoice;
    utterance.pitch = 0.85;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log("Jarvis: Neural Link Online.");
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
          .toLowerCase();

        // Stage 1: Waiting for Wake Word
        if (!isWaitingForCommand) {
          if (transcript.includes("hey jarvis") || transcript.includes("hi jarvis") || transcript.includes("hello jarvis")) {
            const displayName = user?.displayName || user?.email?.split("@")[0] || "Agent";
            setIsWaitingForCommand(true);
            setIsWakeWordActive(true);
            
            speak(`Hello ${displayName}. I am ready to help. What are your instructions?`);
            toast.info(`JARVIS: Standing by for ${displayName}...`, {
              icon: "🤖",
              duration: 5000
            });

            // Clear the buffer by restarting
            setTimeout(() => {
               recognitionRef.current.stop();
            }, 1000);
            
            // Timeout if no command is given
            setTimeout(() => {
              setIsWaitingForCommand(false);
              setIsWakeWordActive(false);
            }, 10000);
          }
        } 
        // Stage 2: Processing the Command
        else {
           // We look for any significant text after the greeting
           const lastResult = event.results[event.results.length - 1];
           if (lastResult.isFinal) {
             const command = lastResult[0].transcript.toLowerCase();
             handleCommand(command);
             setIsWaitingForCommand(false);
             setIsWakeWordActive(false);
           }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Vocal Uplink Error:", event.error);
        setIsListening(false);
        setIsWaitingForCommand(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Persist the listener
        try { recognitionRef.current.start(); } catch(e) {}
      };
    }

    try {
      recognitionRef.current.start();
    } catch (e) {}
  }, [user, isWaitingForCommand]);

  const handleCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    console.log("Executing Protocol:", cmd);

    if (cmd.includes("search") || cmd.includes("find")) {
      const query = cmd.replace("search", "").replace("find", "").replace("for", "").trim();
      speak(`Searching the archives for ${query}. Stand by.`);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else if (cmd.includes("home") || cmd.includes("mainframe")) {
      speak("Returning to the main mainframe.");
      navigate("/");
    } else if (cmd.includes("history")) {
      speak("Accessing your classified watch history.");
      navigate("/history");
    } else if (cmd.includes("settings") || cmd.includes("config")) {
      speak("Opening neural configuration.");
      navigate("/settings");
    } else if (cmd.includes("adult") || cmd.includes("hub")) {
      speak("Restricted protocols accessed. Authorization verified.");
      navigate("/adult");
    } else if (cmd.includes("who are you")) {
      speak("I am JARVIS. Your personal intelligent system.");
    } else if (cmd.includes("thank you") || cmd.includes("thanks")) {
      speak("Of course, Agent.");
    }
  };

  return { isListening, isWakeWordActive, isWaitingForCommand, startListening, speak };
};
