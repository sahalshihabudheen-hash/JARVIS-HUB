import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── Audio timing (tuned to ps2_start_up.mp3) ────────────────────────────────
const T = {
  GLOW_START:   800,
  TOWERS_START: 4000,
  LOGO_APPEAR:  7400,
  LOGO_FULL:   10200,
  FADE_OUT:    12000,
  DONE:        13600,
};

// ─── Stars ───────────────────────────────────────────────────────────────────
interface Star { x: number; y: number; size: number; opacity: number; twinkle: number }
function buildStars(n: number): Star[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.6 + Math.random() * 1.8,
    opacity: 0.15 + Math.random() * 0.75,
    twinkle: 2 + Math.random() * 6,
  }));
}
const STARS = buildStars(240);

// ─── Towers ───────────────────────────────────────────────────────────────────
interface Tower {
  x: number; delay: number; height: number; width: number;
  hue: number; sat: number; lit: number; opacity: number;
}
function buildTowers(count: number): Tower[] {
  const out: Tower[] = [];
  for (let i = 0; i < count; i++) {
    const cluster = Math.floor(Math.random() * 5);
    const baseX = (cluster / 5) * 90 + 5;
    out.push({
      x: baseX + (Math.random() - 0.5) * 20,
      delay: Math.random() * 3400,
      height: 5 + Math.random() * 72,
      width: 2 + Math.random() * 10,
      hue: 200 + Math.random() * 50,   // dark indigo → blue
      sat: 60 + Math.random() * 35,
      lit: 18 + Math.random() * 28,
      opacity: 0.25 + Math.random() * 0.65,
    });
  }
  return out;
}
const TOWERS = buildTowers(180);

