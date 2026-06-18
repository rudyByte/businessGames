import React from 'react';
import { motion } from 'framer-motion';
import { useDetectiveStore } from '../../../stores/detectiveStore';
import { Compass, Radio } from 'lucide-react';

export default function DetectiveRadar() {
  const pulse = useDetectiveStore(s => s.radarPulse);
  const nearestId = useDetectiveStore(s => s.nearestHotspotId);
  const hotspotPositions = useDetectiveStore(s => s.hotspotPositions);

  // Determine beep frequency based on pulse intensity
  const beepHz = 0.5 + pulse * 4; // 0.5Hz (far) to 4.5Hz (very close)
  const beepDuration = 1 / beepHz;

  // Color shifts from cyan (far) to orange (close)
  const hue = 190 - pulse * 120; // 190° cyan → 70° orange
  const saturation = 70 + pulse * 30;
  const lightness = 50 + pulse * 10;
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  // Ring scale
  const ringScale = 0.6 + pulse * 0.4;
  const ringOpacity = 0.15 + pulse * 0.35;

  // Nearest hotspot name
  const nearestHotspot = nearestId
    ? hotspotPositions.find(h => h.id === nearestId)
    : null;

  const isHot = pulse > 0.6;
  const isVeryHot = pulse > 0.85;

  return (
    <div className="relative flex flex-col items-center">
      {/* Radar Circle */}
      <div className="relative w-20 h-20">
        {/* Background ring */}
        <div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: `hsla(190, 60%, 50%, 0.3)`,
            background: `radial-gradient(circle, hsla(190, 60%, 50%, 0.05) 0%, transparent 70%)`,
          }}
        />

        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${color}`,
            opacity: ringOpacity,
            scale: ringScale,
          }}
          animate={{
            scale: [ringScale, ringScale * 1.3, ringScale],
            opacity: [ringOpacity, ringOpacity * 0.5, ringOpacity],
          }}
          transition={{
            duration: beepDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Inner pulse ring (second ring for visual depth) */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${color}`,
            opacity: ringOpacity * 0.5,
          }}
          animate={{
            scale: [ringScale * 0.8, ringScale * 1.5, ringScale * 0.8],
            opacity: [ringOpacity * 0.3, 0, ringOpacity * 0.3],
          }}
          transition={{
            duration: beepDuration * 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
          animate={isVeryHot ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        />

        {/* Compass icon */}
        <Compass
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        />
      </div>

      {/* Label */}
      <div className="mt-2 text-center">
        <div
          className="text-[8px] font-game-body font-bold uppercase tracking-widest transition-colors duration-300"
          style={{ color }}
        >
          {pulse === 0 ? 'Scanning...' : isVeryHot ? 'Very Hot!' : isHot ? 'Warm!' : 'Cold'}
        </div>
        {nearestId && pulse > 0.3 && (
          <div className="text-[7px] text-slate-500 mt-0.5 font-game-body">
            {nearestId.replace(/_/g, ' ')}
          </div>
        )}
        {/* Signal bars */}
        <div className="flex items-center justify-center gap-0.5 mt-1">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className="w-1 rounded-full transition-all duration-300"
              style={{
                height: `${4 + bar * 3}px`,
                backgroundColor: pulse >= bar * 0.25 ? color : 'rgba(255,255,255,0.1)',
                boxShadow: pulse >= bar * 0.25 ? `0 0 4px ${color}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Beep indicator */}
      <motion.div
        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
        style={{ backgroundColor: pulse > 0 ? color : 'transparent' }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: beepDuration, repeat: Infinity }}
      />
    </div>
  );
}
