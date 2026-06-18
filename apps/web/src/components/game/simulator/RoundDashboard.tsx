import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ArrowRight, Coins, TrendingUp, TrendingDown, Users, Star,
  ShoppingBag, Megaphone, ChefHat, PartyPopper, Timer,
  AlertTriangle, Lightbulb
} from 'lucide-react';
import api from '../../../lib/api';
import CustomerAnimation from './CustomerAnimation';
import EventCard, { EVENT_DECKS, BusinessEvent } from './EventCard';

interface RoundDashboardProps {
  saveState: any;
  onRoundComplete: (updatedSave: any) => void;
}

// ─── Market Events (existing) ─────────────────────────────────────────────────
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
  { id: 'normal', name: '☀️ Clear Skies', emoji: '☀️', description: 'Just another regular school day', flavor: 'A calm, predictable day at school. No surprises — time to focus on the basics!', iconColor: 'text-yellow-400', gradient: 'from-yellow-500/10 to-transparent', effect: {} },
  { id: 'rainy', name: '🌧️ Monsoon Drizzle', emoji: '🌧️', description: 'Rain keeps students indoors', flavor: 'The rain is pouring. Students are hiding in classrooms — fewer will venture to your stall today.', iconColor: 'text-blue-400', gradient: 'from-blue-500/10 to-transparent', effect: { demandMultiplier: 0.5 } },
  { id: 'food_festival', name: '🎪 Food Fest Frenzy', emoji: '🎪', description: 'Annual food festival — double the hunger!', flavor: 'The school is buzzing with food festival energy! Every student wants a snack. Time to cash in!', iconColor: 'text-purple-400', gradient: 'from-purple-500/10 to-transparent', effect: { demandMultiplier: 2.2, brandBoost: 5 } },
  { id: 'exam_week', name: '📚 Exam Cram Session', emoji: '📚', description: 'Stress-eating students seek comfort food', flavor: 'Exams are here! Fewer students are roaming, but those who come NEED their samosa fix.', iconColor: 'text-red-400', gradient: 'from-red-500/10 to-transparent', effect: { demandMultiplier: 0.6, satisfactionBoost: 1 } },
  { id: 'cricket_win', name: '🏏 Victory Fever!', emoji: '🏏', description: 'India won the match! Parties everywhere!', flavor: 'INDIA WON! 🏆 Students are dancing in the corridors. Everyone wants to celebrate with samosas!', iconColor: 'text-orange-400', gradient: 'from-orange-500/10 to-transparent', effect: { demandMultiplier: 1.8, brandBoost: 3 } },
  { id: 'supplier_shortage', name: '📦 Ingredient Shortage', emoji: '📦', description: 'Potato prices shot up overnight!', flavor: 'Bad news — the supplier raised prices! Every samosa costs more to make today. Can you still turn a profit?', iconColor: 'text-yellow-500', gradient: 'from-yellow-500/10 to-transparent', effect: { costMultiplier: 1.5 } },
  { id: 'health_inspector', name: '🔍 Inspector Visit', emoji: '🔍', description: 'Health inspector roaming — keep prices fair!', flavor: 'The school health inspector is doing rounds. Overpricing could hurt your reputation!', iconColor: 'text-cyan-400', gradient: 'from-cyan-500/10 to-transparent', effect: { maxPrice: 50, brandPenalty: 8 } },
  { id: 'charity_day', name: '🤝 Charity Drive', emoji: '🤝', description: 'Donate 10 samosas, win hearts forever!', flavor: 'It\'s charity day! Donating samosas costs a little now but builds massive brand loyalty!', iconColor: 'text-pink-400', gradient: 'from-pink-500/10 to-transparent', effect: { charityCost: 10, brandBoost: 15, demandMultiplier: 1.2 } },
  { id: 'blogger_visit', name: '📸 Viral Foodie Visit', emoji: '📸', description: 'A food blogger with 10K followers is here!', flavor: 'OMG! A famous student food blogger is reviewing stalls today! Impress them and your stall goes VIRAL!', iconColor: 'text-rose-400', gradient: 'from-rose-500/10 to-transparent', effect: { demandMultiplier: 2.5, brandBoost: 20 } },
  { id: 'price_war', name: '⚔️ Price War!', emoji: '⚔️', description: 'Rival stall selling at rock-bottom prices', flavor: 'A competitor opened right next to you! They\'re selling samosas for ₹25. Can you beat them with quality?', iconColor: 'text-red-500', gradient: 'from-red-500/10 to-transparent', effect: { demandMultiplier: 0.7, brandPenalty: 3 } },
  { id: 'power_cut', name: '🔌 Power Cut', emoji: '🔌', description: 'No electricity — limited cooking capacity!', flavor: 'The power is out in the kitchen! You can only cook a limited batch today. Make every samosa count!', iconColor: 'text-gray-400', gradient: 'from-gray-500/10 to-transparent', effect: { forcedBatch: 100, satisfactionPenalty: 1 } },
  { id: 'diwali_near', name: '🪔 Diwali Buzz', emoji: '🪔', description: 'Festival season — everyone is celebratory!', flavor: 'Diwali is around the corner! The whole school is festive and students are treating themselves.', iconColor: 'text-yellow-400', gradient: 'from-amber-500/10 to-transparent', effect: { demandMultiplier: 1.5, brandBoost: 5 } },
];

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

