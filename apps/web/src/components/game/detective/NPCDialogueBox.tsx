import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/api';
import { Send, X, Lightbulb, Sparkles } from 'lucide-react';

interface NPCDialogueBoxProps {
  npcId: string;
  npcName: string;
  npcContext: string;
  sceneContext: string;
  onClose: () => void;
  onClueRevealed: (clueId: string, details: any) => void;
  sceneClues?: { id: string; title: string; desc: string }[];
  discoveredClues?: string[];
}

// NPC-specific keyword-to-clue mapping for each NPC
const NPC_CLUE_MAP: Record<string, Array<{
  keywords: string[];
  clueId: string;
  title: string;
  desc: string;
}>> = {
  canteen_uncle: [
    { keywords: ['queue', 'wait', 'line', 'crowd', 'busy', 'rush'], clueId: 'canteen_queue', title: 'Canteen Counter', desc: 'Long queue! Recess ends before half the students get served hot samosas.' },
    { keywords: ['water', 'cooler', 'drink', 'thirsty', 'dry'], clueId: 'water_cooler', title: 'Water Cooler', desc: 'Water cooler completely empty and dry during Delhi summer heat.' },
    { keywords: ['notice', 'board', 'announce', 'poster', 'bulletin'], clueId: 'notice_board', title: 'Notice Board', desc: 'Important paper notices go unread because they look boring and get buried.' },
  ],
  vegetable_vendor: [
    { keywords: ['spoil', 'waste', 'rot', 'fresh', 'sun', 'heat', 'vegetable'], clueId: 'vegetable_vendor', title: 'Vegetable Wastage', desc: 'Fresh vegetables spoil rapidly in the afternoon sun — 40% lost daily.' },
    { keywords: ['queue', 'wait', 'line', 'tea', 'chai', 'crowd'], clueId: 'tea_stall', title: 'Chai Stall Queue', desc: 'Huge queues at peak hours. Customers wait 15 minutes for one cup of tea.' },
    { keywords: ['rickshaw', 'auto', 'transport', 'fare', 'passenger'], clueId: 'rickshaw_stand', title: 'Auto-Rickshaw Mismatch', desc: 'Drivers wait hours for fares while passengers walk looking for autos.' },
  ],
};

export default function NPCDialogueBox({
  npcId,
  npcName,
  npcContext,
  sceneContext,
  onClose,
  onClueRevealed,
  sceneClues = [],
  discoveredClues = []
}: NPCDialogueBoxProps) {
  const [messages, setMessages] = useState<{ role: 'player' | 'npc'; content: string; isClueReveal?: boolean }[]>([
    { role: 'npc', content: `Namaste beta! I'm ${npcId === 'canteen_uncle' ? 'Raju, the canteen uncle' : 'Sunil Bhai, the vegetable vendor'}. Ask me about the problems I face daily!` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Suggest questions based on NPC
  const suggestedQuestions = npcId === 'canteen_uncle'
    ? ['What\'s the biggest problem you face?', 'How do students react to the queues?', 'What would make your job easier?']
    : ['What frustrates you most about your business?', 'How much do you lose to spoilage?', 'What would help you sell more?'];

  const hasRevealedAll = sceneClues.length > 0 && sceneClues.every(c => discoveredClues.includes(c.id));

  const handleSend = async (e: React.FormEvent | string) => {
    const messageText = typeof e === 'string' ? e : (() => {
      e.preventDefault();
      return inputText;
    })();

    if (!messageText.trim()) return;

    const userMsg = messageText;
    if (typeof e !== 'string') setInputText('');
    setMessages(prev => [...prev, { role: 'player', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await api.post('/games/ai/npc-chat', {
        npcId,
        npcContext,
        sceneContext,
        playerQuestion: userMsg,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const { response } = res.data.data;
      setMessages(prev => [...prev, { role: 'npc', content: response }]);

      // Smart clue detection: check response against undiscovered clues for this NPC
      const clueMappings = NPC_CLUE_MAP[npcId] || [];
      const lowercaseResponse = response.toLowerCase();

      for (const mapping of clueMappings) {
        if (discoveredClues.includes(mapping.clueId)) continue; // already found
        const matched = mapping.keywords.some(k => lowercaseResponse.includes(k));
        if (matched) {
          onClueRevealed(mapping.clueId, { title: mapping.title, desc: mapping.desc });
          // Add a special message showing the clue was revealed
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'npc',
              content: `🔍 *Clue Found!* "${mapping.title}" added to your evidence. I just described a real problem you can solve!`,
              isClueReveal: true
            }]);
          }, 500);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to get NPC AI response:', err);
      setMessages(prev => [...prev, { role: 'npc', content: 'Arre beta, I am a bit busy now. Ask me about my daily problems! [worried]' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 max-w-[90vw] h-[450px] bg-slate-900 border border-slate-700/60 rounded-2xl flex flex-col overflow-hidden z-40 shadow-2xl font-sans text-xs"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/60 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">
            {npcId === 'canteen_uncle' ? '👨‍🍳' : '🧑‍🌾'}
          </div>
          <div>
            <span className="font-bold text-white text-sm block">{npcName}</span>
            <span className="text-[9px] text-slate-500 block">
              {npcId === 'canteen_uncle' ? 'School Canteen Operator' : 'Market Vegetable Vendor'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Clue progress indicator */}
          <span className="text-[9px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {discoveredClues.length}/{sceneClues.length}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/30">
        {messages.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`flex flex-col max-w-[85%] rounded-2xl p-3 leading-relaxed ${
              m.role === 'player'
                ? 'bg-purple-600 text-white rounded-br-none ml-auto'
                : m.isClueReveal
                  ? 'bg-green-900/40 border border-green-500/30 text-green-200 rounded-bl-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
            }`}
          >
            <span className="text-[9px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider block">
              {m.role === 'player' ? 'You' : m.isClueReveal ? '🔍 Clue Found!' : npcName}
            </span>
            <p className="whitespace-pre-line text-[11px]">{m.content}</p>
          </motion.div>
        ))}

        {isLoading && (
          <div className="bg-slate-900 border border-slate-800 text-slate-400 max-w-[50%] rounded-2xl rounded-bl-none p-3">
            <span className="animate-pulse">{npcName} is thinking...</span>
          </div>
        )}

        {/* Clue hint */}
        {!hasRevealedAll && !isLoading && messages.length <= 2 && (
          <div className="p-2.5 bg-blue-900/20 border border-blue-500/20 rounded-xl flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-blue-300 font-medium">Ask about their daily struggles</p>
              <p className="text-[9px] text-slate-500">Try: "What frustrates you?" or click a suggestion below</p>
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {!hasRevealedAll && messages.length <= 3 && (
        <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/40 flex gap-1.5 overflow-x-auto">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="shrink-0 text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Complete status */}
      {hasRevealedAll && (
        <div className="px-4 py-2 bg-green-900/20 border-t border-green-500/20 text-center">
          <span className="text-[10px] text-green-400 font-semibold flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" /> All clues revealed! Great interview!
          </span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={(e) => handleSend(e)} className="bg-slate-900 border-t border-slate-800 p-2 flex gap-2 shrink-0">
        <input
          type="text"
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none outline-0 transition-colors text-xs"
          placeholder={hasRevealedAll ? "Ask anything..." : "Ask about their problems..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-xl border border-purple-500/10 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </motion.div>
  );
}
