import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropSortAssessment, AssessmentResult, createDefaultResult } from '../../../lib/assessmentTypes';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  assessment: DragDropSortAssessment;
  onComplete: (result: AssessmentResult) => void;
  startTime: number;
}

interface DragItem {
  id: string;
  label: string;
  emoji?: string;
  categoryId: string;
  placed: boolean;
}

export default function DragDropSort({ assessment, onComplete, startTime }: Props) {
  const [items, setItems] = useState<DragItem[]>(
    assessment.items.map(i => ({ ...i, placed: false }))
  );
  const [placedItems, setPlacedItems] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    assessment.categories.forEach(c => { init[c.id] = []; });
    return init;
  });
  const [dragging, setDragging] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState<{ correct: boolean; label: string } | null>(null);

  const allPlaced = items.every(i => i.placed);
  const correctCount = items.filter(i => {
    const placedIn = Object.entries(placedItems).find(([, ids]) => ids.includes(i.id))?.[0];
    return placedIn === i.categoryId;
  }).length;

  const handleDragStart = (itemId: string) => {
    setDragging(itemId);
  };

  const handleDrop = (categoryId: string) => {
    if (!dragging) return;
    const item = items.find(i => i.id === dragging);
    if (!item) return;

    // Remove from previous category
    const newPlaced = { ...placedItems };
    Object.keys(newPlaced).forEach(key => {
      newPlaced[key] = newPlaced[key].filter(id => id !== dragging);
    });

    // Add to new category
    newPlaced[categoryId] = [...(newPlaced[categoryId] || []), dragging];

    setPlacedItems(newPlaced);
    setItems(prev => prev.map(i => i.id === dragging ? { ...i, placed: true } : i));
    setDragging(null);

    // Show feedback after brief delay
    const isCorrect = item.categoryId === categoryId;
    setFeedbackItem({ correct: isCorrect, label: item.label });
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1200);

    // Auto-submit when all placed
    const updatedPlaced = { ...newPlaced, [categoryId]: [...(newPlaced[categoryId] || []), dragging] };
    const allDone = items.every(i => {
      const category = Object.entries(updatedPlaced).find(([, ids]) => ids.includes(i.id))?.[0];
      return category !== undefined;
    });

    if (allDone) {
      const correctTotal = items.filter(i => {
        const cat = Object.entries(updatedPlaced).find(([, ids]) => ids.includes(i.id))?.[0];
        return cat === i.categoryId;
      }).length;
      const result = createDefaultResult(assessment, Date.now() - startTime);
      result.score = correctTotal * assessment.pointsPerCorrect;
      result.correctCount = correctTotal;
      result.answers = { placements: updatedPlaced };
      result.passed = correctTotal >= Math.ceil(items.length * 0.6);
      setTimeout(() => onComplete(result), 800);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-center">
        <span className="text-4xl block mb-2">{assessment.emoji}</span>
        <h3 className="text-lg font-bold text-white">{assessment.title}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{assessment.instructions}</p>
        <p className="text-xs text-purple-400 mt-1 font-semibold">
          {correctCount}/{items.length} correct · Drag items into the right tiers
        </p>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && feedbackItem && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-center py-2 px-4 rounded-xl text-xs font-bold ${
              feedbackItem.correct ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {feedbackItem.correct ? (
              <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> ✓ Correct placement!</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5"><XCircle className="h-3.5 w-3.5" /> ✗ Wrong tier for "{feedbackItem.label}"</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unplaced items pool */}
      {!allPlaced && (
        <div className="flex flex-wrap gap-2 justify-center min-h-[60px] p-3 bg-slate-900/60 border border-dashed border-slate-700/60 rounded-xl">
          {items.filter(i => !i.placed).map(item => (
            <motion.div
              key={item.id}
              layout
              draggable
              onDragStart={() => handleDragStart(item.id)}
              className={`px-3 py-2 rounded-lg border-2 cursor-grab active:cursor-grabbing text-xs font-bold ${
                dragging === item.id ? 'border-purple-500 bg-purple-500/20 scale-110 shadow-lg' : 'border-slate-700/60 bg-slate-800/60 hover:border-purple-500/40 hover:bg-slate-700/60'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.emoji && <span className="mr-1.5">{item.emoji}</span>}
              {item.label}
            </motion.div>
          ))}
        </div>
      )}

      {/* Categories (drop zones) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
        {assessment.categories.map(cat => {
          const placed = placedItems[cat.id] || [];
          return (
            <div
              key={cat.id}
              onDrop={() => handleDrop(cat.id)}
              onDragOver={handleDragOver}
              className={`min-h-[100px] p-2 rounded-xl border-2 transition-all ${
                dragging ? 'border-dashed border-purple-500/40 bg-purple-500/5' : 'border-slate-800/60 bg-slate-900/40'
              }`}
              style={{ borderColor: dragging ? `${cat.color}60` : undefined }}
            >
              <div className="text-center mb-2">
                <span
                  className="inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.label}
                </span>
              </div>
              <div className="space-y-1">
                {placed.map(itemId => {
                  const item = assessment.items.find(i => i.id === itemId);
                  if (!item) return null;
                  const correct = item.categoryId === cat.id;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium ${
                        correct ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-red-500/30 bg-red-500/10 text-red-300'
                      }`}
                    >
                      {item.emoji && <span className="mr-1">{item.emoji}</span>}
                      {item.label}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {allPlaced && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-green-400 font-semibold"
        >
          ✓ All placed! Finalising results...
        </motion.div>
      )}
    </div>
  );
}
