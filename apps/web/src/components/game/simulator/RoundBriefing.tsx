import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, MessageCircle, ArrowRight, Lightbulb } from 'lucide-react';
import api from '../../../lib/api';

interface RoundBriefingProps {
  round: number;
  startupName: string;
  onBeginRound: () => void;
  lastRoundProfit?: number;
  lastRoundFeedback?: string;
}

const MARKET_NEWS = [
  { emoji: '🌤️', text: 'Weather: Hot day — cold drink demand UP 20%' },
  { emoji: '📚', text: 'Exams next week — stress-eating mood, premium snacks sell well' },
  { emoji: '🎪', text: 'School fest coming — crowd doubles during lunch' },
  { emoji: '🏏', text: 'India won the match! Celebrations = extra foot traffic' },
  { emoji: '🌧️', text: 'Monsoon alert — fewer students outdoors, focus on delivery' },
  { emoji: '🪔', text: 'Diwali buzz — festive spending, gift packs popular' },
  { emoji: '⚽', text: 'Inter-school tournament — everyone stays after school' },
  { emoji: '❄️', text: 'Cold wave — hot soup & samosa demand spikes' },
];

const CUSTOMER_INSIGHTS = [
  { emoji: '💬', text: 'Customers said: "Your prices are fair, but delivery is slow"' },
  { emoji: '💬', text: 'Customers said: "I wish you had more variety"' },
  { emoji: '💬', text: 'Customers said: "The quality is great, keep it up!"' },
  { emoji: '💬', text: 'Customers said: "Can you take pre-orders?"' },
  { emoji: '💬', text: 'Customers said: "Your stall is hard to find"' },
  { emoji: '💬', text: 'Customers said: "The packaging could be better"' },
  { emoji: '💬', text: 'Customers said: "Love the friendly service!"' },
  { emoji: '💬', text: 'Customers said: "Too expensive for my pocket money"' },
];

const MENTOR_ADVICE = [
  "Focus on speed today — customers love fast service! Try pre-cooking some samosas.",
  "Quality over quantity! A smaller batch with perfect taste builds loyalty.",
  "Watch your margins — don't drop prices too low just to attract crowds.",
  "Your staff matters! Keep them motivated for better customer experience.",
  "Listen to complaints — they're free business advice!",
  "Branding is memory. A catchy stall name makes customers return.",
  "Don't fear competition. Differentiate on quality and service.",
  "The best marketing is a happy customer. Excel at service today!",
];

export default function RoundBriefing({ round, startupName, onBeginRound, lastRoundProfit, lastRoundFeedback }: RoundBriefingProps) {
  const [step, setStep] = useState<'mentor' | 'news' | 'insight' | 'ready'>('mentor');
  const [mentorText, setMentorText] = useState('');
  const [newsItem, setNewsItem] = useState(MARKET_NEWS[0]);
  const [insightItem, setInsightItem] = useState(CUSTOMER_INSIGHTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Pick random news and insight
    setNewsItem(MARKET_NEWS[Math.floor(Math.random() * MARKET_NEWS.length)]);
    setInsightItem(CUSTOMER_INSIGHTS[Math.floor(Math.random() * CUSTOMER_INSIGHTS.length)]);
    setMentorText(MENTOR_ADVICE[Math.floor(Math.random() * MENTOR_ADVICE.length)]);
  }, [round]);

  // Auto-advance through steps
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (step === 'mentor') {
      timers.push(setTimeout(() => setStep('news'), 4000));
    } else if (step === 'news') {
      timers.push(setTimeout(() => setStep('insight'), 4000));
    } else if (step === 'insight') {
      timers.push(setTimeout(() => setStep('ready'), 4000));
    }
    return () => timers.forEach(clearTimeout);
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="max-w-lg w-full mx-4">
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: MENTOR ───────────────────── */}
          {step === 'mentor' && (
            <motion.div
              key="mentor"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              className="text-center"
            >
              {/* Mentor Avatar */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 p-1"
              >
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl">
                  🦉
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-1">
                  Professor Vikash — Morning Briefing
                </h2>
                <p className="text-[10px] text-slate-500">
                  Day {round} · {startupName}
                </p>
              </motion.div>

              {/* Mentor Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-6 mb-4"
              >
                <div className="absolute -top-3 left-6 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-[10px] text-orange-400 font-bold">
                  🦉 Mentor Says
                </div>
                <div className="flex items-start gap-3 mt-2">
                  <Sparkles className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-200 leading-relaxed">
                    "{mentorText}"
                  </p>
                </div>
              </motion.div>

              {lastRoundProfit !== undefined && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-xs text-slate-500"
                >
                  Last round: {lastRoundProfit >= 0 ? (
                    <span className="text-green-400 font-bold">+₹{lastRoundProfit} profit</span>
                  ) : (
                    <span className="text-red-400 font-bold">₹{lastRoundProfit} loss</span>
                  )}
                </motion.div>
              )}

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2 h-2 rounded-full bg-orange-400"
                />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2: MARKET NEWS ──────────────── */}
          {step === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center text-3xl"
              >
                📰
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-white mb-2"
              >
                Market Report
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{newsItem.emoji}</span>
                  <p className="text-sm text-slate-200 leading-relaxed text-left">
                    {newsItem.text}
                  </p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-slate-500 mt-4"
              >
                Plan your strategy based on today's conditions!
              </motion.p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2 h-2 rounded-full bg-blue-400"
                />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: CUSTOMER INSIGHT ─────────── */}
          {step === 'insight' && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center text-3xl"
              >
                💡
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-white mb-2"
              >
                Customer Insight
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{insightItem.emoji}</span>
                  <p className="text-sm text-slate-200 leading-relaxed text-left">
                    {insightItem.text}
                  </p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-yellow-400 mt-4 font-semibold"
              >
                ⚡ Use this feedback to improve your decisions today!
              </motion.p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2 h-2 rounded-full bg-green-400"
                />
              </div>
            </motion.div>
          )}

          {/* ─── STEP 4: GO ───────────────────────── */}
          {step === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20"
              >
                <span className="text-5xl">🚀</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-2 font-game"
              >
                Ready for Day {round}!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-slate-400 mb-8"
              >
                The school bell is about to ring. Time to serve!
              </motion.p>

              <motion.button
                onClick={onBeginRound}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-lg flex items-center gap-3 mx-auto shadow-xl shadow-orange-500/20 border border-orange-400/20"
              >
                OPEN FOR BUSINESS! 🚀
                <ArrowRight className="h-5 w-5" />
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-[10px] text-slate-600 mt-4"
              >
                Remember: {mentorText.split('!')[0]}!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
