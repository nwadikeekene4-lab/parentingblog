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
        bg-[#fff7fb]
        sm:bg-transparent
      "
    >
      {/* =========================================================
          BACKGROUND
          ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Mobile base background */}
        <div
          className="
            absolute
            inset-0
            sm:hidden
            bg-[#fff7fb]
          "
        />

        {/* =======================================================
            FAMILY IMAGE

            Keep the image itself clean and sharp.
            ======================================================= */}
        <motion.img
          src="/Images/stories/homebg.jpg"
          alt="Family background"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="
            absolute
            inset-x-0
            top-0
            w-full

            h-full
            object-cover
            object-center

            max-sm:h-auto
            max-sm:min-h-0
            max-sm:object-contain
            max-sm:object-top

            sm:inset-0
            sm:h-full
          "
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
        />

        {/* =======================================================
            MOBILE IMAGE FADE

            Short and subtle. It only softens the bottom edge of
            the photograph instead of washing out the whole image.
            ======================================================= */}
        <div
          className="
            absolute
            inset-x-0
            top-[30%]
            h-[23%]
            sm:hidden
            bg-gradient-to-b
            from-transparent
            via-[#fff7fb]/20
            to-[#fff7fb]
          "
        />

        {/* Very soft continuation below the image */}
        <div
          className="
            absolute
            inset-x-0
            top-[48%]
            bottom-0
            sm:hidden
            bg-gradient-to-b
            from-[#fff7fb]
            to-[#fdf1f7]
          "
        />

        {/* Desktop overlay — unchanged */}
        <div
          className="
            absolute
            inset-0
            hidden
            sm:block
            bg-black/45
          "
        />
      </div>

      {/* =========================================================
          CONTENT
          ========================================================= */}
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

          pt-[34svh]
          pb-12

          sm:py-20
          lg:py-28
          xl:py-32
        "
      >
        {/* =======================================================
            HERO TEXT
            ======================================================= */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 18 }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            delay: 0.05,
            ease: "easeOut",
          }}
          className="
            max-w-5xl
            mx-auto
            text-center
          "
        >
          <h1
            className="
              text-4xl
              leading-[1.06]
              font-extrabold
              tracking-tight

              text-[#351d2d]

              sm:text-5xl
              sm:text-white

              md:text-6xl
              lg:text-7xl
              xl:text-8xl
            "
          >
            Welcome to

            <span
              className="
                block
                mt-1.5
                sm:mt-3
                text-pink-600
                sm:text-pink-300
              "
            >
              Parenting Together
            </span>
          </h1>

          <div className="mt-4 sm:mt-6">
            <RotatingText />
          </div>

          <p
            className="
              mt-4
              sm:mt-7
              max-w-3xl
              mx-auto

              text-sm
              leading-6
              text-[#624653]

              sm:text-lg
              md:text-xl
              md:leading-8
              sm:text-gray-100
            "
          >
            Parenting is one of life's greatest journeys.
            Learn from real parents, share your experiences,
            and become part of a supportive community built
            to help every family grow together.
          </p>
        </motion.div>

        {/* =======================================================
            ACTION CARDS
            ======================================================= */}
        <div
          className="
            mt-7
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
          {/* Stories */}
          <motion.button
            type="button"
            whileHover={
              shouldReduceMotion
                ? undefined
                : { y: -5 }
            }
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/stories")}
            className="
              w-full
              text-left
              cursor-pointer

              rounded-3xl

              border
              border-[#ead7e1]

              bg-white/90
              backdrop-blur-xl

              p-5
              sm:p-6
              lg:p-10

              shadow-[0_14px_40px_rgba(111,48,82,0.09)]

              hover:bg-white
              hover:border-[#e4c5d5]
              hover:shadow-[0_18px_48px_rgba(111,48,82,0.13)]

              transition-all
              duration-300

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-pink-400
            "
          >
            <div className="text-3xl sm:text-4xl">
              📖
            </div>

            <h2
              className="
                mt-3
                sm:mt-4
                text-lg
                sm:text-xl
                lg:text-3xl
                font-bold
                text-[#351d2d]
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
                text-[#6b5360]
              "
            >
              Discover experiences, lessons and advice
              from parents around the world.
            </p>

            <span
              className="
                mt-4
                sm:mt-5
                inline-block
                font-semibold
                text-pink-600
              "
            >
              Browse stories →
            </span>
          </motion.button>

          {/* Share */}
          <motion.button
            type="button"
            whileHover={
              shouldReduceMotion
                ? undefined
                : { y: -5 }
            }
            whileTap={{ scale: 0.98 }}
            onClick={handleShareStory}
            className="
              w-full
              text-left
              cursor-pointer

              rounded-3xl

              border
              border-pink-300/40

              bg-gradient-to-br
              from-pink-500
              via-pink-500
              to-fuchsia-600

              p-5
              sm:p-6
              lg:p-10

              shadow-[0_18px_50px_rgba(190,24,93,0.18)]

              hover:from-pink-500
              hover:via-pink-600
              hover:to-fuchsia-600

              hover:shadow-[0_22px_58px_rgba(190,24,93,0.25)]

              transition-all
              duration-300

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-pink-300
            "
          >
            <div className="text-3xl sm:text-4xl">
              ✍️
            </div>

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
                text-white/95
              "
            >
              Tell your parenting journey and inspire
              another family.
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
