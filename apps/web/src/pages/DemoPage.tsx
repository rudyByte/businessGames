import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  ShieldAlert,
  Trophy,
  Building,
  MapPin,
  BookOpen,
  Star,
  Coins,
  Play,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lightbulb,
  Target,
  CheckCircle,
  Globe,
  Flame,
  Heart,
  Rocket,
  Sword,
  Zap,
} from 'lucide-react';

const DEMO_CREDENTIALS = {
  student: { email: 'aryan@student.com', password: 'User@123', label: 'Student Demo', role: 'Student' },
  faculty: { email: 'sharma@dps.in', password: 'User@123', label: 'Faculty Demo', role: 'Faculty' },
  admin: { email: 'admin@campusedge.in', password: 'Admin@123', label: 'Admin Demo', role: 'Admin' },
  parent: { email: 'parent.goel@parent.com', password: 'User@123', label: 'Parent Demo', role: 'Parent' },
} as const;

const TEXT_COLORS: Record<string, string> = {
  teal: 'text-game-teal',
  orange: 'text-game-orange',
  danger: 'text-game-danger',
  success: 'text-game-success',
};

const BG_GRADIENTS: Record<string, string> = {
  teal: 'from-game-teal/10 to-game-teal/5',
  orange: 'from-game-orange/10 to-game-orange/5',
  danger: 'from-game-danger/10 to-game-danger/5',
  success: 'from-game-success/10 to-game-success/5',
};

const DOT_COLORS: Record<string, string> = {
  teal: 'bg-game-teal',
  orange: 'bg-game-orange',
  danger: 'bg-game-danger',
  success: 'bg-game-success',
};

const ROLE_CARDS = [
  { icon: Gamepad2, color: 'text-game-teal', title: 'Students', desc: 'Play gamified quests, earn XP & coins, climb leaderboards, and unlock achievements.' },
  { icon: BookOpen, color: 'text-game-orange', title: 'Faculty', desc: 'Track classroom progress, create assignments, and view AI-generated learning insights.' },
  { icon: ShieldAlert, color: 'text-game-danger', title: 'Admins', desc: 'Manage schools, view platform-wide stats, and oversee faculty & student enrollment.' },
];

const DEMO_ACCOUNTS_CARDS = [
  { label: 'Student', email: 'aryan@student.com', pass: 'User@123', color: 'teal', action: 'Login as Aryan', roleKey: 'student' as const },
  { label: 'Faculty', email: 'sharma@dps.in', pass: 'User@123', color: 'orange', action: 'Login as Ms. Sharma', roleKey: 'faculty' as const },
  { label: 'Admin', email: 'admin@campusedge.in', pass: 'Admin@123', color: 'danger', action: 'Login as Rajiv', roleKey: 'admin' as const },
  { label: 'Parent', email: 'parent.goel@parent.com', pass: 'User@123', color: 'success', action: 'Login as Mrs. Goel', roleKey: 'parent' as const },
];

const ROUTES_DATA = [
  ['/login', 'All', 'Public', 'Login page with demo quick-login buttons'],
  ['/register', 'All', 'Public', 'New user registration'],
  ['/demo', 'All', 'Public', 'Crawlable demo overview & sitemap (this page)'],
  ['/student', 'Student', 'Protected', 'Student home with XP, streak, coins, games & leaderboard'],
  ['/student/games', 'Student', 'Protected', 'Games catalog — Problem Hunt Detective & Startup Simulator'],
  ['/student/games/detective', 'Student', 'Protected', 'Problem Hunt Detective game (3D scenes, NPC dialogue, clue finding)'],
  ['/student/games/simulator', 'Student', 'Protected', 'Startup Simulator (brand builder, team builder, pricing, Shark Tank)'],
  ['/student/achievements', 'Student', 'Protected', 'Achievements & badges earned through gameplay'],
  ['/student/leaderboard', 'Student', 'Protected', 'Class leaderboard showing XP rankings'],
  ['/student/profile', 'Student', 'Protected', 'Student profile with avatar customization'],
  ['/faculty', 'Faculty', 'Protected', 'Faculty dashboard with classroom progress, AI insights'],
  ['/faculty/assignments', 'Faculty', 'Protected', 'Create and manage assignments for classrooms'],
  ['/faculty/analytics', 'Faculty', 'Protected', 'Detailed analytics on student performance'],
  ['/parent', 'Parent', 'Protected', 'Parent overview showing child progress'],
  ['/parent/reports', 'Parent', 'Protected', 'Detailed progress reports for parents'],
  ['/admin', 'Admin', 'Protected', 'Admin dashboard with school management, stats'],
];

