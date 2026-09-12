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
        bg-[#180f17]
      "
    >
      {/* =========================================================
          BACKGROUND
          ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#180f17]">
        {/* Mobile atmospheric background */}
        <div
          className="
            absolute
            inset-0
            sm:hidden
            bg-[radial-gradient(circle_at_50%_18%,rgba(236,72,153,0.24),transparent_32%),radial-gradient(circle_at_10%_72%,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_90%_78%,rgba(244,114,182,0.12),transparent_28%),linear-gradient(180deg,#24131f_0%,#1b1019_42%,#120b11_100%)]
          "
        />

        {/* Mobile soft glow */}
        <div
          className="
            absolute
            left-1/2
            top-[42%]
            hidden
            h-[360px]
            w-[360px]
            -translate-x-1/2
            rounded-full
            bg-pink-500/10
            blur-[100px]
            sm:block
            sm:h-[500px]
            sm:w-[500px]
          "
        />

        {/* Mobile left glow */}
        <div
          className="
            absolute
            -left-24
            bottom-16
            hidden
            h-56
            w-56
            rounded-full
            bg-fuchsia-500/10
            blur-[90px]
            sm:block
            sm:h-72
            sm:w-72
          "
        />

        {/* Mobile right glow */}
        <div
          className="
            absolute
            -right-24
            bottom-24
            hidden
            h-56
            w-56
            rounded-full
            bg-rose-400/10
            blur-[90px]
            sm:block
            sm:h-72
            sm:w-72
          "
        />

        {/* Background Image */}
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

        {/* =======================================================
            MOBILE IMAGE TRANSITION ONLY
            ======================================================= */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[55%]
            sm:hidden
            bg-gradient-to-b
            from-black/10
            via-transparent
            to-[#180f17]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            top-[22%]
            bottom-0
            sm:hidden
            bg-gradient-to-b
            from-transparent
            via-[#180f17]/45
            to-[#120b11]
          "
        />
      </div>

      {/* =========================================================
          DESKTOP OVERLAY
          Kept close to the original desktop treatment.
          ========================================================= */}
      <div
        className="
          absolute
          inset-0
          z-[1]
          bg-black/45
        "
      />

      {/* Slight mobile readability overlay */}
      <div
        className="
          absolute
          inset-0
          z-[1]
          sm:hidden
          bg-gradient-to-t
          from-black/35
          via-transparent
          to-transparent
        "
      />

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
          pt-[52svh]
          pb-14
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
          className="
            max-w-5xl
            mx-auto
            text-center
          "
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

        {/* =======================================================
            ACTION CARDS
            ======================================================= */}
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
              border-white/30
              bg-white/15
              backdrop-blur-xl
              p-5
              sm:p-6
              lg:p-10
              shadow-2xl
              hover:bg-white/25
              transition
              duration-300
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-pink-300
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
              border
              border-pink-300/20
              bg-gradient-to-br
              from-pink-500/95
              via-pink-500/90
              to-fuchsia-600/90
              backdrop-blur-xl
              p-5
              sm:p-6
              lg:p-10
              shadow-2xl
              hover:from-pink-500
              hover:via-pink-600
              hover:to-fuchsia-600
              transition
              duration-300
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-pink-200
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
