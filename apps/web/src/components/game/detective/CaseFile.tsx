import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, CheckCircle, X, Target, Search, Trophy, ArrowRight } from 'lucide-react';

interface CaseFileProps {
  discoveredClues: (any & { source?: string })[];
  onClose: () => void;
  onSubmitRankings: (rankings: any[]) => void;
}

// Priority tier visuals
const PRIORITY_TIERS = [
  { level: 'S', label: 'Critical', color: 'red', desc: 'Huge impact, urgent fix', points: 5 },
  { level: 'A', label: 'High', color: 'orange', desc: 'Major opportunity', points: 4 },
  { level: 'B', label: 'Medium', color: 'yellow', desc: 'Worth exploring', points: 3 },
  { level: 'C', label: 'Low', color: 'gray', desc: 'Small improvement', points: 2 },
  { level: 'D', label: 'Ignore', color: 'zinc', desc: 'Not a real problem', points: 1 },
];

const TIER_STYLES: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  red: { border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500 text-white' },
  orange: { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500 text-white' },
  yellow: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500 text-black' },
  gray: { border: 'border-slate-500/40', bg: 'bg-slate-500/10', text: 'text-slate-400', badge: 'bg-slate-600 text-white' },
  zinc: { border: 'border-slate-700/40', bg: 'bg-slate-700/10', text: 'text-slate-600', badge: 'bg-slate-800 text-slate-400' },
};

export default function CaseFile({ discoveredClues, onClose, onSubmitRankings }: CaseFileProps) {
  const [priorities, setPriorities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    discoveredClues.forEach(cl => { initial[cl.id] = 2; }); // default to index 2 = B (Medium)
    return initial;
  });

  const [view, setView] = useState<'board' | 'review'>('board');

  const handleSetPriority = (clueId: string, tierIdx: number) => {
    setPriorities(prev => ({ ...prev, [clueId]: tierIdx }));
  };

  const handleSubmit = () => {
    const list = discoveredClues.map(cl => {
      const tierIdx = priorities[cl.id] ?? 2;
      const tier = PRIORITY_TIERS[tierIdx];
      const score = tier.points * 20;
      return {
        problemId: cl.id,
        size: tier.points,
        frequency: tier.points,
        solvability: 3,
        totalScore: score,
        priority: tier.level,
      };
    });
    setView('review');
  };

  const handleConfirm = () => {
    const list = discoveredClues.map(cl => {
      const tierIdx = priorities[cl.id] ?? 2;
      const tier = PRIORITY_TIERS[tierIdx];
      return {
        problemId: cl.id, size: tier.points, frequency: tier.points, solvability: 3, totalScore: tier.points * 20
      };
    });
    onSubmitRankings(list);
  };

  const totalScore = discoveredClues.reduce((sum, cl) => {
    const tierIdx = priorities[cl.id] ?? 2;
    return sum + PRIORITY_TIERS[tierIdx].points * 20;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-2xl p-6 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
              <Book className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">🔍 Evidence Board</h2>
              <p className="text-[10px] text-slate-500">{discoveredClues.length} clues to evaluate</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── BOARD VIEW: Rank clues by priority ─── */}
          {view === 'board' && (
            <motion.div key="board" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-y-auto space-y-4">
              {/* Priority Legend */}
              <div className="flex gap-1.5 pb-2">
                {PRIORITY_TIERS.map((tier, i) => {
                  const s = TIER_STYLES[tier.color];
                  return (
                    <div key={tier.level} className="flex-1 text-center p-2 rounded-lg border border-slate-800/60 bg-slate-900/40">
                      <div className={`w-6 h-6 rounded-full ${tier.color === 'red' ? 'bg-red-500' : tier.color === 'orange' ? 'bg-orange-500' : tier.color === 'yellow' ? 'bg-yellow-500' : tier.color === 'gray' ? 'bg-slate-500' : 'bg-slate-700'} flex items-center justify-center text-[10px] font-black mx-auto`}
                        style={{ color: tier.color === 'yellow' ? '#000' : '#fff' }}>
                        {tier.level}
                      </div>
                      <div className="text-[8px] text-slate-500 mt-1 uppercase font-bold">{tier.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Clue Cards */}
              {discoveredClues.length === 0 ? (
                <div className="text-center py-16 text-slate-600">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-xs">No clues yet. Explore the scene to find evidence!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {discoveredClues.map((cl, idx) => {
                    const tierIdx = priorities[cl.id] ?? 2;
                    const tier = PRIORITY_TIERS[tierIdx];
                    const style = TIER_STYLES[tier.color];
                    return (
                      <motion.div
                        key={cl.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`p-4 rounded-xl border ${style.border} ${style.bg} transition-all`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Priority Badge */}
                          <div className="flex flex-col items-center gap-1">
                            {PRIORITY_TIERS.map((t, i) => {
                              const isActive = tierIdx === i;
                              return (
                                <button
                                  key={t.level}
                                  onClick={() => handleSetPriority(cl.id, i)}
                                  className={`w-7 h-5 rounded text-[9px] font-black transition-all ${
                                    isActive
                                      ? t.color === 'red' ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30' :
                                        t.color === 'orange' ? 'bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/30' :
                                        t.color === 'yellow' ? 'bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/30' :
                                        t.color === 'gray' ? 'bg-slate-500 text-white scale-110' :
                                        'bg-slate-700 text-slate-400 scale-110'
                                      : 'bg-slate-800 text-slate-600 hover:bg-slate-700 hover:text-slate-300'
                                  }`}
                                  title={t.label}
                                >
                                  {t.level}
                                </button>
                              );
                            })}
                          </div>

                          {/* Clue Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${style.text} bg-slate-900/60`}>
                                #{idx + 1}
                              </span>
                              <h4 className="font-bold text-sm text-white">{cl.title}</h4>
                              <span className={`text-[9px] ml-auto ${cl.source === 'npc' ? 'text-blue-400' : 'text-green-400'} flex items-center gap-0.5`}>
                                {cl.source === 'npc' ? '💬 NPC' : '🔍 Found'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{cl.desc}</p>
                            
                            {/* Priority label */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${style.text}`}>
                                {tier.label} Priority
                              </span>
                              <span className="text-[9px] text-slate-600">{tier.desc}</span>
                            </div>
                          </div>

                          {/* Score preview */}
                          <div className="text-right shrink-0">
                            <div className="text-[9px] text-slate-500 uppercase font-bold">Score</div>
                            <div className={`text-lg font-black ${style.text}`}>{tier.points * 20}%</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {discoveredClues.length > 0 && (
                <motion.button
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-amber-500/20"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Target className="h-4 w-4" />
                  Review Rankings <ArrowRight className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ─── REVIEW VIEW: Summary + Confirm ─── */}
          {view === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 overflow-y-auto space-y-6">
              {/* Score banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900/60 border border-slate-700/50 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-16 h-16 mx-auto bg-amber-600/20 border border-amber-500/30 rounded-full flex items-center justify-center mb-3">
                  <Trophy className="h-8 w-8 text-amber-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white font-display">Opportunity Assessment</h3>
                <p className="text-slate-400 text-xs mt-1">Your problem ranking summary</p>
                
                <div className="flex justify-center gap-6 mt-4">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Clues Evaluated</div>
                    <div className="text-2xl font-black text-white">{discoveredClues.length}</div>
                  </div>
                  <div className="w-px bg-slate-700" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Total Score</div>
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="text-2xl font-black text-amber-400"
                    >
                      {totalScore}%
                    </motion.div>
                  </div>
                  <div className="w-px bg-slate-700" />
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Avg Priority</div>
                    <div className="text-2xl font-black text-white">
                      {PRIORITY_TIERS[Math.round(discoveredClues.reduce((s, cl) => s + (priorities[cl.id] ?? 2), 0) / discoveredClues.length)].level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ranking list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Rankings</h4>
                {[...discoveredClues]
                  .sort((a, b) => (priorities[b.id] ?? 2) - (priorities[a.id] ?? 2))
                  .map((cl, idx) => {
                    const tierIdx = priorities[cl.id] ?? 2;
                    const tier = PRIORITY_TIERS[tierIdx];
                    const style = TIER_STYLES[tier.color];
                    return (
                      <motion.div
                        key={cl.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${style.badge}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-white">{cl.title}</div>
                          <div className="text-[10px] text-slate-500">{cl.desc.slice(0, 60)}...</div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black ${style.badge}`}>
                          {tier.level} · {tier.points * 20}%
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  onClick={() => setView('board')}
                  className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  ↩️ Re-rank Clues
                </motion.button>
                <motion.button
                  onClick={handleConfirm}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-amber-600 to-green-600 hover:from-amber-700 hover:to-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-amber-500/20"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Submit Report
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
