import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle } from 'lucide-react';

export interface BusinessEvent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  flavor: string;
  choices: {
    id: string;
    label: string;
    emoji: string;
    description: string;
    effect: string;
  }[];
}

interface EventCardProps {
  event: BusinessEvent;
  onChoose: (choiceId: string) => void;
  onSkip?: () => void;
}

const EVENT_DECKS: Record<string, BusinessEvent> = {
  rush_hour: {
    id: 'rush_hour',
    name: 'RUSH HOUR!',
    emoji: '🔥',
    description: 'Students are pouring in! 3x customers for a short burst!',
    flavor: 'The recess bell just rang! The corridor is flooded with hungry students. Can you handle the rush?',
    choices: [
      { id: 'serve_fast', label: 'Speed Service', emoji: '⚡', description: 'Pre-cook extra batches, serve fast', effect: 'Serve 3x customers but quality drops slightly' },
      { id: 'premium_rush', label: 'Premium Rush', emoji: '💎', description: 'Keep quality high, serve slower', effect: 'Fewer customers but higher satisfaction & premium price' },
      { id: 'referral_bonus', label: 'Referral Blitz', emoji: '📢', description: 'Offer "bring a friend" discount', effect: 'More customers, lower margin per sale' },
    ],
  },
  competitor: {
    id: 'competitor',
    name: 'COMPETITOR ARRIVES!',
    emoji: '😱',
    description: 'A rival samosa stall opened next door!',
    flavor: 'Uh oh! A new stall just opened right next to yours. They\'re selling cheaper samosas and stealing your customers!',
    choices: [
      { id: 'price_match', label: 'Price Match', emoji: '🏷️', description: 'Match competitor prices', effect: 'Keep customers but lower profit margin' },
      { id: 'quality_focus', label: 'Quality Route', emoji: '⭐', description: 'Focus on better taste & service', effect: 'Fewer customers but build brand loyalty' },
      { id: 'bundle_deal', label: 'Bundle Offer', emoji: '🎁', description: 'Samosa+drink combo at discount', effect: 'Attract customers with value deal' },
    ],
  },
  vip_customer: {
    id: 'vip_customer',
    name: '⭐ VIP CUSTOMER',
    emoji: '⭐',
    description: 'A food critic with 5K followers is here!',
    flavor: 'A famous student food blogger just walked in! They have 5,000 followers on FoodieGram. Impress them!',
    choices: [
      { id: 'premium_price', label: 'Premium Service', emoji: '💎', description: 'Charge 2x with special presentation', effect: 'High profit if they like it, bad review if not' },
      { id: 'free_sample', label: 'Free Sample', emoji: '🎁', description: 'Give free samosas + ask for review', effect: 'Guaranteed good review, no immediate profit' },
      { id: 'standard_price', label: 'Keep it Normal', emoji: '⚖️', description: 'Serve as usual, no special treatment', effect: 'Regular experience, moderate review chance' },
    ],
  },
  bad_review: {
    id: 'bad_review',
    name: '📱 BAD REVIEW!',
    emoji: '📱',
    description: 'A student posted a complaint on the school app!',
    flavor: 'Someone posted: "The samosas were cold and the service was slow!" The notification is spreading...',
    choices: [
      { id: 'respond_apologize', label: 'Apologize Publicly', emoji: '🙏', description: 'Reply professionally, offer refund', effect: 'Regain trust, short-term cost' },
      { id: 'improve_quality', label: 'Quality Upgrade', emoji: '🔧', description: 'Invest in better packaging/hygiene', effect: 'Long-term fix, costs money now' },
      { id: 'ignore_move', label: 'Ignore It', emoji: '😤', description: 'Keep going, it\'ll blow over', effect: 'No cost now, but reputation may suffer' },
    ],
  },
  viral_moment: {
    id: 'viral_moment',
    name: '🚀 VIRAL MOMENT!',
    emoji: '🚀',
    description: 'Your stall is getting featured in the school newsletter!',
    flavor: 'AMAZING! The school newspaper wants to feature your stall in this week\'s edition! This is huge exposure!',
    choices: [
      { id: 'max_capacity', label: 'Go Big!', emoji: '📈', description: 'Cook max batch, hire extra help', effect: 'Serve 2x customers, high costs but huge revenue' },
      { id: 'exclusive_offer', label: 'Special Offer', emoji: '🎉', description: 'Coupon for newsletter readers', effect: 'Build customer data, moderate boost' },
      { id: 'story_branding', label: 'Tell Your Story', emoji: '📖', description: 'Share your startup journey in the feature', effect: 'Strong brand connection, long-term loyalty' },
    ],
  },
  supply_issue: {
    id: 'supply_issue',
    name: '📦 SUPPLY PROBLEM',
    emoji: '📦',
    description: 'Potato prices shot up! Your costs just increased.',
    flavor: 'Bad news — the wholesale market has a potato shortage! Every samosa will cost 40% more to make today. What\'s your move?',
    choices: [
      { id: 'absorb_cost', label: 'Absorb Cost', emoji: '💪', description: 'Keep same price, lower profit margin', effect: 'Customers happy, your profit takes a hit' },
      { id: 'raise_price', label: 'Raise Prices', emoji: '📈', description: 'Increase price by 30%', effect: 'Maintain margin, but some customers leave' },
      { id: 'smaller_batch', label: 'Smaller Batch', emoji: '🍳', description: 'Cook fewer, premium quality', effect: 'Low volumes, high margins, exclusive feel' },
    ],
  },
};

