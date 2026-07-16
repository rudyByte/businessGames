import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Building, ArrowRight, Clock, Zap } from 'lucide-react';
import api from '../../lib/api';

const GAME_UI_META: Record<string, any> = {
  'problem-hunt': {
    tagline: 'Find problems. Build solutions.',
    icon: Trophy,
    color: '#FF6B35',
    gradient: 'from-orange-600/20 to-orange-700/5',
    borderColor: 'rgba(255,107,53,0.3)',
    cta: 'Start Investigation',
    ctaColor: 'btn-game-primary',
    targetRoute: '/student/games/detective',
  },
  'startup-simulator': {
    tagline: 'Build your empire from scratch.',
    icon: Building,
    color: '#4ECDC4',
    gradient: 'from-teal-600/20 to-teal-700/5',
    borderColor: 'rgba(78,205,196,0.3)',
    cta: 'Launch Startup',
    ctaColor: 'btn-game-secondary',
    targetRoute: '/student/games/simulator',
  },
};

export default function GamesPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await api.get('/games');
        const dbGames = res.data.data;
        const merged = dbGames.map((g: any) => {
          const meta = GAME_UI_META[g.slug] || {
            tagline: 'Empower your entrepreneur journey.',
            icon: Trophy,
            color: '#4ECDC4',
            gradient: 'from-teal-600/20 to-teal-700/5',
            borderColor: 'rgba(78,205,196,0.3)',
            cta: 'Play Now',
            ctaColor: 'btn-game-primary',
            targetRoute: `/student/games/${g.slug}`,
          };
          return {
            ...g,
            ...meta,
            stats: [
              { label: 'Chapters', value: `${g.totalChapters || 3}`, icon: Clock },
              { label: 'Status', value: 'Active', icon: Zap },
            ],
          };
        });
        setGames(merged);
      } catch (err) {
        console.error('Failed to load games catalog:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGames();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="game-card-accent p-6 rounded-xl">
        <h1 className="text-2xl font-game-round font-bold text-white">Games Catalog 🎮</h1>
        <p className="text-sm font-game-body text-game-text-muted mt-1">
          Explore curricular games designed to help you practice real business skills.
        </p>
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {games.map((game, idx) => {
          const Icon = game.icon;

          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, type: 'spring', stiffness: 200 }}
              className="group relative overflow-hidden rounded-2xl border transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)`,
                borderColor: game.borderColor,
                boxShadow: `0 4px 24px ${game.color}08, 0 0 40px ${game.color}03`,
              }}
            >
              {/* Hover glow effect */}
              <div
                className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl pointer-events-none"
                style={{ backgroundColor: `${game.color}08` }}
              />

              {/* Top icon area */}
              <div
                className={`h-40 flex items-center justify-center relative overflow-hidden`}
                style={{
                  background: `linear-gradient(135deg, ${game.color}15 0%, ${game.color}05 100%)`,
                  borderBottom: `1px solid ${game.color}20`,
                }}
              >
                {/* Glow orb */}
                <div
                  className="absolute w-32 h-32 rounded-full blur-3xl"
                  style={{ backgroundColor: `${game.color}10` }}
                />
                <Icon
                  className="h-20 w-20 relative drop-shadow-xl transition-transform group-hover:scale-110 duration-300"
                  style={{ color: game.color }}
                />
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-game-body font-bold uppercase tracking-widest"
                      style={{ color: game.color }}
                    >
                      {game.tagline}
                    </span>
                  </div>
                  <h3 className="text-xl font-game-round font-bold text-white">
                    {game.name}
                  </h3>
                  <p className="text-sm font-game-body text-game-text-muted leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                  {game.stats.map((stat: any, i: number) => {
                    const StatIcon = stat.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-[11px] font-game-body font-semibold text-slate-500"
                      >
                        <StatIcon className="h-3.5 w-3.5" style={{ color: game.color }} />
                        <span>{stat.label}: {stat.value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => navigate(game.targetRoute)}
                  className={`btn-game w-full ${game.ctaColor}`}
                >
                  {game.cta} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
