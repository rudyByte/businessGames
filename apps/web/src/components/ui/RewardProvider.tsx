/* ───────────────────────────────────────────────
 *  RewardProvider.tsx — Reward Explosion System
 *
 *  Provides:
 *    • useReward() hook for triggering rewards anywhere
 *    • Particle burst (CSS-based, 20-80 divs)
 *    • Floating "+XP" text that drifts upward
 *    • Screen flash (green/red/gold overlay)
 *    • Confetti (canvas-confetti) for major rewards
 *    • Particle pool recycling for performance
 * ─────────────────────────────────────────────── */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  RewardType,
  RewardConfig,
  REWARD_CONFIG,
  RewardEventDetail,
  ParticleConfig,
  generateParticles,
  soundManager,
} from '../../lib/rewardSystem';

/* ─── Types ───────────────────────────────────── */
interface FloatingTextData {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

interface ScreenFlashData {
  color: string;
  opacity: number;
  key: number;
}

type ParticleBurst = ParticleConfig[];

interface RewardContextValue {
  triggerReward: (type: RewardType, position?: { x: number; y: number }) => void;
}

/* ─── Context ─────────────────────────────────── */
const RewardContext = createContext<RewardContextValue>({
  triggerReward: () => {},
});

export const useReward = () => useContext(RewardContext);

/* ─── Particle burst component ───────────────── */
function ParticleExplosion({ particles }: {
  particles: ParticleBurst;
}) {
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={`${p.id}-${p.delay}`}
          className="absolute pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
          }}
          initial={{ opacity: 1, scale: 0 }}
          animate={{
            opacity: 0,
            scale: 1,
            x: p.targetX - p.x,
            y: p.targetY - p.y,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        >
          {/* Render different shapes */}
          {p.shape === 'circle' && (
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }}
            />
          )}
          {p.shape === 'star' && (
            <svg viewBox="0 0 20 20" className="w-full h-full" style={{ color: p.color }}>
              <polygon
                points="10,0 13,7 20,7 14,12 16,20 10,15 4,20 6,12 0,7 7,7"
                fill={p.color}
              />
            </svg>
          )}
          {p.shape === 'sparkle' && (
            <svg viewBox="0 0 16 16" className="w-full h-full" style={{ color: p.color }}>
              <path
                d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6Z"
                fill={p.color}
              />
            </svg>
          )}
          {p.shape === 'coin' && (
            <div
              className="w-full h-full rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
              style={{
                backgroundColor: `${p.color}30`,
                borderColor: p.color,
                color: p.color,
              }}
            >
              ₹
            </div>
          )}
        </motion.div>
      ))}
    </>
  );
}