const EVENT_CARD_COLORS: Record<string, string> = {
  rush_hour: 'from-red-500/20 to-orange-500/10 border-red-500/30',
  competitor: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
  vip_customer: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
  bad_review: 'from-red-500/20 to-rose-500/10 border-red-500/30',
  viral_moment: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
  supply_issue: 'from-orange-500/20 to-yellow-500/10 border-orange-500/30',
};

export default function EventCard({ event, onChoose, onSkip }: EventCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hasChosen, setHasChosen] = useState(false);

  const handleChoose = useCallback((choiceId: string) => {
    if (hasChosen) return;
    setHasChosen(true);
    onChoose(choiceId);
  }, [hasChosen, onChoose]);

  // Timer countdown
  React.useEffect(() => {
    if (isFlipped && !hasChosen && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-choose first option if time runs out
            if (!hasChosen) {
              handleChoose(event.choices[0].id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isFlipped, hasChosen, timeLeft, event.choices, handleChoose]);

  const cardColor = EVENT_CARD_COLORS[event.id] || 'from-blue-500/20 to-cyan-500/10 border-blue-500/30';
  const timerUrgent = timeLeft <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      animate={{ opacity: 1, scale: 1, rotateY: isFlipped ? 0 : 180 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="w-full max-w-md mx-auto"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`relative rounded-2xl border-2 ${cardColor} bg-slate-900 overflow-hidden transition-all ${
          isFlipped ? 'transform-none' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card back (before flip) */}
        {!isFlipped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center cursor-pointer"
            style={{ backfaceVisibility: 'hidden' }}
            onClick={() => setIsFlipped(true)}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              🃏
            </motion.div>
            <p className="text-slate-400 text-sm font-bold">TAP TO REVEAL</p>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl mt-2"
            >
              ⚡
            </motion.div>
          </motion.div>
        )}

        {/* Card front (after flip) */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Timer bar */}
            <div className="h-1 bg-slate-800">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 15) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
                className={`h-full ${
                  timerUrgent ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              />
            </div>

            {/* Header */}
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{event.emoji}</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  timerUrgent ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Timer className={`h-3 w-3 ${timerUrgent ? 'animate-pulse' : ''}`} />
                  {timeLeft}s
                </div>
              </div>
              <h3 className="text-lg font-bold text-white">{event.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{event.flavor}</p>
            </div>

            {/* Choices */}
            <div className="px-5 pb-5 space-y-2">
              {event.choices.map((choice, idx) => {
                const chosen = hasChosen;
                return (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    onClick={() => handleChoose(choice.id)}
                    disabled={chosen}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      chosen
                        ? 'border-slate-700/50 bg-slate-900/50 opacity-50'
                        : 'border-slate-700/50 bg-slate-800/30 hover:border-orange-500/50 hover:bg-orange-500/5 cursor-pointer'
                    }`}
                    whileHover={!chosen ? { scale: 1.02 } : {}}
                    whileTap={!chosen ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">{choice.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white">{choice.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{choice.description}</div>
                        <div className="text-[9px] text-orange-400/70 mt-1 italic">{choice.effect}</div>
                      </div>
                      <span className="text-[10px] text-slate-600 font-bold shrink-0">
                        {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export { EVENT_DECKS };
