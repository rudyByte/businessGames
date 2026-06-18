import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDetectiveStore } from '../../../stores/detectiveStore';
import { ArrowDown, User, MessageSquare } from 'lucide-react';

/* ─── NPC info lookup ────────────────────────── */
const NPC_INFO: Record<string, { name: string; emoji: string; desc: string }> = {
  canteen_uncle: { name: 'Raju Uncle', emoji: '👨‍🍳', desc: 'Canteen operator — talk about student problems' },
  vegetable_vendor: { name: 'Sunil Bhai', emoji: '🧑‍🌾', desc: 'Vegetable vendor — talk about market problems' },
};

export default function WitnessChain() {
  const witnessTarget = useDetectiveStore(s => s.currentWitnessTarget);
  const witnessArrowVisible = useDetectiveStore(s => s.witnessArrowVisible);

  const npc = witnessTarget ? NPC_INFO[witnessTarget] : null;

  return (
    <AnimatePresence>
      {witnessTarget && witnessArrowVisible && npc && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm"
          style={{
            borderColor: 'rgba(59,130,246,0.3)',
            backgroundColor: 'rgba(59,130,246,0.08)',
          }}
        >
          {/* Arrow indicator */}
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="flex items-center"
          >
            <ArrowDown className="h-4 w-4 text-blue-400" />
          </motion.div>

          {/* NPC Info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm">
              {npc.emoji}
            </div>
            <div>
              <div className="text-[10px] font-game-body font-bold text-blue-300">
                Talk to {npc.name}
              </div>
              <div className="text-[8px] text-game-text-muted font-game-body">
                {npc.desc}
              </div>
            </div>
          </div>

          {/* Hint badge */}
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <MessageSquare className="h-3 w-3 text-blue-400" />
            <span className="text-[8px] font-game-body font-bold text-blue-400 uppercase tracking-wider">
              Witness
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
