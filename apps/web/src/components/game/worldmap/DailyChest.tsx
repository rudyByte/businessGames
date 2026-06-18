import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';

interface DailyChestProps {
  canOpen: boolean;
  onOpen: () => void;
}

export default function DailyChest({ canOpen, onOpen }: DailyChestProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [reward, setReward] = useState<{ xp: number; coins: number } | null>(null);

  const handleOpen = () => {
    if (!canOpen || isOpening || isOpen) return;

    setIsOpening(true);
    onOpen();

    // Simulate reward calculation
    const xpReward = Math.floor(Math.random() * 151) + 50; // 50-200 XP
    const coinReward = Math.floor(Math.random() * 21) + 10; // 10-30 coins

    setTimeout(() => {
      setIsOpening(false);
      setIsOpen(true);
      setReward({ xp: xpReward, coins: coinReward });
    }, 800);
  };

  const handleClose = () => {
    setIsOpen(false);
    setReward(null);
  };

  return (
    <>
      {/* Chest on the map */}
      <motion.button
        onClick={handleOpen}
        disabled={!canOpen || isOpen}
        className={`relative cursor-pointer focus:outline-none ${!canOpen ? 'opacity-50' : ''}`}
        whileHover={canOpen && !isOpen ? { scale: 1.1 } : {}}
        whileTap={canOpen && !isOpen ? { scale: 0.95 } : {}}
        animate={
          canOpen && !isOpen
            ? {
                rotate: [0, -3, 3, -2, 2, 0],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                },
              }
            : {}
        }
      >
        {/* Glow ring when available */}
        {canOpen && !isOpen && (
          <motion.div
            className="absolute -inset-3 rounded-full bg-game-yellow/20"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* "OPEN ME!" speech bubble */}
        {canOpen && !isOpen && (
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <span className="bg-game-hot text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
              OPEN ME! 🎁
            </span>
          </motion.div>
        )}

        {/* Chest SVG */}
        <motion.svg
          width="64"
          height="64"
          viewBox="0 0 48 48"
          fill="none"
          animate={
            isOpening
              ? {
                  rotateX: [0, 90],
                  scaleY: [1, 0.2],
                  opacity: [1, 0],
                }
              : {}
          }
          transition={{ duration: 0.6 }}
        >
          {/* Chest body */}
          <rect x="8" y="20" width="32" height="22" rx="3" fill="#8B5CF6" stroke="#A78BFA" strokeWidth="1.5" />
          {/* Chest lid */}
          <motion.path
            d="M8 20 Q8 10 24 10 Q40 10 40 20"
            fill="#7C3AED"
            stroke="#A78BFA"
            strokeWidth="1.5"
            animate={
              isOpening
                ? {
                    d: ['M8 20 Q8 10 24 10 Q40 10 40 20', 'M8 20 Q8 -5 24 -5 Q40 -5 40 20'],
                    fill: ['#7C3AED', '#6D28D9'],
                  }
                : {}
            }
            transition={{ duration: 0.4 }}
          />
          {/* Lock */}
          <circle cx="24" cy="28" r="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
          {/* Lock keyhole */}
          <rect x="23" y="27" width="2" height="4" rx="0.5" fill="#B45309" />
          {/* Gold trim */}
          <rect x="8" y="36" width="32" height="2" rx="1" fill="#FBBF24" />
          {/* Stars decoration */}
          <text x="16" y="33" fontSize="6" fill="#FBBF24">✦</text>
          <text x="28" y="33" fontSize="6" fill="#FBBF24">✦</text>
          {/* Handle */}
          <path d="M20 10 Q24 6 28 10" fill="none" stroke="#A78BFA" strokeWidth="1.5" />
        </motion.svg>

        {/* "Daily Chest" label */}
        <span className="block text-xs font-game-body font-bold text-game-yellow mt-1.5 text-center">
          Daily Chest
        </span>
      </motion.button>

      {/* Reward Modal */}
      <AnimatePresence>
        {isOpen && reward && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-game-deep/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="relative max-w-md w-full bg-gradient-to-b from-game-dark to-game-deep rounded-2xl p-8 border-2 border-game-yellow/30 shadow-2xl text-center"
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Sparkle background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-game-yellow/10 rounded-full blur-3xl" />

              {/* Chest icon */}
              <motion.div
                className="relative z-10 mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl border border-purple-500/20 flex items-center justify-center mb-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Gift className="h-8 w-8 text-game-yellow" />
              </motion.div>

              {/* Reward text */}
              <h3 className="text-2xl font-game-round font-bold text-white mb-2 relative z-10">
                Daily Reward!
              </h3>
              <p className="text-slate-400 text-sm mb-5 relative z-10">
                Come back tomorrow for another chest!
              </p>

              {/* Reward breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                <motion.div
                  className="bg-game-deep/60 rounded-xl p-4 border border-purple-500/15"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">XP</span>
                  <p className="text-xl font-game-round font-bold text-white">+{reward.xp}</p>
                </motion.div>
                <motion.div
                  className="bg-game-deep/60 rounded-xl p-3 border border-game-yellow/15"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-xs text-game-yellow font-bold uppercase tracking-wider">Coins</span>
                  <p className="text-xl font-game-round font-bold text-game-yellow">₹{reward.coins}</p>
                </motion.div>
              </div>

              {/* Collect button */}
              <motion.button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-game-orange to-game-hot text-white font-bold py-3 rounded-xl text-base relative z-10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Collect Rewards! 🎉
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
