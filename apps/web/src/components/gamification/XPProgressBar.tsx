import React from 'react';
import HexBadge, { getRarityForLevel } from '../ui/HexBadge';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function XPProgressBar({
  currentXP,
  level,
  showLabel = true,
  size = 'md',
}: XPProgressBarProps) {
  const XP_THRESHOLDS = [
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
    3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
  ];

  const currentLevelThreshold = XP_THRESHOLDS[level - 1] || 0;
  const nextLevelThreshold = XP_THRESHOLDS[level] || 10450;

  const xpInCurrentLevel = currentXP - currentLevelThreshold;
  const xpRequiredForNextLevel = nextLevelThreshold - currentLevelThreshold;

  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100));
  const rarity = getRarityForLevel(level);

  const barHeight = size === 'sm' ? 'h-3' : size === 'lg' ? 'h-6' : 'h-5';

  return (
    <div className={`w-full bg-game-dark/60 border border-slate-700/30 rounded-xl p-3 flex items-center gap-3 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {/* Hexagonal Level Badge */}
      <HexBadge level={level} rarity={rarity} size={size === 'sm' ? 'sm' : 'md'} />

      {/* XP Info + Bar */}
      <div className="flex-1 space-y-1.5">
        {showLabel && (
          <div className="flex justify-between items-center">
            <span className="font-game-round font-bold text-white">
              Level {level}
            </span>
            <span className="font-game-score text-xs text-game-text-muted">
              {currentXP} / {nextLevelThreshold} XP
            </span>
          </div>
        )}

        {/* Chunky progress bar */}
        <div className={`progress-bar-game ${barHeight}`}>
          <div
            className="progress-bar-fill progress-fill-game"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                animation: 'shimmer 2.5s infinite',
              }}
            />
          </div>
        </div>

        {showLabel && (
          <div className="flex justify-between text-[10px] text-game-text-muted">
            <span>{xpInCurrentLevel} XP earned this level</span>
            <span>{xpRequiredForNextLevel - xpInCurrentLevel} XP to next level</span>
          </div>
        )}
      </div>
    </div>
  );
}
