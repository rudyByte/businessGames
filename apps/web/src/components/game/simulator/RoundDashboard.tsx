import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ArrowRight, Coins, TrendingUp, TrendingDown, Users, Star,
  ShoppingBag, Megaphone, ChefHat, PartyPopper, Timer,
  AlertTriangle
} from 'lucide-react';
import api from '../../../lib/api';

interface RoundDashboardProps {
  saveState: any;
  onRoundComplete: (updatedSave: any) => void;
}

// ─── Market Events ────────────────────────────────────────────────────────────
interface MarketEvent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  flavor: string;
  iconColor: string;
  gradient: string;
  effect: {
    demandMultiplier?: number;
    costMultiplier?: number;
    maxPrice?: number;
    satisfactionBoost?: number;
    satisfactionPenalty?: number;
    brandBoost?: number;
    brandPenalty?: number;
    charityCost?: number;
    competitorPrice?: number;
    forcedBatch?: number;
    fixedCustomers?: number;
  };
}

const MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'normal',
    name: '☀️ Clear Skies',
    emoji: '☀️',
    description: 'Just another regular school day',
    flavor: 'A calm, predictable day at school. No surprises — time to focus on the basics!',
    iconColor: 'text-yellow-400',
    gradient: 'from-yellow-500/10 to-transparent',
    effect: {},
  },
  {
    id: 'rainy',
    name: '🌧️ Monsoon Drizzle',
    emoji: '🌧️',
    description: 'Rain keeps students indoors',
    flavor: 'The rain is pouring. Students are hiding in classrooms — fewer will venture to your stall today.',
    iconColor: 'text-blue-400',
    gradient: 'from-blue-500/10 to-transparent',
    effect: { demandMultiplier: 0.5 },
  },
  {
    id: 'food_festival',
    name: '🎪 Food Fest Frenzy',
    emoji: '🎪',
    description: 'Annual food festival — double the hunger!',
    flavor: 'The school is buzzing with food festival energy! Every student wants a snack. Time to cash in!',
    iconColor: 'text-purple-400',
    gradient: 'from-purple-500/10 to-transparent',
    effect: { demandMultiplier: 2.2, brandBoost: 5 },
  },
  {
    id: 'exam_week',
    name: '📚 Exam Cram Session',
    emoji: '📚',
    description: 'Stress-eating students seek comfort food',
    flavor: 'Exams are here! Fewer students are roaming, but those who come NEED their samosa fix.',
    iconColor: 'text-red-400',
    gradient: 'from-red-500/10 to-transparent',
    effect: { demandMultiplier: 0.6, satisfactionBoost: 1 },
  },
  {
    id: 'cricket_win',
    name: '🏏 Victory Fever!',
    emoji: '🏏',
    description: 'India won the match! Parties everywhere!',
    flavor: 'INDIA WON! 🏆 Students are dancing in the corridors. Everyone wants to celebrate with samosas!',
    iconColor: 'text-orange-400',
    gradient: 'from-orange-500/10 to-transparent',
    effect: { demandMultiplier: 1.8, brandBoost: 3 },
  },
  {
    id: 'supplier_shortage',
    name: '📦 Ingredient Shortage',
    emoji: '📦',
    description: 'Potato prices shot up overnight!',
    flavor: 'Bad news — the supplier raised prices! Every samosa costs more to make today. Can you still turn a profit?',
    iconColor: 'text-yellow-500',
    gradient: 'from-yellow-500/10 to-transparent',
    effect: { costMultiplier: 1.5 },
  },
  {
    id: 'health_inspector',
    name: '🔍 Inspector Visit',
    emoji: '🔍',
    description: 'Health inspector roaming — keep prices fair!',
    flavor: 'The school health inspector is doing rounds. Overpricing could hurt your reputation!',
    iconColor: 'text-cyan-400',
    gradient: 'from-cyan-500/10 to-transparent',
    effect: { maxPrice: 50, brandPenalty: 8 },
  },
  {
    id: 'charity_day',
    name: '🤝 Charity Drive',
    emoji: '🤝',
    description: 'Donate 10 samosas, win hearts forever!',
    flavor: 'It\'s charity day! Donating samosas costs a little now but builds massive brand loyalty!',
    iconColor: 'text-pink-400',
    gradient: 'from-pink-500/10 to-transparent',
    effect: { charityCost: 10, brandBoost: 15, demandMultiplier: 1.2 },
  },
  {
    id: 'blogger_visit',
    name: '📸 Viral Foodie Visit',
    emoji: '📸',
    description: 'A food blogger with 10K followers is here!',
    flavor: 'OMG! A famous student food blogger is reviewing stalls today! Impress them and your stall goes VIRAL!',
    iconColor: 'text-rose-400',
    gradient: 'from-rose-500/10 to-transparent',
    effect: { demandMultiplier: 2.5, brandBoost: 20 },
  },
  {
    id: 'price_war',
    name: '⚔️ Price War!',
    emoji: '⚔️',
    description: 'Rival stall selling at rock-bottom prices',
    flavor: 'A competitor opened right next to you! They\'re selling samosas for ₹25. Can you beat them with quality?',
    iconColor: 'text-red-500',
    gradient: 'from-red-500/10 to-transparent',
    effect: { demandMultiplier: 0.7, brandPenalty: 3 },
  },
  {
    id: 'power_cut',
    name: '🔌 Power Cut',
    emoji: '🔌',
    description: 'No electricity — limited cooking capacity!',
    flavor: 'The power is out in the kitchen! You can only cook a limited batch today. Make every samosa count!',
    iconColor: 'text-gray-400',
    gradient: 'from-gray-500/10 to-transparent',
    effect: { forcedBatch: 100, satisfactionPenalty: 1 },
  },
  {
    id: 'diwali_near',
    name: '🪔 Diwali Buzz',
    emoji: '🪔',
    description: 'Festival season — everyone is celebratory!',
    flavor: 'Diwali is around the corner! The whole school is festive and students are treating themselves.',
    iconColor: 'text-yellow-400',
    gradient: 'from-amber-500/10 to-transparent',
    effect: { demandMultiplier: 1.5, brandBoost: 5 },
  },
];

