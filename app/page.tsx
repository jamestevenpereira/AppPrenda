"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "closed" | "opening" | "message" | "gifts" | "cat";

const GIFTS = [
  "Solário",
  "Hidratação de Cabelo",
  "Corte de Cabelo",
  "Sushi",
  "Pintura de Cabelo",
];

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${6 + Math.random() * 6}s`,
  size: `${10 + Math.random() * 14}px`,
  emoji: i % 3 === 0 ? "🌸" : i % 3 === 1 ? "🌺" : "✿",
}));

export default function Home() {
  const [step, setStep] = useState<Step>("closed");
  const [showSeal, setShowSeal] = useState(true);

  useEffect(() => {
    if (step === "opening") {
      const t1 = setTimeout(() => setShowSeal(false), 300);
      const t2 = setTimeout(() => setStep("message"), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [step]);

  const handleEnvelopeClick = () => {
    if (step === "closed") setStep("opening");
  };

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #fce4ec 0%, #f8bbd9 40%, #f48fb1 100%)" }}
    >
      {/* Falling petals */}
      {PETALS.map((p) => (
        <span
          key={p.id}
          className="petal select-none"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            fontSize: p.size,
            top: "-30px",
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* ── STEP: closed envelope ── */}
      <AnimatePresence>
        {(step === "closed" || step === "opening") && (
          <motion.div
            className="relative flex flex-col items-center z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="cursor-pointer select-none"
              onClick={handleEnvelopeClick}
              whileHover={step === "closed" ? { scale: 1.03 } : {}}
              whileTap={step === "closed" ? { scale: 0.97 } : {}}
            >
              <EnvelopeSVG isOpening={step === "opening"} showSeal={showSeal} />
            </motion.div>

            {step === "closed" && (
              <motion.p
                className="mt-6 text-pink-700 text-sm tracking-widest uppercase"
                style={{ fontFamily: "var(--font-lato)" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Toca para abrir ♥
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STEP: message card ── */}
      <AnimatePresence>
        {step === "message" && (
          <motion.div
            className="z-10 flex flex-col items-center px-6 w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CardMessage onNext={() => setStep("gifts")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STEP: gifts card ── */}
      <AnimatePresence>
        {step === "gifts" && (
          <motion.div
            className="z-10 flex flex-col items-center px-6 w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CardGifts onNext={() => setStep("cat")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STEP: cat finale ── */}
      <AnimatePresence>
        {step === "cat" && (
          <motion.div
            className="z-10 flex flex-col items-center px-6 w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CatFinale />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ─────────────────────────────────────────
   Envelope SVG component
───────────────────────────────────────── */
function EnvelopeSVG({ isOpening, showSeal }: { isOpening: boolean; showSeal: boolean }) {
  return (
    <div className="relative float-animation" style={{ width: 300, height: 220 }}>
      {/* Envelope body */}
      <svg width="300" height="220" viewBox="0 0 300 220" fill="none">
        {/* Body */}
        <rect x="4" y="60" width="292" height="160" rx="8" fill="#f8c8d8" />
        <rect x="4" y="60" width="292" height="160" rx="8" stroke="#e8a0b8" strokeWidth="2" />

        {/* Bottom flap lines */}
        <line x1="4" y1="220" x2="150" y2="130" stroke="#e8a0b8" strokeWidth="1.5" />
        <line x1="296" y1="220" x2="150" y2="130" stroke="#e8a0b8" strokeWidth="1.5" />

        {/* Top flap */}
        <motion.path
          d="M4 60 L150 10 L296 60 Z"
          fill="#f4b0ca"
          stroke="#e8a0b8"
          strokeWidth="2"
          animate={isOpening ? {
            rotateX: [0, -140],
            originY: "0%",
          } : {}}
          style={{ transformOrigin: "150px 60px" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Text on envelope */}
        <text x="150" y="105" textAnchor="middle" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#5a2a3a" letterSpacing="1">
          O TEU DIA
        </text>
        <text x="150" y="122" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#7a4a5a" letterSpacing="2">
          VALE PRESENTE
        </text>
        <text x="150" y="150" textAnchor="middle" fontFamily="serif" fontSize="11" fill="#7a4a5a" fontStyle="italic">
          Para ti, Momo
        </text>
      </svg>

      {/* Wax seal */}
      <AnimatePresence>
        {showSeal && (
          <motion.div
            className="absolute"
            style={{ bottom: 28, left: "50%", transform: "translateX(-50%)" }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WaxSeal />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   Wax seal
───────────────────────────────────────── */
function WaxSeal() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="24" fill="#c8960c" />
      <circle cx="26" cy="26" r="20" fill="#d4a017" />
      <circle cx="26" cy="26" r="16" fill="#c8960c" opacity="0.6" />
      <text x="26" y="30" textAnchor="middle" fontSize="16" fill="#fff8e1">♥</text>
    </svg>
  );
}

/* ─────────────────────────────────────────
   Card base wrapper
───────────────────────────────────────── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="relative bg-amber-50 rounded-sm shadow-2xl w-full overflow-hidden"
      style={{
        border: "1px solid #d4b896",
        minHeight: 380,
      }}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.1 }}
    >
      {/* Decorative border */}
      <div className="absolute inset-3 border border-amber-200 rounded-sm pointer-events-none" />
      <div className="absolute inset-[10px] border border-amber-100 rounded-sm pointer-events-none" />
      <div className="p-8 flex flex-col items-center gap-3">
        {children}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Message card
───────────────────────────────────────── */
function CardMessage({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <p className="text-center font-bold tracking-widest text-sm text-stone-700" style={{ fontFamily: "var(--font-playfair)", letterSpacing: "0.15em" }}>
        O TEU DIA
      </p>
      <p className="text-center tracking-[0.25em] text-xs text-stone-500 uppercase" style={{ fontFamily: "var(--font-lato)" }}>
        Vale Presente
      </p>
      <div className="text-pink-400 text-base my-1">♥</div>

      <div className="text-center space-y-3 mt-2">
        <p className="text-stone-600 text-sm leading-relaxed italic" style={{ fontFamily: "var(--font-playfair)" }}>
          Para o teu aniversário,<br />queria oferecer-te<br />um momento só teu:
        </p>
        <p className="text-stone-700 text-sm leading-relaxed" style={{ fontFamily: "var(--font-playfair)" }}>
          cabelo novo, mimo<br />e aquilo que já disseste<br />que gostavas de experimentar.
        </p>
        <p className="text-stone-600 text-sm leading-relaxed italic" style={{ fontFamily: "var(--font-playfair)" }}>
          Não porque precises<br />de mudar nada,<br />mas porque mereces sentir-te<br />ainda mais confiante<br />e cuidada.
        </p>
      </div>

      <div className="text-pink-400 text-base my-1">♥</div>
      <p className="text-stone-500 text-sm italic" style={{ fontFamily: "var(--font-playfair)" }}>Para ti, Momo</p>

      <motion.button
        onClick={onNext}
        className="mt-4 px-6 py-2 rounded-full text-xs tracking-widest uppercase text-white"
        style={{ background: "linear-gradient(135deg, #e8a0b8, #c06080)", fontFamily: "var(--font-lato)" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        Ver o presente →
      </motion.button>
    </Card>
  );
}

/* ─────────────────────────────────────────
   Gifts card
───────────────────────────────────────── */
function CardGifts({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <p className="text-center font-bold tracking-widest text-sm text-stone-700" style={{ fontFamily: "var(--font-playfair)", letterSpacing: "0.15em" }}>
        O TEU DIA
      </p>
      <p className="text-center tracking-[0.25em] text-xs text-stone-500 uppercase" style={{ fontFamily: "var(--font-lato)" }}>
        Vale Presente
      </p>
      <div className="text-pink-400 text-base my-1">♥</div>

      <p className="text-stone-600 text-sm italic mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
        Incluído neste presente
      </p>

      <ul className="w-full space-y-2">
        {GIFTS.map((gift, i) => (
          <motion.li
            key={gift}
            className="flex items-center gap-2 text-stone-700 text-sm"
            style={{ fontFamily: "var(--font-playfair)" }}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}
          >
            <span className="text-pink-400">♥</span>
            {gift}
          </motion.li>
        ))}
      </ul>

      <div className="text-pink-400 text-base mt-3">♥</div>
      <p className="text-stone-500 text-sm italic" style={{ fontFamily: "var(--font-playfair)" }}>Para ti, Momo</p>

      <motion.button
        onClick={onNext}
        className="mt-4 px-6 py-2 rounded-full text-xs tracking-widest uppercase text-white"
        style={{ background: "linear-gradient(135deg, #e8a0b8, #c06080)", fontFamily: "var(--font-lato)" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        Ver surpresa ♥
      </motion.button>
    </Card>
  );
}

/* ─────────────────────────────────────────
   Cat finale
───────────────────────────────────────── */
function CatFinale() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Card>
        <p className="text-center font-bold tracking-widest text-sm text-stone-700" style={{ fontFamily: "var(--font-playfair)", letterSpacing: "0.15em" }}>
          O TEU DIA
        </p>
        <p className="text-center tracking-[0.25em] text-xs text-stone-500 uppercase" style={{ fontFamily: "var(--font-lato)" }}>
          Vale Presente
        </p>
        <div className="text-pink-400 text-base my-1">♥</div>

        <p className="text-stone-600 text-sm italic text-center" style={{ fontFamily: "var(--font-playfair)" }}>
          E claro... o nosso bebé<br />também te deseja<br />um dia muito feliz. 🐾
        </p>

        <div className="text-pink-400 text-base mt-3">♥</div>
        <p className="text-stone-500 text-sm italic" style={{ fontFamily: "var(--font-playfair)" }}>Para ti, Momo</p>
      </Card>

      <motion.div
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{ width: 260, height: 320 }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.4 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cat.jpg"
          alt="O nosso gatinho"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </motion.div>

      <motion.p
        className="text-pink-700 text-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        🐾 ♥ 🐾
      </motion.p>
    </div>
  );
}

