import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, Sparkles, MessageCircle } from "lucide-react";

const GAME_DATA: Record<string, any> = {
  "harem-hotel": {
    bg: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Manager", text: "Welcome to the new branch of the hotel. I'm here to assist you." },
      { speaker: "You", text: "It's good to be here. What's on the agenda today?" },
      { speaker: "Manager", text: "We have some VIP guests arriving. I'll need your help making sure their suites are... perfectly prepared." }
    ]
  },
  "summertime-saga": {
    bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Sarah", text: "Hey! I didn't think you were coming to the beach today." },
      { speaker: "You", text: "Wouldn't miss it. The weather is perfect." },
      { speaker: "Sarah", text: "Well, since you're here, maybe you can help me with the sunscreen..." }
    ]
  },
  "waifu-hub": {
    bg: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Applicant #4", text: "Hello! I'm here for the interview." },
      { speaker: "You", text: "Take a seat. Your portfolio looks impressive." },
      { speaker: "Applicant #4", text: "Thank you! I'm willing to do whatever it takes to get this role." }
    ]
  },
  "breeding-season": {
    bg: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Farmhand", text: "The new crops are coming in nicely, but we have another issue." },
      { speaker: "You", text: "What's going on in the barn?" },
      { speaker: "Farmhand", text: "It's mating season, and the livestock are getting restless. We need to handle this personally." }
    ]
  },
  "camp-pinewood": {
    bg: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Counselor", text: "Welcome to Camp Pinewood! I hope you're ready for an unforgettable summer." },
      { speaker: "You", text: "I sure am. Where do I drop my bags?" },
      { speaker: "Counselor", text: "Right this way. Let me introduce you to the rest of the staff." }
    ]
  },
  "milfy-city": {
    bg: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Neighbor", text: "Oh, hey! I didn't see you there. Have you lived here long?" },
      { speaker: "You", text: "Just moved in, actually." },
      { speaker: "Neighbor", text: "Well, if you ever need any 'help' getting settled, just knock on my door." }
    ]
  },
  "eternum": {
    bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "System", text: "Welcome to Eternum. Synchronizing neural link..." },
      { speaker: "You", text: "Whoa, this feels incredibly real." },
      { speaker: "Guide", text: "That's the point. Welcome to the ultimate virtual reality." }
    ]
  },
  "treasure-of-nadia": {
    bg: "https://images.unsplash.com/photo-1533630654593-b222d5d44449?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Librarian", text: "I found some of your father's old notes. They point to a hidden temple." },
      { speaker: "You", text: "Let me see those. I need to figure out his last location." },
      { speaker: "Librarian", text: "Be careful. Many have gone looking for the treasure of Nadia, but few return." }
    ]
  },
  "being-a-dik": {
    bg: "https://images.unsplash.com/photo-1541535881962-3bb380b08458?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Roommate", text: "Are you ready for the frat party tonight? It's going to be insane." },
      { speaker: "You", text: "I don't know, I should probably study..." },
      { speaker: "Roommate", text: "Come on, man! College is about making memories, not just reading books." }
    ]
  },
  "my-cute-roommate": {
    bg: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&auto=format&fit=crop",
    character: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop",
    dialogues: [
      { speaker: "Roommate", text: "Hey! It's so good to see you again. My place is your place." },
      { speaker: "You", text: "Thanks for letting me crash here while I look for a job." },
      { speaker: "Roommate", text: "No problem at all! Let me show you to your room..." }
    ]
  }
};

const GameEngine = () => {
  const { gameId } = useParams();
  const [step, setStep] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [affection, setAffection] = useState(0);

  const game = gameId && GAME_DATA[gameId] ? GAME_DATA[gameId] : GAME_DATA["harem-hotel"];
  const dialogues = game.dialogues;

  const currentDialogue = dialogues[Math.min(step, dialogues.length - 1)];

  const advanceDialogue = () => {
    if (step < dialogues.length - 1) {
      setStep(s => s + 1);
    } else {
      setShowOptions(true);
    }
  };

  const handleChoice = () => {
    setAffection(a => Math.min(100, a + 15));
    setShowOptions(false);
    setStep(0); // Loop for demo purposes
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans selection:bg-pink-500/30">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={game.bg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      {/* Character Sprite (Simulated) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-[400px] h-[600px] flex justify-center">
        <div className="relative w-full h-full">
          <img 
            src={game.character} 
            alt="Character" 
            className="w-full h-full object-cover object-top mask-image-gradient absolute bottom-0"
            style={{ WebkitMaskImage: 'linear-gradient(to top, transparent, black 10%)' }}
          />
        </div>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          <span className="text-white font-bold text-sm">Affection: {affection}%</span>
        </div>
      </div>

      {/* Dialogue Box */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-30">
        {!showOptions ? (
          <div 
            onClick={advanceDialogue}
            className="w-full bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl cursor-pointer hover:border-pink-500/50 transition-colors shadow-2xl relative"
          >
            <div className="absolute -top-4 left-6 bg-pink-600 text-white px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest shadow-lg">
              {currentDialogue.speaker}
            </div>
            <p className="text-white text-lg md:text-xl font-medium leading-relaxed mt-2">
              "{currentDialogue.text}"
            </p>
            <div className="absolute bottom-4 right-6 text-white/40 text-sm animate-pulse flex items-center gap-2">
              Click to continue <Sparkles className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <button onClick={handleChoice} className="w-full bg-black/80 backdrop-blur-xl border border-white/20 p-4 rounded-xl text-left hover:bg-pink-600/20 hover:border-pink-500 transition-all text-white flex items-center justify-between group">
              <span className="font-medium text-lg">"I'll do whatever you need."</span>
              <MessageCircle className="w-5 h-5 text-white/20 group-hover:text-pink-400" />
            </button>
            <button onClick={handleChoice} className="w-full bg-black/80 backdrop-blur-xl border border-white/20 p-4 rounded-xl text-left hover:bg-blue-600/20 hover:border-blue-500 transition-all text-white flex items-center justify-between group">
              <span className="font-medium text-lg">"Let's keep this strictly professional."</span>
              <MessageCircle className="w-5 h-5 text-white/20 group-hover:text-blue-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameEngine;