// ─── Decision Options ─────────────────────────────────────────────────────────
const PRICE_OPTIONS = [
  { value: 30, label: 'Budget Bites', icon: '🏷️', desc: 'Attract crowds with low prices', vibe: 'Lots of customers, low margin' },
  { value: 50, label: 'Standard Samosa', icon: '⚖️', desc: 'Fair price for fair quality', vibe: 'Balanced customers & profit' },
  { value: 80, label: 'Premium Selection', icon: '💎', desc: 'Higher margins, fewer customers', vibe: 'Fewer customers, high margin' },
];

const BATCH_OPTIONS = [
  { value: 50, label: 'Small Batch', icon: '🍳', desc: '50 samosas — safe & steady', vibe: 'Low risk, low reward' },
  { value: 150, label: 'Medium Batch', icon: '🍳🍳', desc: '150 samosas — balanced', vibe: 'Balanced risk & reward' },
  { value: 300, label: 'Mass Production', icon: '🍳🍳🍳', desc: '300 samosas — go big!', vibe: 'High risk, high reward' },
];

const PROMO_OPTIONS = [
  { value: 300, label: 'Word of Mouth', icon: '🗣️', desc: 'Tell friends in class', vibe: 'Low cost, low reach' },
  { value: 1500, label: 'School Banner', icon: '🪧', desc: 'Hang banner at entrance', vibe: 'Medium reach, medium cost' },
  { value: 3000, label: 'Discount Coupon Blitz', icon: '🎉', desc: '₹5 off first 100 customers!', vibe: 'High reach, high cost' },
];

