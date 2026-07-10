'use client';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section 
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center px-6 py-20"
      style={{ backgroundImage: "url('/images/brazilian-people-celebrating-easter.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Hero Content - Centralized for maximum impact */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-4xl mb-16"
      >
        <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
          Welcome to Parenting Together
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 leading-relaxed font-medium max-w-2xl mx-auto">
          Parenting is one of life's greatest journeys. Whether you're seeking advice or 
          looking to share your own story, you've found a community that cares.
        </p>
      </motion.div>

      {/* Interaction Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-white text-center hover:bg-white/20 transition-all shadow-xl"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-2">See parenting stories</h2>
          <p className="text-white/70">Read heartwarming experiences from others.</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-pink-600/70 backdrop-blur-md border border-pink-400/30 p-8 rounded-3xl text-white text-center hover:bg-pink-600 transition-all shadow-xl"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-2">Post your story</h2>
          <p className="text-pink-100">Inspire the community with your journey.</p>
        </motion.button>
      </div>
    </section>
  );
}