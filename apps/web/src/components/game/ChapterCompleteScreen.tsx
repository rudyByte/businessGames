import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Trophy, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { useReward } from '../ui/RewardProvider';

interface ChapterCompleteProps {
  chapterNumber: number;
  chapterTitle: string;
  gameName: string;
  score: number;
  maxScore: number;
  xpEarned: number;
  coinsEarned: number;
  onContinue: () => void;
  onReplay?: () => void;
}

function StarRating({ earned, total }: { earned: number; total: number }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < earned;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 200 }}
          >
            <Star
              className={`h-10 w-10 ${
                filled
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]'
                  : 'text-slate-700'
              }`}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ChapterCompleteScreen({
  chapterNumber,
  chapterTitle,
  gameName,
  score,
  maxScore,
  xpEarned,
  coinsEarned,
  onContinue,
  onReplay,
}: ChapterCompleteProps) {
  const { triggerReward } = useReward();
  const pct = Math.round((score / maxScore) * 100);
  const starsEarned = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  useEffect(() => {
    triggerReward('level_up');

    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#4ECDC4', '#FFE66D', '#FF6B35'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#4ECDC4', '#FFE66D', '#FF6B35'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [triggerReward]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-md w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/20 rounded-2xl p-8 text-center space-y-6 shadow-2xl"
      >
        {/* Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
            {gameName}
          </span>
          <h2 className="text-2xl font-bold font-display text-white">
            Chapter {chapterNumber} Complete!
          </h2>
          <p className="text-slate-400 text-sm">{chapterTitle}</p>
        </div>

        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-6xl"
        >
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto drop-shadow-[0_0_16px_rgba(255,215,0,0.3)]" />
        </motion.div>

        {/* Star Rating */}
        <StarRating earned={starsEarned} total={3} />

        {/* Score bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Score</span>
            <span className="font-bold text-white">{score}/{maxScore} ({pct}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-lg font-bold text-white">+{xpEarned}</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">XP Earned</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-lg font-bold text-yellow-400">+{coinsEarned}</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Coins</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl border border-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>

          {onReplay && (
            <button
              onClick={onReplay}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl border border-slate-700/50 transition-all text-xs"
            >
              Replay Chapter
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
