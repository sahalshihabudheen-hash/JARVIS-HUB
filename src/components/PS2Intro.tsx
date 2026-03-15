import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── Audio timing constants (tuned to ps2_start_up.mp3) ──────────────────────
const T = {
  GLOW_START:    800,   // initial centre glow pulse
  TOWERS_START:  4000,  // towers begin rising
  LOGO_APPEAR:   7400,  // logo fades in
  LOGO_FULL:    10200,  // logo at peak brightness
  FADE_OUT:     12000,  // screen fades to black
  DONE:         13600,  // onComplete fires
};

// ─── Tower data ───────────────────────────────────────────────────────────────
interface Tower {
  x: number;
  delay: number;
  height: number;
  width: number;
  hue: number;       // colour hue (varied purples / blues)
  sat: number;
  lit: number;
  opacity: number;
}

function buildTowers(count: number): Tower[] {
  const out: Tower[] = [];
  for (let i = 0; i < count; i++) {
    // Group towers into clusters (PS2 had varied density)
    const cluster = Math.floor(Math.random() * 5);
    const baseX = (cluster / 5) * 90 + 5;
    out.push({
      x: baseX + (Math.random() - 0.5) * 20,
      delay: Math.random() * 3400,           // stagger over 3.4 s
      height: 5 + Math.random() * 72,        // 5–77 vh
      width: 2 + Math.random() * 10,
      hue: 200 + Math.random() * 50,         // deep blue → indigo
      sat: 60 + Math.random() * 35,
      lit: 18 + Math.random() * 28,          // dark — distinct from white text
      opacity: 0.25 + Math.random() * 0.65,
    });
  }
  return out;
}

const TOWERS = buildTowers(180);

// ─── Floating particles ───────────────────────────────────────────────────────
interface Particle { x: number; y: number; size: number; speed: number; opacity: number }
function buildParticles(n: number): Particle[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * 100,
    y: 20 + Math.random() * 80,
    size: 1 + Math.random() * 2,
    speed: 8 + Math.random() * 18,
    opacity: 0.1 + Math.random() * 0.4,
  }));
}
const PARTICLES = buildParticles(40);

