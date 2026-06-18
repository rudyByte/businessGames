import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetectiveStore } from '../../../stores/detectiveStore';
import { Sword, User, X, Zap, Trophy, Crown } from 'lucide-react';

export default function RivalBanner() {
  const rivalEnabled = useDetectiveStore(s => s.rivalEnabled);
  const rivalMeera = useDetectiveStore(s => s.rivalMeera);
  const rivalMessage = useDetectiveStore(s => s.rivalMessage);
  const rivalBeatMessage = useDetectiveStore(s => s.rivalBeatMessage);
  const totalFound = useDetectiveStore(s => s.totalFoundThisSession);
  const dismissRivalMessage = useDetectiveStore(s => s.dismissRivalMessage);
  const dismissRivalBeat = useDetectiveStore(s => s.dismissRivalBeat);

  if (!rivalEnabled) return null;

  const playerAhead = totalFound > rivalMeera.meeraClues;
  const meeraAhead = rivalMeera.meeraClues > totalFound;
  const tied = totalFound === rivalMeera.meeraClues && totalFound > 0;
  const beatCount = Math.max(0, rivalMeera.beatCount);

  return (
    <>
      {/* Rival sidebar indicator */}
      <div className="flex flex-col items-center gap-2">
        {/* Meera avatar */}
        <div className="relative">
          <motion.div
            animate={meeraAhead ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm ${
              playerAhead
                ? 'border-game-success/30 bg-game-success/10'
                : meeraAhead
                ? 'border-game-danger/30 bg-game-danger/10'
                : 'border-slate-600/30 bg-slate-800/50'
            }`}
          >
            <Sword className={`h-5 w-5 ${
              playerAhead ? 'text-game-success' : meeraAhead ? 'text-game-danger' : 'text-slate-500'
            }`} />
          </motion.div>

          {/* Status dot */}
          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-game-dark ${
            meeraAhead ? 'bg-game-danger animate-pulse' : 'bg-slate-600'
          }`} />
        </div>

        {/* Label */}
        <div className="text-center">
          <div className="text-[7px] font-game-body font-bold text-game-text-muted uppercase tracking-wider">
            Rival
          </div>
          <div className="text-[9px] font-game-body font-bold text-white">
            Meera
          </div>
        </div>

        {/* Score comparison */}
        <div className="flex items-center gap-1">
          <div className="text-[10px] font-game-score font-bold text-game-teal">
            {totalFound}
          </div>
          <div className="text-[8px] text-slate-600">vs</div>
          <div className={`text-[10px] font-game-score font-bold ${
            meeraAhead ? 'text-game-danger' : 'text-slate-500'
          }`}>
            {rivalMeera.meeraClues}
          </div>
        </div>

        {/* Beat count */}
        {beatCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-game-yellow/10 border border-game-yellow/20">
            <Trophy className="h-3 w-3 text-game-yellow" />
            <span className="text-[7px] font-game-body font-bold text-game-yellow">
              Beat {beatCount}x
            </span>
          </div>
        )}
      </div>

      {/* Rival popup message */}
      <AnimatePresence>
        {rivalMessage && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            className="fixed top-20 right-6 z-50 max-w-xs"
          >
            <div
              className="p-3 rounded-xl border backdrop-blur-md shadow-2xl"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderColor: 'rgba(239,68,68,0.25)',
              }}
            >
              <div className="flex items-start gap-2">
                <Sword className="h-4 w-4 text-game-danger shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[11px] font-game-body text-slate-200 leading-relaxed">
                    {rivalMessage}
                  </p>
                  <button
                    onClick={dismissRivalMessage}
                    className="mt-2 text-[9px] font-game-body font-bold text-game-text-muted hover:text-white transition-colors"
                  >
                    Keep going! →
                  </button>
                </div>
                <button
                  onClick={dismissRivalMessage}
                  className="p-0.5 text-slate-500 hover:text-white rounded transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beat Meera celebration */}
      <AnimatePresence>
        {rivalBeatMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="flex items-center gap-3 px-6 py-3 rounded-2xl border-2 backdrop-blur-md shadow-2xl"
              style={{
                borderColor: 'rgba(6,214,160,0.3)',
                backgroundColor: 'rgba(6,214,160,0.1)',
                boxShadow: '0 0 30px rgba(6,214,160,0.2)',
              }}
            >
              <Crown className="h-6 w-6 text-game-yellow" />
              <div>
                <p className="text-sm font-game-round font-bold text-white">
                  You beat Detective Meera! 🏆
                </p>
                <p className="text-[9px] font-game-body text-game-text-muted">
                  You're the better detective!
                </p>
              </div>
              <button
                onClick={dismissRivalBeat}
                className="p-1 text-slate-500 hover:text-white rounded transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
