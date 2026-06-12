import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, BarChart3 } from 'lucide-react';

interface ValidationLevelProps {
  onComplete: (data: any) => void;
  discoveredClues?: Record<string, string[]>;
}

// ─── Stakeholders with Quiz Questions ─────────────────────────────────────────
interface Stakeholder {
  id: string;
  name: string;
  role: string;
  avatar: string;
  context: string;
  questions: ValidationQuestion[];
}

interface ValidationQuestion {
  id: number;
  text: string;
  answers: { text: string; score: number; feedback: string }[];
}

const STAKEHOLDERS: Stakeholder[] = [
  {
    id: 'student',
    name: 'Rohan (Grade 7)',
    role: 'Regular Canteen Customer',
    avatar: '👦',
    context: 'He faces the canteen queue every single day during recess.',
    questions: [
      {
        id: 1,
        text: '"How does the canteen wait affect you?"',
        answers: [
          { text: '"I sometimes miss recess playtime because of the queue."', score: 10, feedback: '✅ Pain point confirmed! This shows real time-loss for students.' },
          { text: '"It\'s fine, I\'m patient."', score: 3, feedback: '⚠️ Low urgency — the pain isn\'t strong enough for a business.' },
          { text: '"I don\'t eat at the canteen."', score: 0, feedback: '❌ Not a customer — this segment won\'t help validate the idea.' },
        ]
      },
      {
        id: 2,
        text: '"Would you pre-order on a phone app?"',
        answers: [
          { text: '"Yes! I would order before school starts and pick up in 10 seconds!"', score: 10, feedback: '✅ Strong validation! Confirms demand for pre-ordering.' },
          { text: '"Maybe, if it\'s easy to use."', score: 5, feedback: '📊 Neutral — interested but needs more proof.' },
          { text: '"No, I like seeing the food before buying."', score: 1, feedback: '❌ Low interest — this segment prefers browsing.' },
        ]
      },
      {
        id: 3,
        text: '"Would you pay a ₹5 convenience fee?"',
        answers: [
          { text: '"Yes! ₹5 is nothing for saving my entire recess!"', score: 10, feedback: '✅ Willingness to pay confirmed! Strong business model signal.' },
          { text: '"Only if the food is guaranteed hot and fresh."', score: 6, feedback: '📊 Conditional — need to deliver quality to justify fee.' },
          { text: '"No, I\'d rather wait than pay extra."', score: 2, feedback: '❌ Price-sensitive — this segment needs a free model.' },
        ]
      }
    ]
  },
  {
    id: 'parent',
    name: 'Mrs. Patel',
    role: 'Concerned Parent',
    avatar: '👩',
    context: 'She wants her daughter Priya to have a healthy lunch.',
    questions: [
      {
        id: 4,
        text: '"Are you aware of the canteen rush issue?"',
        answers: [
          { text: '"Yes! Priya often comes home hungry because she couldn\'t get food."', score: 10, feedback: '✅ Pain confirmed! Parents are aware and worried.' },
          { text: '"I didn\'t know there was a problem."', score: 2, feedback: '❌ Unaware — needs education before they\'ll pay.' },
          { text: '"I pack lunch for her, so not an issue."', score: 1, feedback: '❌ Not a target customer — brings own food.' },
        ]
      },
      {
        id: 5,
        text: '"Would you use a pre-order system?"',
        answers: [
          { text: '"Absolutely! I would top-up a weekly wallet for Priya."', score: 10, feedback: '✅ Strong validation! Wallet top-up model confirmed.' },
          { text: '"Maybe, if I can control what she orders."', score: 6, feedback: '📊 Conditional — needs parent controls feature.' },
          { text: '"No, I prefer giving her cash."', score: 1, feedback: '❌ Prefers cash — digital wallet not for everyone.' },
        ]
      },
      {
        id: 6,
        text: '"Would you pay ₹20/week for guaranteed healthy food?"',
        answers: [
          { text: '"Yes! Health is worth the extra cost."', score: 10, feedback: '✅ Premium willingness! High-value customer segment.' },
          { text: '"Only if I can see the menu in advance."', score: 6, feedback: '📊 Needs transparency — wants menu preview feature.' },
          { text: '"No, I think school should provide free healthy food."', score: 0, feedback: '❌ Expects free service — not a paying customer.' },
        ]
      }
    ]
  },
  {
    id: 'operator',
    name: 'Raju Uncle',
    role: 'Canteen Operator',
    avatar: '👨‍🍳',
    context: 'He runs the canteen and struggles with the daily chaos.',
    questions: [
      {
        id: 7,
        text: '"What\'s your biggest operational challenge?"',
        answers: [
          { text: '"Managing cash and orders when 100 kids scream at once!"', score: 10, feedback: '✅ Real problem! Cash management + chaos = perfect for a digital solution.' },
          { text: '"Sometimes ingredients run out."', score: 5, feedback: '📊 Medium pain — inventory management is part of the problem.' },
          { text: '"Everything is fine, I manage well."', score: 0, feedback: '❌ No pain — if operator is happy, there\'s no business opportunity.' },
        ]
      },
      {
        id: 8,
        text: '"Would a pre-order system help you?"',
        answers: [
          { text: '"100%! I could prepare in advance and serve smoothly!"', score: 10, feedback: '✅ Operator buy-in! Critical for execution success.' },
          { text: '"Maybe, if it\'s simple to use."', score: 5, feedback: '📊 Interested but needs simplicity — design UX carefully.' },
          { text: '"No, I prefer the current system."', score: 1, feedback: '❌ Resistance to change — adoption would be difficult.' },
        ]
      },
      {
        id: 9,
        text: '"Would you offer discounts for pre-orders?"',
        answers: [
          { text: '"Yes! 5% off — it reduces my stress and waste."', score: 10, feedback: '✅ Win-win! Discount = more pre-orders, less chaos.' },
          { text: '"Only if volumes are high enough."', score: 5, feedback: '📊 Conditional — needs scale to justify discounts.' },
          { text: '"No, my margins are too thin."', score: 2, feedback: '❌ Tight margins — monetization needs a different approach.' },
        ]
      }
    ]
  }
];

