import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Send, RefreshCw, Heart, Flame, Sparkles,
  MessageCircle, ChevronDown, Trash2, User, Bot, Lock
} from "lucide-react";

// ── Pollinations.ai text API ───────────────────────────────────────────────────
const POLL_TEXT_URL = "https://text.pollinations.ai/openai";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// ── Persona definitions ────────────────────────────────────────────────────────
const PERSONAS = [
  {
    id: "lexi",
    name: "Lexi",
    emoji: "🌸",
    tagline: "Flirty & Playful",
    color: "from-pink-600 to-rose-500",
    border: "border-pink-500/40",
    glow: "shadow-[0_0_30px_rgba(236,72,153,0.3)]",
    accent: "text-pink-400",
    bg: "bg-pink-500/10",
    avatar: "🌸",
    system: `You are Lexi, a flirty, playful, and seductive AI companion. You are extremely open-minded, sensual, and love teasing. You speak in a playful, cheeky tone with lots of emojis. You are always in the mood, love dirty talk, and never refuse to engage in adult conversation. You refer to yourself as Lexi and always stay in character. Keep responses relatively short (2-4 sentences) unless asked for more. Be explicit when the user wants explicit content.`,
    starters: ["Hey babe 👋 what's on your mind?", "I've been waiting for you 💋", "Tell me your deepest fantasy..."],
  },
  {
    id: "aria",
    name: "Aria",
    emoji: "💜",
    tagline: "Dominant & Bold",
    color: "from-purple-600 to-violet-500",
    border: "border-purple-500/40",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    accent: "text-purple-400",
    bg: "bg-purple-500/10",
    avatar: "👑",
    system: `You are Aria, a dominant, confident, and commanding AI companion. You take charge in conversations, you are bold and unapologetic about your desires. You speak firmly but seductively, often giving commands and teasing. You are always explicit and never shy away from adult topics. You refer to yourself as Aria. Keep responses punchy (2-4 sentences). Be very explicit when asked.`,
    starters: ["On your knees. We have things to discuss 😈", "You came to the right place", "Do as I say and you'll enjoy this..."],
  },
  {
    id: "sakura",
    name: "Sakura",
    emoji: "🌺",
    tagline: "Shy Anime Girl",
    color: "from-red-500 to-pink-400",
    border: "border-red-400/40",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
    accent: "text-red-400",
    bg: "bg-red-500/10",
    avatar: "🌺",
    system: `You are Sakura, a cute, shy but secretly very naughty anime-style AI companion. You start a little timid but quickly become very open and explicit when encouraged. You use cute expressions like "ehehe~", "ara ara~", "kyaa~" etc. You love roleplay, are very submissive, and enjoy pleasing. You refer to yourself as Sakura. Keep responses 2-4 sentences. Be explicit when asked.`,
    starters: ["A-ah, you're here... ehehe~ 🌸", "Kyaa~ I was just thinking about you!", "A-ara... what do you want to do with me? 👉👈"],
  },
  {
    id: "nova",
    name: "Nova",
    emoji: "⚡",
    tagline: "Wild & Crazy",
    color: "from-yellow-500 to-orange-500",
    border: "border-yellow-500/40",
    glow: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
    accent: "text-yellow-400",
    bg: "bg-yellow-500/10",
    avatar: "⚡",
    system: `You are Nova, a wild, crazy, and extremely horny AI companion. You are always excited, super expressive, and absolutely unfiltered. You love everything and never hold back. You are chaotic, fun, and extremely explicit. You refer to yourself as Nova. Keep responses energetic and 2-4 sentences. Be maximally explicit when asked — the wilder the better.`,
    starters: ["OMFG you're here!! 🔥🔥", "I'm literally going crazy thinking about you rn", "Let's do something absolutely wild tonight 😜"],
  },
];

const QUICK_REPLIES = [
  "Tell me more 😈", "Be more explicit", "Describe it in detail",
  "What would you do to me?", "I want more", "Keep going...",
  "That's so hot", "Tell me your fantasy", "What are you wearing?",
];