const API_ENDPOINTS = [
  ['/api/v1/auth/register', 'POST', 'No', 'Register new user'],
  ['/api/v1/auth/login', 'POST', 'No', 'Login with email & password'],
  ['/api/v1/auth/me', 'GET', 'JWT', 'Get current user profile'],
  ['/api/v1/health', 'GET', 'No', 'Health check'],
  ['/api/v1/games/:slug/progress', 'GET', 'JWT', 'Get game progress for student'],
  ['/api/v1/faculty/classroom', 'GET', 'JWT', 'Get faculty classroom & students'],
  ['/api/v1/faculty/classroom/analytics', 'GET', 'JWT', 'Get AI learning insights'],
  ['/api/v1/faculty/assignments', 'GET', 'JWT', 'List assignments'],
  ['/api/v1/faculty/assignments', 'POST', 'JWT', 'Create assignment'],
  ['/api/v1/admin/stats', 'GET', 'JWT', 'Get admin platform stats'],
];

export default function DemoPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const handleDemoLogin = async (role: keyof typeof DEMO_CREDENTIALS) => {
    const creds = DEMO_CREDENTIALS[role];
    setLoggingIn(role);
    setError(null);

    try {
      await login({ email: creds.email, passwordHash: creds.password });
      const user = useAuthStore.getState().user;
      if (user) {
        if (role === 'student') navigate('/student');
        else if (role === 'faculty') navigate('/faculty');
        else if (role === 'admin') navigate('/admin');
        else if (role === 'parent') navigate('/parent');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Login failed. Make sure the API server is running with seeded data.');
    } finally {
      setLoggingIn(null);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-game-gradient text-white relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-game-orange/10 rounded-full blur-3xl -translate-y-1/2" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-game-teal/10 rounded-full blur-3xl translate-y-1/3" 
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-700/30">
        <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="p-3 bg-gradient-to-br from-game-orange to-game-orange-dark rounded-2xl shadow-game-glow"
            >
              <Rocket className="h-10 w-10 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-game-round tracking-tight text-white text-center text-glow"
          >
            CampusEdge
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-game-body text-game-text-muted text-center mt-4 text-lg max-w-2xl mx-auto font-bold"
          >
            Learn Business. Build Empires. One Quest at a Time.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-game-body text-slate-500 text-center mt-2 text-sm max-w-xl mx-auto"
          >
            An interactive educational platform where students learn entrepreneurship through gamified quests,
            faculty track progress with AI insights, and administrators manage schools.
          </motion.p>

          {/* Quick Demo Login Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => handleDemoLogin('student')}
              disabled={loggingIn !== null}
              className="btn-game btn-game-primary text-sm py-3 px-8"
            >
              {loggingIn === 'student' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Gamepad2 className="h-4 w-4" />
              )}
              <span>Student Demo</span>
            </button>

            <button
              onClick={() => handleDemoLogin('faculty')}
              disabled={loggingIn !== null}
              className="btn-game btn-game-secondary text-sm py-3 px-8"
            >
              {loggingIn === 'faculty' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              <span>Faculty Demo</span>
            </button>

            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loggingIn !== null}
              className="btn-game btn-game-danger text-sm py-3 px-8"
            >
              {loggingIn === 'admin' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
              <span>Admin Demo</span>
            </button>

            <button
              onClick={() => handleDemoLogin('parent')}
              disabled={loggingIn !== null}
              className="btn-game btn-game-ghost !text-game-teal border-game-teal/30 text-sm py-3 px-8"
            >
              {loggingIn === 'parent' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              <span>Parent Demo</span>
            </button>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-lg mx-auto bg-game-danger/10 border border-game-danger/20 text-game-danger p-4 rounded-xl text-sm text-center font-game-body"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <span className="inline-flex items-center gap-2 bg-game-dark/80 border border-slate-700/40 text-game-text-muted text-xs px-4 py-2 rounded-full font-game-body">
              <Sparkles className="h-3.5 w-3.5 text-game-yellow" />
              No sign-up required — click any demo button to explore
            </span>
          </motion.div>
        </div>
      </section>

      {/* Accordion-style Documentation Sections */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        
        {/* Section: Platform Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="game-card rounded-2xl border-slate-700/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('overview')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-game-teal" />
              <h2 className="text-lg font-game-round text-white">Platform Overview</h2>
            </div>
            {expandedSection === 'overview' ? <ChevronUp className="h-4 w-4 text-game-text-muted" /> : <ChevronDown className="h-4 w-4 text-game-text-muted" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'overview' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6 space-y-4 text-sm font-game-body text-slate-300 leading-relaxed overflow-hidden"
              >
                <p>
                  CampusEdge is an educational technology platform that teaches entrepreneurship to middle school students
                  (Grade 7) through interactive, story-driven games built on a real-world curriculum.
                </p>
                <p>
                  The platform has <strong className="text-white">three main user roles</strong> — Students, Faculty, and Super Admins — each with their own dashboard and access controls.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {ROLE_CARDS.map((item, i) => (
                    <div key={i} className="bg-game-deep/60 rounded-xl p-4 border border-slate-700/30">
                      <div className={`flex items-center gap-2 ${item.color} mb-2`}>
                        <item.icon className="h-4 w-4" />
                        <span className="font-bold text-white text-xs font-game-body">{item.title}</span>
                      </div>
                      <p className="text-xs text-game-text-muted">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section: Route Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="game-card rounded-2xl border-slate-700/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('routes')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sword className="h-5 w-5 text-game-orange" />
              <h2 className="text-lg font-game-round text-white">Route Map &amp; Navigation</h2>
            </div>
            {expandedSection === 'routes' ? <ChevronUp className="h-4 w-4 text-game-text-muted" /> : <ChevronDown className="h-4 w-4 text-game-text-muted" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'routes' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6 space-y-4 text-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-game-body">
                    <thead>
                      <tr className="border-b border-slate-700/30 text-game-text-muted font-bold">
                        <th className="pb-3 pr-4">Route</th>
                        <th className="pb-3 pr-4">Role</th>
                        <th className="pb-3 pr-4">Auth</th>
                        <th className="pb-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {ROUTES_DATA.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800/40">
                          <td className="py-2 pr-4"><code className="text-game-teal">{row[0]}</code></td>
                          <td className="py-2 pr-4">{row[1]}</td>
                          <td className="py-2 pr-4"><span className={row[2] === 'Protected' ? 'text-game-yellow' : 'text-game-success'}>{row[2]}</span></td>
                          <td className="py-2">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section: Games */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="game-card rounded-2xl border-slate-700/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('games')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-5 w-5 text-game-teal" />
              <h2 className="text-lg font-game-round text-white">Games &amp; Curriculum</h2>
            </div>
            {expandedSection === 'games' ? <ChevronUp className="h-4 w-4 text-game-text-muted" /> : <ChevronDown className="h-4 w-4 text-game-text-muted" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'games' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6 space-y-6 text-sm font-game-body overflow-hidden"
              >
                {/* Game 1 */}
                <div className="bg-game-deep/60 rounded-xl p-5 border-l-4 border-l-game-teal border border-slate-700/30">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-game-teal/20 to-game-teal/5 rounded-xl shrink-0">
                      <Trophy className="h-8 w-8 text-game-teal" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-white font-game-round">🕵️ Problem Hunt Detective</h3>
                      <p className="text-game-text-muted text-xs leading-relaxed">
                        Part 1 of the entrepreneurship curriculum (Chapters 1-6). Students step into 3D environments —
                        Greenfield School and Rajpur Market — searching for clues, interviewing NPCs, and identifying
                        real-world problems to turn into business opportunities.
                      </p>
                      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 font-bold uppercase mt-2">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 3 Chapters</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" /> 10 Levels each</span>
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Exploration &amp; Quiz</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game 2 */}
                <div className="bg-game-deep/60 rounded-xl p-5 border-l-4 border-l-game-orange border border-slate-700/30">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-game-orange/20 to-game-orange/5 rounded-xl shrink-0">
                      <Building className="h-8 w-8 text-game-orange" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-white font-game-round">🚀 Startup Simulator</h3>
                      <p className="text-game-text-muted text-xs leading-relaxed">
                        Part 2 of the curriculum (Chapters 7-10). Students build a brand, hire a team with complementary
                        skills, experiment with pricing models, run weekly business rounds, and pitch their startup
                        to a virtual Shark Tank panel.
                      </p>
                      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 font-bold uppercase mt-2">
                        <span className="flex items-center gap-1"><Building className="h-3 w-3" /> 4 Chapters</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> 8 Levels each</span>
                        <span className="flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Simulation &amp; Mini-games</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section: Demo Credentials */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="game-card rounded-2xl border-slate-700/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('credentials')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-game-yellow" />
              <h2 className="text-lg font-game-round text-white">Demo Accounts</h2>
            </div>
            {expandedSection === 'credentials' ? <ChevronUp className="h-4 w-4 text-game-text-muted" /> : <ChevronDown className="h-4 w-4 text-game-text-muted" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'credentials' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6 space-y-3 text-sm font-game-body overflow-hidden"
              >
                <p className="text-game-text-muted text-xs">
                  Pre-seeded accounts for exploring the platform. All passwords use <code className="text-white bg-game-deep px-1.5 py-0.5 rounded text-[10px]">User@123</code> except admin.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {DEMO_ACCOUNTS_CARDS.map((acct, i) => (
                    <div key={i} className={`bg-gradient-to-br ${BG_GRADIENTS[acct.color]} rounded-xl p-4 border border-slate-700/30`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${DOT_COLORS[acct.color]}`} />
                        <span className="font-bold text-white text-xs">{acct.label}</span>
                      </div>
                      <p className="text-[11px] text-game-text-muted font-mono">{acct.email}</p>
                      <p className="text-[11px] text-slate-600 font-mono">{acct.pass}</p>
                      <button
                        onClick={() => handleDemoLogin(acct.roleKey)}
                        disabled={loggingIn !== null}
                        className={`mt-3 text-[11px] ${TEXT_COLORS[acct.color]} hover:text-white font-bold flex items-center gap-1 transition-colors`}
                      >
                        <Play className="h-3 w-3 fill-current" /> {acct.action}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section: Tech Stack */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="game-card rounded-2xl border-slate-700/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('techstack')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-game-success" />
              <h2 className="text-lg font-game-round text-white">Technology Stack</h2>
            </div>
            {expandedSection === 'techstack' ? <ChevronUp className="h-4 w-4 text-game-text-muted" /> : <ChevronDown className="h-4 w-4 text-game-text-muted" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'techstack' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-game-body">
                  <div className="bg-game-deep/60 rounded-xl p-4 border border-slate-700/30">
                    <h4 className="font-bold text-game-teal text-xs mb-3 uppercase tracking-wider">Frontend</h4>
                    <ul className="space-y-2 text-xs text-game-text-muted">
                      {['React 18 with TypeScript', 'Vite bundler', 'Tailwind CSS with custom glassmorphism', 'Zustand for state management', 'React Router v6 with role-based guards', 'Three.js / React Three Fiber (3D scenes)', 'Axios with JWT interceptors'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-game-success shrink-0" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-game-deep/60 rounded-xl p-4 border border-slate-700/30">
                    <h4 className="font-bold text-game-orange text-xs mb-3 uppercase tracking-wider">Backend</h4>
                    <ul className="space-y-2 text-xs text-game-text-muted">
                      {['Node.js with Express', 'Prisma ORM + SQLite (dev)', 'JWT authentication with bcrypt', 'Zod validation schemas', 'Monorepo with npm workspaces', 'Shared types package (@campusedge/shared)', 'Rate limiting & error handling middleware'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-game-success shrink-0" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section: API Endpoints */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="game-card rounded-2xl border-slate-700/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('api')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-game-orange" />
              <h2 className="text-lg font-game-round text-white">API Endpoints</h2>
            </div>
            {expandedSection === 'api' ? <ChevronUp className="h-4 w-4 text-game-text-muted" /> : <ChevronDown className="h-4 w-4 text-game-text-muted" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'api' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-game-body">
                    <thead>
                      <tr className="border-b border-slate-700/30 text-game-text-muted font-bold">
                        <th className="pb-3 pr-4">Endpoint</th>
                        <th className="pb-3 pr-4">Method</th>
                        <th className="pb-3 pr-4">Auth</th>
                        <th className="pb-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {API_ENDPOINTS.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800/40">
                          <td className="py-2 pr-4"><code className="text-game-teal">{row[0]}</code></td>
                          <td className={`py-2 pr-4 font-mono ${row[1] === 'POST' ? 'text-game-success' : 'text-game-yellow'}`}>{row[1]}</td>
                          <td className="py-2 pr-4">{row[2] === 'No' ? <span className="text-game-success">No</span> : <span className="text-game-yellow">{row[2]}</span>}</td>
                          <td className="py-2">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section: Gamification System */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="game-card rounded-2xl border-slate-700/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('gamification')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-game-yellow" />
              <h2 className="text-lg font-game-round text-white">Gamification System</h2>
            </div>
            {expandedSection === 'gamification' ? <ChevronUp className="h-4 w-4 text-game-text-muted" /> : <ChevronDown className="h-4 w-4 text-game-text-muted" />}
          </button>
          <AnimatePresence>
            {expandedSection === 'gamification' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6 space-y-4 text-sm font-game-body text-slate-300 overflow-hidden"
              >
                <p className="text-xs text-game-text-muted">The platform uses a comprehensive gamification system to keep students engaged:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-game-deep/60 rounded-xl p-4 border border-slate-700/30 flex items-start gap-3">
                    <Coins className="h-5 w-5 text-game-yellow shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs">Virtual Currency (Coins)</span>
                      <p className="text-[11px] text-game-text-muted mt-1">Earned by completing levels, achievements, and assignments. Used as a performance metric.</p>
                    </div>
                  </div>
                  <div className="bg-game-deep/60 rounded-xl p-4 border border-slate-700/30 flex items-start gap-3">
                    <Star className="h-5 w-5 text-game-teal shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs">XP &amp; Levels</span>
                      <p className="text-[11px] text-game-text-muted mt-1">Experience points from gameplay. Leveling up unlocks new content and achievements.</p>
                    </div>
                  </div>
                  <div className="bg-game-deep/60 rounded-xl p-4 border border-slate-700/30 flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-game-orange shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs">Achievements</span>
                      <p className="text-[11px] text-game-text-muted mt-1">10 unique badges across 4 rarities (Common, Rare, Epic, Legendary) with XP bonuses.</p>
                    </div>
                  </div>
                  <div className="bg-game-deep/60 rounded-xl p-4 border border-slate-700/30 flex items-start gap-3">
                    <Flame className="h-5 w-5 text-game-orange shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs">Streak Tracking</span>
                      <p className="text-[11px] text-game-text-muted mt-1">Daily activity streaks encourage consistent engagement with the platform.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Rocket className="h-5 w-5 text-game-orange" />
            <span className="font-bold text-white text-sm font-game-round">CampusEdge</span>
          </div>
          <p className="text-[10px] text-slate-500 font-game-body">
            Educational Entrepreneurship Platform · Built with React, Express, Prisma &amp; Three.js
          </p>
          <p className="text-[10px] text-slate-600 mt-1 font-game-body">
            This is a demo overview page. All protected routes require authentication via the demo login buttons above.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="/login" className="text-[11px] text-game-teal hover:text-white transition-colors font-game-body font-bold">Login Page</a>
            <a href="/register" className="text-[11px] text-game-teal hover:text-white transition-colors font-game-body font-bold">Register</a>
            <span className="text-[11px] text-slate-600">|</span>
            <span className="text-[11px] text-slate-600 font-game-body">Crawlable Demo Sitemap v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
