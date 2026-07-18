'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RotatingText from './RotatingText';

export default function Hero() {
  const router = useRouter();

  return (
    <section
      className="
        relative
        min-h-[700px]
        sm:min-h-[760px]
        lg:min-h-[820px]
        xl:min-h-[850px]
        overflow-hidden
        flex
        items-center
      "
    >

      {/* Background */}
      <motion.div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          lg:bg-[length:100%_auto]
        "
        style={{
          backgroundImage:
            "url('/Images/stories/familysize.jpeg')",
          backgroundPosition:
            "center center",
        }}
        animate={{
          scale: [1, 1.015, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />


      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />


      {/* Content */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-12
          py-12
          sm:py-16
          lg:py-28
          xl:py-32
        "
      >

        {/* Hero Text */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="
            max-w-5xl
            mx-auto
            text-center
          "
        >

          <h1
            className="
              text-3xl
              leading-tight
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
              mt-6
              mx-auto
              max-w-4xl
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
            mt-10
            sm:mt-14
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
            lg:gap-7
            max-w-5xl
            mx-auto
          "
        >


          {/* Explore Stories */}
          <motion.div
            whileHover={{
              y: -6,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() =>
              router.push('/stories')
            }
            className="
              cursor-pointer
              rounded-3xl
              border
              border-white/30
              bg-white/15
              backdrop-blur-xl
              p-6
              lg:p-10
              xl:p-12
              shadow-xl
              transition
              hover:bg-white/25
            "
          >

            <div className="text-4xl">
              📖
            </div>


            <h2
              className="
                mt-4
                text-xl
                lg:text-3xl
                font-bold
                text-white
              "
            >
              Explore Parenting Stories
            </h2>


            <p
              className="
                mt-3
                text-sm
                lg:text-lg
                leading-7
                text-gray-100
              "
            >
              Discover experiences, lessons and advice from parents around the world.
            </p>


            <span
              className="
                inline-block
                mt-5
                font-semibold
                text-pink-200
              "
            >
              Browse stories →
            </span>

          </motion.div>




          {/* Share Story */}
          <motion.div
            whileHover={{
              y: -6,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() =>
              router.push('/stories/my-stories')
            }
            className="
              cursor-pointer
              rounded-3xl
              bg-pink-500/90
              backdrop-blur-xl
              p-6
              lg:p-10
              xl:p-12
              shadow-xl
              transition
              hover:bg-pink-600
            "
          >

            <div className="text-4xl">
              ✍️
            </div>


            <h2
              className="
                mt-4
                text-xl
                lg:text-3xl
                font-bold
                text-white
              "
            >
              Share Your Story
            </h2>


            <p
              className="
                mt-3
                text-sm
                lg:text-lg
                leading-7
                text-white
              "
            >
              Tell your parenting journey and inspire another family.
            </p>


            <span
              className="
                inline-block
                mt-5
                font-semibold
                text-white
              "
            >
              Create a story →
            </span>

          </motion.div>


        </div>


      </div>

    </section>
  );
}
