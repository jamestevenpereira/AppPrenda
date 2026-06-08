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
  size: 12 + (i % 4) * 5,
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
      // Zoom envelope before opening
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
      className="relative w-full h-screen overflow-hidden bg-black"
      onClick={advance}
      style={{ cursor: step < 4 ? "pointer" : "default" }}
    >

      {/* ── Background images steps 0-3 ── */}
      <AnimatePresence>
        {step <= 3 && (
          <motion.div
            key={`bg-${step}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: envelopeZoomed ? 1.13 : 1 }}
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
              className="w-full h-full object-cover object-center"
              draggable={false}
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 4: full-screen cat ── */}
      <AnimatePresence>
        {step === 4 && (
          <motion.div
            key="cat"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cat.jpg"
              alt="O nosso gatinho"
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
            {/* Dark gradient at bottom */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 45%, transparent 65%)",
              }}
            />
            {/* Text overlay */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 pb-16 px-8 text-center"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              <p
                className="text-white text-xl font-semibold tracking-widest mb-3"
                style={{
                  fontFamily: "var(--font-playfair)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                }}
              >
                O Teu Dia ♥
              </p>
              <p
                className="text-white/90 text-sm italic leading-relaxed"
                style={{
                  fontFamily: "var(--font-playfair)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.55)",
                }}
              >
                E o nosso bebé também te deseja<br />um dia muito especial. 🐾
              </p>
              <motion.p
                className="text-white text-2xl mt-4"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 120 }}
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
            className="absolute pointer-events-none select-none z-10"
            style={{ left: h.left, bottom: -30, fontSize: h.size }}
            animate={{ y: [-30, -1100], opacity: [0, 0.75, 0.75, 0] }}
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

      {/* ── Progress bar ── */}
      {preloaded && (
        <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-20 pointer-events-none">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.28)" }}
            >
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i <= step ? 1 : 0 }}
                transition={{ duration: i === step ? 0.35 : 0, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Mute button ── */}
      <AnimatePresence>
        {preloaded && step >= 1 && (
          <motion.button
            className="absolute top-10 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)" }}
            onClick={toggleMute}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileTap={{ scale: 0.88 }}
          >
            <span className="text-sm leading-none">{muted ? "🔇" : "🔊"}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Tap hint ── */}
      <AnimatePresence>
        {step <= 3 && preloaded && !envelopeZoomed && (
          <motion.div
            key={`hint-${step}`}
            className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none z-20"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: step === 0 ? 1.2 : 0.9 }}
          >
            <motion.div
              className="px-6 py-2 rounded-full text-white text-xs tracking-widest uppercase"
              style={{
                background: "rgba(0,0,0,0.32)",
                backdropFilter: "blur(6px)",
                fontFamily: "var(--font-lato)",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
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
            className="absolute inset-0 flex flex-col items-center justify-center z-50"
            style={{ background: "linear-gradient(160deg,#fce4ec,#f8bbd9)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-pink-600 text-sm tracking-widest"
              style={{ fontFamily: "var(--font-lato)" }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              A preparar o teu presente... ♥
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
