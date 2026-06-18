import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Trophy, Flame, Zap } from 'lucide-react';
import api from '../../lib/api';

interface TeamData {
  name: string;
  studentIds: string[];
  totalXP: number;
}

interface ClassWarState {
  classroomId: string;
  teamA: TeamData;
  teamB: TeamData;
  weekStart: string;
  active: boolean;
}

interface ClassWarBannerProps {
  classroomId?: string;
  compact?: boolean;
}

export default function ClassWarBanner({ classroomId, compact = false }: ClassWarBannerProps) {
  const [warState, setWarState] = useState<ClassWarState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classroomId) {
      setLoading(false);
      return;
    }

    async function fetchClassWar() {
      try {
        const res = await api.get(`/rival/class-war/${classroomId}`);
        if (res.data.data?.classWar?.active) {
          setWarState(res.data.data.classWar);
        }
      } catch (err) {
        console.error('Failed to fetch class war:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchClassWar();

    // Listen for class war updates
    const handleWarStarted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setWarState(detail);
    };

    const handleWarEnded = (e: Event) => {
      setWarState(null);
    };

    window.addEventListener('class_war:started', handleWarStarted);
    window.addEventListener('class_war:ended', handleWarEnded);

    return () => {
      window.removeEventListener('class_war:started', handleWarStarted);
      window.removeEventListener('class_war:ended', handleWarEnded);
    };
  }, [classroomId]);

  if (loading || !warState || !warState.active) return null;

  const totalXP = warState.teamA.totalXP + warState.teamB.totalXP || 1;
  const teamAPercent = (warState.teamA.totalXP / totalXP) * 100;
  const teamAhead = warState.teamA.totalXP > warState.teamB.totalXP;
  const xpDiff = Math.abs(warState.teamA.totalXP - warState.teamB.totalXP);

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-slate-900/90 to-slate-900/70 border border-slate-700/40 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-game-orange" />
            <span className="text-xs font-bold text-white">Class War 🔥</span>
          </div>
          <span className="text-[9px] text-slate-500">Live</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold ${teamAhead ? 'text-game-orange' : 'text-slate-400'}`}>
            {warState.teamA.name}
          </span>
          <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${teamAPercent}%` }}
              className="h-full bg-gradient-to-r from-game-orange to-game-yellow rounded-l-full"
            />
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${100 - teamAPercent}%` }}
              className="h-full bg-gradient-to-r from-game-teal to-blue-500 rounded-r-full"
            />
          </div>
          <span className={`text-xs font-bold ${!teamAhead ? 'text-game-teal' : 'text-slate-400'}`}>
            {warState.teamB.name}
          </span>
        </div>

        <div className="flex justify-between text-[9px] text-slate-500">
          <span className="font-bold font-mono">{warState.teamA.totalXP.toLocaleString()} XP</span>
          <span className="text-game-yellow font-bold">{xpDiff.toLocaleString()} XP gap</span>
          <span className="font-bold font-mono">{warState.teamB.totalXP.toLocaleString()} XP</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-700/40 rounded-xl p-5 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-game-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-game-teal/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sword className="h-5 w-5 text-game-orange" />
          <h3 className="text-sm font-bold text-white">⚔️ Class War</h3>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-game-success/10 border border-game-success/20 rounded-full">
          <Flame className="h-3 w-3 text-game-success" />
          <span className="text-[9px] text-game-success font-bold uppercase">Live</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center gap-3 mb-3">
        {/* Team A */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Shield className={`h-4 w-4 ${teamAhead ? 'text-game-orange' : 'text-slate-500'}`} />
            <span className={`text-sm font-bold ${teamAhead ? 'text-game-orange' : 'text-slate-400'}`}>
              {warState.teamA.name}
            </span>
            {teamAhead && <Trophy className="h-3.5 w-3.5 text-game-yellow" />}
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {warState.teamA.totalXP.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-600">XP</div>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-black text-slate-600">VS</div>
          <div className="text-[8px] text-slate-700 uppercase tracking-wider">Battle</div>
        </div>

        {/* Team B */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Shield className={`h-4 w-4 ${!teamAhead ? 'text-game-teal' : 'text-slate-500'}`} />
            <span className={`text-sm font-bold ${!teamAhead ? 'text-game-teal' : 'text-slate-400'}`}>
              {warState.teamB.name}
            </span>
            {!teamAhead && <Trophy className="h-3.5 w-3.5 text-game-yellow" />}
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {warState.teamB.totalXP.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-600">XP</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${teamAPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-game-orange to-game-yellow relative"
        >
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]" />
        </motion.div>
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${100 - teamAPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-game-teal to-blue-500 relative"
        >
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]" />
        </motion.div>
      </div>

      {/* Gap indicator */}
      <div className="flex justify-center mt-2">
        <div className="px-3 py-1 bg-slate-800/60 rounded-full">
          <span className="text-[10px] text-slate-400">
            {teamAhead ? `${warState.teamA.name}` : `${warState.teamB.name}`} leads by{' '}
            <strong className="text-game-yellow font-mono">{xpDiff.toLocaleString()} XP</strong>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
