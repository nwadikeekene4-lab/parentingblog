'use client';

import { motion } from 'framer-motion';

export default function StoryIntroduction() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/Images/stories/parentingtips.jpeg')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto flex min-h-[380px] max-w-4xl flex-col items-center justify-center px-6 py-16 text-center"
      >
        <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
          Parenting Stories
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200">
          Discover real experiences from parents around the world,
          learn from their journeys, and inspire others by sharing
          your own story.
        </p>

        <button className="mt-8 rounded-full bg-pink-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:bg-pink-700 active:scale-95">
          Share Your Story
        </button>
      </motion.div>
    </section>
  );
      }
