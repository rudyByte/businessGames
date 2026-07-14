// apps/web/src/phaser/EventBridge.ts
import Phaser from 'phaser';

// Singleton EventEmitter for cross-boundary communication
export const EventBridge = new Phaser.Events.EventEmitter();

// Events from Phaser → React
export const PHASER_EVENTS = {
  XP_EARNED: 'xp_earned',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  COIN_EARNED: 'coin_earned',
  SCENE_COMPLETE: 'scene_complete',
  OPEN_MODAL: 'open_modal',
  PLAY_SOUND: 'play_sound',
  ZONE_CLICKED: 'zone_clicked',
  CHEST_OPENED: 'chest_opened',
  CHALLENGE_STARTED: 'challenge_started',
  GAME_PAUSED: 'game_paused',
  GAME_RESUMED: 'game_resumed',
} as const;

// Events from React → Phaser
export const REACT_EVENTS = {
  PLAYER_DATA_LOADED: 'player_data_loaded',
  CLOSE_MODAL: 'close_modal',
  RESUME_GAME: 'resume_game',
  UPDATE_STREAK: 'update_streak',
  UNLOCK_ZONE: 'unlock_zone',
} as const;

export type PhaserEventName = typeof PHASER_EVENTS[keyof typeof PHASER_EVENTS];
export type ReactEventName = typeof REACT_EVENTS[keyof typeof REACT_EVENTS];
