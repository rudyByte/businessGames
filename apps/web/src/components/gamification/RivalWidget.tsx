import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Flame, User, ChevronUp, Crown } from 'lucide-react';
import api from '../../lib/api';

interface RivalData {
  rivalStudentId: string;
  rivalName: string;
  rivalLevel: number;
  rivalXP: number;
  rivalAvatarUrl: string | null;
  xpGap: number;
  assignedAt: string;
}

interface RivalWidgetProps {
  studentId?: string;
  className?: string;
}

export default function RivalWidget({ studentId, className = '' }: RivalWidgetProps) {
  const [rival, setRival] = useState<RivalData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRival = useCallback(async () => {
    try {
      const res = await api.get('/rival');
      if (res.data.data?.rival) {
        setRival(res.data.data.rival);
        setError(false);
      }
    } catch (err) {
      console.error('Failed to fetch rival:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkOvertake = useCallback(async () => {
    try {
      const res = await api.post('/rival/refresh');
      const data = res.data.data;

      if (data.overtaken) {
        setCelebrationMessage(`🔥 YOU JUST OVERTOOK YOUR RIVAL!`);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);

        if (data.newRival) {
          setRival(data.newRival);
        }
      }

      // Update XP gap
      if (data.xpDiff !== undefined && rival) {
        setRival(prev => prev ? { ...prev, xpGap: data.xpDiff } : prev);
      }
    } catch (err) {
      console.error('Failed to refresh rival:', err);
    }
  }, [rival]);

  // Initial fetch
  useEffect(() => {
    fetchRival();
  }, [fetchRival]);

  // Refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(checkOvertake, 120000);
    return () => clearInterval(interval);
  }, [checkOvertake]);

  // Listen for socket events
  useEffect(() => {
    const handleRivalPassed = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCelebrationMessage(detail.message);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
      // Refresh rival data
      fetchRival();
    };

    const handleYouPassed = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCelebrationMessage(detail.message);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
      // Update rival data
      if (detail.newRival) {
        setRival(detail.newRival);
      } else {
        fetchRival();
      }
    };

    window.addEventListener('rival:passed_you', handleRivalPassed);
    window.addEventListener('rival:you_passed', handleYouPassed);

    return () => {
      window.removeEventListener('rival:passed_you', handleRivalPassed);
      window.removeEventListener('rival:you_passed', handleYouPassed);
    };
  }, [fetchRival]);

  if (loading) return null;
  if (error || !rival) return null;

  const isAhead = rival.xpGap <= 0;
  const xpDiff = Math.abs(rival.xpGap);
  const initials = rival.rivalName.split(' ').map(w => w.charAt(0)).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {/* Rival Indicator (bottom-left corner) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`fixed bottom-4 left-4 z-50 ${className}`}
      >
        <div className="flex items-center gap-2.5 bg-game-dark/90 backdrop-blur-xl border border-slate-700/40 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/30">
          {/* Rival avatar */}
          <div className="relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isAhead ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}>
              {initials}
            </div>
            {/* Status dot */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-game-dark ${
                isAhead ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>

          {/* Rival info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-300">{rival.rivalName}</span>
              {!isAhead && (
                <ChevronUp className="h-3 w-3 text-red-400" />
              )}
              {isAhead && (
                <Crown className="h-3 w-3 text-game-yellow" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>Lv.{rival.rivalLevel}</span>
              <span>·</span>
              <span className="font-mono">{rival.rivalXP.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-2.5 w-2.5 text-slate-600" />
              <span className={`text-[9px] font-bold ${
                isAhead ? 'text-game-success' : 'text-game-danger'
              }`}>
                {isAhead ? `${xpDiff} XP ahead! 🏆` : `${xpDiff} XP behind`}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overtake / Passed Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-7xl mb-4"
              >
                {celebrationMessage.includes('OVERTOOK') ? '🏆' : '⚡'}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-2xl font-bold text-white font-game-round"
              >
                {celebrationMessage}
              </motion.h2>
              {rival && celebrationMessage.includes('OVERTOOK') && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-sm text-game-teal mt-2"
                >
                  New rival: {rival.rivalName} (Lv.{rival.rivalLevel})
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
