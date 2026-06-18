import React from 'react';
import { motion } from 'framer-motion';

interface GhostData {
  name: string;
  status: string;
  color: string;
  x: number;
  y: number;
}

interface ClassmateGhostsProps {
  ghosts: GhostData[];
}

const ghostColors: Record<string, string> = {
  purple: '#A78BFA',
  pink: '#F472B6',
  teal: '#2DD4BF',
  blue: '#60A5FA',
  orange: '#FB923C',
};

export default function ClassmateGhosts({ ghosts }: ClassmateGhostsProps) {
  if (!ghosts || ghosts.length === 0) return null;

  return (
    <>
      {ghosts.map((ghost, i) => {
        const color = ghostColors[ghost.color as keyof typeof ghostColors] || ghostColors.purple;
        const delay = i * 1.5;
        const driftDuration = 6 + i * 1.5;

        return (
          <motion.div
            key={i}
            className="absolute z-20 cursor-pointer group"
            style={{ left: `${ghost.x}%`, top: `${ghost.y}%` }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [0, 10, -5, 0],
              y: [0, -5, 5, 0],
            }}
            transition={{
              duration: driftDuration,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          >
            {/* Ghost SVG */}
            <svg width="32" height="38" viewBox="0 0 24 28" fill="none" className="drop-shadow-lg">
              {/* Ghost body */}
              <path
                d="M12 2C6.5 2 2 6.5 2 12V22L5 19L8 22L11 19L14 22L17 19L20 22L22 19V12C22 6.5 17.5 2 12 2Z"
                fill={color}
                opacity="0.85"
              />
              {/* Eyes */}
              <circle cx="8" cy="10" r="2.5" fill="#1E293B" />
              <circle cx="16" cy="10" r="2.5" fill="#1E293B" />
              {/* Eye shine */}
              <circle cx="9" cy="9" r="1" fill="white" opacity="0.7" />
              <circle cx="17" cy="9" r="1" fill="white" opacity="0.7" />
              {/* Blush */}
              <ellipse cx="6" cy="13" rx="2" ry="1.5" fill="white" opacity="0.2" />
              <ellipse cx="18" cy="13" rx="2" ry="1.5" fill="white" opacity="0.2" />
              {/* Wave border at bottom */}
              <path
                d="M2 22C2 22 4 20.5 6 22C8 23.5 10 20.5 12 22C14 23.5 16 20.5 18 22C20 23.5 22 22 22 22"
                fill={color}
                opacity="0.85"
              />
            </svg>

            {/* Tooltip */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
              <div className="bg-game-deep/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                <p className="text-xs font-game-body font-bold text-white">{ghost.name}</p>
                <p className="text-[10px] text-slate-400">{ghost.status}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
