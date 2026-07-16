// apps/web/src/pages/student/HomePage.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Phaser from 'phaser';
import { PhaserGame, PhaserGameRef } from '../../phaser/PhaserGame';
import { WorldMapScene } from '../../phaser/scenes/WorldMapScene';
import { EventBridge, PHASER_EVENTS, REACT_EVENTS } from '../../phaser/EventBridge';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';


// Overlay tab types
type Tab = 'challenges' | 'leaderboard' | 'inventory' | 'profile' | null;

// Lightweight XP popup that floats up
function XPPopup({ amount, onDone }: { amount: number; onDone: () => void }) {
  return (
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 pointer-events-none select-none"
      style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem', color: '#4ECDC4', textShadow: '0 0 20px rgba(78,205,196,0.8)' }}
      initial={{ opacity: 1, y: 0, x: '-50%', scale: 0.7 }}
      animate={{ opacity: 0, y: -120, scale: 1.3 }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
      onAnimationComplete={onDone}
    >
      +{amount} XP ✨
    </motion.div>
  );
}

// Level up celebration modal
function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-glass text-center px-12 py-10 max-w-sm mx-4"
        initial={{ scale: 0.3, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-7xl mb-3 animate-bounce-in">🏆</div>
        <h2 className="font-game text-4xl text-gradient-orange mb-1" style={{ fontFamily: "'Fredoka One', cursive" }}>
          LEVEL UP!
        </h2>
        <p className="text-6xl font-score font-bold" style={{ fontFamily: "'Orbitron', monospace", color: '#FFE66D' }}>
          {level}
        </p>
        <p className="text-sm mt-3 mb-6" style={{ color: '#A8B2D8', fontFamily: "'Nunito', sans-serif" }}>
          You're getting unstoppable 💪
        </p>
        <button
          onClick={onClose}
          className="btn-game btn-primary w-full"
        >
          Keep Going! 🚀
        </button>
      </motion.div>
    </motion.div>
  );
}

// Chest reward modal
function ChestModal({ rewards, onClose }: { rewards: { xp: number; coins: number }; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-glass text-center px-10 py-8 max-w-xs mx-4"
        initial={{ scale: 0.4, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          🎁
        </motion.div>
        <h3 className="font-game text-2xl mb-4 text-gradient-gold" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Daily Chest!
        </h3>
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-score font-bold" style={{ color: '#4ECDC4', fontFamily: "'Orbitron', monospace" }}>
              +{rewards.xp}
            </div>
            <div className="text-xs" style={{ color: '#A8B2D8' }}>XP</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-score font-bold" style={{ color: '#FFE66D', fontFamily: "'Orbitron', monospace" }}>
              +{rewards.coins}
            </div>
            <div className="text-xs" style={{ color: '#A8B2D8' }}>Coins</div>
          </div>
        </div>
        <button onClick={onClose} className="btn-game btn-gold w-full">
          Awesome! 🌟
        </button>
      </motion.div>
    </motion.div>
  );
}

// Zone navigation handler
function useZoneNavigation(navigate: ReturnType<typeof useNavigate>) {
  return useCallback((zone: string) => {
    switch (zone) {
      case 'problem-hunt':  navigate('/student/games/detective'); break;
      case 'startup-wars':  navigate('/student/games/simulator'); break;
      case 'arcade':        navigate('/student/games/arcade'); break;
      case 'showcase':      navigate('/student/games/simulator'); break;
      default: break;
    }
  }, [navigate]);
}

export default function StudentHomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const phaserRef = useRef<PhaserGameRef>(null);
  const [activeTab, setActiveTab] = useState<Tab>(null);
  const [xpPopups, setXpPopups] = useState<{ id: number; amount: number }[]>([]);
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);
  const [chestModal, setChestModal] = useState<{ xp: number; coins: number } | null>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const popupCounter = useRef(0);

  const handleZone = useZoneNavigation(navigate);
  const [unlockNotification, setUnlockNotification] = useState<string | null>(null);

  // Phaser game config
  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#0D0D1A',
    scene: [WorldMapScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      roundPixels: true,
    },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  };

  // Load player data and push to Phaser
  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await api.get('/students/me');
        const s = res.data.data;

        // Onboarding Check
        const detProg = s.gameProgress?.find((p: any) => p.game.slug === 'problem-hunt');
        let onboardingComplete = false;
        if (detProg?.detectiveSave) {
          try {
            const save = typeof detProg.detectiveSave === 'string' ? JSON.parse(detProg.detectiveSave) : detProg.detectiveSave;
            if (save.onboardingComplete) {
              onboardingComplete = true;
            }
          } catch (e) {
            console.error('Error parsing detectiveSave:', e);
          }
        }
        if (!onboardingComplete) {
          navigate('/student/onboarding');
          return;
        }

        // Dynamic zone unlocking
        const unlockedZones = ['problem-hunt'];
        const simProg = s.gameProgress?.find((p: any) => p.game.slug === 'startup-simulator');
        if (detProg?.status === 'COMPLETED' || simProg) {
          unlockedZones.push('startup-wars');
          unlockedZones.push('arcade');
          unlockedZones.push('showcase');
        }

        // Chapter unlock notifications
        if (detProg) {
          const currentCh = detProg.currentChapter || 1;
          const lastSeenChStr = localStorage.getItem('lastSeenChapter');
          const lastSeenCh = lastSeenChStr ? parseInt(lastSeenChStr) : 1;
          if (currentCh > lastSeenCh) {
            setUnlockNotification(`Chapter ${currentCh} Unlocked! 🕵️`);
            localStorage.setItem('lastSeenChapter', currentCh.toString());
          }
        }
        if (simProg && simProg.status === 'IN_PROGRESS') {
          const lastSeenSim = localStorage.getItem('lastSeenSimUnlocked');
          if (!lastSeenSim) {
            setUnlockNotification("Startup Galaxy Unlocked! 🚀");
            localStorage.setItem('lastSeenSimUnlocked', 'true');
          }
        }

        const data = {
          name: s.name,
          level: s.level || 1,
          xp: s.totalXP || 0,
          coins: s.coins || 0,
          streak: s.streak || 0,
          unlockedZones,
          starsEarned: {},
        };
        setPlayerData(data);
      } catch (err) {
        console.error('Failed to fetch player data:', err);
        // Fallback to auth store data
        if (user?.student) {
          setPlayerData({
            name: user.student.name || 'Champion',
            level: user.student.level || 1,
            xp: user.student.totalXP || 0,
            coins: user.student.coins || 0,
            streak: user.student.streak || 0,
            unlockedZones: ['problem-hunt'],
            starsEarned: {},
          });
        }
      }
    };
    fetchPlayer();
  }, [user, navigate]);

  // Send player data to Phaser scene after it boots
  const onGameReady = useCallback((game: Phaser.Game) => {
    const sendData = () => {
      const scene = game.scene.getScene('WorldMapScene');
      if (scene && playerData) {
        scene.events.emit('player_data', playerData);
      } else {
        setTimeout(sendData, 200);
      }
    };
    setTimeout(sendData, 500);
  }, [playerData]);

  // Re-emit player data if it loads after game is ready
  useEffect(() => {
    if (playerData && phaserRef.current?.game) {
      const scene = phaserRef.current.game.scene.getScene('WorldMapScene');
      scene?.events.emit('player_data', playerData);
    }
  }, [playerData]);

  // EventBridge listeners
  useEffect(() => {
    const handleZoneClick = ({ zone }: { zone: string }) => handleZone(zone);
    const handleChestOpen = async () => {
      try {
        const res = await api.post('/games/daily-chest/claim');
        const { xp, coins } = res.data.data;
        setChestModal({ xp, coins });
      } catch (err: any) {
        alert(err.response?.data?.error?.message || 'Chest already opened today! Come back tomorrow.');
      }
    };
    const handleXPEarned = ({ amount }: { amount: number }) => {
      const id = ++popupCounter.current;
      setXpPopups((prev) => [...prev, { id, amount }]);
    };
    const handleLevelUp = ({ level }: { level: number }) => setLevelUpModal(level);

    const handleNav = ({ tab }: { tab: Tab }) => setActiveTab(tab);

    EventBridge.on(PHASER_EVENTS.ZONE_CLICKED, handleZoneClick);
    EventBridge.on(PHASER_EVENTS.CHEST_OPENED, handleChestOpen);
    EventBridge.on(PHASER_EVENTS.XP_EARNED, handleXPEarned);
    EventBridge.on(PHASER_EVENTS.LEVEL_UP, handleLevelUp);
    EventBridge.on('nav:challenges',  () => setActiveTab('challenges'));
    EventBridge.on('nav:leaderboard', () => setActiveTab('leaderboard'));
    EventBridge.on('nav:inventory',   () => setActiveTab('inventory'));
    EventBridge.on('nav:profile',     () => setActiveTab('profile'));
    EventBridge.on('nav:map',         () => setActiveTab(null));

    return () => {
      EventBridge.off(PHASER_EVENTS.ZONE_CLICKED, handleZoneClick);
      EventBridge.off(PHASER_EVENTS.CHEST_OPENED, handleChestOpen);
      EventBridge.off(PHASER_EVENTS.XP_EARNED, handleXPEarned);
      EventBridge.off(PHASER_EVENTS.LEVEL_UP, handleLevelUp);
      EventBridge.off('nav:challenges',  () => setActiveTab('challenges'));
      EventBridge.off('nav:leaderboard', () => setActiveTab('leaderboard'));
      EventBridge.off('nav:inventory',   () => setActiveTab('inventory'));
      EventBridge.off('nav:profile',     () => setActiveTab('profile'));
      EventBridge.off('nav:map',         () => setActiveTab(null));
    };
  }, [handleZone]);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#0D0D1A' }}>
      {/* Floating Announcement Banner */}
      <div className="absolute top-16 left-0 right-0 z-20 pointer-events-auto max-w-lg mx-auto">
        <AnnouncementBanner />
      </div>

      {/* Phaser World Map canvas */}
      <PhaserGame
        ref={phaserRef}
        config={phaserConfig}
        onGameReady={onGameReady}
      />

      {/* Chapter Unlock Notification Overlay */}
      <AnimatePresence>
        {unlockNotification && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUnlockNotification(null)}
          >
            <motion.div
              className="card-glass text-center p-8 max-w-sm border border-yellow-500/30 shadow-glow-gold"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="font-game text-2xl mb-2 text-gradient-gold" style={{ fontFamily: "'Fredoka One', cursive" }}>
                CONGRATULATIONS!
              </h2>
              <p className="text-sm text-slate-300 font-bold mb-4">
                {unlockNotification}
              </p>
              <p className="text-xs text-slate-400 mb-6">
                You've successfully unlocked a new zone on your entrepreneurship journey! Keep up the great work.
              </p>
              <button
                onClick={() => setUnlockNotification(null)}
                className="btn-game btn-gold w-full text-xs font-bold"
              >
                Let's Go! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP float popups */}
      <AnimatePresence>
        {xpPopups.map(({ id, amount }) => (
          <XPPopup
            key={id}
            amount={amount}
            onDone={() => setXpPopups((p) => p.filter((x) => x.id !== id))}
          />
        ))}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {levelUpModal !== null && (
          <LevelUpModal level={levelUpModal} onClose={() => setLevelUpModal(null)} />
        )}
      </AnimatePresence>

      {/* Chest Modal */}
      <AnimatePresence>
        {chestModal && (
          <ChestModal rewards={chestModal} onClose={() => setChestModal(null)} />
        )}
      </AnimatePresence>

      {/* Tab overlays (slide in on top of world map) */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            key={activeTab}
            className="absolute inset-0 z-30 overflow-y-auto"
            style={{
              background: 'rgba(13,13,26,0.97)',
              paddingBottom: '72px',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <TabContent tab={activeTab} onClose={() => setActiveTab(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stub tab content — each will be expanded in Sprint 5
function TabContent({ tab, onClose }: { tab: Tab; onClose: () => void }) {
  const titles: Record<NonNullable<Tab>, string> = {
    challenges: '⚔️ Daily Quests',
    leaderboard: '🏆 Leaderboard',
    inventory: '🎒 Inventory',
    profile: '👤 My Profile',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-game text-gradient-hero"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          {tab ? titles[tab] : ''}
        </h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(239,71,111,0.15)', border: '1px solid rgba(239,71,111,0.3)', color: '#EF476F' }}
        >
          ✕
        </button>
      </div>

      {/* Placeholder content per tab — will be replaced in Sprint 5 */}
      <div className="card-game p-8 text-center" style={{ color: '#A8B2D8', fontFamily: "'Nunito', sans-serif" }}>
        <div className="text-4xl mb-3">🚧</div>
        <p className="text-sm">Coming in Sprint 5 — full {tab} tab with live data!</p>
      </div>
    </div>
  );
}