/* ─── Floating text component ────────────────── */
function FloatingTextItem({ text, x, y, color }: {
  text: string;
  x: number;
  y: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[100]"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -80, scale: 1.2 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <span
        className="text-lg font-game-round font-bold whitespace-nowrap"
        style={{
          color,
          textShadow: `0 0 10px ${color}, 0 0 30px ${color}40, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`,
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

/* ─── Screen flash component ─────────────────── */
function ScreenFlashOverlay({ flash, onComplete }: {
  flash: ScreenFlashData;
  onComplete: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[90]"
      style={{ backgroundColor: flash.color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: flash.opacity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onAnimationComplete={onComplete}
    />
  );
}

/* ─── Main Provider ──────────────────────────── */
export function RewardProvider({ children }: { children: React.ReactNode }) {
  const [particleBursts, setParticleBursts] = useState<{ id: number; particles: ParticleBurst }[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);
  const [screenFlash, setScreenFlash] = useState<ScreenFlashData | null>(null);
  const idCounter = useRef(0);
  const [ready, setReady] = useState(false);

  // Ensure context is ready on client
  useEffect(() => { setReady(true); }, []);

  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    const id = ++idCounter.current;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color, createdAt: Date.now() }]);
    // Auto-remove after animation
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => f.id !== id));
    }, 1500);
  }, []);

  const addParticleBurst = useCallback((type: RewardType, config: RewardConfig, position: { x: number; y: number }) => {
    const count = config.particleCount;
    const colors: [string, string] = [config.color, config.accentColor];
    const particles = generateParticles(count, position.x, position.y, colors, config.particleShape);
    const id = ++idCounter.current;
    setParticleBursts((prev) => [...prev, { id, particles }]);
    setTimeout(() => {
      setParticleBursts((prev) => prev.filter((b) => b.id !== id));
    }, 2000);
  }, []);

  /**
   * Shared visuals handler — particle burst + floating text + screen flash + confetti.
   * Does NOT play sound so both the hook and the custom-event listener can
   * call it safely without double-playing audio.
   */
  const triggerVisuals = useCallback((type: RewardType, position?: { x: number; y: number }) => {
    const config = REWARD_CONFIG[type];
    const pos = position ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // 1. Particle burst
    addParticleBurst(type, config, pos);

    // 2. Floating XP text
    if (config.xp > 0) {
      addFloatingText(`+${config.xp} XP`, pos.x - 30, pos.y - 20, config.color);
    } else if (type === 'quiz_wrong') {
      addFloatingText('Try Again!', pos.x - 35, pos.y - 20, config.color);
    } else if (type === 'coin_earn') {
      addFloatingText('+ Coins', pos.x - 30, pos.y - 20, config.color);
    } else if (type === 'level_up') {
      addFloatingText('LEVEL UP! ⬆', pos.x - 50, pos.y - 30, config.color);
    }

    // 3. Screen flash for major rewards
    if (config.major) {
      const flashKey = ++idCounter.current;
      setScreenFlash({ color: config.color, opacity: 0.15, key: flashKey });
      setTimeout(() => setScreenFlash(null), 500);
    }

    // 4. Confetti for major rewards
    if (config.major && type !== 'quiz_wrong') {
      confetti({
        particleCount: Math.min(config.particleCount, 50),
        spread: 70,
        origin: {
          x: Math.min(1, Math.max(0, pos.x / window.innerWidth)),
          y: Math.min(1, Math.max(0, pos.y / window.innerHeight)),
        },
        colors: [config.color, config.accentColor, '#FFE66D', '#FFFFFF'],
        ticks: 100,
      });
    }
  }, [addParticleBurst, addFloatingText]);

  /**
   * Full trigger used by the hook — plays sound AND visuals.
   */
  const trigger = useCallback((type: RewardType, position?: { x: number; y: number }) => {
    const config = REWARD_CONFIG[type];
    soundManager.play(config.sound);
    triggerVisuals(type, position);
  }, [triggerVisuals]);

  // Listen for programmatic triggerReward calls from rewardSystem.ts
  // Only renders visuals — sound is already played by the module-level triggerReward()
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<RewardEventDetail>).detail;
      triggerVisuals(detail.type, detail.position);
    };
    window.addEventListener('reward-event', handler);
    return () => window.removeEventListener('reward-event', handler);
  }, [triggerVisuals]);

  const value = useMemo(() => ({ triggerReward: trigger }), [trigger]);

  if (!ready) {
    return <>{children}</>;
  }

  return (
    <RewardContext.Provider value={value}>
      {children}

      {/* ─── Render particles ────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[95]">
        {particleBursts.map((burst) => (
          <ParticleExplosion
            key={burst.id}
            particles={burst.particles}
          />
        ))}
      </div>

      {/* ─── Render floating text ────────────────── */}
      {floatingTexts.map((ft) => (
        <FloatingTextItem
          key={ft.id}
          text={ft.text}
          x={ft.x}
          y={ft.y}
          color={ft.color}
        />
      ))}

      {/* ─── Render screen flash ────────────────── */}
      <AnimatePresence>
        {screenFlash && (
          <ScreenFlashOverlay
            key={screenFlash.key}
            flash={screenFlash}
            onComplete={() => setScreenFlash(null)}
          />
        )}
      </AnimatePresence>
    </RewardContext.Provider>
  );
}
