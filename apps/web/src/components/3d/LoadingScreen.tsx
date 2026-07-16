import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TIPS = [
  'Observe dialogues closely — sometimes problem details are hidden in emotions.',
  'Pricing too high will drive customers away; pricing too low burns cash.',
  'A proper balance of engineers and marketers leads to rapid startup growth.',
  'Streaks increase XP multipliers, letting you rise to the top of India Leaderboard!',
];

export default function LoadingScreen() {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle tips
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);

    // Simulate progress bar loading
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-50">
      {/* Magnifying Glass Icon */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="text-7xl mb-6"
      >
        🔍
      </motion.div>

      <div className="max-w-md w-full text-center space-y-6">
        <h3 className="font-game text-xl text-gradient-orange" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Loading 3D Assets...
        </h3>

        {/* Progress Bar Container */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-teal"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tips display */}
        <div className="min-h-[60px] text-xs text-slate-400 italic font-body px-4">
          💡 Tip: {TIPS[tipIndex]}
        </div>
      </div>
    </div>
  );
}
