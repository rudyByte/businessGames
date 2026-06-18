import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetectiveStore } from '../../../stores/detectiveStore';
import { Zap, Flame, Sparkles } from 'lucide-react';

/* ─── Combo level config ─────────────────────── */
const COMBO_STYLES: Record<number, { label: string; color: string; glow: string; emoji: string }> = {
  2: { label: 'COMBO x2!', color: '#22D3EE', glow: 'rgba(34,211,238,0.4)', emoji: '⚡' },
  3: { label: 'COMBO x3!', color: '#FBBF24', glow: 'rgba(251,191,36,0.4)', emoji: '🔥' },
  4: { label: 'SUPER COMBO x4!', color: '#F97316', glow: 'rgba(249,115,22,0.4)', emoji: '💥' },
  5: { label: 'MEGA COMBO x5!', color: '#EF4444', glow: 'rgba(239,68,68,0.4)', emoji: '🌟' },
};

export default function ComboIndicator() {
  const combo = useDetectiveStore(s => s.combo);
  const comboVisible = useDetectiveStore(s => s.comboVisible);
  const dismissCombo = useDetectiveStore(s => s.dismissCombo);

  // Auto-dismiss after animation
  useEffect(() => {
    if (comboVisible) {
      const timer = setTimeout(() => dismissCombo(), 2000);
      return () => clearTimeout(timer);
    }
  }, [comboVisible, dismissCombo]);

  const style = COMBO_STYLES[Math.min(combo.count, 5)] || COMBO_STYLES[2];
  const show = comboVisible && combo.count >= 2;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`combo-${combo.count}-${combo.lastClueTime}`}
          initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.5, y: -40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 backdrop-blur-md"
            style={{
              borderColor: `${style.color}40`,
              backgroundColor: `${style.color}12`,
              boxShadow: `0 0 30px ${style.glow}, 0 0 60px ${style.glow}`,
            }}
          >
            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {combo.count >= 4 ? (
                <Flame className="h-6 w-6" style={{ color: style.color }} />
              ) : combo.count >= 3 ? (
                <Zap className="h-6 w-6" style={{ color: style.color }} />
              ) : (
                <Sparkles className="h-6 w-6" style={{ color: style.color }} />
              )}
            </motion.div>

            {/* Text */}
            <div className="text-center">
              <motion.span
                className="font-game-score font-black text-lg block"
                style={{ color: style.color, textShadow: `0 0 20px ${style.glow}` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              >
                {style.emoji} {style.label}
              </motion.span>
              <span className="text-[9px] font-game-body text-white font-bold block">
                +{combo.count * 30} XP Bonus!
              </span>
            </div>

            {/* XP multiplier */}
            <div
              className="px-2 py-1 rounded-lg text-[10px] font-game-score font-bold"
              style={{
                backgroundColor: `${style.color}20`,
                color: style.color,
              }}
            >
              x{combo.count}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
