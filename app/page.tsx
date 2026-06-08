"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 0 | 1 | 2 | 3;

const STEPS: Step[] = [0, 1, 2, 3];

const BG_IMAGES = [
  "/step1-envelope-closed.png",
  "/step2-message.png",
  "/step3-gifts.png",
];

export default function Home() {
  const [step, setStep] = useState<Step>(0);
  const [preloaded, setPreloaded] = useState(false);

  // Preload all images silently
  useEffect(() => {
    const imgs = [...BG_IMAGES, "/cat.jpg"].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    Promise.all(imgs.map((img) => new Promise((r) => { img.onload = r; img.onerror = r; }))).then(() => setPreloaded(true));
  }, []);

  const advance = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black" onClick={advance} style={{ cursor: step < 3 ? "pointer" : "default" }}>

      {/* ── Background images: steps 0-2 ── */}
      <AnimatePresence mode="wait">
        {step <= 2 && (
          <motion.div
            key={`bg-${step}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BG_IMAGES[step]}
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
              draggable={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 3: cat finale ── */}
      <AnimatePresence mode="wait">
        {step === 3 && (
          <motion.div
            key="cat"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ background: "linear-gradient(160deg,#fce4ec 0%,#f8bbd9 50%,#f48fb1 100%)" }}
          >
            {/* Cat photo */}
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

            {/* Caption card */}
            <motion.div
              className="mt-5 px-6 py-4 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", maxWidth: "min(85vw, 380px)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-pink-700 font-semibold text-sm tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-lato)" }}>
                O Teu Dia ♥
              </p>
              <p className="text-stone-600 text-sm italic leading-relaxed" style={{ fontFamily: "var(--font-playfair)" }}>
                E o nosso bebé também te deseja<br />um dia muito especial. 🐾
              </p>
            </motion.div>

            {/* paw print deco */}
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

      {/* ── Step 0 overlay: "tap to open" pulse ── */}
      <AnimatePresence>
        {step === 0 && preloaded && (
          <motion.div
            className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="px-6 py-2 rounded-full text-white text-xs tracking-widest uppercase"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", fontFamily: "var(--font-lato)" }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Toca para abrir ♥
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Steps 1-2 overlay: forward hint ── */}
      <AnimatePresence>
        {(step === 1 || step === 2) && (
          <motion.div
            key={`hint-${step}`}
            className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="px-5 py-2 rounded-full text-white text-xs tracking-widest uppercase"
              style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)", fontFamily: "var(--font-lato)" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {step === 1 ? "Toca para continuar →" : "Toca para ver a surpresa ♥"}
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
