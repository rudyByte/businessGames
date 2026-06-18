import React from 'react';
import { motion } from 'framer-motion';
import { useDetectiveStore, useDetectiveDerived } from '../../../stores/detectiveStore';
import { Clock, Zap } from 'lucide-react';

export default function RushTimer() {
  const rushActive = useDetectiveStore(s => s.rushActive);
  const rushTimeRemaining = useDetectiveStore(s => s.rushTimeRemaining);
  const rushMultiplier = useDetectiveStore(s => s.rushMultiplier);
  const { isRushUrgent, isRushCritical } = useDetectiveDerived();

  if (!rushActive) return null;

  const minutes = Math.floor(rushTimeRemaining / 60);
  const seconds = rushTimeRemaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm"
      style={{
        borderColor: isRushCritical
          ? 'rgba(239,68,68,0.3)'
          : isRushUrgent
          ? 'rgba(251,191,36,0.3)'
          : 'rgba(78,205,196,0.2)',
        backgroundColor: isRushCritical
          ? 'rgba(239,68,68,0.12)'
          : isRushUrgent
          ? 'rgba(251,191,36,0.1)'
          : 'rgba(78,205,196,0.08)',
      }}
    >
      <motion.div
        animate={isRushCritical ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <Clock className={`h-3.5 w-3.5 ${
          isRushCritical ? 'text-red-400' : isRushUrgent ? 'text-yellow-400' : 'text-game-teal'
        }`} />
      </motion.div>

      <div className="flex items-center gap-1.5">
        <span className={`font-game-score font-bold text-xs ${
          isRushCritical ? 'text-red-400' : isRushUrgent ? 'text-yellow-400' : 'text-white'
        }`}>
          {timeStr}
        </span>
        <span className="text-[9px] font-game-body font-bold text-game-text-muted">
          / 5:00
        </span>
      </div>

      {/* Multiplier badge */}
      {rushMultiplier > 1 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-game-score font-bold"
          style={{
            backgroundColor: rushMultiplier >= 3
              ? 'rgba(239,68,68,0.2)'
              : 'rgba(251,191,36,0.2)',
            color: rushMultiplier >= 3 ? '#F87171' : '#FBBF24',
          }}
        >
          <Zap className="h-3 w-3" />
          x{rushMultiplier} XP
        </motion.div>
      )}

      {/* Rush label */}
      <div className="hidden sm:block text-[8px] font-game-body font-bold text-game-text-muted uppercase tracking-wider">
        {rushMultiplier > 1
          ? `Rush Hour — ${rushMultiplier}x XP!`
          : 'Normal XP'}
      </div>
    </motion.div>
  );
}
