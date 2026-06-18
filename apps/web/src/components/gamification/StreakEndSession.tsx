import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, X, Zap, Clock, ArrowRight, Sparkles, Shield,
} from 'lucide-react';

/* ─── Props ──────────────────────────────────── */
interface StreakEndSessionProps {
  open: boolean;
  onClose: () => void;
  onQuickChallenge: () => void;
  onLeave: () => void;
  streak: number;
  xpToNextLevel: number;
  nextLevel: number;
  hasStreakShield?: boolean;
  streakExpiresInHours?: number;
}

/* ─── Component ─────────────────────────────── */
export default function StreakEndSession({
  open, onClose, onQuickChallenge, onLeave,
  streak, xpToNextLevel, nextLevel,
  hasStreakShield = false,
  streakExpiresInHours = 8,
}: StreakEndSessionProps) {
  const [timeLeft, setTimeLeft] = useState(streakExpiresInHours * 3600); // seconds
  const [showMourning, setShowMourning] = useState(false);
  const [useShield, setUseShield] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!open) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const handleShieldUse = () => {
    setUseShield(true);
    setTimeout(() => {
      setUseShield(false);
      onClose();
    }, 2000);
  };

  const isUrgent = timeLeft < 3600; // less than 1 hour
  const isCritical = timeLeft < 600; // less than 10 minutes

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-game-deep/90 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="relative max-w-md w-full bg-gradient-to-b from-game-dark to-game-deep rounded-2xl border overflow-hidden shadow-2xl"
            style={{ borderColor: isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <div
              className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
                isCritical ? 'bg-red-500/10' : 'bg-orange-500/8'
              }`}
            />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 relative z-10 space-y-5">
              {/* Streak display */}
              {!showMourning && !useShield ? (
                <>
                  <div className="text-center">
                    <motion.div
                      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block"
                    >
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                          isCritical
                            ? 'bg-red-500/20 border-red-500/30 animate-pulse'
                            : 'bg-orange-500/15 border-orange-500/20'
                        }`}
                        style={{ borderWidth: 2 }}
                      >
                        <Flame className={`h-8 w-8 ${isCritical ? 'text-red-400' : 'text-orange-400'}`} />
                      </div>
                    </motion.div>

                    <h2 className="text-xl font-game-round font-bold text-white">
                      Before you go...
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Your <span className="text-orange-400 font-bold">{streak}-day streak</span> needs to survive!
                    </p>
                  </div>

                  {/* Countdown */}
                  <div className="text-center p-4 rounded-xl bg-game-deep/60 border border-slate-800/40">
                    <div className="text-[9px] text-slate-500 uppercase font-bold mb-2">
                      Streak resets in
                    </div>
                    <div className={`font-mono text-3xl font-black tracking-wider ${
                      isCritical ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-white'
                    }`}>
                      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    {isCritical && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-[10px] text-red-400 font-bold flex items-center justify-center gap-1"
                      >
                        <Zap className="h-3 w-3" /> Streak is about to break!
                      </motion.div>
                    )}
                  </div>

                  {/* XP proximity hook */}
                  {xpToNextLevel > 0 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-center">
                      <Sparkles className="h-5 w-5 mx-auto mb-1 text-purple-400" />
                      <p className="text-xs text-slate-300">
                        You're only <strong className="text-purple-400">{xpToNextLevel} XP</strong> away from <strong className="text-white">Level {nextLevel}</strong>!
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1">One quick challenge could do it!</p>
                    </div>
                  )}

                  {/* Quick Challenge button */}
                  <motion.button
                    onClick={onQuickChallenge}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-purple-600 text-white font-bold text-sm border border-orange-500/20 shadow-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap className="h-4 w-4" /> Quick Challenge (+{xpToNextLevel}+ XP)
                  </motion.button>

                  {/* Streak Shield */}
                  {hasStreakShield && !useShield && (
                    <motion.button
                      onClick={handleShieldUse}
                      className="w-full py-2.5 rounded-xl bg-game-deep/60 border border-slate-700/40 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Shield className="h-3.5 w-3.5 text-game-teal" /> Use Streak Shield (1 remaining)
                    </motion.button>
                  )}

                  {/* Leave button */}
                  <button
                    onClick={() => { setShowMourning(true); }}
                    className="w-full py-2 text-center text-slate-500 hover:text-slate-400 text-xs transition-colors"
                  >
                    I'll risk it — leave anyway
                  </button>
                </>
              ) : useShield ? (
                /* Shield activated animation */
                <div className="text-center py-6 space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 mx-auto bg-game-teal/20 rounded-full flex items-center justify-center border-2 border-game-teal/40"
                  >
                    <Shield className="h-10 w-10 text-game-teal" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white">Streak Saved! 🛡️</h3>
                  <p className="text-xs text-slate-400">Your streak shield protected your {streak}-day flame.</p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5 }}
                    className="h-1 bg-gradient-to-r from-game-teal to-green-400 rounded-full mx-auto max-w-[200px]"
                  />
                </div>
              ) : (
                /* Mourning animation */
                <div className="text-center py-6 space-y-4">
                  <motion.div
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{ scale: [1, 1.2, 0], rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 1.5 }}
                    className="w-20 h-20 mx-auto flex items-center justify-center"
                  >
                    <Flame className="h-12 w-12 text-slate-600" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-bold text-white">Streak Lost 🔥💔</h3>
                    <p className="text-xs text-slate-400 mt-1">Your {streak}-day streak broke. But you can rebuild!</p>
                    <motion.button
                      onClick={() => { setShowMourning(false); }}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-xs"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🔥 Rebuild from Day 1
                    </motion.button>
                    <button
                      onClick={onLeave}
                      className="block mx-auto mt-3 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      Leave now
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
