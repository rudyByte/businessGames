import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Award, TrendingUp, Flame, ChevronRight } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */

export interface RishabhChallengeData {
  id: string;
  /** Challenge title like "Prove me wrong!" */
  title: string;
  /** Rishabh's challenge/doubt text */
  challenge: string;
  /** Rishabh's current expression/emotion */
  expression: 'smug' | 'doubtful' | 'impressed' | 'shocked' | 'happy' | 'reluctant';
  /** Optional context — what the student achieved */
  context?: string;
  /** Type of challenge */
  type: 'doubt' | 'challenge' | 'congratulate' | 'transformation';
  /** Optional challenge mission */
  mission?: {
    label: string;
    description: string;
    onAccept: () => void;
  };
}

interface RishabhChallengeProps {
  data: RishabhChallengeData;
  onDismiss: () => void;
  /** Auto-dismiss time (defaults to 0 = manual only) */
  autoDismissMs?: number;
}

/* ─── Expression Styles ─────────────────────────────────────────── */

const EXPRESSION_META: Record<string, {
  emoji: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  emojiBg: string;
  titleColor: string;
}> = {
  smug: {
    emoji: '😏',
    bgGradient: 'from-amber-600/15 to-yellow-600/10',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-400',
    emojiBg: 'bg-amber-500/10',
    titleColor: 'text-amber-300',
  },
  doubtful: {
    emoji: '🤨',
    bgGradient: 'from-orange-600/15 to-red-600/10',
    borderColor: 'border-orange-500/30',
    accentColor: 'text-orange-400',
    emojiBg: 'bg-orange-500/10',
    titleColor: 'text-orange-300',
  },
  impressed: {
    emoji: '😲',
    bgGradient: 'from-blue-600/15 to-purple-600/10',
    borderColor: 'border-blue-500/30',
    accentColor: 'text-blue-400',
    emojiBg: 'bg-blue-500/10',
    titleColor: 'text-blue-300',
  },
  shocked: {
    emoji: '😱',
    bgGradient: 'from-purple-600/15 to-pink-600/10',
    borderColor: 'border-purple-500/30',
    accentColor: 'text-purple-400',
    emojiBg: 'bg-purple-500/10',
    titleColor: 'text-purple-300',
  },
  happy: {
    emoji: '😊',
    bgGradient: 'from-green-600/15 to-emerald-600/10',
    borderColor: 'border-green-500/30',
    accentColor: 'text-green-400',
    emojiBg: 'bg-green-500/10',
    titleColor: 'text-green-300',
  },
  reluctant: {
    emoji: '😤',
    bgGradient: 'from-red-600/15 to-rose-600/10',
    borderColor: 'border-red-500/30',
    accentColor: 'text-red-400',
    emojiBg: 'bg-red-500/10',
    titleColor: 'text-red-300',
  },
};

/* ─── Rishabh Avatar ────────────────────────────────────────────── */

