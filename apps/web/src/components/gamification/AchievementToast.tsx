import React, { useEffect } from 'react';
import { Award, X } from 'lucide-react';

interface AchievementToastProps {
  name: string;
  description: string;
  rarity: string;
  xpBonus: number;
  onClose: () => void;
}

export default function AchievementToast({ name, description, rarity, xpBonus, onClose }: AchievementToastProps) {
  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border-2 border-purple-500/20 text-slate-100 rounded-xl p-4 shadow-2xl flex items-start gap-4 animate-slideInRight font-sans text-xs">
      <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl shrink-0">
        <Award className="h-6 w-6" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center">
          <span className="font-bold text-white text-[13px] tracking-tight">{name}</span>
          <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {rarity}
          </span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">{description}</p>
        <span className="text-[10px] text-green-400 font-bold block pt-1">+{xpBonus} XP Bonus</span>
      </div>

      <button onClick={onClose} className="p-0.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