// ─── Grade Calculation ────────────────────────────────────────────────────────
function calculateGrade(totalScore: number, maxScore: number): { grade: string; emoji: string; color: string; feedback: string } {
  const pct = Math.round((totalScore / maxScore) * 100);
  if (pct >= 90) return { grade: 'A+', emoji: '🏆', color: 'text-yellow-400', feedback: 'Outstanding validation! You\'ve proven there\'s a real business opportunity.' };
  if (pct >= 75) return { grade: 'A', emoji: '🌟', color: 'text-green-400', feedback: 'Great work! Strong evidence for moving forward with this idea.' };
  if (pct >= 60) return { grade: 'B+', emoji: '👍', color: 'text-blue-400', feedback: 'Good validation. Some concerns need more research before building.' };
  if (pct >= 45) return { grade: 'B', emoji: '📊', color: 'text-purple-400', feedback: 'Mixed signals — you may want to test with more customers.' };
  if (pct >= 30) return { grade: 'C+', emoji: '🤔', color: 'text-orange-400', feedback: 'Weak validation. Consider whether this problem is worth solving.' };
  return { grade: 'D', emoji: '⚠️', color: 'text-red-400', feedback: 'Not validated. This might not be a real business opportunity.' };
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function ValidationLevel({ onComplete, discoveredClues }: ValidationLevelProps) {
  const [activeStakeholder, setActiveStakeholder] = useState<number | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { qId: number; answerIdx: number; score: number }>>({});
  const [showResult, setShowResult] = useState(false);
  const [showGrade, setShowGrade] = useState(false);

  const maxScore = useMemo(() => STAKEHOLDERS.reduce((sum, s) => sum + s.questions.reduce((qs, q) => qs + 10, 0), 0), []);

  const totalScore = useMemo(() => Object.values(answers).reduce((sum, a) => sum + a.score, 0), [answers]);

  const grade = useMemo(() => calculateGrade(totalScore, maxScore), [totalScore, maxScore]);

  const isStakeholderComplete = (idx: number) => {
    const s = STAKEHOLDERS[idx];
    return s.questions.every(q => answers[`${s.id}_${q.id}`]);
  };

  const allComplete = STAKEHOLDERS.every((_, idx) => isStakeholderComplete(idx));

  const handleSelectAnswer = (answerIdx: number) => {
    if (activeStakeholder === null) return;
    const s = STAKEHOLDERS[activeStakeholder];
    const q = s.questions[currentQIdx];
    const a = q.answers[answerIdx];

    setAnswers(prev => ({
      ...prev,
      [`${s.id}_${q.id}`]: { qId: q.id, answerIdx, score: a.score }
    }));

    // Auto-advance to next question after brief delay
    setTimeout(() => {
      if (currentQIdx < s.questions.length - 1) {
        setCurrentQIdx(prev => prev + 1);
      } else {
        // Stakeholder complete
        setActiveStakeholder(null);
        setCurrentQIdx(0);
        // Check if all are complete
        const newAnswers = { ...answers, [`${s.id}_${q.id}`]: { qId: q.id, answerIdx, score: a.score } };
        const allDone = STAKEHOLDERS.every((st, idx) => {
          return st.questions.every(qs => newAnswers[`${st.id}_${qs.id}`]);
        });
        if (allDone) {
          setShowResult(true);
        }
      }
    }, 800);
  };

  const handleFinish = () => {
    setShowGrade(true);
    onComplete({
      validatedProblem: 'canteen_queue',
      respondents: 3,
      supportCount: 3,
      feeWillingness: totalScore > 60 ? 'High' : 'Medium',
      validationScore: totalScore,
      maxScore,
      grade: grade.grade,
      pivotNotes: grade.feedback,
      answers
    });
  };

  // Get status for each stakeholder (grid view)
  const stakeholderStatus = useMemo(() => STAKEHOLDERS.map((s, idx) => {
    const stakeholderAnswers = STAKEHOLDERS[idx].questions.map(q => answers[`${s.id}_${q.id}`]);
    const answered = stakeholderAnswers.filter(a => a !== undefined).length;
    const total = s.questions.length;
    const score = stakeholderAnswers.reduce((sum, a) => sum + (a?.score || 0), 0);
    return { answered, total, score, complete: answered === total };
  }), [answers]);

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-md font-sans text-xs overflow-y-auto">
      <AnimatePresence mode="wait">
        {/* ─── Opening: Select Stakeholder ─── */}
        {!showResult && !showGrade && activeStakeholder === null && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="text-5xl">🎯</div>
              <h2 className="text-2xl font-bold font-display text-white">Customer Validation</h2>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Rank your problems! Now interview real stakeholders to validate your top opportunity.
                Choose the right answers to prove the business potential.
              </p>
            </div>

            {/* Score tracker */}
            <div className="flex justify-center gap-6 p-4 bg-slate-900/60 border border-slate-800/40 rounded-xl max-w-md mx-auto">
              <div className="text-center">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Answered</div>
                <div className="text-lg font-bold text-white">{Object.keys(answers).length}</div>
              </div>
              <div className="w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Score</div>
                <div className="text-lg font-bold text-yellow-400">{totalScore}/{maxScore}</div>
              </div>
              <div className="w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Questions</div>
                <div className="text-lg font-bold text-white">9</div>
              </div>
            </div>

            {/* Stakeholder Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STAKEHOLDERS.map((s, idx) => {
                const status = stakeholderStatus[idx];
                return (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => {
                      setActiveStakeholder(idx);
                      setCurrentQIdx(status.complete ? s.questions.length - 1 : status.answered);
                    }}
                    className={`p-5 rounded-2xl border-2 text-center transition-all ${
                      status.complete
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-slate-700/60 bg-slate-900/60 hover:border-purple-500/30 hover:bg-purple-500/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-5xl mb-3">{s.avatar}</div>
                    <h3 className="font-bold text-white text-sm">{s.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">{s.role}</p>
                    <p className="text-[9px] text-slate-500 italic mt-2">{s.context}</p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: s.questions.length }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < status.answered ? 'bg-green-500' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <span className={`text-[9px] font-bold ${status.complete ? 'text-green-400' : 'text-slate-500'}`}>
                        {status.complete ? '✓ Complete' : `${status.answered}/${status.total}`}
                      </span>
                    </div>
                    {status.score > 0 && (
                      <div className="mt-2 text-[10px] text-yellow-400 font-semibold">
                        Score: {status.score}/30
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {allComplete && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4">
                <motion.button
                  onClick={() => setShowResult(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-8 rounded-xl border border-green-500/20 flex items-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="h-4 w-4" /> View Validation Results <ArrowRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── Active Quiz Question ─── */}
        {!showResult && !showGrade && activeStakeholder !== null && (
          <motion.div
            key={`quiz-${activeStakeholder}-${currentQIdx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/40 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{STAKEHOLDERS[activeStakeholder].avatar}</span>
                <div>
                  <h3 className="font-bold text-white text-sm">{STAKEHOLDERS[activeStakeholder].name}</h3>
                  <p className="text-[9px] text-slate-400">{STAKEHOLDERS[activeStakeholder].role}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Question</div>
                <div className="text-sm font-bold text-white">{currentQIdx + 1}/{STAKEHOLDERS[activeStakeholder].questions.length}</div>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center">
              {STAKEHOLDERS[activeStakeholder].questions.map((q, i) => (
                <div key={q.id}
                  className={`w-8 h-1.5 rounded-full transition-colors ${
                    answers[`${STAKEHOLDERS[activeStakeholder].id}_${q.id}`]
                      ? 'bg-green-500' : i === currentQIdx ? 'bg-purple-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <div className="text-center space-y-2">
              <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">Ask this question</span>
              <h3 className="text-lg font-bold text-white font-display">
                {STAKEHOLDERS[activeStakeholder].questions[currentQIdx].text}
              </h3>
            </div>

            {/* Answer Choices */}
            <div className="space-y-2.5">
              {STAKEHOLDERS[activeStakeholder].questions[currentQIdx].answers.map((a, idx) => {
                const alreadyAnswered = answers[`${STAKEHOLDERS[activeStakeholder].id}_${STAKEHOLDERS[activeStakeholder].questions[currentQIdx].id}`];
                const isSelected = alreadyAnswered?.answerIdx === idx;

                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => !alreadyAnswered && handleSelectAnswer(idx)}
                    disabled={!!alreadyAnswered}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-500/10 ring-1 ring-green-500/30'
                        : alreadyAnswered
                          ? 'border-slate-800/40 bg-slate-900/30 opacity-50'
                          : 'border-slate-700/60 bg-slate-900/60 hover:border-purple-500/40 hover:bg-slate-800/60 cursor-pointer'
                    }`}
                    whileHover={!alreadyAnswered ? { scale: 1.01 } : {}}
                    whileTap={!alreadyAnswered ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {['A', 'B', 'C'][idx]}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-200 leading-relaxed">{a.text}</p>
                        {isSelected && (
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] text-green-400 mt-2 font-medium"
                          >
                            {a.feedback} <span className="text-yellow-400">+{a.score} pts</span>
                          </motion.p>
                        )}
                      </div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-green-400' : 'text-slate-600'}`}>
                        {isSelected ? `+${a.score}` : `${['⭐', '⭐', '⭐'][a.score === 10 ? 0 : a.score >= 5 ? 1 : 2]}`}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Skip button */}
            <button
              onClick={() => {
                if (currentQIdx < STAKEHOLDERS[activeStakeholder].questions.length - 1) {
                  setCurrentQIdx(prev => prev + 1);
                } else {
                  setActiveStakeholder(null);
                  setCurrentQIdx(0);
                }
              }}
              className="w-full py-2.5 text-center text-slate-500 hover:text-slate-300 font-semibold text-xs transition-colors"
            >
              Skip this question →
            </button>

            {/* Score summary */}
            <div className="flex items-center justify-center gap-4 p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <Star className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-[10px] text-slate-400">
                Current Score: <strong className="text-yellow-400">{totalScore}</strong> / {maxScore} · 
                Stakeholder: <strong className="text-white">{stakeholderStatus[activeStakeholder].score}/30</strong>
              </span>
            </div>
          </motion.div>
        )}

        {/* ─── Result Summary ─── */}
        {showResult && !showGrade && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="text-5xl">📊</div>
              <h2 className="text-2xl font-bold font-display text-white">Validation Summary</h2>
              <p className="text-slate-400 text-xs">Here's how your interviews went</p>
            </div>

            {/* Score Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 text-center">
              <div className="text-3xl font-black text-white">{totalScore}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Score</div>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalScore / maxScore) * 100}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-slate-500">
                <span>0</span>
                <span>{maxScore}</span>
              </div>

              {/* Grade preview */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mt-4"
              >
                <span className={`text-3xl font-black ${grade.color}`}>{grade.grade}</span>
                <p className="text-xs text-slate-400 mt-1">{grade.feedback}</p>
              </motion.div>
            </div>

            {/* Per-stakeholder breakdown */}
            <div className="space-y-2">
              {STAKEHOLDERS.map((s, idx) => {
                const status = stakeholderStatus[idx];
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl">
                    <span className="text-2xl">{s.avatar}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-xs">{s.name}</div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(status.score / 30) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-yellow-400">{status.score}/30</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => { setActiveStakeholder(0); setShowResult(false); setCurrentQIdx(0); }}
                className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                ↩️ Re-interview
              </motion.button>
              <motion.button
                onClick={handleFinish}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-purple-500/20 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trophy className="h-4 w-4" /> Complete Validation
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── Grade Reveal ─── */}
        {showGrade && (
          <motion.div
            key="grade"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150 }}
              className="text-7xl"
            >{grade.emoji}</motion.div>

            <div className="space-y-1">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Validation Grade</span>
              <div className={`text-6xl font-black ${grade.color}`}>{grade.grade}</div>
              <p className="text-slate-300 text-xs mt-2 max-w-xs mx-auto">{grade.feedback}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Score', value: `${totalScore}/${maxScore}`, icon: '⭐' },
                { label: 'Interviews', value: '3/3', icon: '👥' },
                { label: 'Grade', value: grade.grade, icon: grade.emoji },
              ].map((stat, i) => (
                <div key={i} className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <div className="text-sm font-bold text-white">{stat.value}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl space-y-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">💡 Entrepreneur Lesson</span>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Validating with real customers is what separates successful startups from good ideas.
                Zomato validated the food delivery problem with restaurant partners before ever building an app.
                Your grade of {grade.grade} shows you're thinking like a real founder!"
              </p>
            </div>

            <motion.button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3.5 rounded-xl border border-green-500/20 shadow-lg text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🏆 Complete Mission
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
