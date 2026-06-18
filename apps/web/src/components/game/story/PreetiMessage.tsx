import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, ChevronRight } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */

export interface PreetiMessageData {
  id: string;
  /** The message text (supports emojis and Hinglish) */
  message: string;
  /** Preeti's mood/expression */
  mood?: 'excited' | 'happy' | 'proud' | 'dramatic' | 'funny' | 'warm' | 'serious';
  /** Optional XP reward for reading */
  xpReward?: number;
  /** Optional action label */
  actionLabel?: string;
  /** Optional action callback */
  onAction?: () => void;
}

interface PreetiMessageProps {
  message: PreetiMessageData;
  onDismiss: () => void;
  /** Auto-dismiss time in ms (default: 0 = manual dismiss only) */
  autoDismissMs?: number;
}

/* ─── Mood-based styles ─────────────────────────────────────────── */

const MOOD_STYLES: Record<string, {
  gradient: string;
  border: string;
  emoji: string;
  accentColor: string;
  bgGlow: string;
}> = {
  excited: {
    gradient: 'from-purple-600/20 to-pink-600/10',
    border: 'border-purple-500/30',
    emoji: '🤩',
    accentColor: 'text-purple-400',
    bgGlow: 'bg-purple-500/10',
  },
  happy: {
    gradient: 'from-green-600/20 to-emerald-600/10',
    border: 'border-green-500/30',
    emoji: '😊',
    accentColor: 'text-green-400',
    bgGlow: 'bg-green-500/10',
  },
  proud: {
    gradient: 'from-amber-600/20 to-yellow-600/10',
    border: 'border-amber-500/30',
    emoji: '🥹',
    accentColor: 'text-amber-400',
    bgGlow: 'bg-amber-500/10',
  },
  dramatic: {
    gradient: 'from-red-600/20 to-rose-600/10',
    border: 'border-red-500/30',
    emoji: '😱',
    accentColor: 'text-red-400',
    bgGlow: 'bg-red-500/10',
  },
  funny: {
    gradient: 'from-blue-600/20 to-cyan-600/10',
    border: 'border-blue-500/30',
    emoji: '😅',
    accentColor: 'text-blue-400',
    bgGlow: 'bg-blue-500/10',
  },
  warm: {
    gradient: 'from-teal-600/20 to-emerald-600/10',
    border: 'border-teal-500/30',
    emoji: '💛',
    accentColor: 'text-teal-400',
    bgGlow: 'bg-teal-500/10',
  },
  serious: {
    gradient: 'from-slate-600/20 to-slate-700/10',
    border: 'border-slate-500/30',
    emoji: '🤔',
    accentColor: 'text-slate-400',
    bgGlow: 'bg-slate-500/10',
  },
};

const DEFAULT_MOOD = 'warm';

/* ─── Preeti Avatar SVG ─────────────────────────────────────────── */

function PreetiAvatar({ mood, size = 'md' }: { mood: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = size === 'sm' ? 'w-10 h-10 text-lg' : size === 'lg' ? 'w-16 h-16 text-3xl' : 'w-14 h-14 text-2xl';
  const moodStyle = MOOD_STYLES[mood] || MOOD_STYLES[DEFAULT_MOOD];

  return (
    <div
      className={`
        ${sizeClasses} rounded-2xl flex items-center justify-center
        ${moodStyle.bgGlow} border ${moodStyle.border}
        shadow-lg shrink-0
      `}
    >
      {/* Character emoji with mood expression */}
      <span className="drop-shadow-lg filter brightness-110">
        {MOOD_STYLES[mood]?.emoji || '😊'}
      </span>
      {/* Name label below avatar */}
      {size !== 'sm' && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[8px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
            Preeti Didi
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */

export default function PreetiMessage({ message, onDismiss, autoDismissMs = 0 }: PreetiMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const mood = message.mood || DEFAULT_MOOD;
  const moodStyle = MOOD_STYLES[mood] || MOOD_STYLES[DEFAULT_MOOD];

  // Auto-dismiss timer
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

  const handleAction = useCallback(() => {
    message.onAction?.();
    handleDismiss();
  }, [message, handleDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="fixed bottom-24 right-4 z-50 max-w-sm w-full"
        >
          {/* Card */}
          <div
            className={`
              relative bg-slate-900/90 backdrop-blur-xl border ${moodStyle.border}
              rounded-2xl shadow-2xl overflow-hidden
            `}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${moodStyle.gradient} opacity-60`} />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-10 text-slate-500 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg p-1.5 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Content */}
            <div className="relative p-4 flex gap-4">
              {/* Avatar section */}
              <div className="relative flex flex-col items-center pt-1">
                <PreetiAvatar mood={mood} size="md" />
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                {/* Name header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-sm text-white">Preeti Didi</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                    Mentor
                  </span>
                </div>

                {/* Message text */}
                <p className="text-sm text-slate-200 leading-relaxed mb-3">
                  {message.message}
                </p>

                {/* XP tag */}
                {message.xpReward && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-[10px] font-bold text-yellow-400">
                      +{message.xpReward} XP
                    </span>
                  </div>
                )}

                {/* Action button */}
                {message.actionLabel && message.onAction && (
                  <button
                    onClick={handleAction}
                    className={`
                      inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                      font-bold text-xs transition-all
                      bg-gradient-to-r ${moodStyle.gradient}
                      border ${moodStyle.border} text-white
                      hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                    `}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {message.actionLabel}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}

                {/* Dismiss hint */}
                {!message.actionLabel && (
                  <button
                    onClick={handleDismiss}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors font-medium"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
