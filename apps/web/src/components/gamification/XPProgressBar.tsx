import React from 'react';
import { Star } from 'lucide-react';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
}

export default function XPProgressBar({ currentXP, level }: XPProgressBarProps) {
  const XP_THRESHOLDS = [
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
    3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450
  ];

  const currentLevelThreshold = XP_THRESHOLDS[level - 1] || 0;
  const nextLevelThreshold = XP_THRESHOLDS[level] || 10450;
  
  const xpInCurrentLevel = currentXP - currentLevelThreshold;
  const xpRequiredForNextLevel = nextLevelThreshold - currentLevelThreshold;
  
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100));

  return (
    <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 text-xs font-sans">
      <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
        <Star className="h-5 w-5 fill-purple-400/20" />
      </div>

      <div className="flex-1 space-y-1.5">
        <div className="flex justify-between font-semibold text-slate-350">
          <span>Level {level} Student</span>
          <span>{currentXP} / {nextLevelThreshold} XP</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <span className="text-[10px] text-slate-500 block">
          Earn {nextLevelThreshold - currentXP} more XP to reach Level {level + 1}!
        </span>
      </div>
    </div>
  );
}
