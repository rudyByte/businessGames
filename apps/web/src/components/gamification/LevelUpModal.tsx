import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Award, X } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  useEffect(() => {
    // Trigger celebratory confetti burst on render
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#3b82f6', '#facc15']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#3b82f6', '#facc15']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [level]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-sans text-xs">
      <div className="max-w-sm w-full glass-panel-heavy p-6 md:p-8 rounded-2xl border-2 border-purple-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden animate-zoomIn">
        
        {/* Glow behind */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="flex justify-between items-center z-10 relative">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Level Up Celebration</span>
          <button onClick={onClose} className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="space-y-4 relative z-10 pt-4">
          <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 text-purple-400 flex items-center justify-center text-3xl font-extrabold mx-auto shadow-lg shadow-purple-500/10">
            {level}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-white">Level Up!</h2>
            <p className="text-slate-400">You have advanced to Student Level {level}!</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl text-left text-slate-350 space-y-2 relative z-10">
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block">Level Rewards Unlocked:</span>
          <ul className="space-y-1 list-disc list-inside text-[11px]">
            <li>New custom SVG Uniform style option</li>
            <li>+50 Bonus Virtual Coins</li>
            <li>Unlock advanced Chapter 3 Quests</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-purple-650 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl border border-purple-500/20 transition-colors relative z-10"
        >
          Keep Learning!
        </button>
      </div>
    </div>
  );
}
