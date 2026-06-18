import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildTheAnswerAssessment, AssessmentResult, createDefaultResult } from '../../../lib/assessmentTypes';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface Props {
  assessment: BuildTheAnswerAssessment;
  onComplete: (result: AssessmentResult) => void;
  startTime: number;
}

export default function BuildTheAnswer({ assessment, onComplete, startTime }: Props) {
  const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({});
  const [shuffledTiles, setShuffledTiles] = useState(() =>
    assessment.blanks.map(b => ({
      blankId: b.id,
      tiles: [...b.tiles].sort(() => Math.random() - 0.5),
    }))
  );
  const [showResult, setShowResult] = useState(false);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'correct' | 'wrong' | null>>({});

  const allFilled = assessment.blanks.every(b => filledBlanks[b.id]);
  const correctCount = assessment.blanks.filter(b => filledBlanks[b.id] === b.correctTileId).length;

  const handleTileClick = (blankId: string, tileId: string) => {
    if (showResult) return;
    const isCorrect = tileId === assessment.blanks.find(b => b.id === blankId)?.correctTileId;

    setFilledBlanks(prev => ({ ...prev, [blankId]: tileId }));
    setFeedbackState(prev => ({ ...prev, [blankId]: isCorrect ? 'correct' : 'wrong' }));
    setTimeout(() => setFeedbackState(prev => ({ ...prev, [blankId]: null })), 1000);

    // Check if all filled now
    const updated = { ...filledBlanks, [blankId]: tileId };
    const allDone = assessment.blanks.every(b => updated[b.id]);
    if (allDone) {
      setShowResult(true);
      const correct = assessment.blanks.filter(b => updated[b.id] === b.correctTileId).length;
      const result = createDefaultResult(assessment, Date.now() - startTime);
      result.score = correct * assessment.pointsPerCorrect;
      result.correctCount = correct;
      result.answers = { filledBlanks: updated };
      result.passed = correct >= Math.ceil(assessment.blanks.length * 0.6);
      setTimeout(() => onComplete(result), 1500);
    }
  };

  const handleRemoveTile = (blankId: string) => {
    if (showResult) return;
    const tileId = filledBlanks[blankId];
    if (!tileId) return;
    setFilledBlanks(prev => {
      const next = { ...prev };
      delete next[blankId];
      return next;
    });
    setFeedbackState(prev => ({ ...prev, [blankId]: null }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <span className="text-4xl block mb-2">{assessment.emoji}</span>
        <h3 className="text-lg font-bold text-white">{assessment.title}</h3>
        <p className="text-xs text-slate-400 mt-1">{assessment.instructions}</p>
      </div>

      {/* Sentence template */}
      <div className="p-6 bg-slate-900/60 border border-slate-800/40 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 justify-center text-base text-slate-200 leading-relaxed font-medium">
          {assessment.template.split(/(___)/g).map((part, i) => {
            if (part !== '___') {
              return <span key={i}>{part}</span>;
            }
            // Find which blank corresponds to this position
            const blankIdx = assessment.template.split(/(___)/g).filter((_, idx) => idx < i && _ === '___').length;
            const blank = assessment.blanks[blankIdx];
            if (!blank) return <span key={i}>___</span>;

            const filledTileId = filledBlanks[blank.id];
            const filledTile = filledTileId ? blank.tiles.find(t => t.id === filledTileId) : null;
            const feedback = feedbackState[blank.id];

            return (
              <motion.button
                key={blank.id}
                layout
                onClick={() => filledTile && handleRemoveTile(blank.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 min-w-[100px] transition-all ${
                  feedback === 'correct' ? 'border-green-500/50 bg-green-500/10 text-green-300' :
                  feedback === 'wrong' ? 'border-red-500/50 bg-red-500/10 text-red-300 animate-shake' :
                  filledTile ? 'border-purple-500/40 bg-purple-500/10 text-purple-300 cursor-pointer hover:border-red-400/30' :
                  'border-dashed border-slate-700/60 bg-slate-800/30 text-slate-500'
                }`}
                whileHover={filledTile ? { scale: 1.05 } : {}}
                whileTap={filledTile ? { scale: 0.95 } : {}}
              >
                {filledTile ? (
                  <>
                    <span>{filledTile.text}</span>
                    <span className="text-[9px] opacity-60">✕</span>
                  </>
                ) : (
                  <span className="text-xs italic">{blank.placeholder}</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Word tile pools (below each blank) */}
      <div className="grid grid-cols-1 gap-4">
        {assessment.blanks.map(blank => {
          const blankTiles = shuffledTiles.find(st => st.blankId === blank.id);
          const isFilled = !!filledBlanks[blank.id];
          return (
            <div key={blank.id} className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-[9px] text-slate-500 font-semibold uppercase mb-2">
                {blank.placeholder}
              </div>
              <div className="flex flex-wrap gap-2">
                {blankTiles?.tiles.map(tile => {
                  const isUsed = filledBlanks[blank.id] === tile.id;
                  const isCorrect = tile.id === blank.correctTileId;
                  return (
                    <motion.button
                      key={tile.id}
                      layout
                      onClick={() => !isUsed && handleTileClick(blank.id, tile.id)}
                      disabled={isUsed || showResult}
                      className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                        isUsed
                          ? isCorrect
                            ? 'border-green-500/30 bg-green-500/10 text-green-400 opacity-50'
                            : 'border-red-500/30 bg-red-500/10 text-red-400 opacity-50'
                          : 'border-slate-700/60 bg-slate-800/60 text-slate-200 hover:border-purple-500/40 hover:bg-purple-500/10'
                      }`}
                      whileHover={!isUsed ? { scale: 1.05 } : {}}
                      whileTap={!isUsed ? { scale: 0.95 } : {}}
                    >
                      {tile.text}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        {assessment.blanks.map(b => (
          <div
            key={b.id}
            className={`w-8 h-1.5 rounded-full ${
              filledBlanks[b.id] ? (feedbackState[b.id] === 'correct' ? 'bg-green-500' : 'bg-purple-500') : 'bg-slate-700'
            }`}
          />
        ))}
        <span className="ml-2">{Object.keys(filledBlanks).length}/{assessment.blanks.length} filled · {correctCount} correct</span>
      </div>
    </div>
  );
}
