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

const BALLOON_COLORS = ["#e91e8c","#ffd700","#ce93d8","#f48fb1","#ff6b9d","#c2185b","#ffe082","#e040fb"];
const BALLOONS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: 3 + (i * 9.5) % 88,
  color: BALLOON_COLORS[i % BALLOON_COLORS.length],
  delay: i * 0.5,
  duration: 12 + (i % 5) * 2,   // 12-20s — nice slow float
  scale: 0.8 + (i % 3) * 0.15,
}));

const HINTS = [
  "Toca para abrir ♥",
  "← voltar  ·  continuar →",
  "← voltar  ·  continuar →",
  "← voltar  ·  ver vídeo ♥",
];


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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const musicWasPlayingRef = useRef(false);
  const advancingRef = useRef(false);

  // Preload images
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

  // Init background music
  useEffect(() => {
    audioRef.current = new Audio("/music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.45;
  }, []);

  // Swap music ↔ video audio when entering/leaving step 4
  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    if (step === 4) {
      // Remember if music was playing and pause it
      if (!audio.paused) musicWasPlayingRef.current = true;
      audio.pause();
      // Unmute and play video audio
      if (video) {
        video.muted = false;
        video.play().catch(() => {});
      }
    } else {
      // Pause & reset video
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      // Resume background music if it was playing before
      if (musicWasPlayingRef.current) {
        musicWasPlayingRef.current = false;
        audio.play().catch(() => {});
      }
    }
  }, [step]);

  // Mute button: controls video on step 4, background music otherwise
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !muted;
    setMuted(newMuted);
    if (step === 4) {
      if (videoRef.current) videoRef.current.muted = newMuted;
    } else {
      if (audioRef.current) audioRef.current.muted = newMuted;
    }
  }, [muted, step]);

  const flash = (side: "left" | "right") => {
    setTapFlash(side);
    setTimeout(() => setTapFlash(null), 220);
  };

  const handleTap = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (advancingRef.current) return;
    const isLeft = e.clientX < e.currentTarget.offsetWidth / 2;

    if (isLeft) {
      if (step === 0) return;
      flash("left");
      setStep((s) => (s - 1) as Step);
    } else {
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
        height: "100dvh",
        cursor: step < 4 ? "pointer" : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* ── Tap flash ── */}
      <AnimatePresence>
        {tapFlash && (
          <motion.div
            key={tapFlash}
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute", top: 0, bottom: 0,
              [tapFlash === "left" ? "left" : "right"]: 0,
              width: "50%",
              background: "rgba(255,255,255,0.18)",
              zIndex: 30, pointerEvents: "none",
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
              src={BG_IMAGES[step]} alt="" draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
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
              ref={videoRef}
              src="/video.mp4"
              autoPlay
              loop
              muted            /* start muted for autoplay; useEffect unmutes after mount */
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Balloons ── */}
      {step === 4 && BALLOONS.map((b) => (
        <motion.div
          key={b.id}
          style={{ position: "absolute", left: `${b.left}%`, bottom: -110, zIndex: 16, pointerEvents: "none" }}
          initial={{ y: 0, opacity: 0, scale: b.scale }}
          animate={{
            y: -1700,
            opacity: [0, 1, 1, 1, 0],
            rotate: [-5, 5, -6, 4, -4, 5, -5],
          }}
          transition={{
            delay: b.delay,
            duration: b.duration,
            repeat: Infinity,
            repeatDelay: 2,
            y: { ease: "linear" },
            opacity: { times: [0, 0.06, 0.4, 0.8, 1], ease: "linear" },
            rotate: { duration: b.duration * 0.5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <BalloonSVG color={b.color} />
        </motion.div>
      ))}

      {/* ── Floating hearts ── */}
      {preloaded && HEARTS.map((h) => (
        <motion.span
          key={h.id}
          style={{ position: "absolute", left: h.left, bottom: -30, fontSize: h.size, pointerEvents: "none", zIndex: 10 }}
          animate={{ y: [-30, -1300], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, repeatDelay: h.duration * 0.4, ease: "linear" }}
        >
          {h.char}
        </motion.span>
      ))}

      {/* ── Progress bar ── */}
      {preloaded && (
        <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 12, right: 12, display: "flex", gap: 6, zIndex: 20, pointerEvents: "none" }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,0.28)" }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i <= step ? 1 : 0 }}
                transition={{ duration: i === step ? 0.3 : 0, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 99, background: "#fff", transformOrigin: "left" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Mute button ── */}
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
              right: 12, zIndex: 21,
              width: 44, height: 44, borderRadius: "50%",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              cursor: "pointer", fontSize: 18,
            }}
          >
            {muted ? "🔇" : "🔊"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Tap hint ── */}
      <AnimatePresence>
        {step <= 3 && preloaded && !envelopeZoomed && (
          <motion.div
            key={`hint-${step}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ delay: step === 0 ? 1.2 : 0.9 }}
            style={{
              position: "absolute",
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)",
              left: 0, right: 0, display: "flex", justifyContent: "center",
              pointerEvents: "none", zIndex: 20,
            }}
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: "10px 24px", borderRadius: 99, color: "#fff",
                fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                background: "rgba(0,0,0,0.32)",
                backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
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
            exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(160deg,#fce4ec,#f8bbd9)", zIndex: 50,
            }}
          >
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: "#c06080", fontSize: 13, letterSpacing: "0.15em", fontFamily: "var(--font-lato)" }}
            >
              A preparar o teu presente... ♥
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function BalloonSVG({ color }: { color: string }) {
  const dark = shadeColor(color, -30);
  const gid = `g${color.replace("#", "")}`;
  return (
    <svg width="60" height="98" viewBox="0 0 60 98" fill="none">
      <defs>
        <radialGradient id={gid} cx="35%" cy="32%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
          <stop offset="100%" stopColor={dark} stopOpacity="0.45" />
        </radialGradient>
      </defs>
      {/* Body */}
      <ellipse cx="30" cy="31" rx="26" ry="29" fill={color} />
      <ellipse cx="30" cy="31" rx="26" ry="29" fill={`url(#${gid})`} />
      {/* Highlight */}
      <ellipse cx="20" cy="20" rx="7" ry="9" fill="rgba(255,255,255,0.3)" transform="rotate(-20 20 20)" />
      {/* Knot */}
      <polygon points="30,60 26,67 34,67" fill={dark} />
      {/* String */}
      <path d="M30 67 Q36 76 26 84 Q20 90 30 98" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Text */}
      <text x="30" y="37" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="Georgia, serif"
        style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }}>
        26
      </text>
    </svg>
  );
}

function shadeColor(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
