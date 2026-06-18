import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeDecisionAssessment, AssessmentResult, createDefaultResult } from '../../../lib/assessmentTypes';
import { ThumbsUp, ThumbsDown, Timer } from 'lucide-react';

interface Props {
  assessment: SwipeDecisionAssessment;
  onComplete: (result: AssessmentResult) => void;
  startTime: number;
}

export default function SwipeDecision({ assessment, onComplete, startTime }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [swiping, setSwiping] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [finished, setFinished] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragOffsetX = useRef(0);
  const answersRef = useRef(answers);
  const feedbackCorrectRef = useRef(feedbackCorrect);
  answersRef.current = answers;
  feedbackCorrectRef.current = feedbackCorrect;

  const totalCards = assessment.cards.length;
  const currentCard = assessment.cards[currentIdx];

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentCard || swiping || finished) return;
    setSwiping(true);
    setSwipeDir(direction);

    const answer = direction === 'right' ? 'yes' : 'no';
    const correct = answer === currentCard.correctAnswer;
    setAnswers(prev => ({ ...prev, [currentCard.id]: correct }));
    setFeedbackCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSwiping(false);
      setSwipeDir(null);
      if (currentIdx >= totalCards - 1) {
        finishAssessment();
      } else {
        setCurrentIdx(prev => prev + 1);
      }
    }, 400);
  }, [currentCard, currentIdx, swiping, finished, totalCards]);

  const finishAssessment = () => {
    const currentAnswers = answersRef.current;
    const currentFb = feedbackCorrectRef.current;
    setFinished(true);
    const correctCount = Object.values(currentAnswers).filter(Boolean).length + (currentFb ? 1 : 0);
    const result = createDefaultResult(assessment, Date.now() - startTime);
    result.score = correctCount * assessment.pointsPerCorrect;
    result.correctCount = correctCount;
    result.totalCount = totalCards;
    result.answers = { ...currentAnswers, [currentCard?.id || '']: currentFb };
    result.passed = correctCount >= Math.ceil(totalCards * 0.6);
    setTimeout(() => onComplete(result), 500);
  };

  // Timer — use ref to avoid stale closures
  const finishAssessmentRef = useRef(finishAssessment);
  finishAssessmentRef.current = finishAssessment;

  useEffect(() => {
    if (finished || currentIdx >= totalCards) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishAssessmentRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIdx, finished, totalCards]);

  // Touch/mouse drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    if (cardRef.current) cardRef.current.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    dragOffsetX.current = e.clientX - dragStartX.current;
    if (cardRef.current && !swiping) {
      cardRef.current.style.transform = `translateX(${dragOffsetX.current}px) rotate(${dragOffsetX.current * 0.05}deg)`;
    }
  };
  const handlePointerUp = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      if (dragOffsetX.current > 80) handleSwipe('right');
      else if (dragOffsetX.current < -80) handleSwipe('left');
      dragOffsetX.current = 0;
    }
  };

  if (finished) {
    return (
      <div className="flex items-center justify-center h-48">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold text-green-400"
        >
          Calculating results...
        </motion.div>
      </div>
    );
  }

  if (!currentCard) {
    return <div className="text-center text-slate-500 py-12">No cards left!</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{assessment.emoji}</span>
          <div>
            <h3 className="text-sm font-bold text-white">{assessment.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Timer className={`h-4 w-4 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
          <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-slate-300'}`}>{timeLeft}s</span>
          <span className="text-slate-600">{currentIdx + 1}/{totalCards}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx) / totalCards) * 100}%` }} />
      </div>

      {/* Swipe Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          ref={cardRef}
          initial={{ opacity: 0, x: 100 }}
          animate={{
            opacity: 1,
            x: swipeDir === 'left' ? -200 : swipeDir === 'right' ? 200 : 0,
            rotate: swipeDir === 'left' ? -15 : swipeDir === 'right' ? 15 : 0,
          }}
          exit={{ opacity: 0, x: swipeDir === 'left' ? -200 : 200 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative p-6 rounded-2xl border-2 bg-gradient-to-br from-slate-800 to-slate-900 text-center cursor-grab active:cursor-grabbing select-none"
          style={{
            borderColor: swiping
              ? swipeDir === 'right' ? 'rgba(34,197,94,0.4)' : swipeDir === 'left' ? 'rgba(239,68,68,0.4)' : 'rgba(51,65,85,0.5)'
              : 'rgba(51,65,85,0.5)',
            touchAction: 'none',
          }}
        >
          {/* Swipe hint overlays */}
          {Math.abs(dragOffsetX.current) > 30 && (
            <div className={`absolute inset-0 rounded-2xl pointer-events-none ${dragOffsetX.current > 0 ? 'bg-green-500/5' : 'bg-red-500/5'}`} />
          )}

          <div className="text-6xl mb-4">{currentCard.emoji}</div>
          <p className="text-base font-medium text-white leading-relaxed max-w-sm mx-auto">
            {currentCard.text}
          </p>

          {/* Swipe indicators */}
          <div className="flex justify-between mt-6 text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${dragOffsetX.current < -30 ? 'bg-red-500/20 text-red-400' : 'text-slate-500'}`}>
              <ThumbsDown className="h-4 w-4" /> Not an Opportunity
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${dragOffsetX.current > 30 ? 'bg-green-500/20 text-green-400' : 'text-slate-500'}`}>
              <ThumbsUp className="h-4 w-4" /> Real Opportunity
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Buttons for non-touch users */}
      <div className="flex gap-4">
        <button
          onClick={() => handleSwipe('left')}
          disabled={swiping}
          className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ThumbsDown className="h-4 w-4" /> 👎 No
        </button>
        <button
          onClick={() => handleSwipe('right')}
          disabled={swiping}
          className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-green-400 hover:bg-green-500/10 hover:border-green-500/30 font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ThumbsUp className="h-4 w-4" /> 👍 Yes
        </button>
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center py-2 px-4 rounded-xl text-xs font-bold ${
              feedbackCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {feedbackCorrect ? '✓ Right!' : '✗ Not quite'}
            <span className="text-slate-400 ml-2 font-normal">{currentCard.explanation}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score so far */}
      <div className="text-center text-[10px] text-slate-500">
        {Object.keys(answers).length + (currentIdx > 0 ? 1 : 0) > 0 && (
          <span>{Object.values(answers).filter(Boolean).length} correct so far</span>
        )}
      </div>
    </div>
  );
}
