import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Trophy, Medal, Crown, Star, ArrowUp, ArrowDown } from 'lucide-react';

/* ─── Types ──────────────────────────────────── */
interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  prevRank?: number;   // for animated rank change detection
}

/* ─── Sample Data ────────────────────────────── */
const CLASSROOM: LeaderboardEntry[] = [
  { rank: 1, name: 'Aryan Goel', level: 3, xp: 1200, prevRank: 2 },
  { rank: 2, name: 'Priya Patel', level: 3, xp: 1050, prevRank: 1 },
  { rank: 3, name: 'Rahul Sen', level: 2, xp: 900, prevRank: 3 },
  { rank: 4, name: 'Sneha Rao', level: 2, xp: 720, prevRank: 5 },
  { rank: 5, name: 'Amit Shah', level: 1, xp: 480, prevRank: 4 },
  { rank: 6, name: 'Neha Kapoor', level: 1, xp: 350, prevRank: 6 },
  { rank: 7, name: 'Vikram Joshi', level: 1, xp: 220, prevRank: 7 },
  { rank: 8, name: 'Divya Mehta', level: 1, xp: 150, prevRank: 8 },
];

const SCHOOL: LeaderboardEntry[] = [
  { rank: 1, name: 'Kabir Verma', level: 5, xp: 2500 },
  { rank: 2, name: 'Aryan Goel', level: 3, xp: 1200 },
  { rank: 3, name: 'Priya Patel', level: 3, xp: 1050 },
  { rank: 4, name: 'Ananya Roy', level: 2, xp: 980 },
  { rank: 5, name: 'Rahul Sen', level: 2, xp: 900 },
  { rank: 6, name: 'Sneha Rao', level: 2, xp: 720 },
  { rank: 7, name: 'Amit Shah', level: 1, xp: 480 },
  { rank: 8, name: 'Neha Kapoor', level: 1, xp: 350 },
];

const GLOBAL: LeaderboardEntry[] = [
  { rank: 1, name: 'Aditya Sen', level: 8, xp: 5400 },
  { rank: 2, name: 'Kabir Verma', level: 5, xp: 2500 },
  { rank: 3, name: 'Diya Shah', level: 4, xp: 1800 },
  { rank: 4, name: 'Aryan Goel', level: 3, xp: 1200 },
  { rank: 5, name: 'Priya Patel', level: 3, xp: 1050 },
  { rank: 6, name: 'Rahul Sen', level: 2, xp: 900 },
  { rank: 7, name: 'Sneha Rao', level: 2, xp: 720 },
  { rank: 8, name: 'Amit Shah', level: 1, xp: 480 },
];

/* ─── Medal Icon Helper ────────────────────────── */
function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-300" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="font-game-score font-bold text-sm text-slate-500">{rank}</span>;
}

