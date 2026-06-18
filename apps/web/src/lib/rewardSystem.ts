/* ───────────────────────────────────────────────
 *  rewardSystem.ts — CampusEdge Reward Engine
 *  Manages reward types, procedural audio (Web Audio API),
 *  particle color palettes, and XP values for every in-game action.
 * ─────────────────────────────────────────────── */

/* ─── Reward Types ───────────────────────────── */
export type RewardType =
  | 'clue_found'       // +30  XP, cyan
  | 'problem_solved'   // +75  XP, gold
  | 'quiz_correct'     // +50  XP, green
  | 'quiz_wrong'       //  0  XP, red flash + "Try again!"
  | 'level_complete'   // +200 XP, full-screen celebration
  | 'level_up'         // +0   XP, special level-up animation
  | 'achievement'      // +100 XP, special
  | 'streak'           // +25  XP, fire
  | 'coin_earn'        // +0   XP, coin spin
  | 'chest_open'       // +75  XP, rainbow
  | 'business_profit'  // +50  XP, money rain
  | 'zone_enter';       // +10  XP, subtle purple

/* ─── Reward Config ──────────────────────────── */
export interface RewardConfig {
  xp: number;
  label: string;
  color: string;          // Primary particle colour
  accentColor: string;    // Secondary particle colour
  particleCount: number;
  sound: SoundType;
  major: boolean;         // Triggers screen flash / confetti
  particleShape: 'circle' | 'star' | 'coin' | 'sparkle';
}

export type SoundType =
  | 'ding'
  | 'success'
  | 'wrong'
  | 'fanfare'
  | 'whoosh'
  | 'coins'
  | 'levelup'
  | 'silent';

export const REWARD_CONFIG: Record<RewardType, RewardConfig> = {
  clue_found: {
    xp: 30,
    label: 'Clue Found!',
    color: '#22D3EE',
    accentColor: '#67E8F9',
    particleCount: 20,
    sound: 'ding',
    major: false,
    particleShape: 'sparkle',
  },
  problem_solved: {
    xp: 75,
    label: 'Problem Solved!',
    color: '#FBBF24',
    accentColor: '#F59E0B',
    particleCount: 30,
    sound: 'success',
    major: true,
    particleShape: 'star',
  },
  quiz_correct: {
    xp: 50,
    label: 'Correct!',
    color: '#34D399',
    accentColor: '#10B981',
    particleCount: 25,
    sound: 'ding',
    major: false,
    particleShape: 'circle',
  },
  quiz_wrong: {
    xp: 0,
    label: 'Try Again!',
    color: '#FB7185',
    accentColor: '#F43F5E',
    particleCount: 8,
    sound: 'wrong',
    major: false,
    particleShape: 'circle',
  },
  level_complete: {
    xp: 200,
    label: 'Level Complete!',
    color: '#FBBF24',
    accentColor: '#F59E0B',
    particleCount: 60,
    sound: 'fanfare',
    major: true,
    particleShape: 'star',
  },
  level_up: {
    xp: 0,
    label: 'LEVEL UP!',
    color: '#A78BFA',
    accentColor: '#8B5CF6',
    particleCount: 80,
    sound: 'levelup',
    major: true,
    particleShape: 'sparkle',
  },
  achievement: {
    xp: 100,
    label: 'Achievement!',
    color: '#F472B6',
    accentColor: '#EC4899',
    particleCount: 40,
    sound: 'fanfare',
    major: true,
    particleShape: 'star',
  },
  streak: {
    xp: 25,
    label: 'Streak Bonus!',
    color: '#FB923C',
    accentColor: '#F97316',
    particleCount: 20,
    sound: 'success',
    major: false,
    particleShape: 'sparkle',
  },
  coin_earn: {
    xp: 0,
    label: '+ Coins',
    color: '#FBBF24',
    accentColor: '#F59E0B',
    particleCount: 15,
    sound: 'coins',
    major: false,
    particleShape: 'coin',
  },
  chest_open: {
    xp: 75,
    label: 'Chest Opened!',
    color: '#E879F9',
    accentColor: '#D946EF',
    particleCount: 40,
    sound: 'whoosh',
    major: true,
    particleShape: 'sparkle',
  },
  business_profit: {
    xp: 50,
    label: 'Profit!',
    color: '#34D399',
    accentColor: '#10B981',
    particleCount: 30,
    sound: 'coins',
    major: true,
    particleShape: 'coin',
  },
  zone_enter: {
    xp: 10,
    label: 'Entering Zone',
    color: '#A78BFA',
    accentColor: '#8B5CF6',
    particleCount: 12,
    sound: 'ding',
    major: false,
    particleShape: 'circle',
  },
};

