import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── Audio timing constants (seconds) ─────────────────────────────────────────
// Tuned to the PS2 startup audio:
//  0.0s – silence / first low hum
//  2.0s – deep rumble starts building
//  4.2s – towers should start rising
//  7.5s – logo appears
// 10.5s – full glow / hold
// 12.5s – fade out begins
const TIMING = {
  TOWERS_START: 4200,   // ms – towers begin rising
  LOGO_APPEAR:  7500,   // ms – logo fades in
  LOGO_GLOW:   10500,   // ms – logo at full glow
  FADE_OUT:    12200,   // ms – whole screen fades to black
  DONE:        13800,   // ms – callback fires, component unmounts
};

// ─── Tower data (mimic PS2's varied heights and positions) ────────────────────
interface Tower {
  x: number;     // % from left
  delay: number; // ms extra delay
  height: number; // vh units
  width: number;  // px
  brightness: number; // 0–1
}

function generateTowers(count: number): Tower[] {
  const towers: Tower[] = [];
  for (let i = 0; i < count; i++) {
    towers.push({
      x: 2 + (i / count) * 96,
      delay: Math.random() * 2200,
      height: 8 + Math.random() * 55,
      width: 3 + Math.random() * 9,
      brightness: 0.3 + Math.random() * 0.7,
    });
  }
  return towers;
}

const TOWERS = generateTowers(160);

// ─── Component ────────────────────────────────────────────────────────────────
interface PS2IntroProps {
  onComplete: () => void;
}

const PS2Intro = ({ onComplete }: PS2IntroProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = useState<"idle" | "towers" | "logo" | "glow" | "fade">("idle");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Create and play audio immediately
    const audio = new Audio("/ps2_start_up.mp3");
    audio.volume = 1.0;
    audioRef.current = audio;

    audio.play().catch((e) => {
      console.warn("PS2 audio blocked, continuing anyway:", e);
    });

    // Schedule visual phases to match audio
    const t1 = setTimeout(() => setPhase("towers"), TIMING.TOWERS_START);
    const t2 = setTimeout(() => setPhase("logo"),   TIMING.LOGO_APPEAR);
    const t3 = setTimeout(() => setPhase("glow"),   TIMING.LOGO_GLOW);
    const t4 = setTimeout(() => setPhase("fade"),   TIMING.FADE_OUT);
    const t5 = setTimeout(() => {
      setVisible(false);
      audio.pause();
      onComplete();
    }, TIMING.DONE);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      audio.pause();
    };
  }, [onComplete]);

  if (!visible) return null;

  const showTowers = phase === "towers" || phase === "logo" || phase === "glow" || phase === "fade";
  const showLogo   = phase === "logo"   || phase === "glow"  || phase === "fade";
  const fullGlow   = phase === "glow"   || phase === "fade";
  const fading     = phase === "fade";

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        overflow: "hidden",
        transition: fading ? "opacity 1.6s ease-in-out" : undefined,
        opacity: fading ? 0 : 1,
        cursor: "none",
      }}
    >
      {/* Subtle star-field background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 60%, #020a14 0%, #000 70%)",
        }}
      />

      {/* ── Rising towers ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {TOWERS.map((t, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${t.x}%`,
              bottom: 0,
              width: t.width,
              height: showTowers ? `${t.height}vh` : 0,
              background: `rgba(${Math.round(20 + t.brightness * 40)}, ${Math.round(100 + t.brightness * 100)}, ${Math.round(160 + t.brightness * 80)}, ${t.brightness * 0.55})`,
              boxShadow: showTowers
                ? `0 0 ${6 + t.brightness * 14}px rgba(34,160,220,${t.brightness * 0.5})`
                : "none",
              transition: showTowers
                ? `height ${1.4 + t.delay / 3000}s cubic-bezier(0.16,1,0.3,1) ${t.delay}ms, box-shadow 0.5s ease`
                : "none",
              borderRadius: "1px 1px 0 0",
              transformOrigin: "bottom",
            }}
          />
        ))}
      </div>

      {/* ── Atmospheric ground fog ── */}
      {showTowers && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "18vh",
            background: "linear-gradient(to top, rgba(10,40,80,0.55) 0%, transparent 100%)",
            transition: "opacity 1.5s ease",
          }}
        />
      )}

      {/* ── JARVIS HUB Logo ── */}
      {showLogo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            animation: "ps2LogoIn 1.4s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          {/* JARVIS gif */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              overflow: "hidden",
              border: fullGlow
                ? "2px solid rgba(34,211,238,0.8)"
                : "2px solid rgba(34,211,238,0.3)",
              boxShadow: fullGlow
                ? "0 0 40px rgba(34,211,238,0.7), 0 0 80px rgba(34,211,238,0.3)"
                : "0 0 15px rgba(34,211,238,0.3)",
              transition: "box-shadow 1s ease, border 1s ease",
            }}
          >
            <img
              src="/JARVIS2.gif"
              alt="JARVIS"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Logo text */}
          <div style={{ textAlign: "center", lineHeight: 1.1 }}>
            <div
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontSize: 52,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: fullGlow ? "#fff" : "rgba(255,255,255,0.85)",
                textShadow: fullGlow
                  ? "0 0 30px rgba(34,211,238,0.8), 0 0 60px rgba(34,211,238,0.4)"
                  : "0 0 10px rgba(34,211,238,0.3)",
                transition: "text-shadow 1s ease, color 1s ease",
              }}
            >
              JARVIS<span style={{ color: "hsl(190,100%,50%)" }}>HUB</span>
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.45em",
                color: fullGlow ? "rgba(34,211,238,0.9)" : "rgba(34,211,238,0.5)",
                textTransform: "uppercase",
                marginTop: 8,
                transition: "color 1s ease",
              }}
            >
              Intelligence System Online
            </div>
          </div>
        </div>
      )}

      {/* Skip hint */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 28,
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "color 0.3s",
          pointerEvents: "auto",
        }}
        onClick={() => {
          audioRef.current?.pause();
          setVisible(false);
          onComplete();
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        Skip intro
      </div>

      {/* CSS for logo fade-in */}
      <style>{`
        @keyframes ps2LogoIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PS2Intro;
