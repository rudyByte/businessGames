import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RapidFireEmojiAssessment, AssessmentResult, createDefaultResult } from '../../../lib/assessmentTypes';
import { Timer, Zap, Star } from 'lucide-react';

interface Props {
  assessment: RapidFireEmojiAssessment;
  onComplete: (result: AssessmentResult) => void;
  startTime: number;
}

export default function RapidFireEmoji({ assessment, onComplete, startTime }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimit);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; score: number } | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const currentQRef = useRef(currentQ);
  currentQRef.current = currentQ;

  const totalQuestions = assessment.questions.length;
  const currentQuestion = assessment.questions[currentQ];
  const correctSoFar = Object.values(answers).filter(Boolean).length;
  const totalEarned = scores.reduce((s, v) => s + v, 0);

  const finishAssessment = useCallback(() => {
    setShowResult(true);
    const result = createDefaultResult(assessment, Date.now() - startTime);
    result.score = totalEarned;
    result.correctCount = correctSoFar;
    result.totalCount = totalQuestions;
    result.answers = { ...answers, questionResults: scores.map((s, i) => ({ questionIdx: i, score: s })) };
    result.passed = correctSoFar >= Math.ceil(totalQuestions * 0.5);
    setTimeout(() => onComplete(result), 1200);
  }, [answers, scores, correctSoFar, totalEarned, totalQuestions, assessment, startTime, onComplete]);

  // Timer — use ref to avoid stale closure
  const finishAssessmentRef = useRef(finishAssessment);
  finishAssessmentRef.current = finishAssessment;

  useEffect(() => {
    if (showResult) return;
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
  }, [showResult]);

  const handleAnswer = (optionIdx: number) => {
    if (!currentQuestion || showResult) return;
    const selected = currentQuestion.options[optionIdx];
    const isCorrect = selected.isCorrect;
    const timeBonus = assessment.speedBonus ? Math.max(0, Math.floor((timeLeft / assessment.timeLimit) * 10)) : 0;
    const qScore = isCorrect ? assessment.pointsPerCorrect + timeBonus : 0;

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: isCorrect }));
    setScores(prev => [...prev, qScore]);
    setFeedback({ correct: isCorrect, score: qScore });

    setTimeout(() => {
      setFeedback(null);
      if (currentQRef.current >= totalQuestions - 1) {
        finishAssessment();
      } else {
        setCurrentQ(prev => prev + 1);
      }
    }, 600);
  };

  if (showResult) {
    return (
      <div className="flex items-center justify-center h-48">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg font-bold text-green-400">
          Calculating results...
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center text-slate-500 py-12">All done!</div>;
  }

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-bold text-white">Rapid Fire</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 text-yellow-400" />
            <span className="font-bold text-white">{correctSoFar}/{totalQuestions}</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${timeLeft <= 10 ? 'text-red-400' : 'text-slate-400'}`}>
            <Timer className={`h-4 w-4 ${timeLeft <= 10 ? 'animate-pulse' : ''}`} />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${(currentQ / totalQuestions) * 100}%` }} />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          className="text-center space-y-4"
        >
          {/* Question text - full screen style */}
          <div className="p-6 bg-slate-900/60 border border-slate-800/40 rounded-2xl">
            <p className="text-2xl font-bold text-white leading-relaxed font-display">
              {currentQuestion.text}
            </p>
          </div>

          {/* 4 giant emoji/icon answers */}
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="p-6 rounded-2xl border-2 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-purple-800/30 hover:to-slate-800 transition-all"
                style={{
                  borderColor: feedback?.correct !== null
                    ? opt.isCorrect ? 'rgba(34,197,94,0.4)' : 'rgba(51,65,85,0.5)'
                    : 'rgba(51,65,85,0.5)',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="text-5xl md:text-6xl mb-2">{opt.emoji}</div>
                <div className="text-sm font-bold text-slate-300">{opt.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-center py-3 px-4 rounded-xl text-sm font-bold ${
              feedback.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {feedback.correct ? `✓ Correct! +${feedback.score} XP` : '✗ Wrong!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer bar */}
      <div className="flex items-center gap-2 text-[10px] text-slate-600">
        <span className="font-bold">{currentQ + 1}</span>
        <span>/ {totalQuestions}</span>
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden ml-2">
          <motion.div
            className="h-full bg-red-500 rounded-full"
            animate={{ width: [(timeLeft / assessment.timeLimit) * 100] }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {assessment.speedBonus && timeLeft > 0 && (
          <span className="text-purple-400 font-semibold">⚡ Speed bonus active!</span>
        )}
      </div>
    </div>
  );
}
