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
        flex
        min-h-[100svh]
        items-center
        overflow-hidden
        bg-[#3b1828]
        sm:min-h-screen
        lg:min-h-[900px]
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
            h-full
            w-full
            object-cover
            object-[50%_30%]
            sm:object-[50%_35%]
            md:object-center
          "
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 1.02,
                }
          }
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: 1,
                  scale: 1,
                }
          }
          transition={{
            opacity: {
              duration: 0.6,
              ease: "easeOut",
            },
            scale: {
              duration: 1,
              ease: "easeOut",
            },
          }}
        />
      </div>

      {/* Readability Overlay */}
      <div
        className="
          absolute
          inset-0
          z-[1]
          bg-gradient-to-b
          from-black/55
          via-black/35
          to-black/65
        "
        aria-hidden="true"
      />

      {/* Soft colour layer */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]
          bg-gradient-to-br
          from-pink-950/20
          via-transparent
          to-rose-950/30
        "
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-14
          sm:px-6
          sm:py-20
          md:px-8
          lg:px-12
          lg:py-24
          xl:py-28
        "
      >
        {/* Hero Text */}
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 18,
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
          transition={{
            duration: 0.65,
            ease: "easeOut",
          }}
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
          <h1
            className="
              text-[2.45rem]
              font-extrabold
              leading-[1.02]
              tracking-[-0.035em]
              text-white
              drop-shadow-[0_3px_12px_rgba(0,0,0,0.35)]
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
              xl:text-8xl
            "
          >
            Welcome to

            <span
              className="
                mt-2
                block
                bg-gradient-to-r
                from-pink-200
                via-pink-300
                to-rose-200
                bg-clip-text
                text-transparent
                sm:mt-3
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
              mx-auto
              mt-5
              max-w-2xl
              text-[15px]
              leading-6
              text-white/90
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]
              sm:mt-6
              sm:text-lg
              sm:leading-7
              md:text-xl
              md:leading-8
            "
          >
            Parenting is one of life's greatest journeys. Learn from real
            parents, share your experiences, and become part of a supportive
            community built to help every family grow together.
          </p>
        </motion.div>

        {/* Existing Actions */}
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 20,
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
          transition={{
            duration: 0.65,
            delay: shouldReduceMotion ? 0 : 0.1,
            ease: "easeOut",
          }}
          className="
            mx-auto
            mt-8
            grid
            w-full
            max-w-4xl
            grid-cols-1
            gap-4
            sm:mt-10
            sm:gap-5
            md:grid-cols-2
          "
        >
          {/* Stories */}
          <motion.button
            type="button"
            onClick={() => router.push("/stories")}
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    y: -4,
                  }
            }
            whileTap={
              shouldReduceMotion
                ? undefined
                : {
                    scale: 0.985,
                  }
            }
            className="
              group
              min-h-[190px]
              w-full
              cursor-pointer
              rounded-2xl
              border
              border-white/25
              bg-white/12
              p-5
              text-left
              shadow-[0_20px_50px_rgba(0,0,0,0.22)]
              backdrop-blur-md
              transition-colors
              duration-300
              hover:border-white/40
              hover:bg-white/20
              focus:outline-none
              focus:ring-2
              focus:ring-white
              focus:ring-offset-2
              focus:ring-offset-[#3b1828]
              sm:min-h-[210px]
              sm:rounded-3xl
              sm:p-7
              lg:p-8
            "
          >
            <span
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white/15
                text-2xl
                transition-transform
                duration-300
                group-hover:scale-105
                sm:h-14
                sm:w-14
                sm:text-3xl
              "
              aria-hidden="true"
            >
              📖
            </span>

            <span
              className="
                mt-4
                block
                text-xl
                font-bold
                tracking-tight
                text-white
                sm:text-2xl
              "
            >
              Explore Parenting Stories
            </span>

            <span
              className="
                mt-2
                block
                text-sm
                leading-6
                text-white/85
                sm:text-base
                sm:leading-7
              "
            >
              Discover experiences, lessons and advice from parents around
              the world.
            </span>

            <span
              className="
                mt-4
                inline-flex
                items-center
                gap-1
                text-sm
                font-semibold
                text-pink-200
                transition-transform
                duration-300
                group-hover:translate-x-1
                sm:text-base
              "
            >
              Browse stories
              <span aria-hidden="true">→</span>
            </span>
          </motion.button>

          {/* Share Story */}
          <motion.button
            type="button"
            onClick={handleShareStory}
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    y: -4,
                  }
            }
            whileTap={
              shouldReduceMotion
                ? undefined
                : {
                    scale: 0.985,
                  }
            }
            className="
              group
              min-h-[190px]
              w-full
              cursor-pointer
              rounded-2xl
              border
              border-pink-300/25
              bg-gradient-to-br
              from-pink-500/95
              to-rose-600/90
              p-5
              text-left
              shadow-[0_20px_50px_rgba(0,0,0,0.22)]
              transition-all
              duration-300
              hover:from-pink-500
              hover:to-rose-600
              focus:outline-none
              focus:ring-2
              focus:ring-pink-200
              focus:ring-offset-2
              focus:ring-offset-[#3b1828]
              sm:min-h-[210px]
              sm:rounded-3xl
              sm:p-7
              lg:p-8
            "
          >
            <span
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white/15
                text-2xl
                transition-transform
                duration-300
                group-hover:scale-105
                sm:h-14
                sm:w-14
                sm:text-3xl
              "
              aria-hidden="true"
            >
              ✍️
            </span>

            <span
              className="
                mt-4
                block
                text-xl
                font-bold
                tracking-tight
                text-white
                sm:text-2xl
              "
            >
              Share Your Story
            </span>

            <span
              className="
                mt-2
                block
                text-sm
                leading-6
                text-white/90
                sm:text-base
                sm:leading-7
              "
            >
              Tell your parenting journey and inspire another family.
            </span>

            <span
              className="
                mt-4
                inline-flex
                items-center
                gap-1
                text-sm
                font-semibold
                text-white
                transition-transform
                duration-300
                group-hover:translate-x-1
                sm:text-base
              "
            >
              Create a story
              <span aria-hidden="true">→</span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
  }
