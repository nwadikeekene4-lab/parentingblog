'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RotatingText from './RotatingText';

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-[85vh] overflow-hidden flex items-center">

      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/Images/brazilian-people-celebrating-easter-300kb-1.jpg')",
          backgroundPosition: "center 35%",
        }}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />


      {/* Softer Overlay */}
      <div className="absolute inset-0 bg-black/45" />


      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
            Welcome to
            <span className="block mt-2 text-pink-300">
              Parenting Together
            </span>
          </h1>


          <div className="mt-5">
            <RotatingText />
          </div>


          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg text-gray-100 leading-8">
            Parenting is one of life's greatest journeys.
            Learn from real parents, share your experiences,
            and become part of a community helping families grow together.
          </p>

        </motion.div>



        {/* Choice Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">


          {/* Stories */}
          <motion.div
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/stories')}
            className="cursor-pointer rounded-3xl border border-white/30 bg-white/15 backdrop-blur-xl p-6 shadow-xl hover:bg-white/25 transition"
          >

            <div className="text-3xl mb-3">
              📖
            </div>

            <h2 className="text-xl font-bold text-white">
              Explore Parenting Stories
            </h2>

            <p className="mt-2 text-sm text-gray-100">
              Discover experiences, lessons and advice from parents around the world.
            </p>

            <span className="inline-block mt-5 text-pink-200 font-semibold">
              Browse stories →
            </span>

          </motion.div>



          {/* Post Story */}
          <motion.div
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/stories/my-stories')}
            className="cursor-pointer rounded-3xl bg-pink-500/90 backdrop-blur-xl p-6 shadow-xl hover:bg-pink-600 transition"
          >

            <div className="text-3xl mb-3">
              ✍️
            </div>

            <h2 className="text-xl font-bold text-white">
              Share Your Story
            </h2>

            <p className="mt-2 text-sm text-white">
              Tell your parenting journey and inspire another family.
            </p>

            <span className="inline-block mt-5 text-white font-semibold">
              Create a story →
            </span>

          </motion.div>


        </div>

      </div>

    </section>
  );
            }
