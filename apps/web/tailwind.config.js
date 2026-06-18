/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Shadcn HSL color variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Primary "Desi Neon" palette
        'game-orange': '#FF6B35',
        'game-orange-dark': '#E55A2B',
        'game-teal': '#4ECDC4',
        'game-teal-dark': '#3DBDB5',
        'game-yellow': '#FFE66D',
        'game-success': '#06D6A0',
        'game-success-dark': '#05B88A',
        'game-danger': '#EF476F',
        'game-danger-dark': '#D9385E',
        'game-mint': '#95E1D3',
        'game-hot': '#FF3366',
        'game-deep': '#1A1A2E',
        'game-dark': '#16213E',
        'game-night': '#0F3460',
        'game-glow': '#E94560',

        // Text colors
        'game-text': '#FFFFFF',
        'game-text-muted': '#A8B2D8',

        // Rarity colors
        'rarity-bronze': '#CD7F32',
        'rarity-silver': '#C0C0C0',
        'rarity-gold': '#FFD700',
        'rarity-platinum': '#E5E4E2',
        'rarity-diamond': '#B9F2FF',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "sans-serif"],
        display: ["Plus Jakarta Sans", "Outfit", "sans-serif"],
        game: ["Bangers", "cursive"],
        'game-round': ["'Fredoka One'", "Nunito", "sans-serif"],
        'game-body': ["Nunito", "sans-serif"],
        'game-score': ["Orbitron", "monospace"],
      },
      backgroundImage: {
        'gradient-game': 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
        'gradient-game-secondary': 'linear-gradient(135deg, #4ECDC4 0%, #3DBDB5 100%)',
        'gradient-game-danger': 'linear-gradient(135deg, #EF476F 0%, #D9385E 100%)',
        'gradient-game-card': 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
        'gradient-game-glow': 'linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%)',
      },
      boxShadow: {
        'game-glow': '0 0 20px rgba(255, 107, 53, 0.3), 0 0 40px rgba(255, 107, 53, 0.1)',
        'game-glow-teal': '0 0 20px rgba(78, 205, 196, 0.3), 0 0 40px rgba(78, 205, 196, 0.1)',
        'game-glow-yellow': '0 0 20px rgba(255, 230, 109, 0.3), 0 0 40px rgba(255, 230, 109, 0.1)',
        'game-glow-purple': '0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.1)',
        'game-btn': '0 4px 14px rgba(255, 107, 53, 0.35)',
        'game-btn-pressed': '0 2px 4px rgba(255, 107, 53, 0.2)',
        'game-card-glow': '0 4px 24px rgba(255, 107, 53, 0.08), 0 0 40px rgba(255, 107, 53, 0.03)',
      },
      animation: {
        'float': 'float-bob 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'holographic': 'holographic 3s linear infinite',
        'slide-up-fade': 'slideUpFade 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,107,53,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(255,107,53,0.6)' },
        },
        'holographic': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'scaleIn': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
