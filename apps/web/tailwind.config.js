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
      },
      colors: {
        'game-orange': '#FF6B35',
        'game-teal': '#4ECDC4',
        'game-yellow': '#FFE66D',
        'game-mint': '#95E1D3',
        'game-hot': '#FF3366',
        'game-deep': '#1A1A2E',
        'game-dark': '#16213E',
        'game-night': '#0F3460',
        'game-glow': '#E94560',
      },
    },
  },
  plugins: [],
};
