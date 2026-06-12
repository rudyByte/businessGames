import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import {
  ArrowRight, Users, Star, Brain, Heart,
  CheckCircle2, XCircle, DollarSign, Trophy,
  UserCheck, Puzzle, Rocket, Search,
} from 'lucide-react';

interface TeamBuilderProps {
  onComplete: (saveState: any) => void;
}

// ─── DATA ─────────────────────────────────────────────────────

const ALL_CANDIDATES = [
  { id: 'cfo_senior', role: 'CFO', name: 'Amit Sen', level: 'Senior', salary: 3500, skills: 4, personality: 'Analytical', tag: '📊 Finance Guru', ask: 'What is the most important financial metric for a startup?', options: ['Revenue', 'Burn rate & runway', 'Customer count', 'Number of employees'], correctIdx: 1 },
  { id: 'cfo_junior', role: 'CFO', name: 'Neha Kulkarni', level: 'Junior', salary: 1800, skills: 2, personality: 'Detail-oriented', tag: '🧮 Number Cruncher', ask: 'If your product costs ₹20 to make and sells for ₹50, what is the margin %?', options: ['40%', '60%', '30%', '50%'], correctIdx: 1 },
  { id: 'cmo_senior', role: 'CMO', name: 'Sneha Roy', level: 'Senior', salary: 3000, skills: 4, personality: 'Creative', tag: '🎨 Brand Wizard', ask: 'Which marketing channel gives the best ROI for a school-based startup?', options: ['TV ads', 'School referrals & word-of-mouth', 'Billboards', 'Radio'], correctIdx: 1 },
  { id: 'cmo_junior', role: 'CMO', name: 'Rohan Mehta', level: 'Junior', salary: 1600, skills: 2, personality: 'Energetic', tag: '📢 Hype Builder', ask: 'What is a good way to measure brand awareness?', options: ['Sales revenue', 'Customer surveys & recall rate', 'Number of employees', 'Office size'], correctIdx: 1 },
  { id: 'ops_senior', role: 'Operations', name: 'Vikram Rao', level: 'Senior', salary: 3200, skills: 4, personality: 'Systematic', tag: '⚙️ Process Master', ask: 'A supplier offers 10% discount if you order 500 units. You only need 300. What should you do?', options: ['Order 500 for the discount', 'Order 300 to avoid waste', 'Order 400 as compromise', 'Switch supplier'], correctIdx: 1 },
  { id: 'ops_junior', role: 'Operations', name: 'Priya Sharma', level: 'Junior', salary: 1700, skills: 2, personality: 'Organized', tag: '📋 Efficiency Pro', ask: 'If samosa demand is 200/day but you can only make 150/day, what is your first step?', options: ['Ignore extra demand', 'Increase production capacity', 'Raise prices to reduce demand', 'Both B & C'], correctIdx: 3 },
  { id: 'cs_senior', role: 'CustomerService', name: 'Kunal Joshi', level: 'Senior', salary: 2800, skills: 4, personality: 'Empathetic', tag: '💬 People Person', ask: 'A customer complains their samosa order arrived cold. What is the BEST response?', options: ['Offer a refund', 'Blame the delivery team', 'Apologize and give free replacement + coupon', 'Ignore the complaint'], correctIdx: 2 },
  { id: 'cs_junior', role: 'CustomerService', name: 'Ananya Kapoor', level: 'Junior', salary: 1500, skills: 2, personality: 'Friendly', tag: '😊 Smile Ambassador', ask: 'What percentage of unhappy customers complain?', options: ['96%', '10%', '50%', '4%'], correctIdx: 3 },
];

const ROLES = ['CFO', 'CMO', 'Operations', 'CustomerService'] as const;
const BUDGET = 8000;

// ─── COMPONENT ────────────────────────────────────────────────

