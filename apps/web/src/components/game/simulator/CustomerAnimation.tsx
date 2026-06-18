import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerData {
  id: number;
  type: 'happy' | 'hesitant' | 'complaint';
  emoji: string;
  delay: number;
  paid: boolean;
}

interface CustomerAnimationProps {
  customersServed: number;
  totalCustomers: number;
  revenue: number;
  satisfaction: number;
  onAnimationComplete: () => void;
  hasEvent?: boolean;
  eventType?: string;
}

const HAPPY_EMOJIS = ['😊', '😄', '🤩', '🙌', '😋', '🥳', '😃', '👏'];
const HESITANT_EMOJIS = ['🤔', '🧐', '😐', '🤨'];
const COMPLAINT_EMOJIS = ['😤', '😠', '💢', '😞'];

export default function CustomerAnimation({
  customersServed,
  totalCustomers,
  revenue,
  satisfaction,
  onAnimationComplete,
  hasEvent,
  eventType,
}: CustomerAnimationProps) {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [displayRevenue, setDisplayRevenue] = useState(0);
  const [displayCustomers, setDisplayCustomers] = useState(0);
  const [showCashRegister, setShowCashRegister] = useState(false);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revenueIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate distribution
  const happyCount = Math.round(customersServed * (satisfaction >= 4 ? 0.8 : satisfaction >= 3 ? 0.5 : 0.2));
  const hesitantCount = Math.round(customersServed * (satisfaction >= 4 ? 0.15 : satisfaction >= 3 ? 0.3 : 0.3));
  const complaintCount = customersServed - happyCount - hesitantCount;

  // Generate customer data
  useEffect(() => {
    const customerData: CustomerData[] = [];
    let id = 0;

    // Happy customers
    for (let i = 0; i < Math.min(happyCount, 20); i++) {
      customerData.push({
        id: id++,
        type: 'happy',
        emoji: HAPPY_EMOJIS[Math.floor(Math.random() * HAPPY_EMOJIS.length)],
        delay: 0.2 + Math.random() * 0.3,
        paid: true,
      });
    }

    // Hesitant customers
    for (let i = 0; i < Math.min(hesitantCount, 8); i++) {
      customerData.push({
        id: id++,
        type: 'hesitant',
        emoji: HESITANT_EMOJIS[Math.floor(Math.random() * HESITANT_EMOJIS.length)],
        delay: 0.3 + Math.random() * 0.4,
        paid: false,
      });
    }

    // Complaint customers
    for (let i = 0; i < Math.min(complaintCount, 5); i++) {
      customerData.push({
        id: id++,
        type: 'complaint',
        emoji: COMPLAINT_EMOJIS[Math.floor(Math.random() * COMPLAINT_EMOJIS.length)],
        delay: 0.4 + Math.random() * 0.5,
        paid: false,
      });
    }

    setCustomers(customerData);
  }, [customersServed, satisfaction, happyCount, hesitantCount, complaintCount]);

  // Animate customer appearance and revenue counter
  useEffect(() => {
    // Customer appearance timeline
    animRef.current = setInterval(() => {
      setCustomers(prev => prev.map(c => c)); // trigger animation by id
    }, 500);

    // Revenue counter tick-up
    const revenuePerTick = Math.max(1, Math.floor(revenue / 30));
    let currentRev = 0;
    revenueIntervalRef.current = setInterval(() => {
      currentRev += revenuePerTick;
      if (currentRev >= revenue) {
        currentRev = revenue;
        if (revenueIntervalRef.current) clearInterval(revenueIntervalRef.current);
      }
      setDisplayRevenue(currentRev);
      setDisplayCustomers(Math.min(customersServed, Math.floor((currentRev / revenue) * customersServed)));
      if (currentRev > 0 && !showCashRegister) setShowCashRegister(true);
    }, 100);

    // Cleanup
    return () => {
      if (animRef.current) clearInterval(animRef.current);
      if (revenueIntervalRef.current) clearInterval(revenueIntervalRef.current);
    };
  }, [customersServed, revenue]);

  // Set event message
  useEffect(() => {
    if (hasEvent && eventType) {
      switch (eventType) {
        case 'rush_hour': setEventMessage('🔥 RUSH HOUR! Customers flooding in!'); break;
        case 'competitor': setEventMessage('😱 Competitor arrived! Some customers went there!'); break;
        case 'vip': setEventMessage('⭐ VIP Customer — will pay premium!'); break;
        case 'bad_review': setEventMessage('📱 Bad review notification — reputation hit!'); break;
        case 'viral': setEventMessage('🚀 VIRAL! Someone posted about you!'); break;
        default: setEventMessage(null);
      }
    }
  }, [hasEvent, eventType]);

  // Call animation complete when revenue reaches target
  useEffect(() => {
    if (displayRevenue >= revenue && customers.length > 0) {
      const timeout = setTimeout(onAnimationComplete, 2000);
      return () => clearTimeout(timeout);
    }
  }, [displayRevenue, revenue, customers.length, onAnimationComplete]);

  const stallEmoji = '🏪';

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/80 to-slate-950 rounded-2xl border border-slate-700/50 p-6 min-h-[320px]">
      {/* Background grid */}
      <div className="absolute inset-0 bg-ambient opacity-30" />
      
      {/* Floor line */}
      <div className="absolute bottom-20 left-0 right-0 h-px bg-slate-700/30" />

      {/* Event message */}
      <AnimatePresence>
        {eventMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-4 left-1/2 z-20 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-xs font-bold text-yellow-400 whitespace-nowrap"
          >
            {eventMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stall in center */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-center"
      >
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-5xl block"
        >
          {stallEmoji}
        </motion.span>
        <div className="mt-1 text-[9px] text-slate-600 font-bold uppercase tracking-wider">
          YOUR STALL
        </div>
      </motion.div>

      {/* Customer walkway — customers walking from left to center */}
      <div className="absolute bottom-16 left-0 right-0 z-5" style={{ height: 60 }}>
        <AnimatePresence>
          {customers.map((customer, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={customer.id}
                initial={{
                  opacity: 0,
                  x: isLeft ? -100 : 100,
                  y: 0,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, -8, 0, -8, 0],
                }}
                exit={{
                  opacity: 0,
                  y: -30,
                  scale: 0.5,
                }}
                transition={{
                  x: { type: 'spring', stiffness: 100, damping: 20, delay: customer.delay },
                  y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { delay: customer.delay },
                }}
                className={`absolute ${isLeft ? 'left-4' : 'right-4'}`}
                style={{
                  bottom: Math.sin(index * 1.5) * 8,
                  zIndex: 100 - index,
                }}
              >
                {/* Customer with speech bubble */}
                <div className="relative">
                  <motion.span
                    className={`text-2xl block ${customer.type === 'complaint' ? 'animate-shake' : ''}`}
                    animate={
                      customer.type === 'happy'
                        ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }
                        : customer.type === 'complaint'
                        ? { x: [0, -3, 3, -3, 0] }
                        : {}
                    }
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {customer.emoji}
                  </motion.span>

                  {/* Speech bubble for complaints */}
                  {customer.type === 'complaint' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: customer.delay + 0.5 }}
                      className="absolute -top-8 -right-2 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-0.5 text-[8px] text-red-400 font-semibold whitespace-nowrap"
                    >
                      Too expensive!
                    </motion.div>
                  )}

                  {/* Coin animation for happy customers */}
                  {customer.paid && (
                    <motion.div
                      initial={{ opacity: 0, y: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [0, -30, -50],
                        scale: [0, 1.2, 0],
                      }}
                      transition={{ duration: 1.5, delay: customer.delay + 1, ease: 'easeOut' }}
                      className="absolute -top-4 left-3 text-xs"
                    >
                      🪙
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Stats overlay at bottom */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-6 z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-1 bg-slate-900/80 border border-slate-700/50 rounded-full text-xs"
        >
          <span className="text-slate-400">Customers: </span>
          <motion.span
            key={displayCustomers}
            className="font-bold text-white"
          >
            {displayCustomers}
          </motion.span>
          <span className="text-slate-600"> / {customersServed}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-3 py-1 bg-slate-900/80 border border-slate-700/50 rounded-full text-xs"
        >
          <span className="text-slate-400">Revenue: </span>
          <motion.span
            key={displayRevenue}
            className="font-bold text-yellow-400"
          >
            ₹{displayRevenue}
          </motion.span>
        </motion.div>
      </div>

      {/* Cash register ring effect */}
      <AnimatePresence>
        {showCashRegister && displayRevenue > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: [0.4, 0], scale: [1.5, 3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-yellow-400/10"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
