import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Star, Sparkles, Zap, Gift, Trophy } from 'lucide-react';
import HexBadge, { getRarityForLevel } from '../ui/HexBadge';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const rarity = getRarityForLevel(level);

  useEffect(() => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B35', '#4ECDC4', '#FFE66D', '#FFD700'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF6B35', '#4ECDC4', '#FFE66D', '#FFD700'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [level]);

  const rewards = [
    { icon: Star, text: 'New custom SVG Uniform style option', color: 'text-game-yellow' },
    { icon: Zap, text: '+50 Bonus Virtual Coins', color: 'text-game-orange' },
    { icon: Gift, text: 'Unlock advanced Chapter 3 Quests', color: 'text-game-teal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-game-deep/90 backdrop-blur-md p-4">
      <div
        className="relative max-w-sm w-full rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-2xl border overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
          borderColor: 'rgba(255, 215, 0, 0.2)',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.1), 0 0 120px rgba(255, 107, 53, 0.05)',
        }}
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
        />

        {/* Close button */}
        <div className="flex justify-between items-center relative z-10">
          <span className="text-[10px] font-game-score font-bold text-game-yellow uppercase tracking-widest">
            Level Up!
          </span>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          {/* Hexagonal level badge */}
          <div className="flex justify-center">
            <HexBadge level={level} rarity={rarity} size="lg" />
          </div>

          {/* Sparkle effects */}
          <motion.div className="flex justify-center gap-1">
            {[1, 2, 3].map((i) => (
              <Sparkles key={i} className="h-4 w-4 text-game-yellow" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </motion.div>

          <div className="space-y-1">
            <h2 className="text-2xl font-game-round font-bold text-white">
              Level Up!
            </h2>
            <p className="text-sm text-game-text-muted">
              You've advanced to <span className="font-game-score font-bold text-game-yellow">Level {level}</span>
            </p>
          </div>
        </div>

        {/* Rewards list */}
        <div className="bg-game-dark/60 border border-slate-700/30 p-4 rounded-xl text-left space-y-2 relative z-10">
          <span className="text-[10px] font-bold text-game-yellow uppercase tracking-wider block">
            🎁 Rewards Unlocked
          </span>
          <ul className="space-y-2">
            {rewards.map((reward, i) => {
              const Icon = reward.icon;
              return (
                <li key={i} className="flex items-center gap-2 text-[12px] text-game-text-muted">
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${reward.color}`} />
                  {reward.text}
                </li>
              );
            })}
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="btn-game btn-game-primary w-full relative z-10"
        >
          <Trophy className="h-4 w-4" /> Continue Playing
        </button>
      </div>
    </div>
  );
}
