import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Assessment,
  AssessmentResult,
  calculateGrade,
  DragDropSortAssessment,
  SwipeDecisionAssessment,
  BuildTheAnswerAssessment,
  HotspotClickAssessment,
  RapidFireEmojiAssessment,
  PriceNegotiationAssessment,
} from '../../../lib/assessmentTypes';
import DragDropSort from './DragDropSort';
import SwipeDecision from './SwipeDecision';
import BuildTheAnswer from './BuildTheAnswer';
import HotspotClick from './HotspotClick';
import RapidFireEmoji from './RapidFireEmoji';
import PriceNegotiation from './PriceNegotiation';
import { X, Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  assessment: Assessment;
  onComplete: (result: AssessmentResult) => void;
  onClose?: () => void;
  onRetry?: () => void;
}

export default function AssessmentEngine({ assessment, onComplete, onClose, onRetry }: Props) {
  const startTime = Date.now();
  const [phase, setPhase] = React.useState<'context' | 'active' | 'result'>('context');
  const [result, setResult] = React.useState<AssessmentResult | null>(null);

  const handleComplete = (res: AssessmentResult) => {
    setResult(res);
    setPhase('result');
  };

  const handleContinue = () => {
    if (result) onComplete(result);
  };

  const handleRetry = () => {
    setPhase('context');
    setResult(null);
  };

  const renderAssessment = () => {
    switch (assessment.type) {
      case 'drag-drop-sort':
        return <DragDropSort assessment={assessment as DragDropSortAssessment} onComplete={handleComplete} startTime={startTime} />;
      case 'swipe-decision':
        return <SwipeDecision assessment={assessment as SwipeDecisionAssessment} onComplete={handleComplete} startTime={startTime} />;
      case 'build-the-answer':
        return <BuildTheAnswer assessment={assessment as BuildTheAnswerAssessment} onComplete={handleComplete} startTime={startTime} />;
      case 'hotspot-click':
        return <HotspotClick assessment={assessment as HotspotClickAssessment} onComplete={handleComplete} startTime={startTime} />;
      case 'rapid-fire-emoji':
        return <RapidFireEmoji assessment={assessment as RapidFireEmojiAssessment} onComplete={handleComplete} startTime={startTime} />;
      case 'price-negotiation':
        return <PriceNegotiation assessment={assessment as PriceNegotiationAssessment} onComplete={handleComplete} startTime={startTime} />;
      default:
        return <div className="text-center text-slate-500 py-12">Unknown assessment type</div>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ─── Context / Briefing ─── */}
        {phase === 'context' && assessment.context && (
          <motion.div
            key="context"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center p-8">
              <span className="text-5xl block mb-4">{assessment.emoji}</span>
              <h2 className="text-xl font-bold text-white font-display mb-2">{assessment.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
                {assessment.context}
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
                <span>🎯 {assessment.type.replace(/-/g, ' ')}</span>
                <span>⭐ {assessment.pointsPerCorrect} XP each</span>
                {'timeLimit' in assessment && assessment.timeLimit && (
                  <span>⏱️ {assessment.timeLimit}s</span>
                )}
              </div>
            </div>
            <motion.button
              onClick={() => setPhase('active')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm border border-purple-500/20 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🚀 Start Challenge
            </motion.button>
          </motion.div>
        )}

        {/* ─── Active Assessment ─── */}
        {phase === 'context' && !assessment.context && (
          <motion.div key="active-direct" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {renderAssessment()}
          </motion.div>
        )}
        {phase === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderAssessment()}
          </motion.div>
        )}

        {/* ─── Results ─── */}
        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Grade */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-3 shadow-xl"
              >
                <Trophy className="h-8 w-8 text-white" />
              </motion.div>
              {(() => {
                const grade = calculateGrade(result.score, result.maxScore);
                return (
                  <>
                    <div className={`text-5xl font-black ${grade.color}`}>{grade.letter}</div>
                    <div className="text-lg font-bold text-white mt-1">{grade.label}</div>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{grade.feedback}</p>
                  </>
                );
              })()}
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl text-center">
                <Star className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-[9px] text-slate-500 uppercase font-bold">Score</div>
                <div className="text-lg font-bold text-white">{result.score}/{result.maxScore}</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl text-center">
                <Trophy className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                <div className="text-[9px] text-slate-500 uppercase font-bold">Correct</div>
                <div className="text-lg font-bold text-white">{result.correctCount}/{result.totalCount}</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl text-center">
                <div className="text-lg mx-auto mb-1">⏱️</div>
                <div className="text-[9px] text-slate-500 uppercase font-bold">Time</div>
                <div className="text-lg font-bold text-white">{Math.round(result.timeSpent / 1000)}s</div>
              </div>
            </div>

            {/* Result message */}
            {result.feedback && (
              <div className={`p-3 rounded-xl text-xs text-center ${
                result.passed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {result.feedback}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {onRetry && (
                <motion.button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </motion.button>
              )}
              <motion.button
                onClick={handleContinue}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 text-white font-bold text-sm border border-purple-500/20 shadow-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {result.passed ? '🏆 Continue' : '📚 Review & Continue'} <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
