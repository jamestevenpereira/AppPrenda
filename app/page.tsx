"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 0 | 1 | 2 | 3 | 4;

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

export default function Home() {
  const [step, setStep] = useState<Step>(0);
  const [preloaded, setPreloaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload all images
  useEffect(() => {
    const srcs = [...BG_IMAGES, "/cat.jpg"];
    let loaded = 0;
    srcs.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => { if (++loaded === srcs.length) setPreloaded(true); };
      img.src = src;
    });
  }, []);

  // Init audio (but don't play yet — browser requires user gesture)
  useEffect(() => {
    audioRef.current = new Audio("/music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.45;
  }, []);

  const advance = () => {
    if (step < 4) {
      // Start music on first tap
      if (step === 0 && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      setStep((s) => (s + 1) as Step);
    }
  };

  return (
    <main
      className="relative w-full h-screen overflow-hidden bg-black"
      onClick={advance}
      style={{ cursor: step < 4 ? "pointer" : "default" }}
    >
      {/* ── Background images: steps 0-3 ── */}
      <AnimatePresence mode="wait">
        {step <= 3 && (
          <motion.div
            key={`bg-${step}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
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

      {/* ── Step 4: their cat ── */}
      <AnimatePresence mode="wait">
        {step === 4 && (
          <motion.div
            key="cat"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ background: "linear-gradient(160deg,#fce4ec 0%,#f8bbd9 50%,#f48fb1 100%)" }}
          >
            <motion.div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ width: "min(85vw, 380px)", aspectRatio: "3/4" }}
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.2 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cat.jpg"
                alt="O nosso gatinho"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </motion.div>

            <motion.div
              className="mt-5 px-6 py-4 rounded-2xl text-center"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                maxWidth: "min(85vw, 380px)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p
                className="text-pink-700 font-semibold text-sm tracking-widest uppercase mb-1"
                style={{ fontFamily: "var(--font-lato)" }}
              >
                O Teu Dia ♥
              </p>
              <p
                className="text-stone-600 text-sm italic leading-relaxed"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                E o nosso bebé também te deseja<br />um dia muito especial. 🐾
              </p>
            </motion.div>

            <motion.p
              className="mt-4 text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              🐾 ♥ 🐾
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tap hint overlay ── */}
      <AnimatePresence>
        {step <= 3 && preloaded && (
          <motion.div
            key={`hint-${step}`}
            className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: step === 0 ? 1 : 0.8 }}
          >
            <motion.div
              className="px-6 py-2 rounded-full text-white text-xs tracking-widest uppercase"
              style={{
                background: "rgba(0,0,0,0.32)",
                backdropFilter: "blur(6px)",
                fontFamily: "var(--font-lato)",
              }}
              animate={{ opacity: [0.55, 1, 0.55] }}
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
            className="absolute inset-0 flex items-center justify-center bg-pink-100"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-pink-500 text-sm tracking-widest"
              style={{ fontFamily: "var(--font-lato)" }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              A carregar... ♥
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