function RishabhAvatar({ expression, size = 'md' }: { expression: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = size === 'sm' ? 'w-12 h-12 text-xl' : size === 'lg' ? 'w-20 h-20 text-4xl' : 'w-16 h-16 text-3xl';
  const meta = EXPRESSION_META[expression] || EXPRESSION_META.smug;

  return (
    <div
      className={`
        ${sizeClasses} rounded-2xl flex items-center justify-center
        ${meta.emojiBg} border ${meta.borderColor}
        shadow-lg shrink-0 relative
      `}
    >
      {/* Expression emoji */}
      <span className="drop-shadow-lg filter brightness-110">
        {meta.emoji}
      </span>
      {/* Name label */}
      {size !== 'sm' && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className={`text-[8px] font-bold uppercase tracking-wider ${meta.accentColor} bg-slate-900/90 px-2 py-0.5 rounded-full border ${meta.borderColor}`}>
            Rishabh
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Type Badge ────────────────────────────────────────────────── */

const TYPE_BADGES: Record<string, { label: string; color: string; Icon: any }> = {
  doubt: { label: '🤨 Doubt', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', Icon: X },
  challenge: { label: '⚡ Challenge', color: 'bg-red-500/10 text-red-400 border-red-500/20', Icon: Zap },
  congratulate: { label: '🎉 Well Done', color: 'bg-green-500/10 text-green-400 border-green-500/20', Icon: Award },
  transformation: { label: '✨ Changed Mind', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', Icon: TrendingUp },
};

/* ─── Main Component ───────────────────────────────────────────── */

export default function RishabhChallenge({ data, onDismiss, autoDismissMs = 0 }: RishabhChallengeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const meta = EXPRESSION_META[data.expression] || EXPRESSION_META.smug;
  const badge = TYPE_BADGES[data.type] || TYPE_BADGES.doubt;

  // Entrance animation delay
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  const handleAccept = useCallback(() => {
    data.mission?.onAccept();
    handleDismiss();
  }, [data.mission, handleDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={data.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          {/* Rishabh character card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={showAnimation ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className={`
              relative max-w-sm w-full bg-slate-900/95 backdrop-blur-xl
              border-2 ${meta.borderColor} rounded-2xl shadow-2xl overflow-hidden
            `}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${meta.bgGradient} opacity-60`} />

            {/* Orange glow top-right */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl ${meta.emojiBg}`} />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-10 text-slate-500 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg p-1.5 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Type badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            {/* Content */}
            <div className="relative p-6 pt-12 text-center space-y-4">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={showAnimation ? { scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 150, damping: 14, delay: 0.15 }}
                className="flex justify-center"
              >
                <RishabhAvatar expression={data.expression} size="lg" />
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={showAnimation ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.25 }}
                className={`text-lg font-bold font-display ${meta.titleColor}`}
              >
                {data.title}
              </motion.h3>

              {/* Context (what the student achieved) */}
              {data.context && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={showAnimation ? { opacity: 1 } : {}}
                  transition={{ delay: 0.35 }}
                  className="px-4 py-2 bg-slate-950/60 border border-slate-700/40 rounded-xl"
                >
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {data.context}
                  </p>
                </motion.div>
              )}

              {/* Challenge text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={showAnimation ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
              >
                {/* Speaker label */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-slate-700/50 max-w-12" />
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${meta.accentColor}`}>
                    Rishabh Says
                  </span>
                  <div className="h-px flex-1 bg-slate-700/50 max-w-12" />
                </div>

                {/* Speech bubble */}
                <div className={`
                  relative bg-slate-800/60 border ${meta.borderColor}
                  rounded-2xl px-5 py-4
                `}>
                  {/* Bubble tail */}
                  <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800/60 border-t border-l ${meta.borderColor} transform rotate-45`} />

                  <p className="text-sm text-slate-200 leading-relaxed italic">
                    "{data.challenge}"
                  </p>
                </div>
              </motion.div>

              {/* Mission (challenge to accept) */}
              {data.mission && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={showAnimation ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Flame className="h-4 w-4 text-game-hot" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-game-hot">
                      Challenge Available
                    </span>
                  </div>

                  <div className="px-4 py-3 bg-slate-950/60 border border-slate-700/40 rounded-xl">
                    <p className="text-xs font-bold text-white mb-1">{data.mission.label}</p>
                    <p className="text-[10px] text-slate-400">{data.mission.description}</p>
                  </div>

                  <button
                    onClick={handleAccept}
                    className="w-full bg-gradient-to-r from-game-hot to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 rounded-xl border border-game-hot/30 transition-all shadow-lg hover:shadow-game-hot/30 flex items-center justify-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Accept Challenge!
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* Dismiss only (no mission) */}
              {!data.mission && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={showAnimation ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 }}
                  onClick={handleDismiss}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
                >
                  {data.type === 'congratulate' || data.type === 'transformation'
                    ? 'Continue →'
                    : 'Dismiss'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
