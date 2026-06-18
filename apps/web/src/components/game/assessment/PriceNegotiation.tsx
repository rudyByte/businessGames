import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PriceNegotiationAssessment, AssessmentResult, createDefaultResult } from '../../../lib/assessmentTypes';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Props {
  assessment: PriceNegotiationAssessment;
  onComplete: (result: AssessmentResult) => void;
  startTime: number;
}

const CUSTOMER_EMOJIS: Record<string, { emoji: string; color: string; label: string }> = {
  angry: { emoji: '😠', color: 'text-red-400', label: 'Too expensive!' },
  neutral: { emoji: '😐', color: 'text-yellow-400', label: 'Hmm... let me think' },
  happy: { emoji: '😊', color: 'text-green-400', label: 'Not bad!' },
  excited: { emoji: '🤩', color: 'text-emerald-400', label: 'DEAL! Take my money!' },
};

export default function PriceNegotiation({ assessment, onComplete, startTime }: Props) {
  const [price, setPrice] = useState(Math.round((assessment.costPrice + assessment.maxPrice) / 2));
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<{
    bought: boolean; reaction: string; dialogue: string; revenue: number; profit: number;
  } | null>(null);

  const minPrice = assessment.costPrice;
  const maxPrice = assessment.maxPrice;
  const pct = ((price - minPrice) / (maxPrice - minPrice)) * 100;

  // Real-time customer emotion based on price
  const currentTier = useMemo(() => {
    // Price lower = happier customer
    if (price <= minPrice + (maxPrice - minPrice) * 0.2) {
      if (price <= minPrice + (maxPrice - minPrice) * 0.1) return assessment.tiers.find(t => t.reaction === 'excited') || assessment.tiers[0];
      return assessment.tiers.find(t => t.reaction === 'happy') || assessment.tiers[0];
    }
    if (price <= minPrice + (maxPrice - minPrice) * 0.5) {
      return assessment.tiers.find(t => t.reaction === 'neutral') || assessment.tiers[0];
    }
    return assessment.tiers.find(t => t.reaction === 'angry') || assessment.tiers[0];
  }, [price, assessment]);

  const customer = CUSTOMER_EMOJIS[currentTier?.reaction || 'neutral'];

  const handleLockPrice = () => {
    if (locked) return;
    setLocked(true);

    const tier = currentTier;
    const willBuy = tier?.willBuy || false;
    const revenue = willBuy ? price : 0;
    const profit = willBuy ? price - minPrice : 0;

    setResult({
      bought: willBuy,
      reaction: tier?.reaction || 'neutral',
      dialogue: tier?.dialogue || '...',
      revenue,
      profit,
    });

    const config = assessment;
    const baseScore = willBuy ? config.pointsPerCorrect : 0;
    const profitBonus = profit > 0 ? Math.min(20, Math.floor(profit / 5)) : 0;
    const score = baseScore + profitBonus;
    const maxScore = config.pointsPerCorrect + 20;

    const res: AssessmentResult = {
      assessmentId: config.id,
      type: config.type,
      score,
      maxScore,
      correctCount: willBuy ? 1 : 0,
      totalCount: 1,
      timeSpent: Date.now() - startTime,
      answers: { chosenPrice: price, bought: willBuy, revenue, profit },
      passed: score >= Math.ceil(maxScore * 0.5),
      feedback: willBuy ? `Sale made! ₹${profit} profit` : 'No sale — price too high for this customer',
    };
    setTimeout(() => onComplete(res), 2000);
  };

  const formatPrice = (val: number) => `₹${val}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl block mb-1">{assessment.productEmoji}</span>
        <h3 className="text-lg font-bold text-white">{assessment.title}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          A customer wants to buy <strong className="text-white">{assessment.productName}</strong>. It costs <strong className="text-red-400">₹{assessment.costPrice}</strong> to make.
          Set a fair price and negotiate!
        </p>
      </div>

      {/* Customer character */}
      <motion.div
        className="text-center p-6 rounded-2xl border-2 bg-gradient-to-br from-slate-800 to-slate-900"
        style={{
          borderColor: locked
            ? result?.bought ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.3)'
            : 'rgba(51,65,85,0.5)',
        }}
        animate={!locked ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="text-6xl mb-2"
          animate={!locked ? { rotate: [0, -5, 5, -5, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {locked ? (result?.bought ? '🤝' : '😤') : customer.emoji}
        </motion.div>
        <div className={`text-sm font-bold ${customer.color}`}>
          {locked
            ? (result?.bought ? 'Deal! 🤝' : 'No deal 😤')
            : customer.label
          }
        </div>
        {!locked && currentTier && (
          <div className="text-xs text-slate-500 mt-1 italic">{currentTier.dialogue}</div>
        )}
        {locked && result && (
          <div className="text-xs text-slate-300 mt-2 p-3 bg-slate-900/60 rounded-xl">
            {result.dialogue}
          </div>
        )}
      </motion.div>

      {/* Price slider */}
      <div className="px-2">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-red-400 font-bold">₹{minPrice} (Cost)</span>
          <motion.span
            key={price}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-white"
          >
            {formatPrice(price)}
          </motion.span>
          <span className="text-green-400 font-bold">₹{maxPrice} (Max)</span>
        </div>

        {/* Custom slider */}
        <div className="relative w-full h-10 flex items-center">
          <div className="absolute inset-x-0 h-2 bg-slate-800 rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={price}
            onChange={(e) => !locked && setPrice(Number(e.target.value))}
            disabled={locked}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div
            className="absolute w-8 h-8 bg-white rounded-full border-4 shadow-lg z-5 pointer-events-none"
            style={{
              borderColor: customer.color.replace('text-', '').includes('red') ? '#EF4444' :
                customer.color.includes('green') ? '#22C55E' : '#EAB308',
              left: `calc(${pct}% - 16px)`,
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>🔥 Low price = Happy customer</span>
          <span>💰 High price = More profit per sale</span>
        </div>
      </div>

      {/* Price tiers indicators */}
      <div className="flex gap-1.5">
        {assessment.tiers.map((tier, i) => {
          const isActive = currentTier?.reaction === tier.reaction;
          const emoji = CUSTOMER_EMOJIS[tier.reaction]?.emoji || '😐';
          return (
            <div
              key={tier.reaction}
              className={`flex-1 text-center p-2 rounded-xl border transition-all ${
                isActive ? `${CUSTOMER_EMOJIS[tier.reaction]?.color} border-current bg-current/5` : 'border-slate-800/60 text-slate-600'
              }`}
            >
              <div className="text-xl">{emoji}</div>
              <div className={`text-[9px] font-bold ${isActive ? '' : 'text-slate-600'}`}>
                ₹{tier.min}-{tier.max}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lock in button */}
      {!locked ? (
        <motion.button
          onClick={handleLockPrice}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-bold text-sm border border-purple-500/20 shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          💼 Lock in Price — See If Customer Buys
        </motion.button>
      ) : (
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`text-lg font-bold ${result?.bought ? 'text-green-400' : 'text-red-400'}`}
          >
            {result?.bought ? '🎉 Sale made!' : '😤 Customer walked away'}
          </motion.div>
          {result && (
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl">
                <DollarSign className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-[9px] text-slate-500">Price</div>
                <div className="font-bold text-white">₹{price}</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl">
                <TrendingUp className={`h-4 w-4 mx-auto mb-1 ${result.revenue > 0 ? 'text-green-400' : 'text-red-400'}`} />
                <div className="text-[9px] text-slate-500">Revenue</div>
                <div className="font-bold text-white">₹{result.revenue}</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/40 rounded-xl">
                <TrendingDown className={`h-4 w-4 mx-auto mb-1 ${result.profit > 0 ? 'text-green-400' : 'text-red-400'}`} />
                <div className="text-[9px] text-slate-500">Profit</div>
                <div className="font-bold text-white">₹{result.profit}</div>
              </div>
            </div>
          )}
          <div className="text-[10px] text-slate-500 italic">
            {result?.bought
              ? `Profit margin: ${Math.round((result.profit / price) * 100)}% — ${assessment.productName} sold!`
              : `Try a price closer to ₹${minPrice + Math.round((maxPrice - minPrice) * 0.3)} next time`}
          </div>
        </div>
      )}
    </div>
  );
}
