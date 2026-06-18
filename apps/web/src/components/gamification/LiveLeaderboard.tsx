import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Medal, ArrowUp, ArrowDown, Bell, Trophy, Zap } from 'lucide-react';
import api from '../../lib/api';

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  studentId: string;
  prevRank?: number;
  isCurrentUser?: boolean;
}

interface RankChangeNotification {
  type: 'passed_you' | 'you_passed';
  name: string;
  rank: number;
}

interface LiveLeaderboardProps {
  classroomId?: string;
  currentStudentId?: string;
  currentStudentName?: string;
  compact?: boolean;
}

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Aryan Goel', level: 3, xp: 1200, studentId: 's1' },
  { rank: 2, name: 'Priya Patel', level: 3, xp: 1050, studentId: 's2', isCurrentUser: true },
  { rank: 3, name: 'Rahul Sen', level: 2, xp: 900, studentId: 's3' },
  { rank: 4, name: 'Sneha Rao', level: 2, xp: 720, studentId: 's4' },
  { rank: 5, name: 'Amit Shah', level: 1, xp: 480, studentId: 's5' },
];

export default function LiveLeaderboard({ classroomId, currentStudentId, currentStudentName, compact = false }: LiveLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(SAMPLE_LEADERBOARD);
  const [notification, setNotification] = useState<RankChangeNotification | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Listen for rank change events
  useEffect(() => {
    const handleRankChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === 'rival:passed_you') {
        setNotification({ type: 'passed_you', name: detail.name, rank: detail.rank });
        setTimeout(() => setNotification(null), 4000);
      } else if (detail.type === 'rival:you_passed') {
        setNotification({ type: 'you_passed', name: detail.name, rank: detail.rank });
        setTimeout(() => setNotification(null), 4000);
      }
    };

    window.addEventListener('leaderboard:change', handleRankChange);
    return () => window.removeEventListener('leaderboard:change', handleRankChange);
  }, []);

  const topThree = entries.slice(0, 3);
  const rest = compact ? [] : entries.slice(3, showAll ? entries.length : 7);

  return (
    <div className="space-y-3">
      {/* Rank Change Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 ${
              notification.type === 'you_passed'
                ? 'bg-purple-600/90 border-purple-400/30'
                : 'bg-red-600/90 border-red-400/30'
            }`}
          >
            <Bell className={`h-5 w-5 ${notification.type === 'you_passed' ? 'text-purple-200' : 'text-red-200'}`} />
            <div>
              <p className={`text-sm font-bold ${notification.type === 'you_passed' ? 'text-white' : 'text-white'}`}>
                {notification.type === 'you_passed'
                  ? `🎉 You just passed ${notification.name}! Now rank #${notification.rank}!`
                  : `⚡ ${notification.name} just passed you to rank #${notification.rank}!`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Podium */}
      <div className="flex items-end justify-center gap-2 h-28">
        {topThree.map((entry, idx) => {
          const heights = ['h-24', 'h-20', 'h-16'];
          const colors = [
            'bg-gradient-to-t from-yellow-500/30 to-yellow-500/10 border-yellow-500/30',
            'bg-gradient-to-t from-slate-400/30 to-slate-400/10 border-slate-400/30',
            'bg-gradient-to-t from-amber-700/30 to-amber-700/10 border-amber-700/30',
          ];
          const icons = [
            <Crown key={0} className="h-4 w-4 text-yellow-400" />,
            <Medal key={1} className="h-3.5 w-3.5 text-slate-300" />,
            <Medal key={2} className="h-3.5 w-3.5 text-amber-600" />,
          ];

          return (
            <motion.div
              key={entry.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
              className={`flex flex-col items-center gap-1 ${idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-0.5">
                  {icons[idx]}
                  <span className={`font-bold text-xs ${entry.isCurrentUser ? 'text-game-teal' : 'text-slate-300'}`}>
                    {entry.name.split(' ')[0]}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">{entry.xp} XP</span>
              </div>
              <div className={`w-16 ${heights[idx]} rounded-t-lg border ${colors[idx]} flex items-center justify-center`}>
                <span className="font-bold text-lg text-white">{entry.rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of leaderboard entries */}
      <div className="space-y-1">
        <AnimatePresence>
          {rest.map((entry, idx) => {
            const rankUp = entry.prevRank && entry.prevRank > entry.rank;
            return (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                  entry.isCurrentUser
                    ? 'bg-game-orange/10 border border-game-orange/20'
                    : 'hover:bg-slate-800/30'
                } ${rankUp ? 'animate-rank-up' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-xs text-slate-500">{entry.rank}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    entry.isCurrentUser
                      ? 'bg-game-orange/20 text-game-orange'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {entry.name.charAt(0)}
                  </div>
                  <span className={`text-xs font-bold ${entry.isCurrentUser ? 'text-white' : 'text-slate-300'}`}>
                    {entry.name}
                    {entry.isCurrentUser && <span className="text-[9px] text-game-orange ml-1">(You)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-game-yellow" />
                  <span className="text-xs font-mono text-game-yellow">{entry.xp}</span>
                  {rankUp && <ArrowUp className="h-3 w-3 text-game-success" />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show more toggle */}
      {!compact && entries.length > 7 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showAll ? 'Show less ▲' : `Show all ${entries.length} ▼`}
        </button>
      )}
    </div>
  );
}
