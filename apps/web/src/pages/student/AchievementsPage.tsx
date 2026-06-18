import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { Award, Star, Lock, Rocket, Search } from 'lucide-react';

/* ─── Category icon helper ────────────────────── */
function CategoryIcon({ category, unlocked }: { category?: string; unlocked: boolean }) {
  const className = `h-5 w-5 ${unlocked ? 'text-white' : 'text-slate-600'}`;
  switch (category) {
    case 'detective': return <Search className={className} />;
    case 'simulator': return <Rocket className={className} />;
    default: return <Award className={className} />;
  }
}

/* ─── Category shape helper ────────────────────── */
function BadgeShape({ rarity, children }: { rarity: string; children: React.ReactNode }) {
  const isLegendary = rarity === 'LEGENDARY';
  const shapeClass = isLegendary ? 'badge-star' : rarity === 'EPIC' ? 'badge-diamond' : 'badge-shield';
  return (
    <div className={`${shapeClass} w-12 h-12 flex items-center justify-center`}>
      {children}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────── */
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
        // Use fallback data
        setAchievements([
          { id: '1', name: 'First Steps', description: 'Complete your first level', rarity: 'COMMON', xpBonus: 50, unlocked: true, earnedAt: new Date().toISOString(), badgeColor: '#94A3B8', category: 'general' },
          { id: '2', name: 'Clue Hunter', description: 'Find 10 clues in Detective mode', rarity: 'RARE', xpBonus: 150, unlocked: true, earnedAt: new Date().toISOString(), badgeColor: '#3B82F6', category: 'detective' },
          { id: '3', name: 'Master Negotiator', description: 'Close a deal with 90%+ profit margin', rarity: 'EPIC', xpBonus: 300, unlocked: false, earnedAt: null, badgeColor: '#A855F7', category: 'simulator' },
          { id: '4', name: 'Startup Titan', description: 'Build a company worth ₹1,00,000+', rarity: 'LEGENDARY', xpBonus: 500, unlocked: false, earnedAt: null, badgeColor: '#FFD700', category: 'simulator' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-game-orange/20 to-game-orange/10 border border-game-orange/20 flex items-center justify-center">
            <Star className="h-6 w-6 text-game-orange animate-spin" />
          </div>
          <p className="text-sm font-game-body text-slate-500">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="game-card-accent p-6 rounded-xl">
        <h1 className="text-2xl font-game-round font-bold text-white">My Achievements 🏆</h1>
        <p className="text-sm font-game-body text-game-text-muted mt-1">
          Unlock badges as you complete levels, increase revenue, and grow your company.
        </p>
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievements.map((ach, idx) => {
          const unlocked = ach.unlocked;
          const isLegendary = ach.rarity === 'LEGENDARY';

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
              className={`relative rounded-xl p-5 border transition-all duration-300 overflow-hidden
                ${unlocked
                  ? isLegendary
                    ? 'border-amber-400/30 shadow-[0_0_24px_rgba(255,215,0,0.1)]'
                    : 'game-card-purple'
                  : 'border-slate-700/30 opacity-70 hover:opacity-90'
                }`}
              style={{
                background: unlocked
                  ? `linear-gradient(135deg, ${ach.badgeColor}08 0%, transparent 100%)`
                  : 'rgba(15, 23, 42, 0.4)',
              }}
            >
              {/* Holographic overlay for legendary unlocked */}
              {unlocked && isLegendary && (
                <div className="absolute inset-0 rounded-xl holographic opacity-20 pointer-events-none" />
              )}

              {/* Lock overlay */}
              {!unlocked && (
                <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-game-deep/40 backdrop-blur-[1px] z-10">
                  <Lock className="h-6 w-6 text-slate-600" />
                </div>
              )}

              <div className="flex items-start justify-between gap-3 relative">
                {/* Badge with shape */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center
                    ${unlocked
                      ? isLegendary
                        ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/30'
                        : 'bg-slate-800/60 border border-slate-700/40'
                      : 'bg-slate-900/60 border border-slate-800/40'
                    }`}
                  style={unlocked ? { filter: 'none' } : { filter: 'grayscale(100%)' }}
                >
                  <BadgeShape rarity={ach.rarity}>
                    <CategoryIcon category={ach.category} unlocked={unlocked} />
                  </BadgeShape>
                </div>

                {/* Rarity tag */}
                <span
                  className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0
                    ${ach.rarity === 'LEGENDARY'
                      ? 'text-amber-400 border border-amber-400/30 bg-amber-500/10'
                      : ach.rarity === 'EPIC'
                      ? 'text-purple-400 border border-purple-400/30 bg-purple-500/10'
                      : ach.rarity === 'RARE'
                      ? 'text-blue-400 border border-blue-400/30 bg-blue-500/10'
                      : 'text-slate-500 border border-slate-700/30 bg-slate-800/30'
                    }`}
                >
                  {ach.rarity}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 relative">
                <h4 className={`font-game-round font-bold text-sm tracking-tight ${unlocked ? 'text-white' : 'text-slate-600'}`}>
                  {ach.name}
                </h4>
                <p className={`text-xs font-game-body leading-relaxed ${unlocked ? 'text-game-text-muted' : 'text-slate-600'}`}>
                  {ach.description}
                </p>
              </div>

              {/* Bottom bar */}
              <div className="mt-5 pt-3 border-t border-slate-700/20 flex items-center justify-between relative">
                <span className={`text-xs font-game-score font-bold ${unlocked ? 'text-game-yellow' : 'text-slate-600'}`}>
                  +{ach.xpBonus} XP
                </span>
                <span className={`text-[9px] font-game-body font-medium ${unlocked ? 'text-slate-500' : 'text-slate-600'}`}>
                  {unlocked
                    ? `Earned ${new Date(ach.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                    : 'Locked'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {achievements.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-game-body text-slate-500">No achievements yet — keep playing!</p>
        </div>
      )}
    </div>
  );
}
