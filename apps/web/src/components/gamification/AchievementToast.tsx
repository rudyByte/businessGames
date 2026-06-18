import React, { useEffect } from 'react';
import { X, Rocket, Star, Search } from 'lucide-react';

interface AchievementToastProps {
  name: string;
  description: string;
  rarity: string;
  xpBonus: number;
  category?: 'detective' | 'simulator' | 'general';
  onClose: () => void;
}

/* ─── Rarity config ────────────────────────────── */
const RARITY_STYLES: Record<string, { border: string; glow: string; bg: string; text: string; label: string }> = {
  LEGENDARY: {
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_24px_rgba(255,215,0,0.3)]',
    bg: 'from-amber-900/20 via-yellow-900/10 to-amber-900/20',
    text: 'text-amber-400',
    label: '🌟 LEGENDARY',
  },
  EPIC: {
    border: 'border-purple-500/30',
    glow: 'shadow-[0_0_20px_rgba(147,51,234,0.25)]',
    bg: 'from-purple-900/20 via-purple-800/10 to-purple-900/20',
    text: 'text-purple-400',
    label: '💜 EPIC',
  },
  RARE: {
    border: 'border-blue-400/30',
    glow: 'shadow-[0_0_16px_rgba(59,130,246,0.2)]',
    bg: 'from-blue-900/15 via-blue-800/8 to-blue-900/15',
    text: 'text-blue-400',
    label: '🔵 RARE',
  },
  COMMON: {
    border: 'border-slate-600/30',
    glow: '',
    bg: 'from-slate-800/15 to-slate-800/8',
    text: 'text-slate-400',
    label: '⚪ COMMON',
  },
};

/* ─── Category badge icons ────────────────────── */
function CategoryBadge({ category, rarity }: { category: string; rarity: string }) {
  const isLegendary = rarity === 'LEGENDARY';
  const iconClass = `h-5 w-5 ${isLegendary ? 'text-amber-400' : 'text-slate-300'}`;

  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        ${isLegendary ? 'badge-star bg-gradient-to-br from-amber-500/20 to-yellow-500/20' : 'badge-hexagon bg-slate-800/60'}
        ${isLegendary ? 'border border-amber-400/30' : 'border border-slate-700/30'}`}
    >
      {category === 'detective' ? (
        <Search className={iconClass} />
      ) : category === 'simulator' ? (
        <Rocket className={iconClass} />
      ) : (
        <Star className={iconClass} />
      )}
    </div>
  );
}

/* ─── Component ──────────────────────────────── */
export default function AchievementToast({
  name, description, rarity, xpBonus, category = 'general', onClose,
}: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const style = RARITY_STYLES[rarity] || RARITY_STYLES.COMMON;
  const isLegendary = rarity === 'LEGENDARY';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full rounded-xl p-4 shadow-2xl
        flex items-start gap-3 animate-slide-up border ${style.border} ${style.glow}
        bg-gradient-to-br ${style.bg} backdrop-blur-xl`}
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
      }}
    >
      {/* Holographic overlay for legendary */}
      {isLegendary && (
        <div className="absolute inset-0 rounded-xl holographic opacity-30 pointer-events-none" />
      )}

      {/* Category badge */}
      <CategoryBadge category={category} rarity={rarity} />

      <div className="flex-1 space-y-1 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-game-round font-bold text-sm text-white tracking-tight`}>
            {name}
          </span>
          <span
            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0
              ${style.text} border ${style.border} bg-white/5`}
          >
            {style.label}
          </span>
        </div>
        <p className="text-[12px] text-game-text-muted leading-relaxed">{description}</p>
        <span className={`text-[11px] font-bold block pt-1 ${style.text}`}>
          +{xpBonus} XP Bonus
        </span>
      </div>

      <button
        onClick={onClose}
        className="p-0.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors shrink-0 relative z-10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
