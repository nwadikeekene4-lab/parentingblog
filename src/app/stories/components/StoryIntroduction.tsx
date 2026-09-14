'use client';

import Image from "next/image";
import { motion } from "framer-motion";

export default function StoryIntroduction() {
  return (
    <section
      className="
        relative
        mx-0
        overflow-hidden
        rounded-b-[30px]
        sm:rounded-[32px]
      "
    >
      {/* Background Image */}
      <Image
        src="/Images/stories/parentingtips.jpeg"
        alt="Parents spending quality time with their child"
        fill
        priority
        sizes="100vw"
        className="
          object-cover
          object-[58%_center]
          sm:object-center
        "
      />

      {/* Mobile-first overlay */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-b
          from-black/20
          via-black/45
          to-black/75
          sm:bg-gradient-to-r
          sm:from-black/70
          sm:via-black/55
          sm:to-black/45
        "
      />

      {/* Soft brand tint */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-[#4b1732]/25
          via-transparent
          to-transparent
        "
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[330px]
          max-w-7xl
          flex-col
          items-center
          justify-center
          px-5
          py-12
          text-center

          sm:min-h-[450px]
          sm:px-10
          sm:py-16

          md:min-h-[520px]
          md:px-12

          lg:min-h-[580px]
          lg:px-16

          xl:min-h-[640px]
        "
      >
        <span
          className="
            rounded-full
            border
            border-white/25
            bg-white/10
            px-4
            py-1.5
            text-xs
            font-semibold
            tracking-wide
            text-white
            shadow-sm
            backdrop-blur-md

            sm:px-5
            sm:py-2
            sm:text-sm
          "
        >
          Real stories. Real parents.
        </span>

        <h1
          className="
            mt-4
            max-w-4xl
            text-4xl
            font-extrabold
            leading-[1.05]
            tracking-tight
            text-white
            drop-shadow-[0_3px_12px_rgba(0,0,0,0.25)]

            sm:mt-5
            sm:text-5xl

            md:text-6xl
            lg:text-6xl
            xl:text-7xl
          "
        >
          Parenting Stories
        </h1>

        <p
          className="
            mt-4
            max-w-2xl
            text-sm
            leading-6
            text-white/90

            sm:mt-6
            sm:text-lg
            sm:leading-8

            md:text-xl
          "
        >
          Discover real experiences from parents around the world,
          learn from their journeys, gain practical parenting
          insights, and inspire others by sharing your own story.
        </p>

        <button
          type="button"
          className="
            mt-7
            rounded-full
            bg-white
            px-6
            py-3.5
            text-sm
            font-bold
            text-[#9d2857]
            shadow-[0_10px_30px_rgba(0,0,0,0.18)]

            transition-all
            duration-150
            ease-out

            hover:-translate-y-1
            hover:bg-[#fff7fa]

            active:translate-y-[1px]
            active:scale-[0.96]
            active:brightness-95
            active:shadow-[0_4px_14px_rgba(0,0,0,0.14)]

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-white
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#9d2857]

            motion-reduce:transition-none
            motion-reduce:hover:transform-none
            motion-reduce:active:transform-none

            sm:px-8
            sm:py-4
            sm:text-base
          "
        >
          Share Your Story
        </button>
      </motion.div>
    </section>
  );
      }
