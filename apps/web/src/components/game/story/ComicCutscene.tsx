import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, SkipForward } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */

export interface ComicPanel {
  /** Background color/emoji for the panel (e.g. '🏫', '🏪', '🎯') */
  bgEmoji: string;
  /** Background gradient class (tailwind) */
  bgGradient?: string;
  /** Character sprite shown (emoji or text) */
  character: string;
  /** Character name displayed above the bubble */
  characterName: string;
  /** Dialogue text shown in the speech bubble */
  dialogue: string;
  /** Emotion/expression for the character */
  emotion?: '😊' | '😅' | '😤' | '🤔' | '😎' | '🥹' | '😲' | '💪' | '🙄' | '😏';
  /** Optional scene/setting label */
  location?: string;
}

export interface CutsceneData {
  id: string;
  title: string;
  panels: ComicPanel[];
  /** XP reward for watching the cutscene */
  xpReward?: number;
  /** Coin reward for watching */
  coinReward?: number;
}

interface ComicCutsceneProps {
  cutscene: CutsceneData;
  onComplete: () => void;
  onSkip?: () => void;
}

/* ─── Panel Component ───────────────────────────────────────────── */

function ComicPanelView({ panel, isActive, panelIndex }: {
  panel: ComicPanel;
  isActive: boolean;
  panelIndex: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Panel card */}
      <div
        className={`
          relative overflow-hidden rounded-2xl border-2 
          ${panel.bgGradient || 'bg-slate-900'}
          border-slate-700/40 shadow-2xl
          min-h-[320px] flex flex-col
        `}
      >
        {/* Background emoji (subtle watermark) */}
        <div className="absolute right-3 bottom-3 text-7xl opacity-15 select-none pointer-events-none">
          {panel.bgEmoji}
        </div>

        {/* Location badge */}
        {panel.location && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-950/60 backdrop-blur-sm border border-slate-700/40 px-2.5 py-1 rounded-full text-slate-400">
              {panel.location}
            </span>
          </div>
        )}

        {/* Panel number */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[9px] font-bold text-slate-600 bg-slate-950/40 px-2 py-0.5 rounded-full">
            #{panelIndex + 1}
          </span>
        </div>

        {/* Character area */}
        <div className="flex-1 flex items-center justify-center pt-10 pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={isActive ? { scale: 1 } : { scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 150, damping: 16, delay: 0.1 }}
            className="relative"
          >
            {/* Character emoji */}
            <div className="text-7xl md:text-8xl filter drop-shadow-xl">
              {panel.emotion || panel.character}
            </div>

            {/* Emotion indicator */}
            {panel.emotion && (
              <div className="absolute -top-2 -right-4 text-3xl animate-bounce">
                {panel.emotion}
              </div>
            )}
          </motion.div>
        </div>

        {/* Character name label */}
        <div className="px-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
            {panel.characterName}
          </span>
        </div>

        {/* Speech bubble */}
        <div className="px-4 pb-5 pt-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-5 py-4"
          >
            {/* Speech bubble tail */}
            <div className="absolute -top-2 left-8 w-4 h-4 bg-slate-800/80 border-t border-l border-slate-700/50 transform rotate-45" />

            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {panel.dialogue}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Progress Dots ─────────────────────────────────────────────── */

function PanelProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-500 ${
            i === current
              ? 'w-8 bg-purple-500 shadow-lg shadow-purple-500/50'
              : i < current
                ? 'w-2 bg-purple-500/40'
                : 'w-2 bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */

export default function ComicCutscene({ cutscene, onComplete, onSkip }: ComicCutsceneProps) {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [showTitle, setShowTitle] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const totalPanels = cutscene.panels.length;

  // Show title for 1.5 seconds, then start panels
  useEffect(() => {
    const timer = setTimeout(() => setShowTitle(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = useCallback(() => {
    if (currentPanel < totalPanels - 1) {
      setCurrentPanel(prev => prev + 1);
    } else {
      setIsComplete(true);
      // Brief delay before calling onComplete so last panel is seen
      setTimeout(() => onComplete(), 800);
    }
  }, [currentPanel, totalPanels, onComplete]);

  const handleSkip = useCallback(() => {
    onSkip?.();
    onComplete();
  }, [onComplete, onSkip]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (!showTitle && !isComplete) handleNext();
      }
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handleSkip, showTitle, isComplete]);

  // Auto-bind tap on the overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // Only handle clicks on the backdrop, not on interactive elements
    if (e.target === e.currentTarget && !showTitle && !isComplete) {
      handleNext();
    }
  }, [handleNext, showTitle, isComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/40 rounded-xl px-3 py-2 transition-all flex items-center gap-1.5 z-10 text-xs font-semibold"
      >
        <SkipForward className="h-3.5 w-3.5" />
        Skip
      </button>

      {/* Title splash */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-4"
          >
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-3xl font-bold text-white font-display">
              {cutscene.title}
            </h2>
            <p className="text-slate-400 text-sm">A new chapter unfolds...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panels */}
      <AnimatePresence mode="wait">
        {!showTitle && !isComplete && (
          <motion.div
            key={currentPanel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <ComicPanelView
              panel={cutscene.panels[currentPanel]}
              isActive={true}
              panelIndex={currentPanel}
            />

            {/* Progress */}
            <PanelProgress total={totalPanels} current={currentPanel} />

            {/* Tap to continue hint */}
            {currentPanel < totalPanels - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 flex items-center justify-center gap-1.5 text-slate-500 text-xs"
              >
                <span>Tap to continue</span>
                <ChevronRight className="h-3.5 w-3.5 animate-pulse" />
              </motion.div>
            )}

            {/* Final panel - complete button */}
            {currentPanel === totalPanels - 1 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleNext}
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl border border-purple-500/20 transition-all shadow-lg"
              >
                {cutscene.xpReward ? (
                  <span>Continue → <span className="text-yellow-300">+{cutscene.xpReward} XP</span></span>
                ) : (
                  <span>Continue →</span>
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Reward toast at the end */}
      <AnimatePresence>
        {isComplete && cutscene.xpReward && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md border border-purple-400/20 rounded-xl px-5 py-3 flex items-center gap-3 shadow-2xl"
          >
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-sm font-bold text-white">Story Complete!</p>
              <p className="text-xs text-purple-200">+{cutscene.xpReward} XP earned</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