/* ─── Podium Component ────────────────────────── */
function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length < 3) return null;
  const [first, second, third] = [entries[0], entries[1], entries[2]];

  return (
    <div className="podium flex items-end justify-center gap-4 h-64 mb-8">
      {/* 2nd Place */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="flex flex-col items-center gap-2 podium-2nd"
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-game-dark/80 border-2 border-slate-400/30 flex items-center justify-center mb-1">
            <span className="font-game-round font-bold text-lg text-slate-300">{second.name.charAt(0)}</span>
          </div>
          <span className="font-game-body font-bold text-xs text-slate-300">{second.name}</span>
          <span className="font-game-score text-[10px] text-slate-500">{second.xp} XP</span>
        </div>
        <div
          className="w-24 h-20 rounded-t-xl flex flex-col items-center justify-start pt-3"
          style={{
            background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
            border: '1px solid rgba(148,163,184,0.2)',
          }}
        >
          <Medal className="h-5 w-5 text-slate-300" />
          <span className="font-game-score text-lg font-bold text-slate-300">2</span>
        </div>
      </motion.div>

      {/* 1st Place */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 200 }}
        className="flex flex-col items-center gap-2 podium-1st"
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-full blur-sm"
              style={{ backgroundColor: 'rgba(255,215,0,0.3)' }}
            />
            <div className="w-14 h-14 rounded-full bg-game-dark/80 border-2 border-yellow-400/50 flex items-center justify-center relative">
              <span className="font-game-round font-bold text-xl text-yellow-400">{first.name.charAt(0)}</span>
            </div>
          </div>
          <Crown className="h-5 w-5 text-yellow-400 -mb-1 drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]" />
          <span className="font-game-body font-bold text-sm text-white">{first.name}</span>
          <span className="font-game-score text-xs text-game-yellow">{first.xp} XP</span>
        </div>
        <div
          className="w-28 h-28 rounded-t-xl flex flex-col items-center justify-start pt-4"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            boxShadow: '0 -8px 24px rgba(255,215,0,0.3)',
          }}
        >
          <Crown className="h-6 w-6 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
          <span className="font-game-score text-2xl font-black text-white">1</span>
        </div>
      </motion.div>

      {/* 3rd Place */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex flex-col items-center gap-2 podium-3rd"
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-game-dark/80 border-2 border-amber-600/30 flex items-center justify-center mb-1">
            <span className="font-game-round font-bold text-lg text-amber-600">{third.name.charAt(0)}</span>
          </div>
          <span className="font-game-body font-bold text-xs text-slate-300">{third.name}</span>
          <span className="font-game-score text-[10px] text-slate-500">{third.xp} XP</span>
        </div>
        <div
          className="w-20 h-16 rounded-t-xl flex flex-col items-center justify-start pt-2"
          style={{
            background: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
            border: '1px solid rgba(180,83,9,0.3)',
          }}
        >
          <Medal className="h-4 w-4 text-amber-600" />
          <span className="font-game-score text-lg font-bold text-amber-500">3</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Rank Change Indicator ────────────────────── */
function RankChange({ entry }: { entry: LeaderboardEntry }) {
  if (!entry.prevRank) return null;
  if (entry.prevRank > entry.rank) {
    return <ArrowUp className="h-3 w-3 text-game-success" />;
  }
  if (entry.prevRank < entry.rank) {
    return <ArrowDown className="h-3 w-3 text-game-danger" />;
  }
  return null;
}

/* ─── Leaderboard Card ────────────────────────── */
function LeaderboardCard({ entry, index, isCurrentUser }: {
  entry: LeaderboardEntry;
  index: number;
  isCurrentUser: boolean;
}) {
  const rankUp = entry.prevRank && entry.prevRank > entry.rank;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all
        ${isCurrentUser
          ? 'bg-gradient-to-r from-game-orange/10 to-game-teal/5 border-game-orange/30 shadow-[0_0_16px_rgba(255,107,53,0.1)]'
          : 'bg-game-dark/50 border-slate-700/30 hover:border-slate-600/50'
        } ${rankUp ? 'animate-rank-up' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-8 flex items-center justify-center">
          <RankMedal rank={entry.rank} />
        </div>

        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-game-score font-bold text-sm
              ${isCurrentUser
                ? 'bg-gradient-to-br from-game-orange/30 to-game-orange/10 border border-game-orange/40 text-game-orange'
                : 'bg-game-dark/80 border border-slate-700/50 text-slate-400'}`}
          >
            {entry.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-game-body font-bold text-sm ${isCurrentUser ? 'text-white' : 'text-slate-200'}`}>
                {entry.name}
              </span>
              <RankChange entry={entry} />
              {isCurrentUser && (
                <span className="text-[8px] font-bold uppercase tracking-wider text-game-orange bg-game-orange/10 px-1.5 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            <span className="font-game-body text-[10px] text-slate-500">Level {entry.level}</span>
          </div>
        </div>
      </div>

      {/* XP Score */}
      <div className="flex items-center gap-2">
        <Star className="h-3.5 w-3.5 text-game-yellow" />
        <span className="font-game-score font-bold text-sm text-game-yellow">{entry.xp}</span>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ───────────────────────────────── */
export default function LeaderboardPage() {
  const [tab, setTab] = useState<'class' | 'school' | 'global'>('class');

  const entriesMap = { class: CLASSROOM, school: SCHOOL, global: GLOBAL };
  const entries = entriesMap[tab];
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="game-card-accent p-5 rounded-xl">
        <h1 className="text-2xl font-game-round font-bold text-white">Leaderboard 📊</h1>
        <p className="text-sm font-game-body text-game-text-muted mt-1">
          Compete with classmates, schoolmates, and students across India!
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-game-dark/60 p-1.5 rounded-xl border border-slate-700/30">
        {(['class', 'school', 'global'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`py-2.5 rounded-lg font-game-body font-bold text-xs transition-all tracking-wider uppercase ${
              tab === t
                ? 'bg-gradient-game text-white shadow-game-btn'
                : 'text-slate-500 hover:text-slate-300 btn-game-ghost'
            }`}
          >
            {t === 'class' ? '🏫 My Class' : t === 'school' ? '🏛️ My School' : '🇮🇳 All India'}
          </button>
        ))}
      </div>

      {/* Podium */}
      <Podium entries={topThree} />

      {/* Rest of leaderboard as cards */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {rest.map((entry, idx) => (
            <LeaderboardCard
              key={entry.name}
              entry={entry}
              index={idx}
              isCurrentUser={entry.name === 'Aryan Goel'}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 font-game-body">No rankings yet — start playing!</p>
        </div>
      )}
    </div>
  );
}
