import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Assessment,
  AssessmentResult,
  DETECTIVE_ASSESSMENTS,
} from '../../lib/assessmentTypes';
import AssessmentEngine from '../game/assessment/AssessmentEngine';
import { useReward } from './RewardProvider';
import { X } from 'lucide-react';

interface Props {
  assessmentId: keyof typeof DETECTIVE_ASSESSMENTS | Assessment;
  onComplete: (result: AssessmentResult) => void;
  onClose?: () => void;
  open: boolean;
}

export default function AssessmentModal({ assessmentId, onComplete, onClose, open }: Props) {
  const { triggerReward } = useReward();

  const assessment: Assessment | undefined = React.useMemo(() => {
    if (typeof assessmentId === 'string') {
      return DETECTIVE_ASSESSMENTS[assessmentId];
    }
    return assessmentId;
  }, [assessmentId]);

  const handleComplete = (result: AssessmentResult) => {
    if (result.passed) {
      triggerReward('problem_solved', {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
    onComplete(result);
  };

  const errorView = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-game-deep/80 backdrop-blur-sm p-4"
        >
          <div className="text-red-400 text-sm">Assessment not found</div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!assessment) return errorView;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-game-deep/85 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-gradient-to-b from-game-dark to-game-deep rounded-2xl border border-slate-700/50 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <AssessmentEngine
              assessment={assessment}
              onComplete={handleComplete}
              onClose={onClose}
              onRetry={() => {}}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