const STAT_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  blue: { border: 'border-blue-500/10', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  yellow: { border: 'border-yellow-500/10', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  red: { border: 'border-red-500/10', text: 'text-red-400', bg: 'bg-red-500/10' },
  green: { border: 'border-green-500/10', text: 'text-green-400', bg: 'bg-green-500/10' },
  purple: { border: 'border-purple-500/10', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  pink: { border: 'border-pink-500/10', text: 'text-pink-400', bg: 'bg-pink-500/10' },
};

const CUSTOMER_REVIEWS = [
  { emoji: '😊', text: '"Best samosas in school! The chutney is amazing!"' },
  { emoji: '🤔', text: '"Decent taste but I wish they had more options."' },
  { emoji: '😤', text: '"Too expensive for the portion size. Not worth it."' },
  { emoji: '😄', text: '"Quick service and friendly staff! Will come again!"' },
  { emoji: '😐', text: '"It was okay. Nothing special honestly."' },
  { emoji: '🤩', text: '"OMG the cheese samosa is life-changing! 🤯"' },
  { emoji: '😞', text: '"They were cold by the time I got mine. Sad."' },
  { emoji: '👏', text: '"Great packaging! Very hygienic."' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function RoundDashboard({ saveState, onRoundComplete }: RoundDashboardProps) {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<number | null>(null);
  const [stage, setStage] = useState<'briefing' | 'decide' | 'simulate' | 'weekly_report'>('briefing');
  const [roundResult, setRoundResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmojis, setCustomerEmojis] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<MarketEvent | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New game mechanic states
  const [activeBusinessEvent, setActiveBusinessEvent] = useState<BusinessEvent | null>(null);
  const [showBusinessEvent, setShowBusinessEvent] = useState(false);
  const [businessEventResult, setBusinessEventResult] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'animating' | 'done'>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [customerReview, setCustomerReview] = useState(CUSTOMER_REVIEWS[0]);
  const [showCashRegister, setShowCashRegister] = useState(false);
  const [keyInsight, setKeyInsight] = useState('');

  const unitCost = saveState.unitCost || 20;
  const currentCash = saveState.cash || 50000;
  const round = saveState.currentRound || 5;
  const teamEff = saveState.teamEfficiency || 100;
  const previousEventId = saveState.lastEventId || null;

  const allChosen = selectedPrice !== null && selectedBatch !== null && selectedPromo !== null;

  // Generate random customer review
  useEffect(() => {
    setCustomerReview(CUSTOMER_REVIEWS[Math.floor(Math.random() * CUSTOMER_REVIEWS.length)]);
  }, [round]);

  // ─── Generate Market Event ─────────────────────────────────────────────────
  const generateEvent = useCallback(() => {
    const excitingEvents = MARKET_EVENTS.filter(e => e.id !== 'normal' && e.id !== previousEventId);
    const isExciting = Math.random() < 0.8;
    const pool = isExciting ? excitingEvents : MARKET_EVENTS.filter(e => e.id === 'normal');
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setCurrentEvent(chosen);
    setShowEvent(true);
  }, [previousEventId]);

  const eventGenerated = useRef(false);

  useEffect(() => {
    if (stage === 'decide' && !eventGenerated.current) {
      generateEvent();
      eventGenerated.current = true;
    }
    if (stage !== 'decide') {
      eventGenerated.current = false;
    }
  }, [stage, generateEvent]);

  // Auto-dismiss event banner
  useEffect(() => {
    if (showEvent && currentEvent) {
      const timer = setTimeout(() => setShowEvent(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showEvent, currentEvent?.id, round]);

  // ─── Random Business Event Generator ───────────────────────────────────────
  const triggerBusinessEvent = useCallback((): boolean => {
    // 45% chance of a business event per round
    if (Math.random() > 0.45) return false;

    const eventKeys = Object.keys(EVENT_DECKS);
    const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
    setActiveBusinessEvent(EVENT_DECKS[randomKey]);
    setShowBusinessEvent(true);
    return true;
  }, []);

  // ─── Handle Business Event Choice ──────────────────────────────────────────
  const handleBusinessEventChoice = useCallback((choiceId: string) => {
    setShowBusinessEvent(false);
    setBusinessEventResult(choiceId);
  }, []);

  // ─── Wait for business event before running simulation ────────────────────
  const [pendingRunDay, setPendingRunDay] = useState(false);

  // When business event is dismissed and we have a result, run the simulation
  useEffect(() => {
    if (pendingRunDay && !showBusinessEvent && businessEventResult !== null) {
      setPendingRunDay(false);
      executeSimulation();
    }
  }, [pendingRunDay, showBusinessEvent, businessEventResult]);

  // ─── Handle Run Day ────────────────────────────────────────────────────────
  const handleRunDay = () => {
    if (!allChosen) return;

    const price = selectedPrice!;
    let production = selectedBatch!;
    const marketing = selectedPromo!;
    const event = currentEvent;

    const effectiveCostMultiplier = event?.effect.costMultiplier || 1;
    const effectiveUnitCost = Math.round(unitCost * effectiveCostMultiplier);

    if (event?.effect.forcedBatch && production > event.effect.forcedBatch) {
      production = event.effect.forcedBatch;
    }

    if (event?.effect.maxPrice && price > event.effect.maxPrice) {
      setErrorMsg(`⚠️ Health inspector won't allow prices above ₹${event.effect.maxPrice}! Choose a lower price.`);
      return;
    }

    const totalExpenses = production * effectiveUnitCost + marketing + 2000;

    if (totalExpenses > currentCash) {
      setErrorMsg(`💸 Not enough cash! You need ₹${totalExpenses - currentCash} more. Choose cheaper options.`);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    // Trigger business event (may show card requiring user choice) — use return value,
    // not the state variable, since state update is async
    const hasBusinessEvent = triggerBusinessEvent();

    if (hasBusinessEvent) {
      setPendingRunDay(true);
      return;
    }

    // No business event triggered — run simulation directly
    executeSimulation();
  };

  // ─── Execute Simulation (extracted for both direct and event-delayed paths) ─
  const executeSimulation = () => {
    if (!allChosen) return;
    const price = selectedPrice!;
    let production = selectedBatch!;
    const marketing = selectedPromo!;
    const event = currentEvent;

    const effectiveCostMultiplier = event?.effect.costMultiplier || 1;
    const effectiveUnitCost = Math.round(unitCost * effectiveCostMultiplier);

    let demandRatio = price > 80 ? 0.3 : price > 60 ? 0.7 : 1.2;

    if (event?.effect.demandMultiplier) {
      demandRatio *= event.effect.demandMultiplier;
    }

    const teamBonus = 1 + (teamEff - 50) / 200;
    const baseCustomers = Math.round((marketing / 100 + 50) * demandRatio * teamBonus);
    const sellableProduction = production - (event?.effect.charityCost || 0);
    const customersCount = Math.min(sellableProduction, baseCustomers);

    // Apply business event effects (now resolved since user made choice or no event)
    let eventDemandBoost = 1;
    let eventPriceBoost = 1;
    if (businessEventResult) {
      if (businessEventResult === 'serve_fast' || businessEventResult === 'max_capacity' || businessEventResult === 'referral_bonus') {
        eventDemandBoost = 1.5;
      } else if (businessEventResult === 'premium_rush' || businessEventResult === 'premium_price' || businessEventResult === 'raise_price') {
        eventPriceBoost = 1.3;
      } else if (businessEventResult === 'quality_focus' || businessEventResult === 'story_branding') {
        eventDemandBoost = 1.2;
      }
    }

    const finalCustomers = Math.round(customersCount * eventDemandBoost);
    const totalExpenses = production * effectiveUnitCost + marketing + 2000;
    const charitySamosas = event?.effect.charityCost || 0;
    const finalPrice = Math.round(price * eventPriceBoost);
    const revenue = finalCustomers * finalPrice;
    const profit = revenue - totalExpenses;

    let satisfaction = price <= 50 ? 5 : price <= 70 ? 4 : 3;
    if (event?.effect.satisfactionBoost) satisfaction = Math.min(5, satisfaction + event.effect.satisfactionBoost);
    if (event?.effect.satisfactionPenalty) satisfaction = Math.max(1, satisfaction - event.effect.satisfactionPenalty);

    let brandDelta = profit > 0 ? 5 : -2;
    if (event?.effect.brandBoost) brandDelta += event.effect.brandBoost;
    if (event?.effect.brandPenalty) brandDelta -= event.effect.brandPenalty;

    // Generate key insight
    const insightOptions = [
      `⚡ Hot insight: Your profit would double if you cut ₹5 from costs`,
      `💡 Insight: Increasing price by ₹10 could boost revenue by ${Math.round((10/finalPrice)*100)}%`,
      `📊 Insight: Marketing spend of ₹${marketing} brought ${finalCustomers} customers (₹${Math.round(marketing/finalCustomers)}/customer)`,
      `🎯 Insight: Team efficiency of ${teamEff}% multiplied your output by ${teamBonus.toFixed(2)}x`,
      `🔥 Insight: Your margin per customer is ${Math.round((finalPrice - effectiveUnitCost)/finalPrice*100)}%`,
    ];
    setKeyInsight(insightOptions[Math.floor(Math.random() * insightOptions.length)]);

    const reactions: string[] = [];
    const reactArr = satisfaction >= 4 ? ['😊', '😄', '🤩', '🙌'] : satisfaction === 3 ? ['😐', '🤔', '🙂'] : ['😞', '😤', '😠'];
    for (let i = 0; i < Math.min(finalCustomers, 15); i++) {
      reactions.push(reactArr[Math.floor(Math.random() * reactArr.length)]);
    }
    setCustomerEmojis(reactions);

    const eventSummary = generateEventSummary(event, effectiveUnitCost, charitySamosas);

    setRoundResult({
      customersServed: finalCustomers,
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
      marketing,
    });

    setAnimationPhase('animating');
    setStage('simulate');
    setIsLoading(false);
  };

  // ─── Handle Simulation Animation Complete ──────────────────────────────────
  const handleAnimationComplete = useCallback(() => {
    setAnimationPhase('done');
    if (roundResult?.profit > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [roundResult]);

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
          satisfaction: roundResult.satisfaction,
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
    setBusinessEventResult(null);
    setAnimationPhase('idle');
    setShowConfetti(false);
    eventGenerated.current = false;
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

      {/* ───── Business Event Card (floating overlay) ───── */}
      <AnimatePresence>
        {showBusinessEvent && activeBusinessEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <EventCard
              event={activeBusinessEvent}
              onChoose={handleBusinessEventChoice}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Day Event</span>
                </div>
                <p className="text-slate-300 text-xs">{currentEvent.flavor}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">{currentEvent.description}</span>
                </div>
              </div>
              <motion.button onClick={() => setShowEvent(false)} className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0" whileHover={{ scale: 1.1 }}>✕</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Error Toast ───── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
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
            <div className="relative bg-gradient-to-b from-slate-900/60 to-transparent border border-slate-800/40 rounded-2xl p-6 mb-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
              <div className="flex items-center gap-6">
                <div className="text-6xl">🏪</div>
                <div>
                  <h2 className="text-xl font-bold font-display text-white">
                    {currentEvent && currentEvent.id !== 'normal'
                      ? <span>{currentEvent.emoji} Morning Prep — Day {round}</span>
                      : <span>☀️ Morning Prep — Day {round}</span>
                    }
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    The school bell is about to ring! Set up your <strong className="text-orange-400">samosa stall</strong> for today's recess rush.
                    <span className="block text-[10px] text-slate-500 mt-1">
                      ⚡ Team chemistry: <strong className="text-purple-400">{teamEff}%</strong> · Budget: ₹{currentCash}
                      {currentEvent && currentEvent.id !== 'normal' && <> · <strong className="text-blue-400">Event: {currentEvent.emoji} {currentEvent.description}</strong></>}
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
                  {currentEvent?.effect.costMultiplier && <span className="text-[9px] text-red-400 font-semibold">(×{currentEvent.effect.costMultiplier})</span>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {PRICE_OPTIONS.map(opt => {
                    const selected = selectedPrice === opt.value;
                    const isBlocked = currentEvent?.effect.maxPrice && opt.value > currentEvent.effect.maxPrice;
                    return (
                      <motion.button key={opt.value} type="button" onClick={() => !isBlocked && setSelectedPrice(opt.value)} disabled={!!isBlocked}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${isBlocked ? 'opacity-30 cursor-not-allowed border-red-900/40 bg-red-950/20' : selected ? 'border-game-orange bg-game-orange/10 ring-1 ring-game-orange/30' : 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700'}`}
                        whileHover={isBlocked ? {} : { scale: 1.02 }} whileTap={isBlocked ? {} : { scale: 0.98 }}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="font-bold text-white text-xs">{opt.label}</div>
                        <div className="text-lg font-bold text-yellow-400 my-1">₹{opt.value}</div>
                        <div className="text-[9px] text-slate-500 leading-tight">{opt.vibe}</div>
                        {isBlocked && <div className="mt-1 text-red-400 text-[9px] font-bold">🚫 Restricted</div>}
                        {selected && !isBlocked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 text-game-orange text-[9px] font-bold">✓ Selected</motion.div>}
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
                  {currentEvent?.effect.forcedBatch && <span className="text-[9px] text-yellow-400 font-semibold">(Max: {currentEvent.effect.forcedBatch} units)</span>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {BATCH_OPTIONS.map(opt => {
                    const selected = selectedBatch === opt.value;
                    const maxBatch = currentEvent?.effect.forcedBatch || 999;
                    const effectiveValue = Math.min(opt.value, maxBatch);
                    const isDisabled = effectiveValue < opt.value;
                    const cost = effectiveValue * (currentEvent?.effect.costMultiplier ? Math.round(unitCost * currentEvent.effect.costMultiplier) : unitCost);
                    const affordable = cost <= currentCash && !isDisabled;
                    return (
                      <motion.button key={opt.value} type="button" onClick={() => affordable && setSelectedBatch(effectiveValue)} disabled={!affordable}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${!affordable ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950' : selected ? 'border-game-orange bg-game-orange/10 ring-1 ring-game-orange/30' : 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700'}`}
                        whileHover={affordable ? { scale: 1.02 } : {}} whileTap={affordable ? { scale: 0.98 } : {}}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="font-bold text-white text-xs">{opt.label}</div>
                        <div className="text-lg font-bold text-white my-1">{effectiveValue} units</div>
                        <div className="text-[9px] text-orange-400 font-semibold">{affordable ? `₹${cost}` : '💸 Can\'t afford!'}</div>
                        <div className="text-[8px] text-slate-500 mt-1">{opt.vibe}</div>
                        {isDisabled && <div className="text-[8px] text-yellow-400 mt-1">🔌 Limited by event</div>}
                        {selected && !isDisabled && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 text-game-orange text-[9px] font-bold">✓ Ready to cook</motion.div>}
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
                      <motion.button key={opt.value} type="button" onClick={() => affordable && setSelectedPromo(opt.value)} disabled={!affordable}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${!affordable ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950' : selected ? 'border-game-orange bg-game-orange/10 ring-1 ring-game-orange/30' : 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700'}`}
                        whileHover={affordable ? { scale: 1.02 } : {}} whileTap={affordable ? { scale: 0.98 } : {}}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="font-bold text-white text-xs">{opt.label}</div>
                        <div className="text-lg font-bold text-blue-400 my-1">₹{opt.value}</div>
                        <div className="text-[9px] text-slate-500 leading-tight">{opt.desc}</div>
                        {selected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 text-game-orange text-[9px] font-bold">✓ Will promote</motion.div>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <motion.button onClick={handleRunDay} disabled={!allChosen || isLoading}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-game-orange to-purple-600 hover:from-orange-700 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 border border-orange-500/20 transition-all shadow-lg shadow-game-orange/10"
              whileHover={allChosen ? { scale: 1.01 } : {}} whileTap={allChosen ? { scale: 0.99 } : {}}
            >
              {isLoading
                ? <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Opening Stall...</span>
                : <>{currentEvent && currentEvent.id !== 'normal' ? `${currentEvent.emoji} Open for Recess!` : '🚀 Open for Recess!'} <ArrowRight className="h-4 w-4" /></>
              }
            </motion.button>
          </motion.div>
        )}

        {/* ───── SIMULATION PHASE (Live Customer Animation) ───── */}
        {stage === 'simulate' && roundResult && (
          <motion.div key="simulate" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
            {/* Live Customer Simulation */}
            <CustomerAnimation
              customersServed={roundResult.customersServed}
              totalCustomers={roundResult.customersServed + (roundResult.charitySamosas || 0)}
              revenue={roundResult.revenue}
              satisfaction={roundResult.satisfaction}
              onAnimationComplete={handleAnimationComplete}
              hasEvent={!!activeBusinessEvent}
              eventType={activeBusinessEvent?.id}
            />

            {/* Skip button if animation takes too long */}
            {animationPhase !== 'done' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                onClick={handleAnimationComplete}
                className="w-full py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
              >
                ⏭ Skip Animation
              </motion.button>
            )}

            {/* Post-Simulation: Show results once animation done */}
            <AnimatePresence>
              {animationPhase === 'done' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Results Dashboard */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Customers Served', value: roundResult.customersServed.toString(), icon: Users, color: 'blue' as const },
                      { label: 'Revenue', value: `₹${roundResult.revenue}`, icon: Coins, color: 'yellow' as const },
                      { label: 'Expenses', value: `₹${roundResult.expenses}`, icon: TrendingDown, color: 'red' as const },
                      { label: 'Profit', value: `₹${roundResult.profit}`, icon: roundResult.profit > 0 ? TrendingUp : TrendingDown, color: roundResult.profit > 0 ? 'green' as const : 'red' as const },
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      const c = STAT_COLORS[stat.color] || STAT_COLORS.blue;
                      return (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                          className={`glass-panel p-4 rounded-xl border ${c.border} text-center`}
                        >
                          <Icon className={`h-5 w-5 mx-auto mb-1 ${c.text}`} />
                          <div className="text-[9px] text-slate-500 uppercase font-bold">{stat.label}</div>
                          <div className={`text-lg font-bold ${c.text} mt-0.5`}>{stat.value}</div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Event Summary */}
                  {roundResult.event && roundResult.event.id !== 'normal' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-xl border border-slate-700/50 bg-slate-900/40"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-xl">{roundResult.event.emoji}</span>
                        <span className="text-slate-300">{roundResult.event.name}</span>
                        <span className="text-slate-500">— {roundResult.eventSummary}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Brand Delta */}
                  {roundResult.brandDelta !== undefined && roundResult.brandDelta !== 0 && (
                    <div className="p-3 rounded-xl border border-purple-800/40 bg-purple-900/10">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="text-slate-400">Brand change:</span>
                        <span className={`font-bold ${roundResult.brandDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {roundResult.brandDelta > 0 ? '+' : ''}{roundResult.brandDelta}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Satisfaction bar */}
                  <div className="p-4 rounded-xl border border-slate-800/40 bg-slate-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400/30" />
                        Customer Satisfaction
                      </span>
                      <motion.span key={roundResult.satisfaction} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                        className={`text-lg font-bold ${roundResult.satisfaction >= 4 ? 'text-green-400' : roundResult.satisfaction >= 3 ? 'text-yellow-400' : 'text-red-400'}`}
                      >
                        {'★'.repeat(roundResult.satisfaction)}{'☆'.repeat(5 - roundResult.satisfaction)}
                      </motion.span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(roundResult.satisfaction / 5) * 100}%` }}
                        className={`h-full rounded-full ${roundResult.satisfaction >= 4 ? 'bg-green-500' : roundResult.satisfaction >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>

                  {/* Key Insight */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{keyInsight}</p>
                    </div>
                  </motion.div>

                  {/* Customer Review Card (comic strip style) */}
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="p-4 rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-900/80"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{customerReview.emoji}</span>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Customer Review</div>
                        <p className="text-xs text-slate-200 italic mt-0.5">{customerReview.text}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: roundResult.satisfaction }).map((_, i) => (
                        <span key={i} className="text-sm">⭐</span>
                      ))}
                      {Array.from({ length: 5 - roundResult.satisfaction }).map((_, i) => (
                        <span key={i} className="text-sm opacity-30">☆</span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Next week teaser */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="p-3 rounded-xl border border-game-teal/20 bg-game-teal/5 text-center"
                  >
                    <p className="text-xs text-game-teal font-semibold">
                      🪔 Next week: Diwali season is coming! Prepare your strategy...
                    </p>
                  </motion.div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button onClick={handleNewDecisions}
                      className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors"
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    >
                      ↩️ Change Decisions
                    </motion.button>
                    <motion.button onClick={handleNextRound} disabled={isLoading}
                      className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-game-orange to-purple-600 hover:from-orange-700 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-orange-500/20 shadow-lg shadow-game-orange/10"
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    >
                      {isLoading ? 'Saving...' : `Next Day → Day ${round + 1}`} <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {/* Confetti overlay for profit */}
                  <AnimatePresence>
                    {showConfetti && roundResult.profit > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl border border-green-400/30 flex items-center gap-3"
                      >
                        <PartyPopper className="h-5 w-5" />
                        <span className="font-bold text-sm">🎉 Profit Day! ₹{roundResult.profit} earned!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Chart */}
                  {chartData.length > 1 && (
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800/40">
                      <h3 className="font-bold text-white text-sm mb-4">📈 Profit Trend</h3>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="round" stroke="#64748b" style={{ fontSize: 10 }} />
                            <YAxis stroke="#64748b" style={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                            <Line type="monotone" dataKey="Profit" stroke="#FF6B35" strokeWidth={2} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Revenue" stroke="#4ECDC4" strokeWidth={1.5} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
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
