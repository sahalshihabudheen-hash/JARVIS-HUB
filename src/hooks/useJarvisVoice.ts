import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useJarvisVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a premium/robot sounding voice
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.includes("Google UK English Male") || v.lang === "en-GB") || voices[0];
    utterance.pitch = 0.8;
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Vocal protocols not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        speak("Awaiting instructions, Agent.");
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Jarvis heard:", transcript);
        handleCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error !== "no-speech") {
          toast.error(`Vocal uplink failed: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCommand = (command: string) => {
    if (command.includes("search") || command.includes("find")) {
      const query = command.replace("search", "").replace("find", "").replace("for", "").trim();
      speak(`Searching database for ${query}.`);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else if (command.includes("home") || command.includes("mainframe")) {
      speak("Returning to main mainframe.");
      navigate("/");
    } else if (command.includes("history")) {
      speak("Accessing your classified history.");
      navigate("/history");
    } else if (command.includes("settings")) {
      speak("Opening neural settings.");
      navigate("/settings");
    } else if (command.includes("adult") || command.includes("hub")) {
      speak("Accessing restricted protocols. Authorization required.");
      navigate("/adult");
    } else if (command.includes("thank you") || command.includes("thanks")) {
      speak("Always at your service, Agent.");
    } else {
      speak("Command not recognized in current protocol.");
      toast.info(`Command received: "${command}"`);
    }
  };

  return { isListening, startListening, speak };
};
