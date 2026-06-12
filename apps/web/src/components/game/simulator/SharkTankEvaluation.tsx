import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { FileDown, Trophy, Star, ShieldCheck, TrendingUp, Users, DollarSign } from 'lucide-react';

interface SharkTankEvaluationProps {
  saveState: any;
  onClose: () => void;
}

const SHARK = {
  id: 'vikram',
  name: 'Vikram Bhai',
  title: 'Financial Shark',
  emoji: '🦈',
  intro: 'Welcome to Shark Tank India! I have built a ₹200 Cr business from a street-side chaat stall. Let me see if your samosa empire has teeth!',
};

function getGrade(score: number, maxScore: number): { letter: string; color: string; feedback: string } {
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return { letter: 'A+', color: 'text-green-400', feedback: 'Outstanding pitch! 🏆 You have what it takes to be a real entrepreneur!' };
  if (pct >= 80) return { letter: 'A', color: 'text-green-400', feedback: 'Excellent pitch! The sharks are impressed and want to invest!' };
  if (pct >= 70) return { letter: 'B+', color: 'text-blue-400', feedback: 'Great effort! A few refinements and you would get funded!' };
  if (pct >= 60) return { letter: 'B', color: 'text-blue-400', feedback: 'Solid pitch. Work on your numbers and clarity next time.' };
  if (pct >= 50) return { letter: 'C+', color: 'text-yellow-400', feedback: 'Decent start. The sharks see potential but need more conviction.' };
  if (pct >= 40) return { letter: 'C', color: 'text-yellow-400', feedback: 'Needs improvement. Focus on your business model and metrics.' };
  return { letter: 'D', color: 'text-red-400', feedback: 'Back to the drawing board. Study your market and come back stronger!' };
}

function buildQuestions(saveState: any) {
  const cash = saveState?.cash || 50000;
  const brand = saveState?.brandStrength || 65;
  const rounds = saveState?.roundHistory?.length || 6;
  const served = rounds * 50 || 150;

  return [
    {
      id: 'problem',
      ask: 'Beta, I see you identified long canteen queues as a problem. But WHY should I care? How big is this opportunity really?',
      options: [
        { text: `"500 students waste 15 mins daily — that is 125 hours of lost recess every day! This is a ₹5 lakh annual market."`, score: 3, vibe: '🔥 Data-driven answer! Sharks love numbers.' },
        { text: '"Students are unhappy because they cannot eat. Parents worry too. It is a big emotional problem."', score: 2, vibe: '👍 Good emotional pitch but weak on market size.' },
        { text: '"Everyone faces this problem. It is very common. You should invest because it affects many people."', score: 1, vibe: '😐 Too vague. Sharks want SPECIFIC numbers.' },
      ]
    },
    {
      id: 'solution',
      ask: 'Samosa preordering app? Interesting. But how exactly does it work? Walk me through the business process.',
      options: [
        { text: '"Parents top-up a wallet (₹500/month). Students pre-order before 9 AM. We deliver to classrooms at 12 PM recess. Zero queue, 100% satisfaction."', score: 3, vibe: '🔥 Crystal clear process! Sharks love operational clarity.' },
        { text: '"It is like Zomato but only for our school. Students order on phone and we deliver during lunch."', score: 2, vibe: '👍 Decent comparison but missing the payment flow detail.' },
        { text: '"We make an app where students can order samosas. It will be very easy to use."', score: 1, vibe: '😐 Very vague. How will you handle payments? Delivery?' },
      ]
    },
    {
      id: 'traction',
      ask: 'Show me the money! What numbers have you achieved? Convince me this is real traction.',
      options: [
        { text: `"We served ${served} customers, built ${brand}% brand strength, and ended with ₹${cash} in cash. We are profitable!"`, score: 3, vibe: '🔥 Sharks LOVE traction! Real numbers prove demand.' },
        { text: '"We have been operating for 12 weeks and students really like our samosas. We think there is big potential."', score: 2, vibe: '👍 Fine but generic. Where are the specific numbers?' },
        { text: '"We just launched but we have great feedback from 5 friends. Everyone loves the taste!"', score: 1, vibe: '😰 Too early for Shark Tank. Come back with real traction.' },
      ]
    },
    {
      id: 'ask',
      ask: 'Final question beta — how much funding do you need from me, and what will you do with it?',
      options: [
        { text: '"We need ₹25,000 to expand to 3 more schools: hire 2 delivery staff (₹8,000), build a simple app (₹12,000), and marketing materials (₹5,000)."', score: 3, vibe: '🔥 Perfect ask! Clear use-of-funds breakdown makes investors confident.' },
        { text: '"We need ₹50,000 so we can scale everywhere and become the next Zomato!"', score: 2, vibe: '👍 Ambitious but too vague. Break down the costs.' },
        { text: '"Whatever you think is fair, sir. We just want to grow the business."', score: 1, vibe: '😰 Never say this to a shark! You must know exactly what you need.' },
      ]
    },
  ];
}

