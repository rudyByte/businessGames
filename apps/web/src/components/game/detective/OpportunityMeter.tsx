import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetectiveStore } from '../../../stores/detectiveStore';
import { Zap, Target, Sparkles } from 'lucide-react';

/* ─── Threshold labels ───────────────────────── */
const THRESHOLD_LABELS = [
  { at: 20, label: 'Curious', emoji: '👀' },
  { at: 40, label: 'Interested', emoji: '🔎' },
  { at: 60, label: 'Convinced', emoji: '💡' },
  { at: 80, label: 'On Fire', emoji: '🔥' },
  { at: 100, label: 'EUREKA!', emoji: '🎯' },
];

export default function OpportunityMeter() {
  const meter = useDetectiveStore(s => s.opportunityMeter);
  const thresholds = useDetectiveStore(s => s.opportunityThresholds);

  // Find current threshold
  const currentThreshold = THRESHOLD_LABELS.filter(t => meter >= t.at).pop();

  const isComplete = meter >= 100;

  // Color interpolation: starts teal, goes to orange and then gold
  const hue = 180 - (meter / 100) * 80; // 180° teal → 100° amber
  const saturation = 70 + (meter / 100) * 20;
  const lightness = 45 + (meter / 100) * 15;
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const glowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      <div className="text-center">
        <div className="text-[8px] font-game-body font-bold text-game-text-muted uppercase tracking-widest">
          Opportunity
        </div>
      </div>

      {/* Vertical meter */}
      <div className="relative w-4 h-32 bg-slate-800/50 rounded-full border border-slate-700/30 overflow-hidden">
        {/* Fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
          style={{
            background: `linear-gradient(to top, ${color}, ${isComplete ? '#FFD700' : color})`,
            boxShadow: `0 0 12px ${glowColor}`,
            height: `${meter}%`,
          }}
          animate={isComplete ? { boxShadow: [`0 0 12px ${glowColor}`, `0 0 24px ${glowColor}`, `0 0 12px ${glowColor}`] } : {}}
          transition={isComplete ? { duration: 1.5, repeat: Infinity } : {}}
        />

        {/* Threshold markers */}
        {thresholds.map((t, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              bottom: `${t}%`,
              backgroundColor: meter >= t ? color : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>

      {/* Percentage / Status */}
      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="eureka"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-1"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-game-yellow" />
            </motion.div>
            <span className="text-[8px] font-game-round font-bold text-game-yellow text-center leading-tight">
              EUREKA!<br />Opportunity Found!
            </span>
          </motion.div>
        ) : (
          <motion.div key="meter" className="text-center">
            <div className="text-xs font-game-score font-bold" style={{ color }}>
              {Math.round(meter)}%
            </div>
            {currentThreshold && (
              <div className="text-[7px] font-game-body text-game-text-muted mt-0.5">
                {currentThreshold.emoji} {currentThreshold.label}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse ring */}
      {isComplete && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${color}`, opacity: 0.3 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}
