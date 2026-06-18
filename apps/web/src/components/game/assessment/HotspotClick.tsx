import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HotspotClickAssessment, AssessmentResult, createDefaultResult } from '../../../lib/assessmentTypes';
import { Timer, Target, Zap } from 'lucide-react';

interface Props {
  assessment: HotspotClickAssessment;
  onComplete: (result: AssessmentResult) => void;
  startTime: number;
}

export default function HotspotClick({ assessment, onComplete, startTime }: Props) {
  const [foundCorrect, setFoundCorrect] = useState<string[]>([]);
  const [wrongClicks, setWrongClicks] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimit);
  const [feedback, setFeedback] = useState<{ id: string; type: 'correct' | 'wrong' } | null>(null);
  const [finished, setFinished] = useState(false);

  const correctHotspots = assessment.hotspots.filter(h => h.isCorrect);
  const incorrectHotspots = assessment.hotspots.filter(h => !h.isCorrect);

  const finishAssessment = useCallback(() => {
    setFinished(true);
    const result = createDefaultResult(assessment, Date.now() - startTime);
    result.score = foundCorrect.length * assessment.pointsPerCorrect;
    result.correctCount = foundCorrect.length;
    result.totalCount = assessment.totalRounds;
    result.answers = { found: foundCorrect, wrong: wrongClicks };
    result.passed = foundCorrect.length >= Math.ceil(assessment.totalRounds * 0.5);
    setTimeout(() => onComplete(result), 500);
  }, [foundCorrect, wrongClicks, assessment, startTime, onComplete]);

  // Timer — uses ref to avoid stale closure
  const finishAssessmentRef = useRef(finishAssessment);
  finishAssessmentRef.current = finishAssessment;

  useEffect(() => {
    if (finished || foundCorrect.length >= assessment.totalRounds) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); finishAssessmentRef.current(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [finished, foundCorrect.length, assessment.totalRounds]);

  const handleHotspotClick = (hotspotId: string) => {
    if (finished || feedback) return;
    const hotspot = assessment.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;

    if (hotspot.isCorrect) {
      if (foundCorrect.includes(hotspotId)) return;
      setFoundCorrect(prev => [...prev, hotspotId]);
      setFeedback({ id: hotspotId, type: 'correct' });
    } else {
      setWrongClicks(prev => [...prev, hotspotId]);
      setFeedback({ id: hotspotId, type: 'wrong' });
    }

    setTimeout(() => setFeedback(null), 1000);

    if (hotspot.isCorrect && foundCorrect.length + 1 >= assessment.totalRounds) {
      setTimeout(() => finishAssessment(), 600);
    }
  };

  const remaining = assessment.totalRounds - foundCorrect.length;
  const pctComplete = (foundCorrect.length / assessment.totalRounds) * 100;

  if (finished) {
    return (
      <div className="flex items-center justify-center h-48">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg font-bold text-green-400">
          Calculating results...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          <span className="text-sm font-bold text-white">Find the Opportunity</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Zap className={`h-4 w-4 ${remaining <= 2 ? 'text-green-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="font-bold text-white">{foundCorrect.length}/{assessment.totalRounds}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${timeLeft <= 5 ? 'text-red-400' : 'text-slate-400'}`}>
            <Timer className={`h-4 w-4 ${timeLeft <= 5 ? 'animate-pulse' : ''}`} />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pctComplete}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Scene description */}
      {assessment.sceneImage && (
        <div className="text-center text-xs text-slate-500 italic mb-2">{assessment.sceneImage}</div>
      )}

      {/* Hotspot grid */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/60 overflow-hidden">
        {/* Background hint */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-2 opacity-30">🏪</div>
            <p className="text-slate-600 text-xs">Market Scene — find {remaining} business opportunities</p>
          </div>
        </div>

        {/* Hotspots */}
        {assessment.hotspots.map(hotspot => {
          const isCorrect = foundCorrect.includes(hotspot.id);
          const isWrong = wrongClicks.includes(hotspot.id);
          const isCurrentFeedback = feedback?.id === hotspot.id;

          return (
            <motion.button
              key={hotspot.id}
              onClick={() => handleHotspotClick(hotspot.id)}
              disabled={isCorrect || isWrong || !!feedback}
              className={`absolute rounded-xl border-2 transition-all ${
                isCorrect ? 'border-green-500 bg-green-500/20 ring-2 ring-green-500/30' :
                isWrong ? 'border-red-500 bg-red-500/10' :
                'border-slate-700/40 bg-slate-800/60 hover:border-purple-500/40 hover:bg-purple-500/10'
              }`}
              style={{
                left: `${hotspot.x}%`, top: `${hotspot.y}%`,
                width: '14%', height: '14%',
                transform: 'translate(-50%, -50%)',
              }}
              whileHover={!isCorrect && !isWrong ? { scale: 1.1 } : {}}
              whileTap={!isCorrect && !isWrong ? { scale: 0.95 } : {}}
            >
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-center p-1">
                {isCorrect ? '✅' : isWrong ? '❌' : hotspot.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-center py-2 px-4 rounded-xl text-xs font-bold ${
              feedback.type === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {feedback.type === 'correct' ? '✓ Correct! That\'s a business opportunity!' : '✗ Nope! Try another one'}
          </motion.div>
        )}
      </AnimatePresence>

      {wrongClicks.length > 0 && (
        <div className="text-center text-[10px] text-slate-500">
          Wrong clicks: {wrongClicks.length}
        </div>
      )}
    </div>
  );
}