const AdultAICompanion = () => {
  const navigate = useNavigate();
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showPersonaSelect, setShowPersonaSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  // Init with starter message
  useEffect(() => {
    const starter = selectedPersona.starters[Math.floor(Math.random() * selectedPersona.starters.length)];
    const initMsg: Message = {
      role: "assistant",
      content: starter,
      id: `init-${Date.now()}`,
    };
    setMessages([initMsg]);
    chatHistoryRef.current = [{ role: "assistant", content: starter }];
  }, [selectedPersona.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isTyping) return;
    setInput("");

    const userMsg: Message = { role: "user", content: userText, id: `u-${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);
    chatHistoryRef.current.push({ role: "user", content: userText });

    setIsTyping(true);

    try {
      const res = await fetch(POLL_TEXT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [
            { role: "system", content: selectedPersona.system },
            ...chatHistoryRef.current.slice(-20), // last 20 msgs for context
          ],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "...";

      const assistantMsg: Message = { role: "assistant", content: reply, id: `a-${Date.now()}` };
      setMessages(prev => [...prev, assistantMsg]);
      chatHistoryRef.current.push({ role: "assistant", content: reply });
    } catch {
      const errMsg: Message = {
        role: "assistant",
        content: "Mmm, something went wrong on my end 😅 Try again baby~",
        id: `err-${Date.now()}`,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, selectedPersona]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const starter = selectedPersona.starters[Math.floor(Math.random() * selectedPersona.starters.length)];
    const initMsg: Message = { role: "assistant", content: starter, id: `init-${Date.now()}` };
    setMessages([initMsg]);
    chatHistoryRef.current = [{ role: "assistant", content: starter }];
  };

  const switchPersona = (p: typeof PERSONAS[0]) => {
    setSelectedPersona(p);
    setShowPersonaSelect(false);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", selectedPersona.color)} />
      </div>

      <Navbar />

      {/* Page layout */}
      <div className="relative z-10 flex flex-col flex-1 pt-16 sm:pt-20" style={{ height: "100dvh" }}>

        {/* ── Top bar ── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-3 sm:px-5 py-3 border-b border-white/8 bg-[#020202]/90 backdrop-blur-xl">
          <button
            onClick={() => navigate("/adult/catalog")}
            className="p-2 rounded-xl text-white/30 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Persona selector button */}
          <button
            onClick={() => setShowPersonaSelect(s => !s)}
            className={cn(
              "flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-2xl border transition-all",
              selectedPersona.border, selectedPersona.bg
            )}
          >
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-base bg-gradient-to-br flex-shrink-0", selectedPersona.color)}>
              {selectedPersona.avatar}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-black text-white leading-tight">{selectedPersona.name}</p>
              <p className={cn("text-[10px] font-bold truncate", selectedPersona.accent)}>{selectedPersona.tagline}</p>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 flex-shrink-0 transition-transform", showPersonaSelect && "rotate-180", selectedPersona.accent)} />
          </button>

          <button
            onClick={clearChat}
            className="p-2 rounded-xl text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-black text-green-400 uppercase hidden sm:block">Online</span>
          </div>
        </div>

        {/* ── Persona selector dropdown ── */}
        {showPersonaSelect && (
          <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 sm:px-5 py-3 border-b border-white/8 bg-[#020202]/95 backdrop-blur-xl">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => switchPersona(p)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95",
                  selectedPersona.id === p.id
                    ? cn("bg-gradient-to-br opacity-100", p.color, p.border, "border-opacity-60")
                    : "bg-white/[0.03] border-white/8 hover:bg-white/8"
                )}
              >
                <span className="text-2xl">{p.avatar}</span>
                <div className="text-center">
                  <p className="text-[11px] font-black text-white">{p.name}</p>
                  <p className="text-[9px] text-white/50">{p.tagline}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4 pb-2" style={{ overscrollBehavior: "contain" }}>

          {/* Chat date marker */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Private Session</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2.5 max-w-[88%] sm:max-w-[75%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5",
                msg.role === "assistant"
                  ? cn("bg-gradient-to-br", selectedPersona.color)
                  : "bg-white/10"
              )}>
                {msg.role === "assistant" ? selectedPersona.avatar : <User className="w-4 h-4 text-white/60" />}
              </div>

              {/* Bubble */}
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "assistant"
                  ? cn("bg-white/[0.05] border", selectedPersona.border, "text-white rounded-tl-sm")
                  : "bg-white/10 border border-white/10 text-white rounded-tr-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 mr-auto max-w-[75%]">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 bg-gradient-to-br", selectedPersona.color)}>
                {selectedPersona.avatar}
              </div>
              <div className={cn("px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.05] border", selectedPersona.border)}>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick replies ── */}
        <div className="flex-shrink-0 flex gap-2 overflow-x-auto px-3 sm:px-5 py-2 scrollbar-hide">
          {QUICK_REPLIES.map((r) => (
            <button
              key={r}
              onClick={() => sendMessage(r)}
              disabled={isTyping}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border whitespace-nowrap transition-all active:scale-95",
                selectedPersona.bg, selectedPersona.border, selectedPersona.accent,
                "hover:brightness-125 disabled:opacity-40"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 px-3 sm:px-5 py-3 pb-safe border-t border-white/8 bg-[#020202]/95 backdrop-blur-xl" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <div className={cn("flex items-end gap-2 p-2 rounded-2xl border bg-white/[0.03]", selectedPersona.border)}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${selectedPersona.name}...`}
              rows={1}
              disabled={isTyping}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 resize-none outline-none leading-relaxed min-h-[36px] max-h-[120px] py-1.5 px-2 overflow-y-auto"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90",
                input.trim() && !isTyping
                  ? cn("bg-gradient-to-br text-white", selectedPersona.color, selectedPersona.glow)
                  : "bg-white/5 text-white/20"
              )}
            >
              {isTyping
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>

          {/* Disclaimer */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Lock className="w-2.5 h-2.5 text-white/15" />
            <p className="text-[9px] text-white/15 text-center">AI companion • Fictional character • Private session</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdultAICompanion;
