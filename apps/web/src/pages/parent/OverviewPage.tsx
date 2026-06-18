import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  Heart, Star, BookOpen, Clock, Award, Landmark, Trophy, Target,
  TrendingUp, CheckCircle, Brain, Lightbulb,
  Activity, Sparkles, Building
} from 'lucide-react';

// ─── Rich Fallback / Dummy Data ──────────────────────────────

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
  RARE: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  EPIC: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  LEGENDARY: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
};

const RARITY_BADGES: Record<string, string> = {
  COMMON: '#CD7F32',
  RARE: '#C0C0C0',
  EPIC: '#FFD700',
  LEGENDARY: '#E5E4E2',
};

const FALLBACK_CHILDREN = [
  {
    id: 'demo-1',
    name: 'Aryan Goel',
    level: 5,
    totalXP: 2850,
    coins: 1240,
    streak: 12,
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    school: { name: 'Delhi Public School' },
    classroom: { name: '7-A' },
    gameProgress: [
      { game: { name: 'Problem Hunt Detective', slug: 'problem-hunt' }, currentChapter: 3, currentLevel: 10, status: 'COMPLETED', totalScore: 8700, totalXPEarned: 1800 },
      { game: { name: 'Startup Simulator', slug: 'startup-simulator' }, currentChapter: 2, currentLevel: 4, status: 'IN_PROGRESS', totalScore: 3200, totalXPEarned: 600 },
    ],
    _fallback: true,
  },
  {
    id: 'demo-2',
    name: 'Priya Patel',
    level: 4,
    totalXP: 2100,
    coins: 980,
    streak: 8,
    lastActiveAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    school: { name: 'Delhi Public School' },
    classroom: { name: '7-A' },
    gameProgress: [
      { game: { name: 'Problem Hunt Detective', slug: 'problem-hunt' }, currentChapter: 2, currentLevel: 7, status: 'IN_PROGRESS', totalScore: 4200, totalXPEarned: 900 },
      { game: { name: 'Startup Simulator', slug: 'startup-simulator' }, currentChapter: 1, currentLevel: 1, status: 'NOT_STARTED', totalScore: 0, totalXPEarned: 0 },
    ],
    _fallback: true,
  },
];

