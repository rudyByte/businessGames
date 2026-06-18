import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
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
import WorldMap from '../../components/game/worldmap/WorldMap';

/* ─── Bottom Navigation Bar ─────────────────────── */
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
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-game-deep/90 backdrop-blur-xl border-t border-slate-700/40">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = badges[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center px-5 py-2 transition-all ${
                isActive ? 'text-game-teal scale-110' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`h-6 w-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(78,205,196,0.5)]' : ''}`} />
                {badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-game-hot text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ─── Stats Bar (Top) ───────────────────────────── */
function StatsBar({ streak, coins, level, xp }: {
  streak: number;
  coins: number;
  level: number;
  xp: number;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 px-5 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left: Level + XP */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-game-deep/70 backdrop-blur-md border border-purple-500/15 rounded-full px-4 py-2">
            <Star className="h-4 w-4 text-purple-400 fill-purple-400/30" />
            <span className="text-sm font-game-round font-bold text-white">Lv.{level}</span>
          </div>
        </div>

        {/* Center: Greeting */}
        <div className="hidden md:flex items-center gap-2 bg-game-deep/60 backdrop-blur-md border border-slate-700/30 rounded-full px-5 py-2">
          <Sparkles className="h-4 w-4 text-game-yellow" />
          <span className="text-sm font-game-body font-bold text-white">
            Entrepreneur Launchpad
          </span>
        </div>

        {/* Right: Streak + Coins */}
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-game-deep/70 backdrop-blur-md border border-orange-500/15 rounded-full px-3 py-2">
            <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-400 fill-orange-400/30' : 'text-slate-600'}`} />
            <span className="text-sm font-game-round font-bold text-white">{streak}</span>
          </div>

          {/* Coins */}
          <motion.div
            className="flex items-center gap-1.5 bg-game-deep/70 backdrop-blur-md border border-game-yellow/15 rounded-full px-3 py-2"
            animate={coins > 0 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Coins className="h-4 w-4 text-game-yellow" />
            <span className="text-sm font-game-round font-bold text-game-yellow">₹{coins}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main HomePage ─────────────────────────────── */
export default function StudentHomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [detProgress, setDetProgress] = useState<any>(null);
  const [simProgress, setSimProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [dailyChestOpened, setDailyChestOpened] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const student = user?.student || {
    name: 'Aryan',
    level: 1,
    totalXP: 0,
    coins: 0,
    streak: 3,
  };

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

  const handleZoneClick = (zoneId: string) => {
    if (zoneId === 'detective') {
      navigate('/student/games/detective');
    } else if (zoneId === 'simulator') {
      navigate('/student/games/simulator');
    } else if (zoneId === 'showcase') {
      // Not yet implemented
    }
  };

  const handleChestOpen = () => {
    setDailyChestOpened(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'leaderboard':
        navigate('/student/leaderboard');
        break;
      case 'profile':
        navigate('/student/profile');
        break;
      case 'challenges':
        navigate('/student/games');
        break;
      // 'map' stays on current page
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-game-deep">
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
            <Gamepad2 className="h-10 w-10 text-purple-400" />
          </div>
          <p className="text-slate-400 text-sm font-game-body">Loading your world...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-game-deep overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed top-20 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-0 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/3 w-64 h-64 bg-game-teal/5 rounded-full blur-3xl pointer-events-none" />

      {/* Stats Bar */}
      <StatsBar
        streak={student.streak || 3}
        coins={student.coins || 0}
        level={student.level || 1}
        xp={student.totalXP || 0}
      />

      {/* World Map (full screen) */}
      <div className="w-full h-full pt-12 pb-14">
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

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        badges={{
          map: 0,
          challenges: 1,
          leaderboard: 0,
          profile: 0,
        }}
      />

      {/* XP Gain Toast Animation */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="bg-gradient-to-r from-purple-600/90 to-purple-700/90 backdrop-blur-md border border-purple-400/20 rounded-xl px-5 py-3 flex items-center gap-3 shadow-2xl">
              <Gift className="h-5 w-5 text-game-yellow" />
              <span className="text-sm font-game-body font-bold text-white">Daily chest opened!</span>
              <Sparkles className="h-4 w-4 text-game-yellow" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
