import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetectiveStore } from '../../../stores/detectiveStore';
import { Lightbulb, UserCheck, Star, Sparkles, X } from 'lucide-react';

/* ─── Sample entrepreneur comparisons ────────── */
const SAMPLE_COMPARISONS = [
  {
    studentProblem: 'Long queue at the canteen — students miss recess',
    realFounder: '"Nobody could find restaurant menus online" — Deepinder Goyal',
    founderName: 'Deepinder Goyal (Zomato)',
    rating: 'GREAT THINKING! Similar observation to a real founder!',
    color: '#FF6B35',
  },
  {
    studentProblem: 'Water cooler empty during summer heat',
    realFounder: '"People needed clean drinking water everywhere" — Manish Gupta',
    founderName: 'Manish Gupta (DrinkPrime)',
    rating: 'EXCELLENT! You spotted a hydration problem!',
    color: '#4ECDC4',
  },
  {
    studentProblem: 'Paper notices go unread — information gap',
    realFounder: '"Schools needed a better way to communicate" — Kunal Shah',
    founderName: 'Kunal Shah (Cred/FreeCharge)',
    rating: 'OUTSTANDING! Information gaps = business opportunities!',
    color: '#FFE66D',
  },
];

export default function CompareReveal() {
  const data = useDetectiveStore(s => s.compareRevealData);
  const dismissCompareReveal = useDetectiveStore(s => s.dismissCompareReveal);

  // Pick a random comparison or use data
  const comparison = data?.realFounder
    ? { ...data, color: '#FF6B35' }
    : SAMPLE_COMPARISONS[Math.floor(Math.random() * SAMPLE_COMPARISONS.length)];

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
        >
          <div
            className="relative rounded-2xl p-5 border shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
              borderColor: 'rgba(255,107,53,0.3)',
              boxShadow: '0 0 40px rgba(255,107,53,0.1)',
            }}
          >
            {/* Close */}
            <button
              onClick={dismissCompareReveal}
              className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-game-yellow" />
                <span className="text-[10px] font-game-score font-bold text-game-yellow uppercase tracking-widest">
                  Entrepreneur Connection
                </span>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-3">
                {/* Student side */}
                <div className="p-3 rounded-xl bg-game-dark/60 border border-game-orange/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <UserCheck className="h-3 w-3 text-game-orange" />
                    <span className="text-[8px] font-game-body font-bold text-game-orange uppercase tracking-wider">
                      You See
                    </span>
                  </div>
                  <p className="text-[11px] font-game-body text-white leading-relaxed">
                    {comparison.studentProblem}
                  </p>
                </div>

                {/* Founder side */}
                <div className="p-3 rounded-xl bg-game-dark/60 border border-game-teal/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="h-3 w-3 text-game-teal" />
                    <span className="text-[8px] font-game-body font-bold text-game-teal uppercase tracking-wider">
                      Real Founder
                    </span>
                  </div>
                  <p className="text-[11px] font-game-body text-white leading-relaxed italic">
                    {comparison.realFounder}
                  </p>
                </div>
              </div>

              {/* Founder name */}
              <div className="text-[9px] font-game-body text-game-text-muted text-center">
                — {comparison.founderName}
              </div>

              {/* Rating */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(78,205,196,0.05) 100%)',
                  border: '1px solid rgba(255,107,53,0.2)',
                }}
              >
                <Sparkles className="h-4 w-4 text-game-yellow" />
                <span className="text-[10px] font-game-round font-bold text-white">
                  {comparison.rating}
                </span>
                <Sparkles className="h-4 w-4 text-game-yellow" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
