import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useJarvisVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    // Cancel any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Priority: UK Male -> US Male -> Robotic/Natural
    const jarvisVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Microsoft Paul") || v.name.includes("Male")) 
                    || voices.find(v => v.lang.startsWith("en-GB"))
                    || voices[0];
    
    utterance.voice = jarvisVoice;
    utterance.pitch = 0.85; // Slightly lower for that Jarvis bass
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const startListening = useCallback((continuous = false) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Vocal protocols not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Stay active for wake-word
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        console.log("Jarvis: Neural Link Established.");
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
          .toLowerCase();

        // Check for wake word
        if (transcript.includes("hey jarvis") || transcript.includes("jarvis")) {
          if (!isWakeWordActive) {
            setIsWakeWordActive(true);
            speak("Yes, Agent? I am listening.");
            toast.info("JARVIS: Listening for command...");
            
            // Pulse the UI or provide feedback
            setTimeout(() => setIsWakeWordActive(false), 5000);
          }

          // Extract command after wake word
          const commandPart = transcript.split(/hey jarvis|jarvis/).pop()?.trim();
          if (commandPart && commandPart.length > 2) {
            handleCommand(commandPart);
            // Reset recognition to clear the buffer
            recognitionRef.current.stop();
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Vocal Uplink Error:", event.error);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Vocal protocols offline.");
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Auto-restart for background wake-word detection
        if (true) {
           try { recognitionRef.current.start(); } catch(e) {}
        }
      };
    }

    try {
      recognitionRef.current.start();
    } catch (e) {}
  }, [isWakeWordActive]);

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase();
    
    if (cmd.includes("search") || cmd.includes("find")) {
      const query = cmd.replace("search", "").replace("find", "").replace("for", "").trim();
      speak(`Initializing deep scan for ${query}. Stand by.`);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else if (cmd.includes("home") || cmd.includes("mainframe")) {
      speak("Returning to the main mainframe, Agent.");
      navigate("/");
    } else if (cmd.includes("history")) {
      speak("Accessing your classified watch history protocols.");
      navigate("/history");
    } else if (cmd.includes("settings") || cmd.includes("config")) {
      speak("Opening neural settings and configuration nodes.");
      navigate("/settings");
    } else if (cmd.includes("adult") || cmd.includes("hub") || cmd.includes("incognito")) {
      speak("Accessing restricted adult protocols. Authorization verified.");
      navigate("/adult");
    } else if (cmd.includes("thank you") || cmd.includes("thanks")) {
      speak("Always at your service, Agent. Operational efficiency is my priority.");
    } else if (cmd.includes("who are you")) {
      speak("I am JARVIS. Your Just A Rather Very Intelligent System. I am here to optimize your media experience.");
    } else {
      console.log("Unrecognized Protocol:", cmd);
    }
  };

  return { isListening, isWakeWordActive, startListening, speak };
};
