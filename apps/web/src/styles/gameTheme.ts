// apps/web/src/styles/gameTheme.ts

export const GAME_THEME = {
  colors: {
    // Primaries
    orange: '#FF6B35',
    orangeLight: '#FF8C42',
    orangeDark: '#E55A2B',
    teal: '#4ECDC4',
    tealLight: '#7EDDD6',
    gold: '#FFE66D',
    goldDark: '#F5D020',

    // Backgrounds (dark game feel)
    bgDeep: '#0D0D1A',
    bgDark: '#1A1A2E',
    bgCard: '#16213E',
    bgCardHover: '#1E2A4A',
    bgGlass: 'rgba(22, 33, 62, 0.85)',

    // Status
    success: '#06D6A0',
    danger: '#EF476F',
    warning: '#FFE66D',
    info: '#4ECDC4',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A8B2D8',
    textMuted: '#6B7A9B',

    // Rarity tiers
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  },

  gradients: {
    orangeBtn: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
    tealBtn: 'linear-gradient(135deg, #4ECDC4 0%, #7EDDD6 100%)',
    goldBtn: 'linear-gradient(135deg, #FFE66D 0%, #F5D020 100%)',
    card: 'linear-gradient(145deg, #16213E 0%, #0F1729 100%)',
    hero: 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 50%, #0D1B3E 100%)',
    xpBar: 'linear-gradient(90deg, #4ECDC4 0%, #FFE66D 100%)',
    legendary: 'linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)',
    sky: 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 60%, #0D2818 100%)',
  },

  shadows: {
    orange: '0 0 20px rgba(255, 107, 53, 0.4)',
    teal: '0 0 20px rgba(78, 205, 196, 0.4)',
    gold: '0 0 20px rgba(255, 230, 109, 0.4)',
    card: '0 8px 32px rgba(0, 0, 0, 0.4)',
    button: '0 4px 15px rgba(255, 107, 53, 0.3)',
    glow: '0 0 40px rgba(78, 205, 196, 0.6)',
  },

  fonts: {
    game: "'Fredoka One', cursive",
    body: "'Nunito', sans-serif",
    score: "'Orbitron', monospace",
  },

  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    pill: '9999px',
  },

  // Phaser-specific colors (numbers, not strings)
  phaser: {
    bgDeep: 0x0D0D1A,
    bgDark: 0x1A1A2E,
    bgCard: 0x16213E,
    orange: 0xFF6B35,
    teal: 0x4ECDC4,
    gold: 0xFFE66D,
    success: 0x06D6A0,
    danger: 0xEF476F,
    grass: 0x0D2818,
    grassLight: 0x1A4A2E,
    ground: 0x0D2818,
    skyTop: 0x0D0D1A,
    skyMid: 0x1A1A2E,
    white: 0xFFFFFF,
    star: 0xF5F0E8,
  }
} as const;

export type GameTheme = typeof GAME_THEME;