export default function SharkTankEvaluation({ saveState, onClose }: SharkTankEvaluationProps) {
  const [phase, setPhase] = useState<'stage' | 'pitch' | 'result'>('stage');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [sharkReaction, setSharkReaction] = useState<string | null>(null);
  const [answerLocked, setAnswerLocked] = useState(false);

  const questions = useMemo(() => buildQuestions(saveState), [saveState]);
  const isLastQuestion = currentQ === questions.length - 1;
  const maxScore = questions.length * 3;

  const earnedScore = useMemo(() => {
    return answers.reduce((sum, ansIdx, qIdx) => {
      return sum + (questions[qIdx]?.options[ansIdx]?.score || 0);
    }, 0);
  }, [answers, questions]);

  const grade = getGrade(earnedScore, maxScore);

  const startupName = saveState?.startupName || 'Samosa Express';
  const cash = saveState?.cash || 50000;
  const brand = saveState?.brandStrength || 65;
  const awareness = saveState?.customerAwareness || 45;
  const teamMembers = saveState?.teamMembers || [];
  const teamEfficiency = saveState?.teamEfficiency || 70;

  const handleAnswer = (optionIdx: number) => {
    if (answerLocked) return;
    setAnswerLocked(true);

    const chosenOption = questions[currentQ].options[optionIdx];
    setSharkReaction(chosenOption.vibe);
    setAnswers(prev => [...prev, optionIdx]);

    setTimeout(() => {
      setSharkReaction(null);
      if (isLastQuestion) {
        setPhase('result');
      } else {
        setCurrentQ(prev => prev + 1);
        setAnswerLocked(false);
      }
    }, 2200);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CampusEdge — Shark Tank Pitch Report', 20, 20);
      doc.setFontSize(14);
      doc.text(`Company: ${startupName}`, 20, 35);
      doc.text(`Grade: ${grade.letter}`, 20, 45);
      doc.text(`Pitch Score: ${earnedScore}/${maxScore}`, 20, 55);
      doc.text(`Ending Cash: ₹${cash}`, 20, 65);
      doc.text(`Brand: ${brand}%`, 20, 75);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('This certifies that the student completed the Startup Simulator capstone pitch.', 20, 95);
      doc.save(`${startupName.replace(/\s+/g, '_')}_pitch_report.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  // ─── STAGE SETUP ─────
  if (phase === 'stage') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950 p-6 backdrop-blur-sm">
        <div className="w-full max-w-3xl glass-panel-heavy rounded-2xl p-6 md:p-8 border border-purple-500/20 max-h-[90vh] overflow-y-auto relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-7xl mb-4">🎤</motion.div>
            <h2 className="text-3xl font-bold font-display text-white">Shark Tank Pitch</h2>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
              You made it to the final round! Step onto the stage and pitch <strong className="text-purple-400">{startupName}</strong> 
              to our panel of sharks. Your team chemistry of <strong className="text-green-400">{teamEfficiency}%</strong> and
              <strong className="text-yellow-400"> ₹{cash}</strong> in revenue will influence the sharks' decisions.
            </p>
            {teamMembers.length > 0 && (
              <div className="flex justify-center gap-3">
                {teamMembers.map((m: any, i: number) => (
                  <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                    className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center text-lg font-bold text-purple-400 mx-auto">
                      {m.name?.charAt(0) || '👤'}
                    </div>
                    <div className="text-[8px] text-slate-500 mt-1">{m.role || 'Member'}</div>
                  </motion.div>
                ))}
              </div>
            )}
            <motion.button
              onClick={() => setPhase('pitch')}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm border border-purple-500/20 shadow-lg shadow-purple-500/10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              🎬 Start Pitch!
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── RESULTS ─────
  if (phase === 'result') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950 p-6 backdrop-blur-sm">
        <div className="w-full max-w-3xl glass-panel-heavy rounded-2xl p-6 md:p-8 border border-purple-500/20 max-h-[90vh] overflow-y-auto relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/20"
            ><Trophy className="h-10 w-10 text-white" /></motion.div>
            <div>
              <span className="text-green-400 font-bold uppercase tracking-wider text-[10px]">Shark Evaluation Complete</span>
              <h2 className="text-2xl font-bold font-display text-white mt-1">{startupName}</h2>
            </div>
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-[9px] text-slate-500 uppercase font-bold">Pitch Score</div>
                <div className="text-2xl font-black text-white">{earnedScore}/{maxScore}</div>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <div className="text-[9px] text-slate-500 uppercase font-bold">Grade</div>
                <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                  className={`text-4xl font-black ${grade.color}`}>{grade.letter}</motion.div>
              </div>
            </div>
            <div className="max-w-xs mx-auto">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(earnedScore / maxScore) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${earnedScore >= 8 ? 'bg-green-500' : earnedScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              </div>
            </div>
            <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">{grade.feedback}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-xl space-y-2">
                <span className="font-bold text-white block text-xs">🦈 Vikram Bhai (Financial Shark)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {earnedScore >= 8
                    ? '"Excellent grasp of unit economics! Your margin management and cost breakdown convinced me you can run a real business."'
                    : earnedScore >= 5
                    ? '"Decent financial awareness but work on your numbers. A shark always asks about unit economics — know your costs!"'
                    : '"Your financials need serious work. You cannot pitch without knowing your burn rate and margins inside out."'}
                </p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-xl space-y-2">
                <span className="font-bold text-white block text-xs">🦈 Ananya Ma'am (Product Shark)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {earnedScore >= 8
                    ? '"Brilliant customer empathy! You deeply understood the canteen queue problem and built exactly what the user needs."'
                    : earnedScore >= 5
                    ? '"Good product thinking! You identified a real problem. Next time, dive deeper into the customer validation process."'
                    : '"Your solution needs more customer validation. Talk to 20 students, not 3, before building anything."'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="bg-slate-900/40 border border-slate-800/40 p-3 rounded-xl">
                <DollarSign className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-[8px] text-slate-500 uppercase font-bold">Cash</div>
                <div className="text-xs font-bold text-white">₹{cash}</div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/40 p-3 rounded-xl">
                <TrendingUp className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                <div className="text-[8px] text-slate-500 uppercase font-bold">Brand</div>
                <div className="text-xs font-bold text-white">{brand}%</div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/40 p-3 rounded-xl">
                <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                <div className="text-[8px] text-slate-500 uppercase font-bold">Awareness</div>
                <div className="text-xs font-bold text-white">{awareness}%</div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleDownloadPDF}
                className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5">
                <FileDown className="h-4 w-4" /> Download Report
              </button>
              <motion.button onClick={onClose}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-sm border border-green-500/20 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <ShieldCheck className="h-4 w-4" /> Complete Showcase
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── PITCH ─────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950 p-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl glass-panel-heavy rounded-2xl p-6 md:p-8 border border-purple-500/20 max-h-[90vh] overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div key="pitch" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-purple-500' : 'bg-slate-800'}`} />
            ))}
            <span className="text-[10px] text-slate-500 font-bold ml-1">{currentQ + 1}/{questions.length}</span>
          </div>

          {/* Shark Card */}
          <motion.div key={currentQ} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/80 to-purple-950/20 border border-purple-500/20"
          >
            <motion.div animate={answerLocked ? { rotate: [0, -5, 5, -5, 0] } : {}} transition={{ duration: 0.5 }} className="text-5xl">{SHARK.emoji}</motion.div>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">{SHARK.name}</div>
              <div className="text-[10px] text-purple-400 font-semibold">{SHARK.title}</div>
              {currentQ === 0 && !answerLocked && <p className="text-[10px] text-slate-500 mt-1 italic">{SHARK.intro}</p>}
            </div>
            <div className="text-right">
              <div className="text-[9px] text-slate-500 uppercase font-bold">Score</div>
              <div className="text-lg font-black text-purple-400">{earnedScore}/{maxScore}</div>
            </div>
          </motion.div>

          {/* Question */}
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-slate-950/60 border border-slate-800/60 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💬</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{SHARK.name} asks:</span>
            </div>
            <p className="text-sm text-white font-medium leading-relaxed">{questions[currentQ].ask}</p>
          </motion.div>

          {/* Answer Options */}
          <div className="space-y-2">
            {questions[currentQ].options.map((opt, idx) => {
              const isSelected = answers.length > currentQ && answers[currentQ] === idx;
              const wasChosen = answerLocked && isSelected;
              const showCorrect = answerLocked && opt.score >= 3 && isSelected;
              const showWrong = answerLocked && isSelected && opt.score < 3;
              return (
                <motion.button key={idx} type="button" onClick={() => handleAnswer(idx)} disabled={answerLocked}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    wasChosen ? 'bg-purple-600/20 border-purple-500/40 ring-1 ring-purple-500/30' :
                    showCorrect ? 'bg-green-600/10 border-green-500/30' :
                    showWrong ? 'bg-red-600/10 border-red-500/30' :
                    answerLocked ? 'opacity-50 border-slate-800/30' :
                    'border-slate-800/60 bg-slate-900/30 hover:border-purple-500/30 hover:bg-slate-900/60'
                  }`}
                  whileHover={!answerLocked ? { scale: 1.01 } : {}} whileTap={!answerLocked ? { scale: 0.99 } : {}}>
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      wasChosen ? 'bg-purple-500 text-white' : showCorrect ? 'bg-green-500 text-white' :
                      showWrong ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {wasChosen ? '✓' : showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-200 leading-relaxed">{opt.text}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3].map(s => (
                          <Star key={s} className={`h-2.5 w-2.5 ${s <= opt.score ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Shark Reaction */}
          <AnimatePresence>
            {sharkReaction && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-purple-950/30 border border-purple-500/20 text-center"
              >
                <div className="text-lg mb-1">🦈</div>
                <p className="text-slate-300 text-sm font-medium">{sharkReaction}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
