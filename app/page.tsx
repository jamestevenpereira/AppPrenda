"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Steps:
// 0 = intro screen
// 1 = envelope closed
// 2 = envelope open + message
// 3 = gifts list
// 4 = cat + envelope photo
// 5 = video (birthday balloons)
// 6 = final photo "Com todo o nosso amor"
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL_STEPS = 7;

const BG_IMAGES = [
  "/step1-envelope-closed.png",   // step 1
  "/step2-message.png",           // step 2
  "/step3-gifts.png",             // step 3
  "/step4-cat-envelope.png",      // step 4
];

const HINTS: Record<number, string> = {
  0: "Toca para começar ♥",
  1: "Toca para abrir ♥",
  2: "← voltar  ·  continuar →",
  3: "← voltar  ·  continuar →",
  4: "← voltar  ·  ver vídeo ♥",
};

const HEARTS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${4 + (i * 6.8) % 92}%`,
  delay: i * 0.6,
  duration: 5 + (i % 5),
  size: 13 + (i % 4) * 5,
  char: ["♥", "💕", "🌸", "✿"][i % 4],
}));


function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

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
    const srcs = [...BG_IMAGES, "/final.png"];
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

  // Swap music ↔ video audio on step 5
  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;
    if (step === 5) {
      if (!audio.paused) musicWasPlayingRef.current = true;
      audio.pause();
      if (video) { video.muted = false; video.play().catch(() => {}); }
    } else {
      if (video) { video.pause(); video.currentTime = 0; }
      if (musicWasPlayingRef.current) {
        musicWasPlayingRef.current = false;
        audio.play().catch(() => {});
      }
    }
  }, [step]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !muted;
    setMuted(next);
    if (step === 5) {
      if (videoRef.current) videoRef.current.muted = next;
    } else {
      if (audioRef.current) audioRef.current.muted = next;
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
      haptic(6);
      flash("left");
      setStep((s) => (s - 1) as Step);
    } else {
      if (step >= 6) return;
      haptic(8);
      flash("right");
      advancingRef.current = true;

      if (step === 1) {
        setEnvelopeZoomed(true);
        if (audioRef.current) audioRef.current.play().catch(() => {});
        setTimeout(() => {
          setStep(2);
          setEnvelopeZoomed(false);
          advancingRef.current = false;
        }, 520);
      } else if (step === 0) {
        // Intro → envelope: start music
        if (audioRef.current) audioRef.current.play().catch(() => {});
        setStep(1);
        advancingRef.current = false;
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
        position: "fixed", inset: 0, overflow: "hidden",
        background: "#000", height: "100dvh",
        cursor: step < 6 ? "pointer" : "default",
        userSelect: "none", WebkitUserSelect: "none",
      }}
    >
      {/* ── Tap flash ── */}
      <AnimatePresence>
        {tapFlash && (
          <motion.div key={tapFlash}
            initial={{ opacity: 0.25 }} animate={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute", top: 0, bottom: 0,
              [tapFlash === "left" ? "left" : "right"]: 0,
              width: "50%", background: "rgba(255,255,255,0.18)",
              zIndex: 30, pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Step 0: Intro screen ── */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div key="intro"
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Gradient background */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#fce4ec 0%,#f8bbd9 45%,#f48fb1 100%)" }} />

            {/* Floating hearts on intro */}
            {HEARTS.slice(0, 8).map((h) => (
              <motion.span key={h.id}
                style={{ position: "absolute", left: h.left, bottom: -30, fontSize: h.size, pointerEvents: "none" }}
                animate={{ y: [-30, -1100], opacity: [0, 0.7, 0.7, 0] }}
                transition={{ duration: h.duration + 2, delay: h.delay, repeat: Infinity, repeatDelay: h.duration * 0.5, ease: "linear" }}
              >{h.char}</motion.span>
            ))}

            {/* Content */}
            <div style={{ position: "relative", textAlign: "center", padding: "0 40px" }}>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{ fontFamily: "var(--font-lato)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9c4068", marginBottom: 20 }}
              >
                Um presente especial
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.9 }}
                style={{ fontFamily: "var(--font-playfair)", fontSize: 48, fontWeight: 700, color: "#7a2045", lineHeight: 1.15, marginBottom: 16 }}
              >
                Para ti,<br />Momo
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
                style={{ fontSize: 36, marginBottom: 24 }}
              >
                ♥
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0.7, 0.4, 0.7] }}
                transition={{ delay: 1.8, duration: 2.5, repeat: Infinity }}
                style={{ fontFamily: "var(--font-lato)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b05070" }}
              >
                Toca para começar
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Steps 1-4: background images ── */}
      <AnimatePresence>
        {step >= 1 && step <= 4 && (
          <motion.div key={`bg-${step}`}
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: envelopeZoomed ? 1.12 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.6, ease: "easeInOut" }, scale: { duration: 0.5, ease: "easeIn" } }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BG_IMAGES[step - 1]} alt="" draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 5: video ── */}
      <AnimatePresence>
        {step === 5 && (
          <motion.div key="video"
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          >
            <video ref={videoRef} src="/video.mp4" autoPlay loop muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 6: final screen ── */}
      <AnimatePresence>
        {step === 6 && (
          <motion.div key="final"
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/final.png" alt="" draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
            />
            {/* Gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 40%, transparent 60%)" }} />

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 52px)",
                paddingLeft: 36, paddingRight: 36, textAlign: "center",
              }}
            >
              <p style={{
                fontFamily: "var(--font-playfair)", color: "#fff",
                fontSize: 28, fontWeight: 600, fontStyle: "italic",
                letterSpacing: "0.04em", lineHeight: 1.3, marginBottom: 14,
                textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              }}>
                Com todo o nosso amor ❤️
              </p>
              <motion.p
                initial={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                style={{ fontSize: 20, fontStyle: "italic", letterSpacing: "0.06em", color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)", marginBottom: 4 }}
              >
                Momo e Bebê
              </motion.p>
              <motion.p
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 160 }}
                style={{ fontSize: 28, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
              >
                ❤️
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Birthday balloons on step 5 ── */}
      {step === 5 && <BirthdayBalloons />}

      {/* ── Floating hearts (steps 1-5) ── */}
      {preloaded && step >= 1 && step <= 5 && HEARTS.map((h) => (
        <motion.span key={h.id}
          style={{ position: "absolute", left: h.left, bottom: -30, fontSize: h.size, pointerEvents: "none", zIndex: 10 }}
          animate={{ y: [-30, -1300], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, repeatDelay: h.duration * 0.4, ease: "linear" }}
        >{h.char}</motion.span>
      ))}

      {/* ── Progress bar ── */}
      {preloaded && step >= 1 && (
        <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 12, right: 12, display: "flex", gap: 5, zIndex: 20, pointerEvents: "none" }}>
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, overflow: "hidden", background: "rgba(255,255,255,0.28)" }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i < step ? 1 : 0 }}
                transition={{ duration: i === step - 1 ? 0.3 : 0, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 99, background: "#fff", transformOrigin: "left" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Mute button ── */}
      <AnimatePresence>
        {preloaded && step >= 1 && step <= 5 && (
          <motion.button onClick={toggleMute}
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }} whileTap={{ scale: 0.88 }}
            style={{
              position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 24px)", right: 12,
              zIndex: 21, width: 44, height: 44, borderRadius: "50%",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.32)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              cursor: "pointer", fontSize: 18,
            }}
          >
            {muted ? "🔇" : "🔊"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Tap hint ── */}
      <AnimatePresence>
        {step in HINTS && preloaded && !envelopeZoomed && (
          <motion.div key={`hint-${step}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ delay: step <= 1 ? 1.4 : 0.9 }}
            style={{
              position: "absolute", bottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)",
              left: 0, right: 0, display: "flex", justifyContent: "center",
              pointerEvents: "none", zIndex: 20,
            }}
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: "10px 24px", borderRadius: 99, color: step === 0 ? "#7a2045" : "#fff",
                fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                background: step === 0 ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.32)",
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
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#fce4ec,#f8bbd9)", zIndex: 50 }}
          >
            <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
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

