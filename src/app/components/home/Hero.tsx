"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import RotatingText from "./RotatingText";

export default function Hero() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  async function handleShareStory() {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (data.authenticated) {
        router.push("/users-dashboard/write-story");
      } else {
        router.push("/auth");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      router.push("/auth");
    }
  }

  return (
    <section
      className="
        relative
        min-h-[100svh]
        lg:min-h-[900px]
        overflow-hidden
        flex
        items-center
        bg-[#24151d]
      "
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src="/Images/stories/homebg.jpg"
          alt="Family background"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="
            absolute
            inset-0
            w-full
            h-full

            object-cover
            object-center

            max-sm:h-auto
            max-sm:min-h-0
            max-sm:top-0
            max-sm:bottom-auto
            max-sm:object-contain
            max-sm:object-top

            sm:object-cover
            sm:object-center
          "
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, scale: 1.015 }
          }
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        />

        {/* Soft fill behind the image on small screens */}
        <div
          className="
            absolute
            inset-0
            -z-10
            bg-gradient-to-b
            from-[#3a1d2b]
            via-[#24151d]
            to-[#160e13]
          "
        />
      </div>

      {/* Background Overlay */}
      <div
        className="
          absolute
          inset-0
          z-[1]
          bg-gradient-to-b
          from-black/35
          via-black/45
          to-black/60
        "
      />

      {/* Extra mobile readability layer */}
      <div
        className="
          absolute
          inset-0
          z-[1]
          bg-gradient-to-t
          from-black/55
          via-transparent
          to-black/10
          sm:hidden
        "
      />

      {/* Content */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-7xl
          mx-auto
          px-5
          sm:px-8
          lg:px-12
          py-16
          sm:py-20
          lg:py-28
          xl:py-32
        "
      >
        {/* Hero Text */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            ease: "easeOut",
          }}
          className="max-w-5xl mx-auto text-center"
        >
          <h1
            className="
              text-4xl
              leading-[1.08]
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
              xl:text-8xl
              font-extrabold
              tracking-tight
              text-white
            "
          >
            Welcome to
            <span
              className="
                block
                mt-2
                sm:mt-3
                text-pink-300
              "
            >
              Parenting Together
            </span>
          </h1>

          <div className="mt-5 sm:mt-6">
            <RotatingText />
          </div>

          <p
            className="
              mt-5
              sm:mt-7
              max-w-3xl
              mx-auto
              text-sm
              leading-6
              sm:text-lg
              md:text-xl
              md:leading-8
              text-gray-100
            "
          >
            Parenting is one of life's greatest journeys.
            Learn from real parents, share your experiences,
            and become part of a supportive community built
            to help every family grow together.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div
          className="
            mt-9
            sm:mt-12
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
            sm:gap-6
            max-w-5xl
            mx-auto
          "
        >
          {/* Stories Card */}
          <motion.button
            type="button"
            whileHover={shouldReduceMotion ? undefined : { y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/stories")}
            className="
              w-full
              text-left
              cursor-pointer
              rounded-2xl
              sm:rounded-3xl
              border
              border-white/25
              bg-white/15
              backdrop-blur-xl
              p-5
              sm:p-6
              lg:p-10
              shadow-2xl
              hover:bg-white/25
              transition-colors
              duration-300
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-pink-300
              focus-visible:ring-offset-2
              focus-visible:ring-offset-transparent
            "
          >
            <div className="text-3xl sm:text-4xl">📖</div>

            <h2
              className="
                mt-3
                sm:mt-4
                text-lg
                sm:text-xl
                lg:text-3xl
                font-bold
                text-white
              "
            >
              Explore Parenting Stories
            </h2>

            <p
              className="
                mt-2
                sm:mt-3
                text-sm
                lg:text-lg
                leading-6
                lg:leading-7
                text-gray-100
              "
            >
              Discover experiences, lessons and advice from parents around the world.
            </p>

            <span
              className="
                mt-4
                sm:mt-5
                inline-block
                font-semibold
                text-pink-200
              "
            >
              Browse stories →
            </span>
          </motion.button>

          {/* Share Card */}
          <motion.button
            type="button"
            whileHover={shouldReduceMotion ? undefined : { y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShareStory}
            className="
              w-full
              text-left
              cursor-pointer
              rounded-2xl
              sm:rounded-3xl
              bg-pink-500/90
              backdrop-blur-xl
              p-5
              sm:p-6
              lg:p-10
              shadow-2xl
              hover:bg-pink-600
              transition-colors
              duration-300
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-pink-200
              focus-visible:ring-offset-2
              focus-visible:ring-offset-transparent
            "
          >
            <div className="text-3xl sm:text-4xl">✍️</div>

            <h2
              className="
                mt-3
                sm:mt-4
                text-lg
                sm:text-xl
                lg:text-3xl
                font-bold
                text-white
              "
            >
              Share Your Story
            </h2>

            <p
              className="
                mt-2
                sm:mt-3
                text-sm
                lg:text-lg
                leading-6
                lg:leading-7
                text-white
              "
            >
              Tell your parenting journey and inspire another family.
            </p>

            <span
              className="
                mt-4
                sm:mt-5
                inline-block
                font-semibold
                text-white
              "
            >
              Create a story →
            </span>
          </motion.button>
        </div>
      </div>
    </section>
  );
        }
