'use client';

import { motion } from 'framer-motion';

export default function StoryIntroduction() {
  return (
    <section
      className="relative overflow-hidden rounded-[32px] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/Images/stories/parentingtips.jpeg')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/45" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative z-10
          mx-auto
          flex
          min-h-[380px]
          sm:min-h-[450px]
          md:min-h-[520px]
          lg:min-h-[580px]
          xl:min-h-[640px]
          max-w-7xl
          flex-col
          items-center
          justify-center
          px-6
          sm:px-10
          lg:px-16
          text-center
        "
      >
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
          Parenting Stories
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-gray-200 sm:text-lg md:text-xl">
          Discover real experiences from parents around the world,
          learn from their journeys, gain practical parenting
          insights, and inspire others by sharing your own story.
        </p>

        <button className="mt-10 rounded-full bg-slate-900 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 active:scale-95">
          Share Your Story
        </button>
      </motion.div>
    </section>
  );
                     }
