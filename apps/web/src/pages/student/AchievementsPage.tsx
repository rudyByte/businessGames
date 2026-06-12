import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Award, Star } from 'lucide-react';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await api.get('/students/me/achievements');
        setAchievements(res.data.data);
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 bg-purple-950/5">
        <h1 className="text-2xl font-bold font-display text-white">My Achievements 🏆</h1>
        <p className="text-slate-400 text-xs mt-1">
          Unlock badges as you complete levels, increase revenue, and grow your company.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`glass-panel p-6 rounded-2xl border transition-all ${
              ach.unlocked
                ? 'border-purple-500/20 bg-purple-950/5'
                : 'border-slate-800/60 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: `${ach.badgeColor}20`,
                  color: ach.badgeColor,
                  border: `1px solid ${ach.badgeColor}30`,
                  filter: ach.unlocked ? 'none' : 'grayscale(100%)',
                }}
              >
                <Award className="h-6 w-6" />
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  ach.rarity === 'LEGENDARY'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                    : ach.rarity === 'EPIC'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                    : ach.rarity === 'RARE'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {ach.rarity}
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <h4 className="font-bold text-sm text-white tracking-tight">{ach.name}</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">{ach.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-[10px]">
              <span className="text-purple-400 font-bold">+{ach.xpBonus} XP Bonus</span>
              <span className="text-slate-500 font-medium">
                {ach.unlocked ? `Earned: ${new Date(ach.earnedAt).toLocaleDateString()}` : 'Locked'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