// ─── Particles ────────────────────────────────────────────────────────────────
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
  const onCompleteRef = useRef(onComplete);
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  // Keep ref current so we always call the latest callback
  useEffect(() => { onCompleteRef.current = onComplete; });

  // Empty deps — runs ONCE on mount only, never on re-renders
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
      setTimeout(() => { audio.pause(); setVisible(false); onCompleteRef.current(); }, T.DONE),
    ];
    return () => { timers.forEach(clearTimeout); audio.pause(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const skip = () => { audioRef.current?.pause(); setVisible(false); onComplete(); };

  if (!visible) return null;

  const showGlow   = phase >= 1;
  const showTowers = phase >= 2;
  const showLogo   = phase >= 3;
  const fullGlow   = phase >= 4;
  const fading     = phase >= 5;

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#010208", overflow: "hidden",
      opacity: fading ? 0 : 1,
      transition: fading ? "opacity 1.5s ease-in-out" : "none",
      cursor: "none",
    }}>

      {/* ── Deep purple-blue nebula (visible from frame 1) ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 120% 80% at 25% 75%, rgba(20,5,80,0.85) 0%, transparent 52%),
          radial-gradient(ellipse 100% 60% at 80% 25%, rgba(0,15,90,0.8) 0%, transparent 50%),
          radial-gradient(ellipse 80% 80% at 55% 55%, rgba(4,8,38,1) 0%, #010208 100%)
        `,
      }} />

      {/* ── Starfield — twinkling from frame 1 ── */}
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          borderRadius: "50%",
          background: "#fff",
          opacity: s.opacity,
          animation: `starTwinkle ${s.twinkle}s ease-in-out infinite`,
          animationDelay: `${(i * 0.07) % s.twinkle}s`,
        }} />
      ))}


      {/* ── Centre glow pulse (appears at 0.8s, expands at 4s) ── */}
      {showGlow && (
        <div style={{
          position: "absolute", left: "50%", top: "52%",
          width: showTowers ? 700 : 60,
          height: showTowers ? 400 : 60,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(20,80,200,0.25) 0%, transparent 70%)",
          transition: "width 2s ease, height 2s ease, opacity 2s ease",
          opacity: showTowers ? 0.8 : 0.45,
          pointerEvents: "none",
        }} />
      )}

      {/* ── Rising towers ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "100%",
        perspective: "900px", perspectiveOrigin: "50% 100%",
      }}>
        {TOWERS.map((t, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${t.x}%`, bottom: 0,
            width: t.width,
            height: showTowers ? `${t.height}vh` : "0",
            background: `linear-gradient(
              to top,
              hsla(${t.hue},${t.sat}%,${t.lit + 12}%,${t.opacity}) 0%,
              hsla(${t.hue},${t.sat}%,${t.lit}%,${t.opacity * 0.5}) 65%,
              transparent 100%
            )`,
            boxShadow: showTowers
              ? `0 0 ${4 + t.opacity * 10}px hsla(${t.hue},75%,55%,${t.opacity * 0.35})`
              : "none",
            transition: `height ${1.1 + t.delay / 2200}s cubic-bezier(0.16,1,0.3,1) ${t.delay}ms`,
            borderRadius: "1px 1px 0 0",
          }} />
        ))}
      </div>

      {/* ── Ground haze ── */}
      {showTowers && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "20vh",
          background: "linear-gradient(to top, rgba(3,12,55,0.75) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Floating particles ── */}
      {showTowers && PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.x}%`, bottom: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: `rgba(100,180,255,${p.opacity})`,
          animation: `particleFloat ${p.speed}s linear infinite`,
          animationDelay: `${-(i * 0.4) % p.speed}s`,
          pointerEvents: "none",
        }} />
      ))}

      {/* ── CRT scanlines ── */}
      {showTowers && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
        }} />
      )}

      {/* ── JARVIS HUB Logo reveal ── */}
      {showLogo && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 18,
          animation: "ps2FadeUp 1.6s cubic-bezier(0.22,1,0.36,1) forwards",
          pointerEvents: "none",
        }}>
          <div style={{
            width: 86, height: 86, borderRadius: "50%", overflow: "hidden",
            border: `2px solid rgba(255,255,255,${fullGlow ? 0.9 : 0.4})`,
            boxShadow: fullGlow
              ? "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(34,211,238,0.35)"
              : "0 0 14px rgba(255,255,255,0.15)",
            transition: "box-shadow 1.2s ease, border 1.2s ease",
          }}>
            <img src="/JARVIS2.gif" alt="JARVIS"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          <div style={{ textAlign: "center" }}>
            {/* JARVIS = white   HUB = electric cyan */}
            <div style={{
              fontFamily: "'Outfit','Inter',sans-serif",
              fontSize: 60, fontWeight: 900,
              letterSpacing: "-0.02em", lineHeight: 1,
            }}>
              <span style={{
                color: "#ffffff",
                textShadow: fullGlow
                  ? "0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.4)"
                  : "0 0 8px rgba(255,255,255,0.25)",
                transition: "text-shadow 1.2s ease",
              }}>JARVIS</span>
              <span style={{
                color: "#00e5ff",
                textShadow: fullGlow
                  ? "0 0 30px rgba(0,229,255,1), 0 0 65px rgba(0,229,255,0.55)"
                  : "0 0 8px rgba(0,229,255,0.25)",
                transition: "text-shadow 1.2s ease",
              }}>HUB</span>
            </div>

            {/* Subtitle — silver, clearly different from towers or text */}
            <div style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 10, fontWeight: 600,
              letterSpacing: "0.55em", textTransform: "uppercase",
              marginTop: 12,
              color: fullGlow ? "rgba(190,215,225,0.8)" : "rgba(190,215,225,0.3)",
              transition: "color 1.2s ease",
            }}>
              Movie Hub
            </div>
          </div>
        </div>
      )}

      {/* ── "Initializing..." blink ── */}
      {showTowers && !showLogo && (
        <div style={{
          position: "absolute", bottom: 24, left: 26,
          fontSize: 9, fontFamily: "Inter,sans-serif",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(34,211,238,0.3)",
          animation: "blink 1.2s step-end infinite",
        }}>
          Initializing...
        </div>
      )}

      {/* ── Skip ── */}
      <button onClick={skip} style={{
        position: "absolute", bottom: 22, right: 26,
        background: "none", border: "none",
        color: "rgba(255,255,255,0.18)",
        fontSize: 10, fontFamily: "Inter,sans-serif",
        letterSpacing: "0.18em", textTransform: "uppercase",
        cursor: "pointer", pointerEvents: "auto",
        transition: "color 0.3s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}
      >Skip ›</button>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes ps2FadeUp {
          from { opacity:0; transform:translateY(22px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes starTwinkle {
          0%,100% { opacity: var(--base-op, 0.5); }
          50%      { opacity: 0.1; }
        }
        @keyframes particleFloat {
          0%   { transform:translateY(0);     opacity:0;   }
          10%  { opacity:1; }
          90%  { opacity:0.4; }
          100% { transform:translateY(-80vh); opacity:0;   }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PS2Intro;
