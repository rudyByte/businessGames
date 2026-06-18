import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Swords, Target, Trophy, Star, ChevronRight,
  Clock, Zap, Sparkles,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────── */
interface Hook {
  id: string;
  label: string;
  description: string;       // e.g. "2 more clues to earn"
  icon: React.ReactNode;
  color: string;
  accentColor: string;
  actionLabel: string;
  progress?: number;          // 0-100
  priority: number;           // lower = higher priority
}

interface ActiveHooksBarProps {
  hooks: Hook[];
}

/* ─── Single Hook Chip ───────────────────────── */
function HookChip({ hook, onDismiss }: { hook: Hook; onDismiss: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative group shrink-0"
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all hover:scale-105"
        style={{
          backgroundColor: `${hook.color}12`,
          borderColor: `${hook.color}25`,
          color: hook.color,
        }}
      >
        <span className="shrink-0">{hook.icon}</span>
        <span className="hidden sm:inline truncate max-w-[160px]">{hook.description}</span>
        <span
          className="hidden md:inline px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${hook.accentColor}20`, color: hook.accentColor }}
        >
          {hook.actionLabel}
        </span>
        {/* Progress ring */}
        {typeof hook.progress === 'number' && (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <circle
              cx="10" cy="10" r="8" fill="none"
              stroke={hook.color} strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 8}`}
              strokeDashoffset={`${2 * Math.PI * 8 * (1 - (hook.progress || 0) / 100)}`}
              transform="rotate(-90 10 10)"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-game-deep/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-1.5 whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
        <p className="text-[10px] font-bold text-white">{hook.label}</p>
        <p className="text-[8px] text-slate-400">{hook.description}</p>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ────────────────────────── */
export default function ActiveHooksBar({ hooks }: ActiveHooksBarProps) {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [visibleHooks, setVisibleHooks] = useState<Hook[]>([]);

  // Sort by priority and filter dismissed
  useEffect(() => {
    const sorted = [...hooks]
      .filter(h => !dismissed[h.id])
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 4); // show max 4
    setVisibleHooks(sorted);
  }, [hooks, dismissed]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
      {visibleHooks.length === 0 ? (
        <div className="flex items-center gap-2 text-[10px] text-slate-600 italic px-2">
          <Sparkles className="h-3 w-3" />
          All caught up! New challenges arrive daily.
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {visibleHooks.map(hook => (
            <HookChip
              key={hook.id}
              hook={hook}
              onDismiss={() => setDismissed(prev => ({ ...prev, [hook.id]: true }))}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ─── Sample Default Hooks ────────────────────── */
export const DEFAULT_HOOKS: Hook[] = [
  {
    id: 'active_chapter',
    label: 'Active Chapter',
    description: 'Chapter 2 — Market Research in progress',
    icon: <Swords className="h-3.5 w-3.5" />,
    color: '#8B5CF6',
    accentColor: '#A78BFA',
    actionLabel: 'Continue',
    progress: 45,
    priority: 1,
  },
  {
    id: 'daily_challenge',
    label: 'Daily Challenge',
    description: 'Find 3 business opportunities — 2 remaining',
    icon: <Target className="h-3.5 w-3.5" />,
    color: '#F59E0B',
    accentColor: '#FBBF24',
    actionLabel: '1h left',
    progress: 33,
    priority: 2,
  },
  {
    id: 'streak',
    label: 'Streak',
    description: '7-day streak needs to survive today!',
    icon: <Flame className="h-3.5 w-3.5" />,
    color: '#EF4444',
    accentColor: '#F97316',
    actionLabel: '🔥 Day 7',
    priority: 3,
  },
  {
    id: 'achievement',
    label: 'Achievement',
    description: '2 more clues to unlock Detective Master',
    icon: <Trophy className="h-3.5 w-3.5" />,
    color: '#22D3EE',
    accentColor: '#67E8F9',
    actionLabel: '2 clues',
    progress: 70,
    priority: 4,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    description: 'Beat Aryan\'s score by 50 XP for #3!',
    icon: <Star className="h-3.5 w-3.5" />,
    color: '#34D399',
    accentColor: '#10B981',
    actionLabel: '#4 → #3',
    progress: 82,
    priority: 5,
  },
  {
    id: 'chest_available',
    label: 'Mystery Chest',
    description: 'A mystery chest is waiting for you!',
    icon: <Zap className="h-3.5 w-3.5" />,
    color: '#F472B6',
    accentColor: '#EC4899',
    actionLabel: 'Open',
    priority: 6,
  },
];