// ─── Component ────────────────────────────────────────────────────────────────
const PS2Intro = ({ onComplete }: { onComplete: () => void }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase]   = useState(0); // 0→idle 1→glow 2→towers 3→logo 4→full 5→fade
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const audio = new Audio("/ps2_start_up.mp3");
    audio.volume = 1.0;
    audioRef.current = audio;
    audio.play().catch(() => {});

    const timers = [
      setTimeout(() => setPhase(1), T.GLOW_START),
      setTimeout(() => setPhase(2), T.TOWERS_START),
      setTimeout(() => setPhase(3), T.LOGO_APPEAR),
      setTimeout(() => setPhase(4), T.LOGO_FULL),
      setTimeout(() => setPhase(5), T.FADE_OUT),
      setTimeout(() => { setVisible(false); audio.pause(); onComplete(); }, T.DONE),
    ];
    return () => { timers.forEach(clearTimeout); audio.pause(); };
  }, [onComplete]);

  const skip = () => {
    audioRef.current?.pause();
    setVisible(false);
    onComplete();
  };

  if (!visible) return null;

  const showGlow   = phase >= 1;
  const showTowers = phase >= 2;
  const showLogo   = phase >= 3;
  const fullGlow   = phase >= 4;
  const fading     = phase >= 5;

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000", overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 1.5s ease-in-out" : "none",
        cursor: "none",
      }}
    >
      {/* ── Deep space radial gradient ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 55%, #010818 0%, #000 75%)",
      }} />

      {/* ── Dramatic centre glow (appears before towers, like PS2) ── */}
      {showGlow && (
        <div style={{
          position: "absolute",
          left: "50%", top: "52%",
          width: showTowers ? 600 : 60,
          height: showTowers ? 350 : 60,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(30,100,200,0.22) 0%, transparent 70%)",
          transition: "width 2s ease, height 2s ease, opacity 2s ease",
          opacity: showTowers ? 0.7 : 0.4,
          pointerEvents: "none",
        }} />
      )}

      {/* ── Towers rising from the dark ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "100%",
        perspective: "900px", perspectiveOrigin: "50% 100%",
      }}>
        {TOWERS.map((t, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${t.x}%`,
              bottom: 0,
              width: t.width,
              height: showTowers ? `${t.height}vh` : "0",
              background: `linear-gradient(
                to top,
                hsla(${t.hue},${t.sat}%,${t.lit + 12}%,${t.opacity}) 0%,
                hsla(${t.hue},${t.sat}%,${t.lit}%,${t.opacity * 0.6}) 60%,
                transparent 100%
              )`,
              boxShadow: showTowers
                ? `0 0 ${4 + t.opacity * 12}px hsla(${t.hue},80%,55%,${t.opacity * 0.4})`
                : "none",
              transition: `height ${1.2 + t.delay / 2200}s cubic-bezier(0.16,1,0.3,1) ${t.delay}ms`,
              borderRadius: "1px 1px 0 0",
              transformOrigin: "bottom center",
            }}
          />
        ))}
      </div>

      {/* ── Atmospheric ground haze ── */}
      {showTowers && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "22vh",
          background: "linear-gradient(to top, rgba(5,20,60,0.7) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Floating particles ── */}
      {showTowers && PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `rgba(100,180,255,${p.opacity})`,
            animation: `particleFloat ${p.speed}s linear infinite`,
            animationDelay: `${-Math.random() * p.speed}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Horizontal scan line sweep (pure PS2 feel) ── */}
      {showTowers && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        }} />
      )}

      {/* ── JARVIS HUB Logo ── */}
      {showLogo && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 18,
          animation: "ps2FadeUp 1.6s cubic-bezier(0.22,1,0.36,1) forwards",
          pointerEvents: "none",
        }}>
          {/* Animated GIF */}
          <div style={{
            width: 86, height: 86, borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid rgba(255,255,255,${fullGlow ? 0.9 : 0.4})`,
            boxShadow: fullGlow
              ? "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(34,211,238,0.3)"
              : "0 0 15px rgba(255,255,255,0.2)",
            transition: "box-shadow 1.2s ease, border 1.2s ease",
          }}>
            <img src="/JARVIS2.gif" alt="JARVIS"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Main wordmark — WHITE for JARVIS, CYAN for HUB */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontSize: 58, fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>
              <span style={{
                color: "#ffffff",
                textShadow: fullGlow
                  ? "0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.4)"
                  : "0 0 8px rgba(255,255,255,0.3)",
                transition: "text-shadow 1.2s ease",
              }}>JARVIS</span>
              <span style={{
                color: "#00e5ff",
                textShadow: fullGlow
                  ? "0 0 30px rgba(0,229,255,0.95), 0 0 60px rgba(0,229,255,0.5)"
                  : "0 0 8px rgba(0,229,255,0.3)",
                transition: "text-shadow 1.2s ease",
              }}>HUB</span>
            </div>

            {/* Subtitle — silver/gray, clearly distinct */}
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10, fontWeight: 600,
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              marginTop: 12,
              color: fullGlow ? "rgba(180,210,220,0.85)" : "rgba(180,210,220,0.35)",
              transition: "color 1.2s ease",
            }}>
              Intelligence System Online
            </div>
          </div>
        </div>
      )}

      {/* ── Skip button ── */}
      <button
        onClick={skip}
        style={{
          position: "absolute", bottom: 22, right: 26,
          background: "none", border: "none",
          color: "rgba(255,255,255,0.2)",
          fontSize: 10, fontFamily: "Inter, sans-serif",
          letterSpacing: "0.18em", textTransform: "uppercase",
          cursor: "pointer", pointerEvents: "auto",
          transition: "color 0.3s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        Skip ›
      </button>

      {/* ── Phase indicator dot (bottom-left, subtle) ── */}
      {showTowers && !showLogo && (
        <div style={{
          position: "absolute", bottom: 24, left: 26,
          fontSize: 9, fontFamily: "Inter, sans-serif",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(34,211,238,0.35)",
          animation: "blink 1.2s step-end infinite",
        }}>
          Initializing...
        </div>
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes ps2FadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0)    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-80vh); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PS2Intro;