const FALLBACK_ACHIEVEMENTS: Record<string, any[]> = {
  'demo-1': [
    { slug: 'first-steps', name: 'First Steps', description: 'Complete your first level', badgeColor: '#CD7F32', rarity: 'COMMON', xpBonus: 25, earnedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
    { slug: 'clue-hunter', name: 'Clue Hunter', description: 'Find 3 clues', badgeColor: '#CD7F32', rarity: 'COMMON', xpBonus: 25, earnedAt: new Date(Date.now() - 18 * 86400000).toISOString() },
    { slug: 'problem-spotter', name: 'Problem Spotter', description: 'Identify 5 unique problems', badgeColor: '#C0C0C0', rarity: 'RARE', xpBonus: 75, earnedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { slug: 'detective-pro', name: 'Detective Pro', description: 'Complete all 3 Detective scenes', badgeColor: '#FFD700', rarity: 'EPIC', xpBonus: 150, earnedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
    { slug: 'brand-born', name: 'Brand Born', description: 'Complete Brand Builder', badgeColor: '#CD7F32', rarity: 'COMMON', xpBonus: 50, earnedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  ],
  'demo-2': [
    { slug: 'first-steps', name: 'First Steps', description: 'Complete your first level', badgeColor: '#CD7F32', rarity: 'COMMON', xpBonus: 25, earnedAt: new Date(Date.now() - 15 * 86400000).toISOString() },
    { slug: 'clue-hunter', name: 'Clue Hunter', description: 'Find 3 clues', badgeColor: '#CD7F32', rarity: 'COMMON', xpBonus: 25, earnedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  ],
};

const FALLBACK_TRANSACTIONS: Record<string, any[]> = {
  'demo-1': [
    { amount: 150, reason: 'Completed Chapter 1: Who is an Entrepreneur?', createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
    { amount: 200, reason: 'Completed Chapter 3: Finding Problems Around You', createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
    { amount: 75, reason: 'Achievement Bonus: Problem Spotter', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { amount: 100, reason: 'Streak milestone: 7 days', createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
    { amount: 120, reason: 'Quiz Score: 92% - Chapter 3 Assessment', createdAt: new Date(Date.now() - 9 * 86400000).toISOString() },
  ],
  'demo-2': [
    { amount: 150, reason: 'Completed Chapter 1: Who is an Entrepreneur?', createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
    { amount: 50, reason: 'Completed Level 1.1 - Getting Briefed', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { amount: 25, reason: 'Daily login bonus (Day 5)', createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  ],
};

const FALLBACK_QUIZZES: Record<string, any[]> = {
  'demo-1': [
    { chapterRef: 'Chapter 1: Entrepreneurship Basics', score: 92, maxScore: 100, completedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { chapterRef: 'Chapter 3: Finding Problems Around You', score: 88, maxScore: 100, completedAt: new Date(Date.now() - 9 * 86400000).toISOString() },
    { chapterRef: 'Chapter 4: Opportunity Mapping', score: 95, maxScore: 100, completedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  ],
  'demo-2': [
    { chapterRef: 'Chapter 1: Entrepreneurship Basics', score: 78, maxScore: 100, completedAt: new Date(Date.now() - 13 * 86400000).toISOString() },
    { chapterRef: 'Chapter 3: Finding Problems Around You', score: 85, maxScore: 100, completedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  ],
};

// ─── Helper: Weekly Activity Data ───────────────────────────

function getWeeklyActivity(studentId: string) {
  const days = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const isActive = studentId === 'demo-1';
  for (let i = 6; i >= 0; i--) {
    days.push({
      day: dayNames[6 - i],
      date: new Date(Date.now() - i * 86400000),
      hours: isActive ? Math.floor(Math.random() * 2) + (i < 2 ? 1.5 : 0.5) : (i < 3 ? 1.2 : 0.3),
    });
  }
  return days;
}

// ─── Skills breakdown ───────────────────────────────────────

const SKILLS_DATA: Record<string, { name: string; value: number; color: string }[]> = {
  'demo-1': [
    { name: 'Observation', value: 92, color: 'bg-emerald-500' },
    { name: 'Problem Solving', value: 85, color: 'bg-blue-500' },
    { name: 'Business Knowledge', value: 78, color: 'bg-purple-500' },
    { name: 'Creativity', value: 88, color: 'bg-yellow-500' },
    { name: 'Financial Literacy', value: 72, color: 'bg-rose-500' },
  ],
  'demo-2': [
    { name: 'Observation', value: 80, color: 'bg-emerald-500' },
    { name: 'Problem Solving', value: 75, color: 'bg-blue-500' },
    { name: 'Business Knowledge', value: 65, color: 'bg-purple-500' },
    { name: 'Creativity', value: 82, color: 'bg-yellow-500' },
    { name: 'Financial Literacy', value: 60, color: 'bg-rose-500' },
  ],
};

// ─── XP Trend ────────────────────────────────────────────────

function getXpTrend(studentId: string) {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  if (studentId === 'demo-1') {
    return [
      { label: 'Week 1', xp: 450 },
      { label: 'Week 2', xp: 680 },
      { label: 'Week 3', xp: 920 },
      { label: 'Week 4', xp: 800 },
    ];
  }
  return [
    { label: 'Week 1', xp: 300 },
    { label: 'Week 2', xp: 520 },
    { label: 'Week 3', xp: 640 },
    { label: 'Week 4', xp: 640 },
  ];
}

// ─── Skill Icons ─────────────────────────────────────────────

const SkillIcon = ({ name }: { name: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Observation': <Target className="h-3.5 w-3.5" />,
    'Problem Solving': <Brain className="h-3.5 w-3.5" />,
    'Business Knowledge': <BookOpen className="h-3.5 w-3.5" />,
    'Creativity': <Lightbulb className="h-3.5 w-3.5" />,
    'Financial Literacy': <Landmark className="h-3.5 w-3.5" />,
  };
  return <>{iconMap[name] || <Star className="h-3.5 w-3.5" />}</>;
};

// ─── Main Component ──────────────────────────────────────────

export default function ParentOverviewPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/parent/children');
        const data = res.data.data;
        if (data && data.length > 0) {
          setChildren(data);
          if (!selectedChild) setSelectedChild(data[0].id);
        } else {
          // Use fallback data for demo
          setChildren(FALLBACK_CHILDREN as any);
          if (!selectedChild) setSelectedChild('demo-1');
        }
      } catch (err) {
        console.warn('API unavailable, using demo data');
        // Fallback to rich dummy data
        setChildren(FALLBACK_CHILDREN as any);
        if (!selectedChild) setSelectedChild('demo-1');
      } finally {
        // Delay to show loading animation briefly for UX
        setTimeout(() => setIsLoading(false), 600);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto" />
          <p className="text-slate-400 text-xs">Loading Family Dashboard...</p>
        </div>
      </div>
    );
  }

  const activeChild = children.find((c) => c.id === selectedChild) || children[0];
  if (!activeChild) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800 max-w-md">
          <Heart className="h-12 w-12 text-green-500/40 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No Children Linked</h3>
          <p className="text-slate-400 text-xs">
            To link a child to your parent account, contact your school administrator.
          </p>
        </div>
      </div>
    );
  }

  const achievements = FALLBACK_ACHIEVEMENTS[activeChild.id] || [];
  const transactions = FALLBACK_TRANSACTIONS[activeChild.id] || [];
  const quizzes = FALLBACK_QUIZZES[activeChild.id] || [];
  const weeklyData = getWeeklyActivity(activeChild.id);
  const skills = SKILLS_DATA[activeChild.id] || SKILLS_DATA['demo-1'];
  const xpTrend = getXpTrend(activeChild.id);
  const activeGames = activeChild.gameProgress || [];
  const detProgress = activeGames.find((g: any) => g.game?.slug === 'problem-hunt');
  const simProgress = activeGames.find((g: any) => g.game?.slug === 'startup-simulator');

  const getGameProgressPercent = (game: any) => {
    if (!game) return 0;
    if (game.status === 'COMPLETED') return 100;
    const totalChapters = game.game?.slug === 'startup-simulator' ? 4 : 3;
    return Math.round(((game.currentChapter - 1) / totalChapters) * 100);
  };

  // XP needed for next level
  const xpForNextLevel = activeChild.level * 1000;
  const xpProgress = Math.round((activeChild.totalXP / xpForNextLevel) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative overflow-hidden glass-panel p-6 md:p-8 rounded-2xl border border-green-500/10 bg-gradient-to-br from-green-950/20 to-emerald-950/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="h-6 w-6 text-green-400 fill-green-400/20" />
            <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Family Learning Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Family Learning Hub <span className="text-green-400">🏡</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Monitor your children's entrepreneurial journey — track XP, game progress, achievements, 
            quiz scores, and weekly activity — all in one place.
          </p>
        </div>
      </section>

      {/* ─── Child Selector ───────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child.id)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              selectedChild === child.id
                ? 'bg-green-600 text-white border-green-500/40 shadow-lg shadow-green-500/10'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-green-500/30 hover:text-white'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              selectedChild === child.id ? 'bg-white/20 text-white' : 'bg-green-500/10 text-green-400'
            }`}>
              {child.name.charAt(0)}
            </div>
            {child.name}
          </button>
        ))}
      </div>

      {activeChild && (
        <>
          {/* ─── Child Profile Header ─────────────────── */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  {activeChild.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">{activeChild.name}</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {activeChild.school?.name || 'School'} · Class {activeChild.classroom?.name || '7th Grade'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold">
                  <Star className="h-4 w-4 fill-green-400/20" />
                  Level {activeChild.level}
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl text-xs font-bold">
                  <Landmark className="h-4 w-4" />
                  ₹{activeChild.coins}
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl text-xs font-bold">
                  <Activity className="h-4 w-4" />
                  🔥 {activeChild.streak || 0} day streak
                </div>
              </div>
            </div>
          </div>

          {/* ─── Stats Grid ───────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Star, label: 'Total XP', value: `${activeChild.totalXP} XP`, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              { icon: Trophy, label: 'Level', value: activeChild.level, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
              { icon: Landmark, label: 'Virtual Coins', value: `₹${activeChild.coins}`, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
              { icon: Activity, label: 'Streak', value: `🔥 ${activeChild.streak || 0} days`, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
              { icon: CheckCircle, label: 'Games Done', value: `${activeGames.filter((g: any) => g.status === 'COMPLETED').length}/${activeGames.length}`, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { icon: Award, label: 'Badges', value: `${achievements.length}`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`glass-panel p-4 rounded-xl border ${stat.color} space-y-1.5`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${stat.color.split(' ')[0]}`} />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{stat.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* ─── XP Progress Bar ──────────────────────── */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Progress to Level {activeChild.level + 1}</span>
              <span className="text-[10px] text-slate-400">{activeChild.totalXP} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                style={{ width: `${Math.min(100, xpProgress)}%` }}
              />
            </div>
          </div>

          {/* ─── Tabs ─────────────────────────────────── */}
          <div className="flex gap-1 bg-slate-900/60 rounded-xl p-1 border border-slate-800 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Heart },
              { id: 'games', label: 'Games', icon: Trophy },
              { id: 'skills', label: 'Skills', icon: Brain },
              { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'achievements', label: 'Achievements', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ─── Tab Content: OVERVIEW ────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats Summary */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800">
                <h3 className="text-sm font-bold text-white font-display mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-400" />
                  Learning Snapshot
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Game Progress Summary */}
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/40">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5 mb-3">
                      <Trophy className="h-3.5 w-3.5 text-purple-400" />
                      Detective Progress
                    </span>
                    {detProgress ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Chapter {detProgress.currentChapter}/3</span>
                          <span className={`font-semibold ${
                            detProgress.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {detProgress.status === 'COMPLETED' ? '✅ Done!' : `Level ${detProgress.currentLevel}/10`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${getGameProgressPercent(detProgress)}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500">{detProgress.totalScore} pts · {detProgress.totalXPEarned} XP earned</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Not started</p>
                    )}
                  </div>

                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/40">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5 mb-3">
                      <Building className="h-3.5 w-3.5 text-blue-400" />
                      Simulator Progress
                    </span>
                    {simProgress && simProgress.status !== 'NOT_STARTED' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Chapter {simProgress.currentChapter}/4</span>
                          <span className={`font-semibold ${
                            simProgress.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {simProgress.status === 'COMPLETED' ? '✅ Done!' : `Level ${simProgress.currentLevel}/8`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${getGameProgressPercent(simProgress)}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500">{simProgress.totalScore} pts · {simProgress.totalXPEarned} XP earned</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500">Not yet started</p>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }} />
                        </div>
                        <span className="text-[10px] text-slate-600">Locked until Detective completed</span>
                      </div>
                    )}
                  </div>

                  {/* XP Trend Mini Chart */}
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/40">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5 mb-3">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      XP Trend (4 Weeks)
                    </span>
                    <div className="flex items-end justify-between gap-2 h-20">
                      {xpTrend.map((week, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                            style={{ height: `${(week.xp / Math.max(...xpTrend.map(w => w.xp))) * 100}%` }}
                          />
                          <span className="text-[8px] text-slate-600 font-semibold">{week.label.split(' ')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800">
                <h3 className="text-sm font-bold text-white font-display mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Star, text: 'Completed Chapter 3: Finding Problems Around You', time: '2 hours ago', color: 'text-purple-400 bg-purple-500/10' },
                    { icon: Trophy, text: 'Achievement Unlocked: Detective Pro 🏆', time: '10 days ago', color: 'text-yellow-400 bg-yellow-500/10' },
                    { icon: BookOpen, text: 'Scored 88% on Chapter 3 Quiz', time: '9 days ago', color: 'text-blue-400 bg-blue-500/10' },
                    { icon: Activity, text: '12-day streak milestone reached!', time: '12 days ago', color: 'text-orange-400 bg-orange-500/10' },
                    { icon: Award, text: 'Earned "Problem Spotter" badge', time: '14 days ago', color: 'text-amber-400 bg-amber-500/10' },
                  ].map((activity, i) => {
                    const Icon = activity.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 py-2">
                        <div className={`p-2 rounded-lg ${activity.color} shrink-0`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-200">{activity.text}</p>
                          <span className="text-[10px] text-slate-600">{activity.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Learning Insight */}
              <div className="glass-panel p-5 rounded-2xl border border-green-500/10 bg-green-950/5">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">AI Learning Insight</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {activeChild.name} is showing strong observation skills (92%) and creativity (88%). 
                      They excel at identifying real-world problems — a core entrepreneurial trait. 
                      Encourage them to think about <strong className="text-white">how each problem could become a business opportunity</strong>. 
                      Next focus area: financial literacy (72%) — practice basic profit calculations together!
                    </p>
                  </div>
                </div>
              </div>

              {/* Coin History */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800">
                <h3 className="text-sm font-bold text-white font-display mb-4 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-yellow-400" />
                  Recent Coin Transactions
                </h3>
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-900/60 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-slate-300">{t.reason}</span>
                      </div>
                      <span className={`text-xs font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab Content: GAMES ───────────────────── */}
          {activeTab === 'games' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-400" />
                Game Progress
              </h3>

              {/* Problem Hunt Detective */}
              <div className="bg-slate-900/60 rounded-xl p-5 border border-purple-500/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-900/30 rounded-xl shrink-0">
                    <Trophy className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">Problem Hunt Detective</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Chapters 1-3: Explore, observe, and identify problems</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                        detProgress?.status === 'COMPLETED' 
                          ? 'text-green-400 border-green-500/30 bg-green-500/10'
                          : detProgress?.status === 'IN_PROGRESS'
                          ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                          : 'text-slate-500 border-slate-600/30 bg-slate-700/10'
                      }`}>
                        {detProgress?.status === 'COMPLETED' ? '✅ Completed' : detProgress?.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((ch) => {
                        const isCompleted = detProgress && detProgress.currentChapter > ch;
                        const isCurrent = detProgress && detProgress.currentChapter === ch;
                        const chapterNames = ['Mindset', 'School Hunt', 'Market Hunt'];
                        return (
                          <div key={ch} className={`p-3 rounded-lg border text-center ${
                            isCompleted ? 'bg-green-500/5 border-green-500/20' :
                            isCurrent ? 'bg-purple-500/5 border-purple-500/30' :
                            'bg-slate-800/30 border-slate-800'
                          }`}>
                            <div className={`text-lg mb-1 ${isCompleted ? 'text-green-400' : isCurrent ? 'text-purple-400' : 'text-slate-600'}`}>
                              {isCompleted ? '✅' : isCurrent ? '🔍' : '🔒'}
                            </div>
                            <p className={`text-[10px] font-semibold ${isCompleted ? 'text-green-400' : isCurrent ? 'text-purple-300' : 'text-slate-500'}`}>
                              Ch.{ch}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-0.5">{chapterNames[ch - 1]}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-4 text-[10px] text-slate-500">
                      <span>⭐ Score: <strong className="text-white">{detProgress?.totalScore || 0}</strong></span>
                      <span>⚡ XP: <strong className="text-white">{detProgress?.totalXPEarned || 0}</strong></span>
                      <span>📊 Progress: <strong className={`${getGameProgressPercent(detProgress) === 100 ? 'text-green-400' : 'text-yellow-400'}`}>{getGameProgressPercent(detProgress)}%</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Startup Simulator */}
              <div className="bg-slate-900/60 rounded-xl p-5 border border-blue-500/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-900/30 rounded-xl shrink-0">
                    <Building className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">Startup Simulator</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Chapters 7-10: Build brand, team, pricing & pitch</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                        simProgress?.status === 'COMPLETED' 
                          ? 'text-green-400 border-green-500/30 bg-green-500/10'
                          : simProgress?.status === 'IN_PROGRESS'
                          ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                          : 'text-slate-500 border-slate-600/30 bg-slate-700/10'
                      }`}>
                        {simProgress?.status === 'COMPLETED' ? '✅ Completed' : simProgress?.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((ch) => {
                        const isCompleted = simProgress && simProgress.currentChapter > ch;
                        const isCurrent = simProgress && simProgress.currentChapter === ch;
                        const chapterNames = ['Brand', 'Team', 'Economics', 'Pitch'];
                        return (
                          <div key={ch} className={`p-2.5 rounded-lg border text-center ${
                            isCompleted ? 'bg-green-500/5 border-green-500/20' :
                            isCurrent ? 'bg-blue-500/5 border-blue-500/30' :
                            'bg-slate-800/30 border-slate-800'
                          }`}>
                            <div className={`text-sm mb-0.5 ${isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-400' : 'text-slate-600'}`}>
                              {isCompleted ? '✅' : isCurrent ? '🏗️' : '🔒'}
                            </div>
                            <p className={`text-[9px] font-semibold ${isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-300' : 'text-slate-500'}`}>
                              {chapterNames[ch - 1]}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {simProgress && simProgress.status !== 'NOT_STARTED' && (
                      <div className="flex gap-4 text-[10px] text-slate-500">
                        <span>⭐ Score: <strong className="text-white">{simProgress.totalScore || 0}</strong></span>
                        <span>⚡ XP: <strong className="text-white">{simProgress.totalXPEarned || 0}</strong></span>
                        <span>📊 Progress: <strong className="text-yellow-400">{getGameProgressPercent(simProgress)}%</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Startup details if available */}
              {simProgress?.simulatorSave && (
                <div className="bg-slate-900/40 rounded-xl p-4 border border-blue-500/5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Startup Snapshot</span>
                  {(() => {
                    const ss = typeof simProgress.simulatorSave === 'string' 
                      ? JSON.parse(simProgress.simulatorSave) 
                      : simProgress.simulatorSave;
                    return (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-2.5 bg-slate-800/40 rounded-lg">
                          <p className="text-[9px] text-slate-500">Startup Name</p>
                          <p className="text-xs font-bold text-white mt-0.5">{ss.startupName || '—'}</p>
                        </div>
                        <div className="text-center p-2.5 bg-slate-800/40 rounded-lg">
                          <p className="text-[9px] text-slate-500">Revenue</p>
                          <p className="text-xs font-bold text-green-400 mt-0.5">₹{(ss.revenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-2.5 bg-slate-800/40 rounded-lg">
                          <p className="text-[9px] text-slate-500">Profit</p>
                          <p className="text-xs font-bold text-yellow-400 mt-0.5">₹{(ss.profit || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-2.5 bg-slate-800/40 rounded-lg">
                          <p className="text-[9px] text-slate-500">Valuation</p>
                          <p className="text-xs font-bold text-purple-400 mt-0.5">₹{(ss.valuation || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ─── Tab Content: SKILLS ──────────────────── */}
          {activeTab === 'skills' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Brain className="h-4 w-4 text-green-400" />
                Skill Development
              </h3>
              <p className="text-[11px] text-slate-400">
                Skills are developed through gameplay. Higher values mean stronger abilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill) => (
                  <div key={skill.name} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <SkillIcon name={skill.name} />
                        <span className="text-xs font-semibold text-white">{skill.name}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{skill.value}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${skill.color} transition-all duration-1000`}
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-green-950/10 border border-green-500/10 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-white">Tip:</strong> To improve <strong>Financial Literacy</strong>, 
                    practice the Startup Simulator's pricing module more. <strong>Observation</strong> 
                    can be further strengthened by exploring more dialogue options in the Detective game.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab Content: QUIZZES ─────────────────── */}
          {activeTab === 'quizzes' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-400" />
                Quiz Performance
              </h3>
              {quizzes.length > 0 ? (
                <>
                  {/* Average score */}
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/40">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Average Score</span>
                    <p className="text-3xl font-bold text-white mt-1">
                      {Math.round(quizzes.reduce((sum: number, q: any) => sum + (q.score / q.maxScore) * 100, 0) / quizzes.length)}%
                    </p>
                  </div>
                  <div className="space-y-3">
                    {quizzes.map((quiz: any, i: number) => {
                      const pct = Math.round((quiz.score / quiz.maxScore) * 100);
                      return (
                        <div key={i} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/40">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-300">{quiz.chapterRef}</span>
                            <span className={`text-xs font-bold ${pct >= 90 ? 'text-green-400' : pct >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {quiz.score}/{quiz.maxScore} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                pct >= 90 ? 'bg-green-500' : pct >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-600 mt-1 block">
                            {new Date(quiz.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">No quiz attempts yet.</p>
              )}
            </div>
          )}

          {/* ─── Tab Content: ACTIVITY ────────────────── */}
          {activeTab === 'activity' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                Weekly Activity
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {weeklyData.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-lg transition-all bg-gradient-to-t from-green-600 to-green-400"
                      style={{ height: `${Math.max(8, day.hours * 40)}px` }}
                    />
                    <span className="text-[9px] text-slate-600 font-semibold">{day.day}</span>
                    <span className="text-[8px] text-slate-500">{day.hours.toFixed(1)}h</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/40">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span>Total this week: <strong className="text-white">{weeklyData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)} hours</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab Content: ACHIEVEMENTS ────────────── */}
          {activeTab === 'achievements' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Award className="h-4 w-4 text-green-400" />
                Achievements & Badges
              </h3>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {achievements.map((ach: any, i: number) => {
                    const rarityColor = RARITY_COLORS[ach.rarity] || RARITY_COLORS['COMMON'];
                    return (
                      <div key={i} className={`relative overflow-hidden rounded-xl p-4 border text-center transition-all hover:scale-105 ${rarityColor}`}>
                        <div 
                          className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg"
                          style={{ backgroundColor: ach.badgeColor + '30', border: `2px solid ${ach.badgeColor}` }}
                        >
                          {ach.rarity === 'LEGENDARY' ? '🏆' : ach.rarity === 'EPIC' ? '💎' : ach.rarity === 'RARE' ? '⭐' : '📜'}
                        </div>
                        <p className="text-xs font-bold text-white">{ach.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{ach.description}</p>
                        <div className={`mt-2 text-[8px] font-bold uppercase tracking-wider ${
                          ach.rarity === 'LEGENDARY' ? 'text-yellow-400' : ach.rarity === 'EPIC' ? 'text-purple-400' : ach.rarity === 'RARE' ? 'text-blue-400' : 'text-slate-400'
                        }`}>
                          {ach.rarity} · +{ach.xpBonus} XP
                        </div>
                        {ach.earnedAt && (
                          <p className="text-[8px] text-slate-600 mt-1">
                            {new Date(ach.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">No achievements earned yet.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
