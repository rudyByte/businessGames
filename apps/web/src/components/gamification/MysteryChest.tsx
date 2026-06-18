import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, X, Star, Trophy, Gem } from 'lucide-react';
import { useReward } from '../ui/RewardProvider';

/* ─── Rarity Config ──────────────────────────── */
type Rarity = 'bronze' | 'silver' | 'gold';

const RARITY_CONFIG: Record<Rarity, {
  label: string;
  color: string;
  borderColor: string;
  glowColor: string;
  xpRange: [number, number];
  coinRange: [number, number];
  weight: number;           // 0-1 probability
  emoji: string;
  bonusItem?: string;
}> = {
  bronze: {
    label: 'Bronze',
    color: '#CD7F32',
    borderColor: 'rgba(205, 127, 50, 0.4)',
    glowColor: 'rgba(205, 127, 50, 0.3)',
    xpRange: [50, 100],
    coinRange: [5, 15],
    weight: 0.7,
    emoji: '🥉',
  },
  silver: {
    label: 'Silver',
    color: '#C0C0C0',
    borderColor: 'rgba(192, 192, 192, 0.4)',
    glowColor: 'rgba(192, 192, 192, 0.3)',
    xpRange: [150, 300],
    coinRange: [20, 50],
    weight: 0.2,
    emoji: '🥈',
  },
  gold: {
    label: 'Gold',
    color: '#FFD700',
    borderColor: 'rgba(255, 215, 0, 0.5)',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    xpRange: [500, 500],
    coinRange: [100, 200],
    weight: 0.1,
    emoji: '🥇',
    bonusItem: '🎟️ Streak Shield',
  },
};

function pickRarity(): Rarity {
  const rand = Math.random();
  if (rand < 0.7) return 'bronze';
  if (rand < 0.9) return 'silver';
  return 'gold';
}

/* ─── Props ──────────────────────────────────── */
interface MysteryChestProps {
  onCollect?: (xp: number, coins: number, rarity: Rarity) => void;
  sourceLabel?: string;     // e.g. "Level Complete!" or "Chapter Done!"
}