/* ─── Particle Utilities ─────────────────────── */
export interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  shape: 'circle' | 'star' | 'coin' | 'sparkle';
  duration: number;
  delay: number;
}

export function generateParticles(
  count: number,
  originX: number,
  originY: number,
  colors: [string, string],
  shape: RewardConfig['particleShape'],
): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 60 + Math.random() * 100;
    const color = Math.random() > 0.5 ? colors[0] : colors[1];
    particles.push({
      id: i,
      x: originX,
      y: originY,
      targetX: originX + Math.cos(angle) * distance,
      targetY: originY + Math.sin(angle) * distance,
      color,
      size: 3 + Math.random() * 5,
      shape,
      duration: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 0.1,
    });
  }
  return particles;
}

/* ─── Procedural Sound Manager (Web Audio API) ── */
class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private primed = false;

  /**
   * Call once during a user-gesture handler (click/tap) to
   * unlock the AudioContext before any reward fires.
   */
  prime() {
    if (this.primed) return;
    this.primed = true;
    try {
      const ctx = new AudioContext();
      // Create a silent buffer and play it to unlock the context
      const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      this.ctx = ctx;
    } catch {
      // Audio unavailable
    }
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  play(type: SoundType) {
    if (!this.enabled) return;
    // Auto-prime on first play
    if (!this.primed) this.prime();
    try {
      const ctx = this.getContext();
      switch (type) {
        case 'ding':
          this.playTone(ctx, 880, 0.08, 'sine', 0.3);
          break;
        case 'success':
          this.playTone(ctx, 523, 0.1, 'sine', 0.25);
          setTimeout(() => this.playTone(ctx, 659, 0.1, 'sine', 0.25), 100);
          setTimeout(() => this.playTone(ctx, 784, 0.15, 'sine', 0.3), 200);
          break;
        case 'wrong':
          this.playTone(ctx, 330, 0.08, 'sawtooth', 0.15);
          setTimeout(() => this.playTone(ctx, 262, 0.15, 'sawtooth', 0.15), 120);
          break;
        case 'fanfare': {
          const notes = [523, 659, 784, 1047];
          notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(ctx, freq, 0.15, 'sine', 0.25), i * 120);
          });
          break;
        }
        case 'whoosh':
          this.playWhoosh(ctx);
          break;
        case 'coins': {
          this.playTone(ctx, 1047, 0.05, 'sine', 0.2);
          setTimeout(() => this.playTone(ctx, 1319, 0.05, 'sine', 0.2), 60);
          setTimeout(() => this.playTone(ctx, 1568, 0.08, 'sine', 0.2), 120);
          break;
        }
        case 'levelup': {
          const scale = [523, 587, 659, 784, 880, 1047, 1175, 1319];
          scale.forEach((freq, i) => {
            setTimeout(() => this.playTone(ctx, freq, 0.1, 'sine', 0.2), i * 80);
          });
          break;
        }
        case 'silent':
          break;
      }
    } catch {
      // Audio not available — fail silently
    }
  }

  private playTone(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playWhoosh(ctx: AudioContext) {
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.random() * 2 - 1;
      data[i] *= Math.max(0, 1 - t / 0.3);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }
}

export const soundManager = new SoundManager();

/* ─── Event Dispatch ─────────────────────────── */
export interface RewardEventDetail {
  type: RewardType;
  xp: number;
  config: RewardConfig;
  position: { x: number; y: number };
  timestamp: number;
}

/**
 * Dispatch a reward event that the RewardProvider listens for.
 * Position defaults to center of screen when omitted.
 */
export function triggerReward(
  type: RewardType,
  position?: { x: number; y: number },
) {
  const config = REWARD_CONFIG[type];
  const xp = config.xp;
  const pos = position ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // Play sound
  soundManager.play(config.sound);

  // Dispatch custom event for React context to pick up
  const detail: RewardEventDetail = {
    type,
    xp,
    config,
    position: pos,
    timestamp: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent<RewardEventDetail>('reward-event', { detail }),
  );
}
