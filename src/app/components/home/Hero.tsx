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
        min-h-screen
        lg:min-h-[900px]
        overflow-hidden
        flex
        items-center
      "
    >

      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">

        <motion.img
          src="/Images/stories/homebg.jpg"
          alt="Family background"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-center
          "
          style={{
            objectPosition: "center center",
          }}
          animate={{
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

      </div>


      {/* Background Overlay */}
      <div
        className="
          absolute
          inset-0
          z-[1]
          bg-black/45
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
          py-20
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
              text-4xl
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
                mt-3
                text-pink-300
              "
            >
              Parenting Together
            </span>

          </h1>


          <div className="mt-6">
            <RotatingText />
          </div>


          <p
            className="
              mt-7
              max-w-3xl
              mx-auto
              text-base
              leading-7
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
            mt-12
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
            max-w-5xl
            mx-auto
          "
        >


          {/* Stories Card */}
          <motion.div
            whileHover={{
              y: -6,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() => {
              router.push('/stories');
            }}
            className="
              cursor-pointer
              rounded-3xl
              border
              border-white/30
              bg-white/15
              backdrop-blur-xl
              p-6
              lg:p-10
              shadow-2xl
              hover:bg-white/25
              transition
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
                mt-5
                inline-block
                font-semibold
                text-pink-200
              "
            >
              Browse stories →
            </span>


          </motion.div>




          {/* Share Card */}
          <motion.div
            whileHover={{
              y: -6,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() => {
              router.push('/stories/my-stories');
            }}
            className="
              cursor-pointer
              rounded-3xl
              bg-pink-500/90
              backdrop-blur-xl
              p-6
              lg:p-10
              shadow-2xl
              hover:bg-pink-600
              transition
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
                mt-5
                inline-block
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
