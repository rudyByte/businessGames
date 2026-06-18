import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Trophy, Zap, X, Star, TrendingUp } from 'lucide-react';
import api from '../../lib/api';

interface WeeklyChallengeData {
  studentId: string;
  rivalStudentId: string;
  weekStart: string;
  studentWeekXP: number;
  rivalWeekXP: number;
  status: 'active' | 'won' | 'lost';
}

interface RivalWeeklyChallengeProps {
  rivalName: string;
  onClose?: () => void;
  compact?: boolean;
}

export default function RivalWeeklyChallenge({ rivalName, onClose, compact = false }: RivalWeeklyChallengeProps) {
  const [challenge, setChallenge] = useState<WeeklyChallengeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const res = await api.get('/rival/weekly-challenge');
        if (res.data.data?.challenge) {
          setChallenge(res.data.data.challenge);
        }
      } catch (err) {
        console.error('Failed to fetch weekly challenge:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenge();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse p-3 rounded-xl bg-slate-900/50 border border-slate-800/30">
        <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
      </div>
    );
  }

  if (!challenge) {
    if (compact) return null;
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/30 text-center">
        <p className="text-xs text-slate-500">No weekly challenge yet. Start playing to get assigned a rival!</p>
      </div>
    );
  }

  const totalXP = challenge.studentWeekXP + challenge.rivalWeekXP || 1;
  const studentPercent = (challenge.studentWeekXP / totalXP) * 100;
  const isWinning = challenge.studentWeekXP >= challenge.rivalWeekXP;
  const daysUntilMonday = (() => {
    const now = new Date();
    const day = now.getDay();
    const daysToMonday = day === 0 ? 1 : 8 - day;
    return daysToMonday;
  })();

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-game-dark/60 border border-slate-700/30">
        <Sword className={`h-4 w-4 ${isWinning ? 'text-game-success' : 'text-game-danger'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Weekly Rival</span>
            <span className="text-[10px] font-mono font-bold text-game-yellow">+{challenge.studentWeekXP} XP</span>
          </div>
          <div className="mt-1 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${studentPercent}%` }}
              className={`h-full rounded-full ${isWinning ? 'bg-game-success' : 'bg-game-danger'}`}
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-600 mt-0.5">
            <span>You: {challenge.studentWeekXP}</span>
            <span>{rivalName}: {challenge.rivalWeekXP}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-700/50 p-4 relative overflow-hidden"
    >
      {/* Close button */}
      {onClose && (
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-600 hover:text-slate-400 transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isWinning ? 'bg-game-success/10 text-game-success' : 'bg-game-danger/10 text-game-danger'
        }`}>
          <Sword className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Beat {rivalName.split(' ')[0]}! 💪</h3>
          <p className="text-[10px] text-slate-500">Earn more XP this week for 500 BONUS XP!</p>
        </div>
        <div className="ml-auto">
          <div className="px-2 py-1 bg-game-yellow/10 border border-game-yellow/20 rounded-lg text-center">
            <span className="text-[10px] text-game-yellow font-bold">500 XP</span>
          </div>
        </div>
      </div>

      {/* XP Battle Bar */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-[10px]">
          <span className="font-bold" style={{ color: isWinning ? '#06D6A0' : '#EF476F' }}>
            You: {challenge.studentWeekXP} XP
          </span>
          <span className="font-bold text-slate-500">
            {rivalName.split(' ')[0]}: {challenge.rivalWeekXP} XP
          </span>
        </div>
        <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${studentPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isWinning
                ? 'bg-gradient-to-r from-game-success to-game-teal'
                : 'bg-gradient-to-r from-game-danger to-game-orange'
            }`}
          />
          {/* Divider at 50% */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-slate-700/50" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{isWinning ? `Ahead by ${challenge.studentWeekXP - challenge.rivalWeekXP} XP` : `Behind by ${challenge.rivalWeekXP - challenge.studentWeekXP} XP`}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          <span>{daysUntilMonday}d left</span>
        </div>
      </div>

      {/* Status badge */}
      <div className={`text-center py-2 rounded-lg text-xs font-bold ${
        isWinning
          ? 'bg-game-success/10 text-game-success border border-game-success/20'
          : 'bg-game-danger/10 text-game-danger border border-game-danger/20'
      }`}>
        {isWinning ? '🏆 You\'re winning! Keep it up!' : `⚡ ${rivalName.split(' ')[0]} is ahead! Catch up!`}
      </div>
    </motion.div>
  );
}
