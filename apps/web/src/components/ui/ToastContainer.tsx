import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../lib/toast';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const COLORS = {
  error: {
    bg: 'bg-red-600/90 border-red-400/30',
    text: 'text-red-100',
    icon: 'text-red-200',
  },
  success: {
    bg: 'bg-green-600/90 border-green-400/30',
    text: 'text-green-100',
    icon: 'text-green-200',
  },
  info: {
    bg: 'bg-blue-600/90 border-blue-400/30',
    text: 'text-blue-100',
    icon: 'text-blue-200',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          const colors = COLORS[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl min-w-[300px] max-w-[420px] ${colors.bg}`}
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${colors.icon}`} />
              <p className={`text-xs font-medium flex-1 ${colors.text}`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`shrink-0 opacity-60 hover:opacity-100 transition-opacity ${colors.icon}`}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
