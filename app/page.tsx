"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 0 | 1 | 2 | 3 | 4;
const TOTAL_STEPS = 5;

const BG_IMAGES = [
  "/step1-envelope-closed.png",
  "/step2-message.png",
  "/step3-gifts.png",
  "/step4-cat-envelope.png",
];

const HINTS = [
  "Toca para abrir ♥",
  "← voltar  ·  continuar →",
  "← voltar  ·  continuar →",
  "← voltar  ·  ver vídeo ♥",
];

const BALLOON_COLORS = ["#e91e8c", "#ffd700", "#ce93d8", "#f48fb1", "#ff6b9d", "#c2185b", "#ffe082", "#e040fb"];

const BALLOONS = Array.from({ length: 11 }, (_, i) => ({
  id: i,
  left: `${4 + (i * 8.8) % 90}%`,
  color: BALLOON_COLORS[i % BALLOON_COLORS.length],
  delay: i * 0.15,
  duration: 5.5 + (i % 4) * 0.8,
  size: 0.85 + (i % 3) * 0.12,
}));

const HEARTS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${4 + (i * 6.8) % 92}%`,
  delay: i * 0.6,
  duration: 5 + (i % 5),
  size: 13 + (i % 4) * 5,
  char: ["♥", "💕", "🌸", "✿"][i % 4],
}));

export default function Home() {
  const [step, setStep] = useState<Step>(0);
  const [preloaded, setPreloaded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [envelopeZoomed, setEnvelopeZoomed] = useState(false);
  const [tapFlash, setTapFlash] = useState<"left" | "right" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const advancingRef = useRef(false);

  useEffect(() => {
    const srcs = [...BG_IMAGES];
    let loaded = 0;
    srcs.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (++loaded === srcs.length) setPreloaded(true);
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.45;
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted((m) => !m);
  }, []);

  const flash = (side: "left" | "right") => {
    setTapFlash(side);
    setTimeout(() => setTapFlash(null), 220);
  };

  const handleTap = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (advancingRef.current) return;

    const isLeft = e.clientX < e.currentTarget.offsetWidth / 2;

    if (isLeft) {
      // Go back
      if (step === 0) return;
      flash("left");
      setStep((s) => (s - 1) as Step);
    } else {
      // Go forward
      if (step >= 4) return;
      flash("right");
      advancingRef.current = true;

      if (step === 0) {
        setEnvelopeZoomed(true);
        if (audioRef.current) audioRef.current.play().catch(() => {});
        setTimeout(() => {
          setStep(1);
          setEnvelopeZoomed(false);
          advancingRef.current = false;
        }, 520);
      } else {
        setStep((s) => (s + 1) as Step);
        advancingRef.current = false;
      }
    }
  }, [step]);

  return (
    <main
      onClick={handleTap}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#000",
        /* dvh for mobile browsers — collapses with browser chrome */
        height: "100dvh",
        cursor: step < 4 ? "pointer" : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* ── Tap flash feedback (Instagram-style) ── */}
      <AnimatePresence>
        {tapFlash && (
          <motion.div
            key={tapFlash}
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              [tapFlash === "left" ? "left" : "right"]: 0,
              width: "50%",
              background: "rgba(255,255,255,0.18)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Background images steps 0-3 ── */}
      <AnimatePresence>
        {step <= 3 && (
          <motion.div
            key={`bg-${step}`}
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: envelopeZoomed ? 1.12 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.6, ease: "easeInOut" },
              scale: { duration: 0.5, ease: "easeIn" },
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BG_IMAGES[step]}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 4: full-screen video ── */}
      <AnimatePresence>
        {step === 4 && (
          <motion.div
            key="video"
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          >
            <video
              src="/video.mp4"
              autoPlay
              loop
              muted={muted}
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />

            {/* Balloons burst */}
            {BALLOONS.map((b) => (
              <motion.div
                key={b.id}
                style={{
                  position: "absolute",
                  left: b.left,
                  bottom: 0,
                  zIndex: 15,
                  pointerEvents: "none",
                  scale: b.size,
                  transformOrigin: "bottom center",
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{
                  y: "-115vh",
                  rotate: [-4, 4, -5, 3, -3, 4, -4],
                  opacity: [0, 1, 1, 1, 0],
                }}
                transition={{
                  duration: b.duration,
                  delay: b.delay,
                  y: { ease: "easeOut" },
                  rotate: {
                    duration: b.duration * 0.55,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: b.delay,
                  },
                  opacity: {
                    times: [0, 0.08, 0.5, 0.78, 1],
                    ease: "linear",
                  },
                }}
              >
                <BalloonSVG color={b.color} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating hearts ── */}
      {preloaded &&
        HEARTS.map((h) => (
          <motion.span
            key={h.id}
            style={{
              position: "absolute",
              left: h.left,
              bottom: -30,
              fontSize: h.size,
              pointerEvents: "none",
              zIndex: 10,
            }}
            animate={{ y: [-30, -1300], opacity: [0, 0.8, 0.8, 0] }}
            transition={{
              duration: h.duration,
              delay: h.delay,
              repeat: Infinity,
              repeatDelay: h.duration * 0.4,
              ease: "linear",
            }}
          >
            {h.char}
          </motion.span>
        ))}

      {/* ── Progress bar (respects safe-area-inset-top) ── */}
      {preloaded && (
        <div
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 0px) + 12px)",
            left: 12,
            right: 12,
            display: "flex",
            gap: 6,
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                overflow: "hidden",
                background: "rgba(255,255,255,0.28)",
              }}
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i <= step ? 1 : 0 }}
                transition={{ duration: i === step ? 0.3 : 0, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: "#fff",
                  transformOrigin: "left",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Mute button (44×44 touch target) ── */}
      <AnimatePresence>
        {preloaded && step >= 1 && (
          <motion.button
            onClick={toggleMute}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileTap={{ scale: 0.88 }}
            style={{
              position: "absolute",
              top: "calc(env(safe-area-inset-top, 0px) + 24px)",
              right: 12,
              zIndex: 21,
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            {muted ? "🔇" : "🔊"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Tap hint (respects safe-area-inset-bottom) ── */}
      <AnimatePresence>
        {step <= 3 && preloaded && !envelopeZoomed && (
          <motion.div
            key={`hint-${step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: step === 0 ? 1.2 : 0.9 }}
            style={{
              position: "absolute",
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: "10px 24px",
                borderRadius: 99,
                color: "#fff",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                background: "rgba(0,0,0,0.32)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                fontFamily: "var(--font-lato)",
              }}
            >
              {HINTS[step]}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {!preloaded && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(160deg,#fce4ec,#f8bbd9)",
              zIndex: 50,
            }}
          >
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                color: "#c06080",
                fontSize: 13,
                letterSpacing: "0.15em",
                fontFamily: "var(--font-lato)",
              }}
            >
              A preparar o teu presente... ♥
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ── Balloon SVG component ── */
function BalloonSVG({ color }: { color: string }) {
  const dark = shadeColor(color, -25);
  return (
    <svg width="56" height="92" viewBox="0 0 56 92" fill="none">
      {/* Body */}
      <ellipse cx="28" cy="29" rx="24" ry="27" fill={color} />
      {/* Side shading */}
      <ellipse cx="28" cy="29" rx="24" ry="27" fill={`url(#grad-${color.replace("#", "")})`} />
      <defs>
        <radialGradient id={`grad-${color.replace("#", "")}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor={dark} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {/* Highlight */}
      <ellipse cx="19" cy="19" rx="6" ry="8" fill="rgba(255,255,255,0.32)" transform="rotate(-20 19 19)" />
      {/* Knot triangle */}
      <polygon points="28,56 24,63 32,63" fill={dark} />
      {/* String */}
      <path
        d="M28 63 Q33 71 24 79 Q19 83 28 92"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* "26" label */}
      <text
        x="28"
        y="35"
        textAnchor="middle"
        fill="white"
        fontSize="15"
        fontWeight="800"
        fontFamily="serif"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
      >
        26
      </text>
    </svg>
  );
}

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
