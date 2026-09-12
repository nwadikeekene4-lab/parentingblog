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
        bg-[#fff9f4]
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
            bg-[#fff9f4]
          "
        />

        {/* =======================================================
            FAMILY IMAGE
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
            MOBILE TRANSITION

            The photograph remains clear. The fade begins lower
            so the heading does not visually enter the image.
            ======================================================= */}
        <div
          className="
            absolute
            inset-x-0
            top-[34%]
            h-[18%]
            sm:hidden
            bg-gradient-to-b
            from-transparent
            via-[#fff9f4]/45
            to-[#fff9f4]
          "
        />

        {/* Soft warm background for the content area */}
        <div
          className="
            absolute
            inset-x-0
            top-[50%]
            bottom-0
            sm:hidden
            bg-gradient-to-b
            from-[#fff9f4]
            via-[#fff9f4]
            to-[#fff3ed]
          "
        />

        {/* Desktop overlay */}
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

          pt-[49svh]
          pb-10

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

              text-[#3a2630]

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
                text-[#d6336c]
                sm:text-pink-300
              "
            >
              Parenting Together
            </span>
          </h1>

          <div
            className="
              mt-4
              sm:mt-6
            "
          >
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
              text-[#654f58]

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
          {/* =====================================================
              EXPLORE STORIES
              ===================================================== */}
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
              border-[#eadbd3]

              bg-[#fffdf9]

              p-5
              sm:p-6
              lg:p-10

              shadow-[0_14px_40px_rgba(91,55,45,0.08)]

              hover:bg-white
              hover:border-[#e5cec3]
              hover:shadow-[0_18px_48px_rgba(91,55,45,0.12)]

              transition-all
              duration-300

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#d9778f]
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
                text-[#3a2630]
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
                text-[#6d5a61]
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
                text-[#c93668]
              "
            >
              Browse stories →
            </span>
          </motion.button>

          {/* =====================================================
              SHARE STORY
              ===================================================== */}
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
              border-[#e8a9b9]

              bg-gradient-to-br
              from-[#d94f7b]
              via-[#d94672]
              to-[#b83262]

              p-5
              sm:p-6
              lg:p-10

              shadow-[0_18px_50px_rgba(170,45,87,0.17)]

              hover:from-[#d84a76]
              hover:via-[#cf3d6c]
              hover:to-[#b52e5d]

              hover:shadow-[0_22px_58px_rgba(170,45,87,0.23)]

              transition-all
              duration-300

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#e9a8b8]
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