// Static color classes to avoid Tailwind dynamic class issue
const STAT_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  blue: { border: 'border-blue-500/10', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  yellow: { border: 'border-yellow-500/10', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  red: { border: 'border-red-500/10', text: 'text-red-400', bg: 'bg-red-500/10' },
  green: { border: 'border-green-500/10', text: 'text-green-400', bg: 'bg-green-500/10' },
  purple: { border: 'border-purple-500/10', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  pink: { border: 'border-pink-500/10', text: 'text-pink-400', bg: 'bg-pink-500/10' },
};

const CUSTOMER_REACTIONS = {
  happy: ['😊', '😄', '🤩', '🙌', '👏', '😋', '🥳'],
  neutral: ['😐', '🤔', '🧐', '🙂'],
  sad: ['😞', '😤', '😠', '💢', '😭'],
};



// ─── Component ────────────────────────────────────────────────────────────────
export default function RoundDashboard({ saveState, onRoundComplete }: RoundDashboardProps) {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<number | null>(null);
  const [stage, setStage] = useState<'decide' | 'simulate'>('decide');
  const [roundResult, setRoundResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmojis, setCustomerEmojis] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<MarketEvent | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const unitCost = saveState.unitCost || 20;
  const currentCash = saveState.cash || 50000;
  const round = saveState.currentRound || 5;
  const teamEff = saveState.teamEfficiency || 100;
  const previousEventId = saveState.lastEventId || null;

  const allChosen = selectedPrice !== null && selectedBatch !== null && selectedPromo !== null;

  // ─── Generate Random Event ─────────────────────────────────────────────────
  const generateEvent = useCallback(() => {
    // Exclude the "normal" event and the previous event to keep things interesting
    const excitingEvents = MARKET_EVENTS.filter(e => e.id !== 'normal' && e.id !== previousEventId);
    // 80% chance of an exciting event, 20% normal day
    const isExciting = Math.random() < 0.8;
    const pool = isExciting ? excitingEvents : MARKET_EVENTS.filter(e => e.id === 'normal');
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setCurrentEvent(chosen);
    setShowEvent(true);
  }, [previousEventId]);

  // Generate event when entering decision phase
  const eventGenerated = React.useRef(false);

  // Use effect for event generation to avoid side effects during render
  React.useEffect(() => {
    if (stage === 'decide' && !eventGenerated.current) {
      generateEvent();
      eventGenerated.current = true;
    }
    if (stage === 'simulate') {
      eventGenerated.current = false;
    }
  }, [stage, generateEvent]);

  // Auto-dismiss event banner after 5s
  React.useEffect(() => {
    if (showEvent && currentEvent) {
      const timer = setTimeout(() => setShowEvent(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showEvent, currentEvent?.id, round]);

  // ─── Handle Run Day ────────────────────────────────────────────────────────
  const handleRunDay = () => {
    if (!allChosen) return;

    const price = selectedPrice!;
    let production = selectedBatch!;
    const marketing = selectedPromo!;
    const event = currentEvent;

    // Apply event effects
    const effectiveCostMultiplier = event?.effect.costMultiplier || 1;
    const effectiveUnitCost = Math.round(unitCost * effectiveCostMultiplier);

    // Apply forced batch
    if (event?.effect.forcedBatch && production > event.effect.forcedBatch) {
      production = event.effect.forcedBatch;
    }

    // Apply max price restriction
    if (event?.effect.maxPrice && price > event.effect.maxPrice) {
      setErrorMsg(`⚠️ Health inspector won't allow prices above ₹${event.effect.maxPrice}! Choose a lower price.`);
      return;
    }

    // Apply charity cost (10 free samosas)
    let charitySamosas = 0;
    if (event?.effect.charityCost) {
      charitySamosas = event.effect.charityCost;
    }

    const totalExpenses = production * effectiveUnitCost + marketing + 2000;

    if (totalExpenses > currentCash) {
      setErrorMsg(`💸 Not enough cash! You need ₹${totalExpenses - currentCash} more. Choose cheaper options.`);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      let demandRatio = price > 80 ? 0.3 : price > 60 ? 0.7 : 1.2;

      // Apply event demand multiplier
      if (event?.effect.demandMultiplier) {
        demandRatio *= event.effect.demandMultiplier;
      }

      const teamBonus = 1 + (teamEff - 50) / 200;
      const baseCustomers = Math.round((marketing / 100 + 50) * demandRatio * teamBonus);
      // Subtract charity samosas from sellable inventory
      const sellableProduction = production - charitySamosas;
      const customersCount = Math.min(sellableProduction, baseCustomers);

      const revenue = customersCount * price;
      const profit = revenue - totalExpenses;

      // Satisfaction: base from price + event modifiers
      let satisfaction = price <= 50 ? 5 : price <= 70 ? 4 : 3;
      if (event?.effect.satisfactionBoost) satisfaction = Math.min(5, satisfaction + event.effect.satisfactionBoost);
      if (event?.effect.satisfactionPenalty) satisfaction = Math.max(1, satisfaction - event.effect.satisfactionPenalty);

      // Brand changes
      let brandDelta = profit > 0 ? 5 : -2;
      if (event?.effect.brandBoost) brandDelta += event.effect.brandBoost;
      if (event?.effect.brandPenalty) brandDelta -= event.effect.brandPenalty;

      const reactions: string[] = [];
      const reactArr = satisfaction >= 4 ? CUSTOMER_REACTIONS.happy : satisfaction === 3 ? CUSTOMER_REACTIONS.neutral : CUSTOMER_REACTIONS.sad;
      for (let i = 0; i < Math.min(customersCount, 15); i++) {
        reactions.push(reactArr[Math.floor(Math.random() * reactArr.length)]);
      }
      setCustomerEmojis(reactions);

      const eventSummary = generateEventSummary(event, effectiveUnitCost, charitySamosas);

      setRoundResult({
        customersServed: customersCount,
        revenue,
        expenses: totalExpenses,
        profit,
        satisfaction,
        brandDelta,
        charitySamosas,
        event,
        eventSummary,
        effectiveUnitCost,
        effectiveBatch: production,
      });
      setStage('simulate');
      setIsLoading(false);
      if (profit > 0) setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }, 800);
  };

  // ─── Handle Next Round ─────────────────────────────────────────────────────
  const handleNextRound = async () => {
    if (!roundResult) return;
    setIsLoading(true);

    const eventSummaryText = roundResult.event && roundResult.event.id !== 'normal'
      ? `${roundResult.event.emoji} ${roundResult.event.description}`
      : '☀️ Normal day';

    const nextSaveState = {
      ...saveState,
      cash: currentCash + roundResult.profit,
      currentRound: round + 1,
      sellingPrice: selectedPrice,
      brandStrength: Math.min(100, Math.max(0, (saveState.brandStrength || 0) + (roundResult.brandDelta || 0))),
      customerAwareness: Math.min(100, (saveState.customerAwareness || 10) + Math.round((selectedPromo || 0) / 400)),
      lastEventId: roundResult.event?.id || null,
      roundHistory: [
        ...(saveState.roundHistory || []),
        {
          round,
          customersServed: roundResult.customersServed,
          revenue: roundResult.revenue,
          expenses: roundResult.expenses,
          profit: roundResult.profit,
          event: eventSummaryText,
          feedback: roundResult.profit > 0 ? '🔥 Great day!' : '😰 Need to improve...'
        }
      ]
    };

    try {
      await api.post('/games/simulator/round-complete', {
        decisions: { price: selectedPrice, production: roundResult.effectiveBatch || selectedBatch, marketing: selectedPromo },
        results: roundResult,
        eventId: roundResult.event?.id || null,
        nextSaveState,
      });
    } catch (err) {
      console.error('Failed to save round:', err);
    }
    onRoundComplete(nextSaveState);
    setIsLoading(false);
  };

  const chartData = useMemo(() => (saveState.roundHistory || []).map((h: any) => ({
    round: `Wk ${h.round}`, Profit: h.profit, Revenue: h.revenue
  })), [saveState.roundHistory]);

  const handleNewDecisions = () => {
    setSelectedPrice(null);
    setSelectedBatch(null);
    setSelectedPromo(null);
    setStage('decide');
    setRoundResult(null);
    setCustomerEmojis([]);
    setErrorMsg(null);
    eventGenerated.current = false; // let useEffect trigger a fresh event
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800/60 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] text-slate-500 uppercase font-bold">Day</span>
            <span className="text-lg font-bold text-white">{round}</span>
            <span className="text-[10px] text-slate-600">/ 12</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-orange-400" />
            <span className="text-[10px] text-slate-500 uppercase font-bold">Stall</span>
            <span className="text-sm font-bold text-white">{saveState.startupName || 'Samosa Stall'}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800/60 rounded-lg text-center">
            <span className="text-[8px] text-slate-500 uppercase font-bold block">Cash</span>
            <span className="text-sm font-bold text-yellow-400">₹{currentCash}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800/60 rounded-lg text-center">
            <span className="text-[8px] text-slate-500 uppercase font-bold block">Brand</span>
            <span className="text-sm font-bold text-purple-400">{saveState.brandStrength || 0}%</span>
          </div>
        </div>
      </div>

      {/* ───── Event Banner ───── */}
      <AnimatePresence>
        {showEvent && currentEvent && currentEvent.id !== 'normal' && (
          <motion.div
            key={currentEvent.id + round}
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative overflow-hidden rounded-xl border border-slate-700/60 bg-gradient-to-r ${currentEvent.gradient} from-slate-900 to-slate-900/80 p-4`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <div className="text-8xl">{currentEvent.emoji}</div>
            </div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="text-4xl flex-shrink-0">{currentEvent.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm">{currentEvent.name}</h3>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    Day Event
                  </span>
                </div>
                <p className="text-slate-300 text-xs">{currentEvent.flavor}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
                    {currentEvent.description}
                  </span>
                </div>
              </div>
              <motion.button
                onClick={() => setShowEvent(false)}
                className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
                whileHover={{ scale: 1.1 }}
              >
                ✕
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Error Toast ───── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-300 text-xs"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-500 hover:text-red-300">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* ───── DECISION PHASE ───── */}
        {stage === 'decide' && (
          <motion.div key="decide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* Street Stall Visual Header */}
            <div className="relative bg-gradient-to-b from-slate-900/60 to-transparent border border-slate-800/40 rounded-2xl p-6 mb-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
              <div className="flex items-center gap-6">
                <div className="text-6xl">🏪</div>
                <div>
                  <h2 className="text-xl font-bold font-display text-white">
                    {currentEvent && currentEvent.id !== 'normal' ? (
                      <span>{currentEvent.emoji} Morning Prep — Day {round}</span>
                    ) : (
                      <span>☀️ Morning Prep — Day {round}</span>
                    )}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    The school bell is about to ring! Set up your <strong className="text-orange-400">samosa stall</strong> for today's recess rush.
                    <span className="block text-[10px] text-slate-500 mt-1">
                      ⚡ Team chemistry: <strong className="text-purple-400">{teamEff}%</strong> affects customer flow
                      {currentEvent && currentEvent.id !== 'normal' && (
                        <> · <strong className="text-blue-400">Event active: {currentEvent.emoji} {currentEvent.description}</strong></>
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Decision Rows */}
            <div className="space-y-4">
              {/* Price */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🏷️</span>
                  <h3 className="font-bold text-white text-sm">Set Today's Price</h3>
                  <span className="text-[9px] text-slate-500 ml-auto">Cost per samosa: ₹{unitCost}</span>
                  {currentEvent?.effect.costMultiplier && (
                    <span className="text-[9px] text-red-400 font-semibold">(×{currentEvent.effect.costMultiplier})</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {PRICE_OPTIONS.map(opt => {
                    const selected = selectedPrice === opt.value;
                    const isBlocked = currentEvent?.effect.maxPrice && opt.value > currentEvent.effect.maxPrice;
                    return (
                      <motion.button
                        key={opt.value} type="button"
                        onClick={() => !isBlocked && setSelectedPrice(opt.value)}
                        disabled={!!isBlocked}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          isBlocked
                            ? 'opacity-30 cursor-not-allowed border-red-900/40 bg-red-950/20'
                            : selected
                              ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                              : 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700'
                        }`}
                        whileHover={isBlocked ? {} : { scale: 1.02 }}
                        whileTap={isBlocked ? {} : { scale: 0.98 }}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="font-bold text-white text-xs">{opt.label}</div>
                        <div className="text-lg font-bold text-yellow-400 my-1">₹{opt.value}</div>
                        <div className="text-[9px] text-slate-500 leading-tight">{opt.vibe}</div>
                        {isBlocked && <div className="mt-1 text-red-400 text-[9px] font-bold">🚫 Restricted</div>}
                        {selected && !isBlocked && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 text-purple-400 text-[9px] font-bold">✓ Selected</motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Batch */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="h-4 w-4 text-orange-400" />
                  <h3 className="font-bold text-white text-sm">Cook Samosas</h3>
                  <span className="text-[9px] text-slate-500 ml-auto">
                    {currentEvent?.effect.costMultiplier
                      ? <>Unit cost: <span className="text-red-400">₹{Math.round(unitCost * currentEvent.effect.costMultiplier)}</span> <span className="line-through text-slate-600">₹{unitCost}</span></>
                      : <>Each samosa costs ₹{unitCost} to make</>
                    }
                  </span>
                  {currentEvent?.effect.forcedBatch && (
                    <span className="text-[9px] text-yellow-400 font-semibold">(Max: {currentEvent.effect.forcedBatch} units)</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {BATCH_OPTIONS.map(opt => {
                    const selected = selectedBatch === opt.value;
                    const maxBatch = currentEvent?.effect.forcedBatch || 999;
                    const effectiveValue = Math.min(opt.value, maxBatch);
                    const isDisabled = effectiveValue < opt.value; // Option exceeds max batch
                    const cost = effectiveValue * (currentEvent?.effect.costMultiplier ? Math.round(unitCost * currentEvent.effect.costMultiplier) : unitCost);
                    const affordable = cost <= currentCash && !isDisabled;
                    return (
                      <motion.button
                        key={opt.value} type="button"
                        onClick={() => affordable && setSelectedBatch(effectiveValue)}
                        disabled={!affordable}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          !affordable ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950'
                            : selected
                              ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                              : 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700'
                        }`}
                        whileHover={affordable ? { scale: 1.02 } : {}}
                        whileTap={affordable ? { scale: 0.98 } : {}}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="font-bold text-white text-xs">{opt.label}</div>
                        <div className="text-lg font-bold text-white my-1">{effectiveValue} units</div>
                        <div className="text-[9px] text-orange-400 font-semibold">{affordable ? `₹${cost}` : '💸 Can\'t afford!'}</div>
                        <div className="text-[8px] text-slate-500 mt-1">{opt.vibe}</div>
                        {isDisabled && <div className="text-[8px] text-yellow-400 mt-1">🔌 Limited by event</div>}
                        {selected && !isDisabled && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 text-purple-400 text-[9px] font-bold">✓ Ready to cook</motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Promo */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone className="h-4 w-4 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">Promote Your Stall</h3>
                  <span className="text-[9px] text-slate-500 ml-auto">Attract more customers!</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {PROMO_OPTIONS.map(opt => {
                    const selected = selectedPromo === opt.value;
                    const affordable = opt.value <= currentCash;
                    return (
                      <motion.button
                        key={opt.value} type="button"
                        onClick={() => affordable && setSelectedPromo(opt.value)}
                        disabled={!affordable}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          !affordable ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950'
                            : selected
                              ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                              : 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700'
                        }`}
                        whileHover={affordable ? { scale: 1.02 } : {}}
                        whileTap={affordable ? { scale: 0.98 } : {}}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="font-bold text-white text-xs">{opt.label}</div>
                        <div className="text-lg font-bold text-blue-400 my-1">₹{opt.value}</div>
                        <div className="text-[9px] text-slate-500 leading-tight">{opt.desc}</div>
                        {selected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 text-purple-400 text-[9px] font-bold">✓ Will promote</motion.div>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <motion.button
              onClick={handleRunDay}
              disabled={!allChosen || isLoading}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 border border-orange-500/20 transition-all shadow-lg shadow-orange-500/10"
              whileHover={allChosen ? { scale: 1.01 } : {}}
              whileTap={allChosen ? { scale: 0.99 } : {}}
            >
              {isLoading
                ? <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Opening Stall...</span>
                : <>{currentEvent && currentEvent.id !== 'normal' ? `${currentEvent.emoji} Open for Recess!` : '🚀 Open for Recess!'} <ArrowRight className="h-4 w-4" /></>
              }
            </motion.button>

            {allChosen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex gap-4 text-slate-400">
                  <span>Price: <strong className="text-white">₹{selectedPrice}</strong></span>
                  <span>Batch: <strong className="text-white">{selectedBatch} units</strong></span>
                  <span>Promo: <strong className="text-white">₹{selectedPromo}</strong></span>
                </div>
                <span className="text-slate-500">
                  Cost: <strong className="text-red-400">₹{(selectedBatch! * (currentEvent?.effect.costMultiplier ? Math.round(unitCost * currentEvent.effect.costMultiplier) : unitCost)) + selectedPromo! + 2000}</strong>
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ───── RESULTS PHASE ───── */}
        {stage === 'simulate' && roundResult && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            {/* Event Impact Summary */}
            {roundResult.event && roundResult.event.id !== 'normal' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-4 p-3 rounded-xl border ${roundResult.event.iconColor === 'text-blue-400' ? 'border-blue-500/20 bg-blue-500/5' : roundResult.event.iconColor === 'text-purple-400' ? 'border-purple-500/20 bg-purple-500/5' : roundResult.event.iconColor === 'text-red-400' || roundResult.event.iconColor === 'text-red-500' ? 'border-red-500/20 bg-red-500/5' : roundResult.event.iconColor === 'text-yellow-400' || roundResult.event.iconColor === 'text-yellow-500' ? 'border-yellow-500/20 bg-yellow-500/5' : roundResult.event.iconColor === 'text-orange-400' ? 'border-orange-500/20 bg-orange-500/5' : 'border-slate-500/20 bg-slate-500/5'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{roundResult.event.emoji}</span>
                  <div>
                    <span className="font-bold text-white text-xs">{roundResult.event.name}</span>
                    <span className="text-slate-400 text-[10px] ml-2">— {roundResult.eventSummary}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Animated Customer Flow */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/60 mb-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  Recess Rush — Customer Flow
                </h3>
                <span className="text-xs text-slate-400">{roundResult.customersServed} arrived</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[60px] bg-slate-950/40 border border-slate-800/40 rounded-xl p-4">
                <AnimatePresence>
                  {customerEmojis.map((emoji, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 30, scale: 0 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                      className="text-xl"
                    >{emoji}</motion.span>
                  ))}
                </AnimatePresence>
                {customerEmojis.length === 0 && <span className="text-slate-600 text-xs italic">No customers arrived today...</span>}
              </div>
              {roundResult.charitySamosas > 0 && (
                <div className="mt-2 text-[10px] text-pink-400 text-center">
                  🤝 Donated {roundResult.charitySamosas} samosas to charity! Brand love +15%
                </div>
              )}
              <div className="flex items-center justify-center gap-4 mt-4 text-3xl">
                <span className="opacity-40">🏃</span>
                <span className="opacity-60">🏃‍♂️</span>
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>🏪</motion.span>
                <span className="opacity-60">🏃‍♀️</span>
                <span className="opacity-40">🏃</span>
              </div>
            </div>

            {/* Results Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Customers Served', value: roundResult.customersServed.toString(), icon: Users, color: 'blue' as const },
                { label: 'Revenue', value: `₹${roundResult.revenue}`, icon: Coins, color: 'yellow' as const },
                { label: 'Expenses', value: `₹${roundResult.expenses}`, icon: TrendingDown, color: 'red' as const },
                { label: 'Profit', value: `₹${roundResult.profit}`, icon: roundResult.profit > 0 ? TrendingUp : TrendingDown, color: roundResult.profit > 0 ? 'green' as const : 'red' as const },
              ].map((stat, i) => {
                const Icon = stat.icon;
                const c = STAT_COLORS[stat.color] || STAT_COLORS.blue;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`glass-panel p-4 rounded-xl border ${c.border} text-center`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${c.text}`} />
                    <div className="text-[9px] text-slate-500 uppercase font-bold">{stat.label}</div>
                    <div className={`text-lg font-bold ${c.text} mt-0.5`}>{stat.value}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Brand Delta */}
            {roundResult.brandDelta !== undefined && roundResult.brandDelta !== 0 && (
              <div className="glass-panel p-3 rounded-xl border border-purple-800/40 mb-6">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-slate-400">Brand change:</span>
                  <span className={`font-bold ${roundResult.brandDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {roundResult.brandDelta > 0 ? '+' : ''}{roundResult.brandDelta}%
                  </span>
                  {roundResult.event && roundResult.event.id !== 'normal' && (
                    <span className="text-slate-500 text-[10px]">(affected by {roundResult.event.emoji})</span>
                  )}
                </div>
              </div>
            )}

            {/* Satisfaction bar */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800/40 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400/30" />
                  Customer Satisfaction
                </span>
                <motion.span
                  key={roundResult.satisfaction}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className={`text-lg font-bold ${roundResult.satisfaction >= 4 ? 'text-green-400' : roundResult.satisfaction >= 3 ? 'text-yellow-400' : 'text-red-400'}`}
                >
                  {'★'.repeat(roundResult.satisfaction)}{'☆'.repeat(5 - roundResult.satisfaction)}
                </motion.span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(roundResult.satisfaction / 5) * 100}%` }}
                  className={`h-full rounded-full ${roundResult.satisfaction >= 4 ? 'bg-green-500' : roundResult.satisfaction >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 mb-6">
                <h3 className="font-bold text-white text-sm mb-4">📈 Profit Trend</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="round" stroke="#64748b" style={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" style={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="Profit" stroke="#a855f7" strokeWidth={2} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Revenue" stroke="#eab308" strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleNewDecisions}
                className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                ↩️ Change Decisions
              </motion.button>
              <motion.button
                onClick={handleNextRound}
                disabled={isLoading}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-purple-500/20"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isLoading ? 'Saving...' : `Next Day → Day ${round + 1}`} <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>

            <AnimatePresence>
              {showCelebration && roundResult.profit > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 50, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 20, x: '-50%' }}
                  className="fixed bottom-8 left-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl border border-green-400/30 flex items-center gap-3 z-50"
                >
                  <PartyPopper className="h-5 w-5" />
                  <span className="font-bold text-sm">
                    Profit Day! ₹{roundResult.profit} earned{roundResult.event && roundResult.event.id !== 'normal' ? ` (${roundResult.event.emoji})` : ''} 🎉
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Event Summary Generator ─────────────────────────────────────────────────
function generateEventSummary(event: MarketEvent | null, effectiveCost: number, charitySamosas: number): string {
  if (!event || event.id === 'normal') return 'No special events today.';
  switch (event.id) {
    case 'rainy': return 'Reduced customer turnout due to rain.';
    case 'food_festival': return 'Huge demand boost from the food festival!';
    case 'exam_week': return 'Fewer customers but higher satisfaction per sale.';
    case 'cricket_win': return 'Victory celebrations drove extra foot traffic!';
    case 'supplier_shortage': return `Ingredient costs increased to ₹${effectiveCost}/unit.`;
    case 'health_inspector': return 'Kept prices fair for the inspector visit.';
    case 'charity_day': return `Donated ${charitySamosas} samosas — brand love increased!`;
    case 'blogger_visit': return 'Viral exposure from food blogger review!';
    case 'price_war': return 'Competitor pricing affected customer turnout.';
    case 'power_cut': return 'Limited cooking capacity due to power outage.';
    case 'diwali_near': return 'Festival buzz brought extra celebratory customers!';
    default: return event.description;
  }
}
