'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RotatingText from './RotatingText';

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/Images/brazilian-people-celebrating-easter-300kb-1.jpg')",
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
            Welcome to
            <span className="block text-pink-400 mt-2">
              Parenting Together
            </span>
          </h1>

          <div className="mt-6">
            <RotatingText />
          </div>

          <p className="mt-8 text-base sm:text-lg md:text-xl text-gray-200 leading-8 max-w-3xl mx-auto">
            Parenting is one of life's greatest journeys.
            Learn from other parents, share your experiences,
            and become part of a supportive community built
            to help every family grow together.
          </p>
        </motion.div>


        {/* Navigation Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* See Parenting Stories */}
          <motion.div
            whileHover={{
              scale: 1.03,
              y: -5,
            }}
            whileTap={{
              scale: 0.95,
              y: 3,
            }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 25,
            }}
            onClick={() => {
              setTimeout(() => {
                router.push('/stories');
              }, 150);
            }}
            className="group cursor-pointer rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 text-left transition-all duration-300 hover:bg-white/20 hover:shadow-2xl"
          >
            <div className="text-4xl mb-4">
              📖
            </div>

            <h2 className="text-2xl font-bold text-white">
              See Parenting Stories
            </h2>

            <p className="mt-3 text-gray-200">
              Discover inspiring stories, parenting advice,
              and real-life experiences from parents around the world.
            </p>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-pink-300 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Explore →
              </span>

              <span className="text-white/70 text-sm">
                Browse stories
              </span>
            </div>
          </motion.div>


          {/* Post Your Story */}
          <motion.button
            whileHover={{
              scale: 1.03,
              y: -5,
            }}
            whileTap={{
              scale: 0.95,
              y: 3,
            }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 25,
            }}
            onClick={() => {
              router.push('/stories/my-stories');
            }}
            className="group rounded-3xl bg-pink-500/90 backdrop-blur-lg p-8 text-left transition-all duration-300 hover:bg-pink-600 hover:shadow-2xl"
          >
            <div className="text-4xl mb-4">
              ✍️
            </div>

            <h2 className="text-2xl font-bold text-white">
              Post Your Story
            </h2>

            <p className="mt-3 text-gray-100">
              Share your parenting journey and connect with other parents.
            </p>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Share →
              </span>

              <span className="text-white/80 text-sm">
                Create a story
              </span>
            </div>
          </motion.button>

        </div>
      </div>
    </section>
  );
          }
