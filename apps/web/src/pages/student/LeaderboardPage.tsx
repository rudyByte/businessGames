import React, { useState } from 'react';
import { BarChart3, Star, Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'class' | 'school' | 'global'>('class');

  const classroomEntries = [
    { rank: 1, name: 'Aryan Goel', level: 3, xp: 1200 },
    { rank: 2, name: 'Priya Patel', level: 3, xp: 1050 },
    { rank: 3, name: 'Rahul Sen', level: 2, xp: 900 },
    { rank: 4, name: 'Sneha Rao', level: 2, xp: 720 },
    { rank: 5, name: 'Amit Shah', level: 1, xp: 480 },
  ];

  const schoolEntries = [
    { rank: 1, name: 'Kabir Verma', level: 5, xp: 2500 },
    { rank: 2, name: 'Aryan Goel', level: 3, xp: 1200 },
    { rank: 3, name: 'Priya Patel', level: 3, xp: 1050 },
    { rank: 4, name: 'Ananya Roy', level: 2, xp: 980 },
    { rank: 5, name: 'Rahul Sen', level: 2, xp: 900 },
  ];

  const globalEntries = [
    { rank: 1, name: 'Aditya Sen', level: 8, xp: 5400 },
    { rank: 2, name: 'Kabir Verma', level: 5, xp: 2500 },
    { rank: 3, name: 'Diya Shah', level: 4, xp: 1800 },
    { rank: 4, name: 'Aryan Goel', level: 3, xp: 1200 },
    { rank: 5, name: 'Priya Patel', level: 3, xp: 1050 },
  ];

  const activeEntries = tab === 'class' ? classroomEntries : tab === 'school' ? schoolEntries : globalEntries;

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 bg-purple-950/5">
        <h1 className="text-2xl font-bold font-display text-white">CampusEdge Rankings 📊</h1>
        <p className="text-slate-400 text-xs mt-1">
          Compete with your classmates, your schoolmates, and students all across India!
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 text-xs">
        {(['class', 'school', 'global'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`py-2.5 rounded-lg font-medium transition-colors uppercase tracking-wider ${
              tab === t
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'class' ? 'My Class' : t === 'school' ? 'My School' : 'All India'}
          </button>
        ))}
      </div>

      {/* List Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider px-4">
          <div className="flex gap-8">
            <span className="w-8">Rank</span>
            <span>Name</span>
          </div>
          <div className="flex gap-16">
            <span>Level</span>
            <span className="w-16 text-right">XP Score</span>
          </div>
        </div>

        <div className="space-y-3">
          {activeEntries.map((entry, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                entry.name.includes('Aryan')
                  ? 'bg-purple-950/15 border-purple-500/30 shadow-md'
                  : 'bg-slate-900/40 border-slate-850/60'
              }`}
            >
              <div className="flex items-center gap-8">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    entry.rank === 2 ? 'bg-slate-450/20 text-slate-350 border border-slate-450/30' :
                    entry.rank === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'text-slate-500'
                  }`}
                >
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                </span>
                <div>
                  <span className="text-sm font-semibold text-white block">{entry.name}</span>
                  {entry.name.includes('Aryan') && (
                    <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">You</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-16">
                <span className="text-xs text-slate-400 font-medium">Level {entry.level}</span>
                <span className="w-16 text-right text-purple-400 font-bold text-sm">{entry.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
