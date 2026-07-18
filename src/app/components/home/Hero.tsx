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
        min-h-[720px]
        sm:min-h-[760px]
        lg:min-h-[85vh]
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
        "
        style={{
          backgroundImage:
            "url('/Images/stories/familybg.jpeg')",
          backgroundPosition: "center center",
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
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-12
          sm:py-16
        "
      >

        {/* Heading Section */}
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
            duration: 0.7,
          }}
          className="
            text-center
            max-w-4xl
            mx-auto
          "
        >

          <h1
            className="
              text-3xl
              leading-tight
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
              font-extrabold
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


          <div
            className="
              mt-4
              sm:mt-5
            "
          >
            <RotatingText />
          </div>


          <p
            className="
              mt-5
              sm:mt-6
              max-w-2xl
              mx-auto
              text-sm
              leading-6
              sm:text-base
              sm:leading-7
              md:text-lg
              text-gray-100
            "
          >
            Parenting is one of life's greatest journeys.
            Learn from real parents, share your experiences,
            and become part of a community helping families grow together.
          </p>


        </motion.div>



        {/* Action Cards */}
        <div
          className="
            mt-8
            sm:mt-10
            grid
            grid-cols-1
            gap-4
            sm:gap-5
            md:grid-cols-2
            max-w-4xl
            mx-auto
          "
        >


          {/* Stories Card */}
          <motion.div

            whileHover={{
              y:-5,
            }}

            whileTap={{
              scale:0.97,
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
              p-5
              sm:p-6
              shadow-xl
              transition
              hover:bg-white/25
            "
          >

            <div className="text-3xl">
              📖
            </div>


            <h2
              className="
                mt-3
                text-lg
                sm:text-xl
                font-bold
                text-white
              "
            >
              Explore Parenting Stories
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-gray-100
              "
            >
              Discover experiences, lessons and advice from parents around the world.
            </p>


            <span
              className="
                inline-block
                mt-4
                text-sm
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
              y:-5,
            }}

            whileTap={{
              scale:0.97,
            }}

            onClick={() =>
              router.push('/stories/my-stories')
            }

            className="
              cursor-pointer
              rounded-3xl
              bg-pink-500/90
              backdrop-blur-xl
              p-5
              sm:p-6
              shadow-xl
              transition
              hover:bg-pink-600
            "
          >

            <div className="text-3xl">
              ✍️
            </div>


            <h2
              className="
                mt-3
                text-lg
                sm:text-xl
                font-bold
                text-white
              "
            >
              Share Your Story
            </h2>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-white
              "
            >
              Tell your parenting journey and inspire another family.
            </p>


            <span
              className="
                inline-block
                mt-4
                text-sm
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