/* ── Birthday balloons ── */
function BirthdayBalloons() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 28, zIndex: 16, pointerEvents: "none" }}>
      <motion.div initial={{ y: "110vh" }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 38, damping: 18, delay: 0.1 }}>
        <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.8 }} style={{ transformOrigin: "50% 100%" }}>
          <BigBalloonSVG digit="2" color="#e8437a" />
        </motion.div>
      </motion.div>
      <motion.div initial={{ y: "110vh" }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 38, damping: 18, delay: 0.3 }}>
        <motion.div animate={{ rotate: [5, -5, 5] }} transition={{ duration: 4.3, repeat: Infinity, ease: "easeInOut", delay: 2.1 }} style={{ transformOrigin: "50% 100%" }}>
          <BigBalloonSVG digit="6" color="#f5c518" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function BigBalloonSVG({ digit, color }: { digit: string; color: string }) {
  const dark = shadeColor(color, -40);
  const gid = `big${digit}`;
  return (
    <svg width="100" height="260" viewBox="0 0 100 260" fill="none">
      <defs>
        <radialGradient id={gid} cx="34%" cy="30%" r="66%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="100%" stopColor={dark} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="54" rx="44" ry="50" fill={color} />
      <ellipse cx="50" cy="54" rx="44" ry="50" fill={`url(#${gid})`} />
      <ellipse cx="33" cy="34" rx="13" ry="17" fill="rgba(255,255,255,0.3)" transform="rotate(-22 33 34)" />
      <polygon points="50,104 43,115 57,115" fill={dark} />
      <path d="M50 115 Q60 138 44 160 Q32 178 50 200 Q62 216 50 238 Q44 250 50 260" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <text x="50" y="72" textAnchor="middle" fill="white" fontSize="52" fontWeight="900" fontFamily="Georgia, serif" style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.55))" }}>
        {digit}
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
