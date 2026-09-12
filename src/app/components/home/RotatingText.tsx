"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const messages = [
  "❤️ Every parent's journey matters.",
  "👶 Learn. Share. Grow together.",
  "🏡 Raising children is easier together.",
  "🤝 A caring community for every parent.",
];

export default function RotatingText() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const interval = setInterval(() => {
      setIndex((previous) => (previous + 1) % messages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <div
      className="
        flex
        min-h-10
        items-center
        justify-center
        overflow-hidden
        px-2
        sm:min-h-12
      "
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={messages[index]}
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 8,
                }
          }
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          exit={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: 0,
                  y: -8,
                }
          }
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="
            text-center
            text-sm
            font-semibold
            leading-6
            text-pink-100
            drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]
            sm:text-base
            md:text-xl
          "
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
               }