export default function TeamBuilder({ onComplete }: TeamBuilderProps) {
  const [phase, setPhase] = useState<'scout' | 'interview' | 'puzzle' | 'result'>('scout');
  const [candidates] = useState(() => [...ALL_CANDIDATES]);
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [interviewIdx, setInterviewIdx] = useState(0);
  const [interviewResults, setInterviewResults] = useState<{ candidateId: string; correct: boolean }[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [chemistry, setChemistry] = useState(70);
  const [submitting, setSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [budgetAlert, setBudgetAlert] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Derived data
  const shortlistedCandidates = candidates.filter(c => shortlisted.includes(c.id));
  const currentInterviewee = shortlistedCandidates[interviewIdx];
  const totalSalary = shortlistedCandidates.reduce((s, c) => s + c.salary, 0);

  // Interview handler
  const handleAnswer = (selectedIdx: number) => {
    if (!currentInterviewee) return;
    const correct = selectedIdx === currentInterviewee.correctIdx;
    setInterviewResults(prev => [...prev, { candidateId: currentInterviewee.id, correct }]);

    if (correct) setChemistry(prev => Math.min(100, prev + 12));
    else setChemistry(prev => Math.max(20, prev - 8));

    if (interviewIdx < shortlistedCandidates.length - 1) {
      setTimeout(() => setInterviewIdx(prev => prev + 1), 600);
    } else {
      setTimeout(() => setPhase('puzzle'), 800);
    }
  };

  // Puzzle - assign roles
  const handleAssignRole = (candidateId: string, role: string) => {
    setRoleMap(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => { if (next[key] === role) delete next[key]; });
      if (next[candidateId] === role) delete next[candidateId];
      else next[candidateId] = role;
      return next;
    });
  };

  // Calculate final chemistry
  const finalChemistry = useMemo(() => {
    let score = chemistry;
    shortlistedCandidates.forEach(c => {
      if (roleMap[c.id] === c.role) score += 10;
      if (roleMap[c.id] && roleMap[c.id] !== c.role) score -= 5;
    });
    const hasSenior = shortlistedCandidates.some(c => c.level === 'Senior');
    const hasJunior = shortlistedCandidates.some(c => c.level === 'Junior');
    if (hasSenior && hasJunior) score += 8;
    return Math.max(0, Math.min(100, score));
  }, [chemistry, roleMap, shortlistedCandidates]);

  const handleSaveTeam = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const teamData = shortlistedCandidates.map(c => ({
        ...c,
        assignedRole: roleMap[c.id] || c.role,
        interviewPassed: interviewResults.find(r => r.candidateId === c.id)?.correct ?? false,
      }));

      const res = await api.post('/games/simulator/save-team', {
        teamMembers: teamData,
        teamEfficiency: finalChemistry,
        interviewResults,
        roleAssignments: roleMap,
      });

      setShowCelebration(true);
      setPhase('result');
    } catch (err: any) {
      console.error('Failed to save team:', err);
      setApiError(err?.response?.data?.error?.message || 'Failed to save team. Please try again.');
      setSubmitting(false);
    }
  };

  const handleLaunchBusiness = () => {
    const teamData = shortlistedCandidates.map(c => ({
      ...c,
      assignedRole: roleMap[c.id] || c.role,
      interviewPassed: interviewResults.find(r => r.candidateId === c.id)?.correct ?? false,
    }));
    onComplete({
      teamMembers: teamData,
      teamEfficiency: finalChemistry,
    });
  };

  const budgetPercent = (totalSalary / BUDGET) * 100;
  const shortlistedCount = shortlisted.length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Game progress bar */}
      <div className="flex items-center gap-2 mb-6 px-1">
        {[
          { key: 'scout', label: 'Scout', icon: Users },
          { key: 'interview', label: 'Interview', icon: Brain },
          { key: 'puzzle', label: 'Team Puzzle', icon: Puzzle },
          { key: 'result', label: 'Launch', icon: Rocket },
        ].map((s, i) => {
          const Icon = s.icon;
          const isActive = phase === s.key;
          const phaseOrder = ['scout', 'interview', 'puzzle', 'result'];
          const isDone = phaseOrder.indexOf(s.key) < phaseOrder.indexOf(phase);
          return (
            <React.Fragment key={s.key}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 scale-105' :
                isDone ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                'bg-slate-900/60 text-slate-600 border border-slate-800/40'
              }`}>
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < 3 && <div className={`h-px flex-1 ${isDone ? 'bg-green-500/30' : 'bg-slate-800/40'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Chemistry & Budget HUD */}
      <div className="flex items-center justify-between mb-6 bg-slate-900/60 border border-slate-800/40 p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-pink-400" />
            <span className="text-xs text-slate-400">Chemistry</span>
            <span className="text-sm font-bold text-white">{finalChemistry}%</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Budget</span>
            <span className="text-sm font-bold text-yellow-400">₹{totalSalary}</span>
          </div>
        </div>
        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, budgetPercent)}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── PHASE 1: SCOUT ─────────────────────────── */}
        {phase === 'scout' && (
          <motion.div
            key="scout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-400" />
                Scout Candidates
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Review candidate profiles. Hire up to <strong className="text-purple-400">3 members</strong> — keep total salary under ₹{BUDGET}/week.
                <span className="block text-[10px] text-slate-500 mt-1">💡 Tip: A mix of Senior (₹2,800+) and Junior (₹1,500-1,800) gives better team balance!</span>
              </p>
            </div>

            {budgetAlert && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />
                Budget exceeded! Remove a candidate or choose someone cheaper.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {candidates.map(c => {
                const hired = shortlisted.includes(c.id);
                const disabled = !hired && shortlistedCount >= 3;
                const overBudget = !hired && totalSalary + c.salary > BUDGET;
                return (
                  <motion.button
                    key={c.id}
                    type="button"
                    layout
                    onClick={() => {
                      setBudgetAlert(false);
                      if (hired) {
                        setShortlisted(prev => prev.filter(id => id !== c.id));
                      } else if (!disabled && !overBudget) {
                        setShortlisted(prev => [...prev, c.id]);
                      } else if (overBudget) {
                        setBudgetAlert(true);
                        setTimeout(() => setBudgetAlert(false), 3000);
                      }
                    }}
                    className={`relative text-left p-4 rounded-xl border transition-all ${
                      hired
                        ? 'border-purple-500/40 bg-purple-950/10 ring-1 ring-purple-500/20'
                        : disabled || overBudget
                        ? 'border-slate-800/30 opacity-50 cursor-not-allowed'
                        : 'border-slate-800/60 hover:border-purple-500/20 hover:bg-slate-900/40 cursor-pointer'
                    }`}
                  >
                    {/* Role badge */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: hired ? 'rgba(168,85,247,0.15)' : 'rgba(100,116,139,0.15)',
                        color: hired ? '#a78bfa' : '#64748b',
                      }}
                    >
                      {c.role}
                    </span>

                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                        hired ? 'bg-purple-600/20 text-purple-400' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{c.tag}</div>

                        {/* Skill stars */}
                        <div className="flex items-center gap-1 mt-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-2.5 w-2.5 ${i < c.skills ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                          ))}
                          <span className="text-[9px] text-slate-500 ml-1">{c.level}</span>
                        </div>

                        {/* Personality */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] text-slate-500">{c.personality}</span>
                          <span className="text-slate-700">·</span>
                          <span className="text-[9px] text-yellow-400 font-semibold">₹{c.salary}/wk</span>
                        </div>
                      </div>
                    </div>

                    {hired && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <UserCheck className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-xs text-slate-400">
                <span className="font-bold text-white">{shortlistedCount}</span> / 3 hired
                <span className="mx-2 text-slate-700">|</span>
                ₹{totalSalary} / ₹{BUDGET}
              </div>
              <motion.button
                onClick={() => setPhase('interview')}
                disabled={shortlistedCount === 0}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-purple-500/20"
                whileHover={shortlistedCount > 0 ? { scale: 1.03 } : {}}
                whileTap={shortlistedCount > 0 ? { scale: 0.97 } : {}}
              >
                Interview Candidates <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── PHASE 2: INTERVIEW ─────────────────────── */}
        {phase === 'interview' && currentInterviewee && (
          <motion.div
            key={`interview-${interviewIdx}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800"
          >
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  Interview {interviewIdx + 1} / {shortlistedCandidates.length}
                </span>
                <span className="text-[10px] text-slate-500">
                  Chemistry: <span className="text-pink-400 font-bold">{chemistry}%</span>
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${((interviewIdx + 1) / shortlistedCandidates.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Candidate Card */}
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="flex items-center gap-4 p-4 bg-slate-900/60 border border-slate-800/40 rounded-xl mb-6"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center text-2xl font-bold text-purple-400">
                {currentInterviewee.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white">{currentInterviewee.name}</div>
                <div className="text-xs text-slate-400">{currentInterviewee.role} · {currentInterviewee.level}</div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-2.5 w-2.5 ${i < currentInterviewee.skills ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                  ))}
                  <span className="text-[9px] text-slate-500 ml-1">Skill Level</span>
                </div>
              </div>
              <div className="ml-auto px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold">
                ₹{currentInterviewee.salary}/wk
              </div>
            </motion.div>

            {/* Interview Question */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">{currentInterviewee.name} asks:</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800/60 rounded-xl mb-4">
                <p className="text-sm text-white font-medium leading-relaxed">
                  "{currentInterviewee.ask}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentInterviewee.options.map((opt, idx) => {
                  const answered = !!interviewResults.find(r => r.candidateId === currentInterviewee.id);
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      onClick={() => !answered && handleAnswer(idx)}
                      disabled={answered}
                      className="p-3 rounded-xl border text-left transition-all text-xs"
                      whileHover={!answered ? { scale: 1.02 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      style={{
                        borderColor: answered
                          ? idx === currentInterviewee.correctIdx ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'
                          : 'rgba(51,65,85,0.5)',
                        backgroundColor: answered
                          ? idx === currentInterviewee.correctIdx ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.03)'
                          : 'rgba(15,23,42,0.5)',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          answered
                            ? idx === currentInterviewee.correctIdx ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {answered
                            ? (idx === currentInterviewee.correctIdx ? '✓' : '✗')
                            : String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-slate-300 leading-relaxed">{opt}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Interview actions */}
            <div className="flex justify-between">
              <button
                onClick={() => { setPhase('scout'); setInterviewIdx(0); setInterviewResults([]); }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                ← Back to Scout
              </button>
              {interviewResults.length === shortlistedCandidates.length && interviewResults.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setPhase('puzzle')}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  Assign Roles <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PHASE 3: TEAM PUZZLE ─────────────────────── */}
        {phase === 'puzzle' && (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-purple-400" />
                Role Alignment Puzzle
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Assign each team member to a business function. Matching their <strong className="text-purple-400">natural expertise</strong> gives <strong className="text-green-400">+10 chemistry</strong> each!
                Wrong assignments cost <strong className="text-red-400">-5 chemistry</strong>.
              </p>
            </div>

            <div className="space-y-3">
              {shortlistedCandidates.map(c => {
                const assignedRole = roleMap[c.id];
                const isCorrect = assignedRole === c.role;
                const isWrong = assignedRole && assignedRole !== c.role;
                return (
                  <motion.div
                    key={c.id}
                    layout
                    className={`p-4 rounded-xl border transition-all ${
                      isCorrect ? 'border-green-500/30 bg-green-500/5' :
                      isWrong ? 'border-red-500/20 bg-red-500/5' :
                      'border-slate-800/60 bg-slate-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isCorrect ? 'bg-green-600/20 text-green-400' :
                          isWrong ? 'bg-red-600/20 text-red-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{c.name}</div>
                          <span className="text-[10px] text-slate-500">Natural fit: {c.role}</span>
                        </div>
                      </div>
                      {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                      {isWrong && <XCircle className="h-4 w-4 text-red-400" />}
                    </div>

                    <div className="flex gap-1.5">
                      {ROLES.map(role => {
                        const isSelected = assignedRole === role;
                        const isNatural = role === c.role;
                        return (
                          <motion.button
                            key={role}
                            type="button"
                            onClick={() => handleAssignRole(c.id, role)}
                            className={`flex-1 py-2 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all ${
                              isSelected
                                ? isNatural
                                  ? 'bg-green-600/20 border-green-500/40 text-green-400'
                                  : 'bg-red-600/20 border-red-500/30 text-red-400'
                                : isNatural
                                ? 'bg-slate-900 border-purple-500/20 text-purple-400/60 hover:border-purple-500/40'
                                : 'bg-slate-950 border-slate-800/60 text-slate-600 hover:text-slate-400 hover:border-slate-700'
                            }`}
                            whileHover={isSelected ? {} : { scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {role}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Chemistry preview */}
            <div className="mt-6 p-4 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Projected Team Chemistry</span>
                <motion.span
                  key={finalChemistry}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className={`text-lg font-bold ${finalChemistry >= 80 ? 'text-green-400' : finalChemistry >= 50 ? 'text-yellow-400' : 'text-red-400'}`}
                >
                  {finalChemistry}%
                </motion.span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    finalChemistry >= 80 ? 'bg-green-500' : finalChemistry >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${finalChemistry}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                {finalChemistry >= 85 ? '🔥 Exceptional synergy! Your team will crush it!' :
                 finalChemistry >= 65 ? '👍 Good team balance. Ready to launch!' :
                 finalChemistry >= 45 ? '⚠️ Some friction in the team. Consider reassigning roles.' :
                 '😰 Low chemistry! Team members may struggle to work together.'}
              </p>
            </div>

            {/* API Error display */}
            {apiError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />
                {apiError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setPhase('interview'); setInterviewIdx(0); }}
                className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-sm transition-colors"
              >
                ← Back
              </button>
              <motion.button
                onClick={handleSaveTeam}
                disabled={Object.keys(roleMap).length === 0 || submitting}
                className="flex-[2] py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all border border-purple-500/20"
                whileHover={Object.keys(roleMap).length > 0 ? { scale: 1.01 } : {}}
                whileTap={Object.keys(roleMap).length > 0 ? { scale: 0.99 } : {}}
              >
                {submitting ? 'Finalizing Team...' : `Launch Team (${finalChemistry}% Chemistry)`}
                <Rocket className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── PHASE 4: CELEBRATION ─────────────────────── */}
        {phase === 'result' && showCelebration && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-8 md:p-12 border border-purple-500/20 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6"
            >
              <Trophy className="h-10 w-10 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold font-display text-white mb-2">Team Assembled!</h2>

            {/* Chemistry meter */}
            <div className="max-w-xs mx-auto mb-6">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Team Chemistry</span>
                <span className="font-bold text-white">{finalChemistry}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    finalChemistry >= 80 ? 'bg-gradient-to-r from-purple-500 to-green-400' :
                    finalChemistry >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                    'bg-gradient-to-r from-red-500 to-orange-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${finalChemistry}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Team members */}
            <div className="flex justify-center gap-3 mb-6">
              {shortlistedCandidates.map(c => (
                <motion.div
                  key={c.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + shortlistedCandidates.indexOf(c) * 0.15 }}
                  className="text-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-1 ${
                    roleMap[c.id] === c.role ? 'bg-green-600/20 text-green-400 border border-green-500/20' : 'bg-purple-600/20 text-purple-400 border border-purple-500/20'
                  }`}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="text-[10px] text-white font-bold">{c.name.split(' ')[0]}</div>
                  <div className="text-[8px] text-slate-500">{roleMap[c.id] || c.role}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs text-slate-400 mb-6"
            >
              Total team payroll: <span className="text-yellow-400 font-bold">₹{totalSalary}/week</span>
              <span className="mx-2 text-slate-700">·</span>
              <span className={finalChemistry >= 80 ? 'text-green-400' : finalChemistry >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                {finalChemistry >= 80 ? '🌟 Super Synergy!' : finalChemistry >= 50 ? '👍 Solid Team' : '⚠️ Needs Work'}
              </span>
            </motion.div>

            <p className="text-xs text-slate-500 mb-4 italic">
              {finalChemistry >= 80
                ? 'Your interview instincts were sharp! The team is perfectly aligned.'
                : finalChemistry >= 50
                ? 'A decent team. With good leadership, they can still succeed.'
                : 'The chemistry is low. You may need to invest extra time in team building.'}
            </p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={handleLaunchBusiness}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 mx-auto border border-purple-500/20"
            >
              Launch Business 🚀 <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
