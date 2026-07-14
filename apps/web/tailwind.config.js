// apps/web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FF6B35',
          light: '#FF8C42',
          dark: '#E55A2B',
        },
        teal: {
          DEFAULT: '#4ECDC4',
          light: '#7EDDD6',
        },
        gold: {
          DEFAULT: '#FFE66D',
          dark: '#F5D020',
        },
        'bg-deep': '#0D0D1A',
        'bg-dark': '#1A1A2E',
        'bg-card': '#16213E',
        'bg-card-hover': '#1E2A4A',
        success: '#06D6A0',
        danger: '#EF476F',
      },
      fontFamily: {
        game: ['Fredoka One', 'cursive'],
        body: ['Nunito', 'sans-serif'],
        score: ['Orbitron', 'monospace'],
      },
      boxShadow: {
        orange: '0 0 20px rgba(255, 107, 53, 0.4)',
        teal: '0 0 20px rgba(78, 205, 196, 0.4)',
        gold: '0 0 20px rgba(255, 230, 109, 0.4)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'button': '0 4px 15px rgba(255, 107, 53, 0.3)',
        'glow-teal': '0 0 40px rgba(78, 205, 196, 0.6)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'shine': 'shineSwipe 0.5s ease forwards',
        'flame': 'flamePulse 0.5s ease-in-out infinite',
        'count-up': 'countUp 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(78,205,196,0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(78,205,196,0.9)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shineSwipe: {
          '0%': { left: '-75%' },
          '100%': { left: '125%' },
        },
        flamePulse: {
          '0%, 100%': { transform: 'scaleY(1) skewX(0deg)' },
          '25%': { transform: 'scaleY(1.1) skewX(-3deg)' },
          '75%': { transform: 'scaleY(0.95) skewX(3deg)' },
        },
        countUp: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
        'gradient-teal': 'linear-gradient(135deg, #4ECDC4 0%, #7EDDD6 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFE66D 0%, #F5D020 100%)',
        'gradient-card': 'linear-gradient(145deg, #16213E 0%, #0F1729 100%)',
        'gradient-hero': 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 50%, #0D1B3E 100%)',
        'gradient-xp': 'linear-gradient(90deg, #4ECDC4 0%, #FFE66D 100%)',
        'gradient-legendary': 'linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)',
      },
    },
  },
  plugins: [],
};