/* ─── Component ─────────────────────────────── */
export default function MysteryChest({ onCollect, sourceLabel = 'Reward Ready!' }: MysteryChestProps) {
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'opening' | 'revealed'>('idle');
  const [rarity, setRarity] = useState<Rarity | null>(null);
  const [reward, setReward] = useState<{ xp: number; coins: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { triggerReward } = useReward();

  const handleClick = () => {
    if (phase !== 'idle') return;
    const r = pickRarity();
    setRarity(r);
    setPhase('shaking');

    // After shake, start opening
    setTimeout(() => setPhase('opening'), 600);

    // Calculate reward
    const cfg = RARITY_CONFIG[r];
    const xp = Math.floor(Math.random() * (cfg.xpRange[1] - cfg.xpRange[0] + 1)) + cfg.xpRange[0];
    const coins = Math.floor(Math.random() * (cfg.coinRange[1] - cfg.coinRange[0] + 1)) + cfg.coinRange[0];

    // Open after shake
    setTimeout(() => {
      setPhase('revealed');
      setShowModal(true);
      setReward({ xp, coins });
      triggerReward('chest_open');
      onCollect?.(xp, coins, r);
    }, 1400);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const cfg = rarity ? RARITY_CONFIG[rarity] : null;

  return (
    <>
      {/* Chest trigger button */}
      <motion.button
        onClick={handleClick}
        disabled={phase !== 'idle'}
        className="relative focus:outline-none"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="relative"
          animate={
            phase === 'shaking'
              ? { rotate: [0, -8, 8, -6, 6, -3, 3, 0], scale: [1, 1.1, 1] }
              : phase === 'opening'
              ? { scaleY: [1, 0.2, 0], opacity: [1, 0.5, 0] }
              : phase === 'idle'
              ? { y: [0, -4, 0] }
              : {}
          }
          transition={
            phase === 'idle'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.5 }
          }
        >
          {/* Glow ring */}
          {phase === 'idle' && (
            <motion.div
              className="absolute -inset-2 rounded-full"
              style={{ backgroundColor: 'rgba(255, 215, 0, 0.15)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Chest SVG */}
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none" className="drop-shadow-xl">
            <rect x="8" y="20" width="32" height="22" rx="3" fill="#8B5CF6" stroke="#A78BFA" strokeWidth="1.5" />
            <path d="M8 20 Q8 10 24 10 Q40 10 40 20" fill="#7C3AED" stroke="#A78BFA" strokeWidth="1.5" />
            <circle cx="24" cy="28" r="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
            <rect x="23" y="27" width="2" height="4" rx="0.5" fill="#B45309" />
            <rect x="8" y="36" width="32" height="2" rx="1" fill="#FBBF24" />
            <text x="16" y="33" fontSize="6" fill="#FBBF24">✦</text>
            <text x="28" y="33" fontSize="6" fill="#FBBF24">✦</text>
            <path d="M20 10 Q24 6 28 10" fill="none" stroke="#A78BFA" strokeWidth="1.5" />
          </svg>

          {/* Sparkle particles during shaking */}
          {phase === 'shaking' && (
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </motion.div>
          )}
        </motion.div>

        {phase === 'idle' && (
          <span className="block text-[10px] font-game-body font-bold text-purple-400 mt-1 text-center">
            Mystery Chest
          </span>
        )}
        {phase === 'shaking' && (
          <span className="block text-[10px] font-game-body font-bold text-yellow-400 mt-1 text-center animate-pulse">
            Opening...
          </span>
        )}
      </motion.button>

      {/* ─── Reward Modal ─── */}
      <AnimatePresence>
        {showModal && rarity && reward && cfg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-game-deep/80 backdrop-blur-md p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.3, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 250 }}
              className="relative max-w-md w-full rounded-2xl p-8 text-center overflow-hidden"
              style={{
                background: rarity === 'gold'
                  ? 'linear-gradient(135deg, #1a1a2e 0%, #3a2a00 100%)'
                  : rarity === 'silver'
                  ? 'linear-gradient(135deg, #1a1a2e 0%, #1a2a3e 100%)'
                  : 'linear-gradient(135deg, #1a1a2e 0%, #2a1a1a 100%)',
                border: `2px solid ${cfg.borderColor}`,
                boxShadow: `0 0 60px ${cfg.glowColor}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background glow */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: cfg.glowColor }}
              />

              {/* Light beam (gold only) */}
              {rarity === 'gold' && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-0"
                  style={{ backgroundColor: '#FFD700', boxShadow: '0 0 40px #FFD700' }}
                  animate={{ height: [0, 200], opacity: [1, 0] }}
                  transition={{ duration: 0.8 }}
                />
              )}

              {/* Rarity badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <span
                  className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{
                    backgroundColor: `${cfg.color}20`,
                    color: cfg.color,
                    border: `1px solid ${cfg.color}40`,
                  }}
                >
                  {rarity === 'gold' && '🌟 '}{cfg.label} Chest
                </span>
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="relative z-10 mx-auto w-20 h-20 rounded-full flex items-center justify-center my-4"
                style={{
                  background: `radial-gradient(circle, ${cfg.color}30, transparent)`,
                }}
              >
                {rarity === 'gold' ? (
                  <Trophy className="h-10 w-10" style={{ color: cfg.color }} />
                ) : rarity === 'silver' ? (
                  <Gem className="h-10 w-10" style={{ color: cfg.color }} />
                ) : (
                  <Star className="h-10 w-10" style={{ color: cfg.color }} />
                )}
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl font-game-round font-bold text-white relative z-10">
                {sourceLabel}
              </h3>
              <p className="text-sm text-slate-400 mt-1 relative z-10">
                {rarity === 'gold' ? '✨ Amazing! You found a legendary chest!' :
                 rarity === 'silver' ? 'Great pull! A silver chest!' :
                 'Nice! Every chest adds up!'}
              </p>

              {/* Reward breakdown */}
              <div className="grid grid-cols-2 gap-4 my-5 relative z-10">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: `${cfg.color}10`, border: `1px solid ${cfg.color}20` }}
                >
                  <Star className="h-5 w-5 mx-auto mb-1" style={{ color: cfg.color }} />
                  <div className="text-[9px] uppercase font-bold tracking-wider" style={{ color: cfg.color }}>XP</div>
                  <div className="text-2xl font-game-round font-bold text-white">+{reward.xp}</div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: `${cfg.color}10`, border: `1px solid ${cfg.color}20` }}
                >
                  <Gift className="h-5 w-5 mx-auto mb-1" style={{ color: cfg.color }} />
                  <div className="text-[9px] uppercase font-bold tracking-wider" style={{ color: cfg.color }}>Coins</div>
                  <div className="text-2xl font-game-round font-bold text-game-yellow">₹{reward.coins}</div>
                </motion.div>
              </div>

              {/* Bonus item for gold */}
              {rarity === 'gold' && cfg.bonusItem && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="relative z-10 p-3 rounded-xl mb-4"
                  style={{ backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
                >
                  <span className="text-sm">{cfg.bonusItem}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Protects your streak once!</span>
                </motion.div>
              )}

              {/* Collect button */}
              <motion.button
                onClick={handleClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="relative z-10 w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
                style={{
                  background: rarity === 'gold'
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : rarity === 'silver'
                    ? 'linear-gradient(135deg, #C0C0C0, #808080)'
                    : 'linear-gradient(135deg, #CD7F32, #8B4513)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {rarity === 'gold' ? '🏆 Collect Legendary Reward!' : '📦 Collect Reward'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
