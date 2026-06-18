import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useReward } from '../../components/ui/RewardProvider';
import api from '../../lib/api';
import WorldMap from '../../components/game/worldmap/WorldMap';
import {
  Flame,
  Coins,
  Star,
  Zap,
  Gamepad2,
  BarChart3,
  User,
  Sparkles,
  Gift,
} from 'lucide-react';

/* ─── Minimal HUD — top bar ─────────────────── */
function HubHud({ streak, coins, level, xp }: {
  streak: number;
  coins: number;
  level: number;
  xp: number;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Left: Level badge */}
        <div className="flex items-center gap-2 bg-game-deep/60 backdrop-blur-md border border-purple-500/20 rounded-full px-3.5 py-1.5 shadow-lg shadow-black/20">
          <Star className="h-3.5 w-3.5 text-purple-400 fill-purple-400/30" />
          <span className="text-xs font-game-round font-bold text-white">Lv.{level}</span>
          <span className="text-[10px] text-slate-500 font-game-body">{xp} XP</span>
        </div>

        {/* Center: subtle branding */}
        <div className="hidden sm:flex items-center gap-2 bg-game-deep/40 backdrop-blur-sm border border-slate-700/20 rounded-full px-4 py-1.5">
          <Sparkles className="h-3 w-3 text-game-yellow" />
          <span className="text-[11px] font-game-body font-bold text-white/70">Launchpad</span>
        </div>

        {/* Right: Streak + Coins */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-game-deep/60 backdrop-blur-md border border-orange-500/20 rounded-full px-3 py-1.5 shadow-lg shadow-black/20">
            <Flame className={`h-3.5 w-3.5 ${streak > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
            <span className="text-xs font-game-round font-bold text-white">{streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-game-deep/60 backdrop-blur-md border border-game-yellow/20 rounded-full px-3 py-1.5 shadow-lg shadow-black/20">
            <Coins className="h-3.5 w-3.5 text-game-yellow" />
            <span className="text-xs font-game-round font-bold text-game-yellow">₹{coins}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Floating Quick Actions — tap to expand ── */
function QuickActions({ onAction }: { onAction: (action: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeOfDay] = useState<'morning' | 'afternoon' | 'evening'>(
    (() => {
      const h = new Date().getHours();
      if (h < 12) return 'morning';
      if (h < 17) return 'afternoon';
      return 'evening';
    })()
  );

  // Close on escape or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const actions = [
    { id: 'detective', label: 'Problem Hunt', emoji: '🔍', desc: 'Find business opportunities' },
    { id: 'simulator', label: 'Startup Galaxy', emoji: '🚀', desc: 'Build your business' },
    { id: 'challenges', label: 'Daily Challenges', emoji: '⚡', desc: 'Bonus XP available' },
    { id: 'leaderboard', label: 'Leaderboard', emoji: '🏆', desc: 'See how you rank' },
  ];

  const greetings = {
    morning: { text: 'Good morning! ☀️', sub: 'Ready to build something?' },
    afternoon: { text: 'Hey there! 👋', sub: 'Time to level up!' },
    evening: { text: 'Let\'s go! 🚀', sub: 'One more challenge?' },
  };

  return (
    <div className="absolute bottom-20 right-4 z-30 flex flex-col items-end gap-2">
      {/* Expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-64 bg-game-deep/90 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-3 shadow-2xl"
          >
            {/* Greeting */}
            <div className="px-2 pb-2 mb-2 border-b border-slate-700/30">
              <p className="text-sm font-game-round font-bold text-white">{greetings[timeOfDay].text}</p>
              <p className="text-[10px] text-slate-500">{greetings[timeOfDay].sub}</p>
            </div>

            {/* Action buttons */}
            <div className="space-y-1">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => { setIsOpen(false); onAction(action.id); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-all text-left group"
                >
                  <span className="text-xl">{action.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-game-teal transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[9px] text-slate-500">{action.desc}</p>
                  </div>
                  <Zap className="h-3.5 w-3.5 text-slate-600 group-hover:text-game-teal transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-game-orange to-game-hot text-white shadow-xl shadow-game-orange/30 flex items-center justify-center"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={!isOpen ? { boxShadow: ['0 4px 20px rgba(255,107,53,0.3)', '0 4px 30px rgba(255,107,53,0.5)', '0 4px 20px rgba(255,107,53,0.3)'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.span
          className="text-xl font-bold"
          animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          +
        </motion.span>
      </motion.button>
    </div>
  );
}

/* ─── Bottom Navigation ─────────────────────── */
function BottomNavBar({ activeTab, onTabChange, badges }: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges: Record<string, number>;
}) {
  const tabs = [
    { id: 'map', label: 'Map', icon: Gamepad2 },
    { id: 'challenges', label: 'Challenges', icon: Zap },
    { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-game-deep/80 backdrop-blur-xl border-t border-slate-700/30">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = badges[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center px-5 py-1 transition-all ${
                isActive ? 'scale-110' : ''
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${
                  isActive
                    ? 'text-game-teal drop-shadow-[0_0_6px_rgba(78,205,196,0.4)]'
                    : 'text-slate-600'
                }`} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-game-hot text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${
                isActive ? 'text-game-teal' : 'text-slate-600'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ─── Main HomePage ─────────────────────────── */
export default function StudentHomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [detProgress, setDetProgress] = useState<any>(null);
  const [simProgress, setSimProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [dailyChestOpened, setDailyChestOpened] = useState(false);
  const [showChestToast, setShowChestToast] = useState(false);
  const { triggerReward } = useReward();

  const student = user?.student || {
    name: 'Aryan',
    level: 1,
    totalXP: 0,
    coins: 0,
    streak: 3,
  };

  // Fetch progress data
  useEffect(() => {
    async function fetchData() {
      try {
        const [detRes, simRes] = await Promise.all([
          api.get('/games/problem-hunt/progress'),
          api.get('/games/startup-simulator/progress'),
        ]);
        setDetProgress(detRes.data.data);
        setSimProgress(simRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // First-login → onboarding
  useEffect(() => {
    if (!isLoading && detProgress) {
      const saveData = detProgress.detectiveSave
        ? (typeof detProgress.detectiveSave === 'string'
            ? JSON.parse(detProgress.detectiveSave)
            : detProgress.detectiveSave)
        : {};
      const hasCompletedOnboarding = saveData.onboardingComplete;
      if (!hasCompletedOnboarding && detProgress.status === 'NOT_STARTED') {
        const timer = setTimeout(() => {
          navigate('/student/onboarding', { replace: true });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, detProgress, navigate]);

  const handleZoneClick = useCallback((zoneId: string) => {
    if (zoneId === 'detective') {
      navigate('/student/games/detective');
    } else if (zoneId === 'simulator') {
      navigate('/student/games/simulator');
    } else if (zoneId === 'showcase') {
      navigate('/student/games/simulator');
    }
    requestAnimationFrame(() => triggerReward('zone_enter'));
  }, [navigate, triggerReward]);

  const handleChestOpen = useCallback(() => {
    setDailyChestOpened(true);
    setShowChestToast(true);
    setTimeout(() => setShowChestToast(false), 3000);
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'detective': navigate('/student/games/detective'); break;
      case 'simulator': navigate('/student/games/simulator'); break;
      case 'challenges': navigate('/student/games'); break;
      case 'leaderboard': navigate('/student/leaderboard'); break;
    }
  }, [navigate]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'leaderboard': navigate('/student/leaderboard'); break;
      case 'profile': navigate('/student/profile'); break;
      case 'challenges': navigate('/student/games'); break;
      default: break;
    }
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-game-deep">
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
            <Gamepad2 className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-slate-500 text-xs font-game-body">Loading your world...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-game-deep overflow-hidden select-none">
      {/* ─── HUD ──────────────────────────────── */}
      <HubHud
        streak={student.streak || 3}
        coins={student.coins || 0}
        level={student.level || 1}
        xp={student.totalXP || 0}
      />

      {/* ─── World Map (full screen hero) ──────── */}
      <div className="absolute inset-0 pt-12 pb-14">
        <WorldMap
          studentName={student.name || 'Explorer'}
          studentLevel={student.level || 1}
          coins={student.coins || 0}
          streak={student.streak || 0}
          detProgress={detProgress}
          simProgress={simProgress}
          onZoneClick={handleZoneClick}
          onChestOpen={handleChestOpen}
          dailyChestAvailable={!dailyChestOpened}
        />
      </div>

      {/* ─── Quick Actions (FAB) ──────────────── */}
      <QuickActions onAction={handleQuickAction} />

      {/* ─── Bottom Nav ────────────────────────── */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        badges={{ map: 0, challenges: 1, leaderboard: 0, profile: 0 }}
      />

      {/* ─── Chest collected toast ──────────────── */}
      <AnimatePresence>
        {showChestToast && (
          <motion.div
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="bg-game-deep/90 backdrop-blur-md border border-game-yellow/20 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-2xl">
              <Gift className="h-4 w-4 text-game-yellow" />
              <span className="text-xs font-game-body font-bold text-white">Daily reward collected!</span>
              <Sparkles className="h-3 w-3 text-game-yellow" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
