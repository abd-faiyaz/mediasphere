'use client';

import { motion } from 'framer-motion';

export const AnimatedDots = () => {
  // Pre-calculate dot positions to ensure consistent rendering
  const dots = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${(i * 2) % 100}%`,
    left: `${(i * 3.6) % 100}%`,
    delay: i * 0.1,
  }));

  return (
    <>
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute w-1 h-1 bg-[#1E3A8A]/20 rounded-full"
          style={{
            top: dot.top,
            left: dot.left,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
};
