'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const messages = [
  "❤️ Every parent's journey matters.",
  "👶 Learn. Share. Grow together.",
  "🏡 Raising children is easier together.",
  "🤝 A caring community for every parent.",
];

export default function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-10 md:h-12 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={messages[index]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="text-base md:text-xl font-semibold text-pink-200 text-center"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
