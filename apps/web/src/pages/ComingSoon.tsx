import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  message?: string;
  backPath?: string;
}

export default function ComingSoon({
  title = 'Coming Soon',
  message = 'This feature is under construction and will be available in a future update.',
  backPath = '/student',
}: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Construction className="h-10 w-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold font-display text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">{message}</p>
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-xl border border-slate-700/50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </motion.div>
    </div>
  );
}
