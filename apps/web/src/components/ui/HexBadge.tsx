import React from 'react';

/* ─── Types ──────────────────────────────────── */
type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'purple';

interface HexBadgeProps {
  level: number;
  rarity?: BadgeRarity;
  size?: BadgeSize;
  className?: string;
  glow?: boolean;
}

/* ─── Size classes ──────────────────────────────── */
const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'w-12 h-14 text-base',
  md: 'w-16 h-[72px] text-xl',
  lg: 'w-20 h-[90px] text-2xl',
};

const RARITY_CLASSES: Record<BadgeRarity, string> = {
  bronze: 'bg-gradient-to-br from-[#CD7F32] to-[#A0522D] shadow-[0_0_16px_rgba(205,127,50,0.4)]',
  silver: 'bg-gradient-to-br from-[#C0C0C0] to-[#A9A9A9] shadow-[0_0_16px_rgba(192,192,192,0.4)]',
  gold: 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] shadow-[0_0_20px_rgba(255,215,0,0.5)]',
  platinum: 'bg-gradient-to-br from-[#E5E4E2] to-[#B0B0B0] shadow-[0_0_20px_rgba(229,228,226,0.5)]',
  diamond: 'bg-gradient-to-br from-[#B9F2FF] to-[#6DD5FA] shadow-[0_0_24px_rgba(185,242,255,0.5)]',
  purple: 'bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] shadow-[0_0_16px_rgba(124,58,237,0.4)]',
};

/* ─── Component ──────────────────────────────── */
export default function HexBadge({ level, rarity = 'purple', size = 'md', className = '', glow = true }: HexBadgeProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center font-game-score font-black text-white
        ${SIZE_CLASSES[size]} ${RARITY_CLASSES[rarity]} ${className}`}
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        animation: glow ? 'glow-pulse 2s ease-in-out infinite' : undefined,
      }}
    >
      {/* Inner highlight */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 60%)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      />
      {/* Level number */}
      <span className="relative z-10" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
        {level}
      </span>
    </div>
  );
}

/* ─── Rarity helper ────────────────────────────── */
export function getRarityForLevel(level: number): BadgeRarity {
  if (level >= 20) return 'diamond';
  if (level >= 15) return 'platinum';
  if (level >= 10) return 'gold';
  if (level >= 5) return 'silver';
  return 'bronze';
}
