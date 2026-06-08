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
  "Toca para continuar →",
  "Toca para continuar →",
  "Toca para ver a surpresa ♥",
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const advancingRef = useRef(false);

  useEffect(() => {
    const srcs = [...BG_IMAGES, "/cat.jpg"];
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

  const advance = useCallback(() => {
    if (advancingRef.current || step >= 4) return;
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
  }, [step]);

  return (
    <main
      onClick={advance}
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

      {/* ── Step 4: full-screen cat ── */}
      <AnimatePresence>
        {step === 4 && (
          <motion.div
            key="cat"
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cat.jpg"
              alt="O nosso gatinho"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />
            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 40%, transparent 60%)",
              }}
            />
            {/* Text pinned to safe-area bottom */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
                paddingLeft: 32,
                paddingRight: 32,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  marginBottom: 10,
                  textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                }}
              >
                O Teu Dia ♥
              </p>
              <p
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15,
                  fontStyle: "italic",
                  lineHeight: 1.65,
                  textShadow: "0 2px 8px rgba(0,0,0,0.55)",
                }}
              >
                E o nosso bebé também te deseja<br />um dia muito especial. 🐾
              </p>
              <motion.p
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 120 }}
                style={{ color: "#fff", fontSize: 24, marginTop: 14 }}
              >
                🐾 ♥ 🐾
              </motion.p>
            </motion.div>
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
