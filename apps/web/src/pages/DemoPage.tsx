import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  GraduationCap,
  Gamepad2,
  School,
  ShieldAlert,
  Users,
  Trophy,
  Building,
  MapPin,
  BookOpen,
  BarChart3,
  User,
  Star,
  Coins,
  ArrowRight,
  ExternalLink,
  Play,
  LogIn,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LayoutDashboard,
  GitBranch,
  Lightbulb,
  Target,
  CheckCircle,
  Globe,
  Flame,
} from 'lucide-react';

const DEMO_CREDENTIALS = {
  student: { email: 'aryan@student.com', password: 'User@123', label: 'Student Demo', role: 'Student' },
  faculty: { email: 'sharma@dps.in', password: 'User@123', label: 'Faculty Demo', role: 'Faculty' },
  admin: { email: 'admin@campusedge.in', password: 'Admin@123', label: 'Admin Demo', role: 'Admin' },
} as const;

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-3xl translate-y-1/2" />

        <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/20">
              <GraduationCap className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-5xl font-bold font-display text-white text-center tracking-tight">
            CampusEdge
          </h1>
          <p className="text-slate-400 text-center mt-4 text-lg max-w-2xl mx-auto">
            Learn Business. Build Empires. One Quest at a Time.
          </p>
          <p className="text-slate-500 text-center mt-2 text-sm max-w-xl mx-auto">
            An interactive educational platform where students learn entrepreneurship through gamified quests,
            faculty track progress with AI insights, and administrators manage schools.
          </p>

          {/* Quick Demo Login Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleDemoLogin('student')}
              disabled={loggingIn !== null}
              className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold text-sm py-3 px-6 rounded-xl border border-purple-500/30 transition-all hover:scale-105 active:scale-95 disabled:scale-100"
            >
              {loggingIn === 'student' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              <span>Launch Student Demo</span>
              <ExternalLink className="h-3.5 w-3.5 text-purple-300" />
            </button>

            <button
              onClick={() => handleDemoLogin('faculty')}
              disabled={loggingIn !== null}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold text-sm py-3 px-6 rounded-xl border border-blue-500/30 transition-all hover:scale-105 active:scale-95 disabled:scale-100"
            >
              {loggingIn === 'faculty' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              <span>Launch Faculty Demo</span>
              <ExternalLink className="h-3.5 w-3.5 text-blue-300" />
            </button>

            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loggingIn !== null}
              className="flex items-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold text-sm py-3 px-6 rounded-xl border border-red-500/30 transition-all hover:scale-105 active:scale-95 disabled:scale-100"
            >
              {loggingIn === 'admin' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
              <span>Launch Admin Demo</span>
              <ExternalLink className="h-3.5 w-3.5 text-red-300" />
            </button>
          </div>

          {error && (
            <div className="mt-6 max-w-lg mx-auto bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 text-slate-400 text-xs px-4 py-2 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
              No sign-up required — click any demo button to explore
            </span>
          </div>
        </div>
      </section>

      {/* Accordion-style Documentation Sections */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        
        {/* Section: Platform Overview */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold font-display text-white">Platform Overview</h2>
            </div>
            {expandedSection === 'overview' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {expandedSection === 'overview' && (
            <div className="px-6 pb-6 space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                CampusEdge is an educational technology platform that teaches entrepreneurship to middle school students
                (Grade 7) through interactive, story-driven games built on a real-world curriculum.
              </p>
              <p>
                The platform has <strong className="text-white">three main user roles</strong> — Students, Faculty, and Super Admins — each with their own dashboard and access controls.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Gamepad2 className="h-4 w-4" />
                    <span className="font-semibold text-white">Students</span>
                  </div>
                  <p className="text-xs text-slate-400">Play gamified quests, earn XP &amp; coins, climb leaderboards, and unlock achievements.</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold text-white">Faculty</span>
                  </div>
                  <p className="text-xs text-slate-400">Track classroom progress, create assignments, and view AI-generated learning insights.</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <School className="h-4 w-4" />
                    <span className="font-semibold text-white">Admins</span>
                  </div>
                  <p className="text-xs text-slate-400">Manage schools, view platform-wide stats, and oversee faculty &amp; student enrollment.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Route Map */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('routes')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-bold font-display text-white">Route Map &amp; Navigation</h2>
            </div>
            {expandedSection === 'routes' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {expandedSection === 'routes' && (
            <div className="px-6 pb-6 space-y-4 text-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                      <th className="pb-3 pr-4">Route</th>
                      <th className="pb-3 pr-4">Role</th>
                      <th className="pb-3 pr-4">Auth</th>
                      <th className="pb-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/login</code></td>
                      <td className="py-2.5 pr-4">All</td>
                      <td className="py-2.5 pr-4"><span className="text-green-400">Public</span></td>
                      <td className="py-2.5">Login page with demo quick-login buttons</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/register</code></td>
                      <td className="py-2.5 pr-4">All</td>
                      <td className="py-2.5 pr-4"><span className="text-green-400">Public</span></td>
                      <td className="py-2.5">New user registration</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/demo</code></td>
                      <td className="py-2.5 pr-4">All</td>
                      <td className="py-2.5 pr-4"><span className="text-green-400">Public</span></td>
                      <td className="py-2.5">Crawlable demo overview &amp; sitemap (this page)</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/student</code></td>
                      <td className="py-2.5 pr-4">Student</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Student home with XP, streak, coins, games &amp; leaderboard</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/student/games</code></td>
                      <td className="py-2.5 pr-4">Student</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Games catalog — Problem Hunt Detective &amp; Startup Simulator</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/student/games/detective</code></td>
                      <td className="py-2.5 pr-4">Student</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Problem Hunt Detective game (3D scenes, NPC dialogue, clue finding)</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/student/games/simulator</code></td>
                      <td className="py-2.5 pr-4">Student</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Startup Simulator (brand builder, team builder, pricing, Shark Tank pitch)</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/student/achievements</code></td>
                      <td className="py-2.5 pr-4">Student</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Achievements &amp; badges earned through gameplay</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/student/leaderboard</code></td>
                      <td className="py-2.5 pr-4">Student</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Class leaderboard showing XP rankings</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/student/profile</code></td>
                      <td className="py-2.5 pr-4">Student</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Student profile with avatar customization</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/faculty</code></td>
                      <td className="py-2.5 pr-4">Faculty</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Faculty dashboard with classroom progress, AI insights &amp; assignment creation</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/faculty/assignments</code></td>
                      <td className="py-2.5 pr-4">Faculty</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Create and manage assignments for classrooms</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/faculty/analytics</code></td>
                      <td className="py-2.5 pr-4">Faculty</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Detailed analytics on student performance</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/parent</code></td>
                      <td className="py-2.5 pr-4">Parent</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Parent overview showing child's progress</td>
                    </tr>
                    <tr className="border-b border-slate-900/60">
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/parent/reports</code></td>
                      <td className="py-2.5 pr-4">Parent</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Detailed progress reports for parents</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4"><code className="text-purple-400">/admin</code></td>
                      <td className="py-2.5 pr-4">Super Admin</td>
                      <td className="py-2.5 pr-4"><span className="text-yellow-400">Protected</span></td>
                      <td className="py-2.5">Admin dashboard with school management, stats &amp; school registration</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Section: Games */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('games')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold font-display text-white">Games &amp; Curriculum</h2>
            </div>
            {expandedSection === 'games' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {expandedSection === 'games' && (
            <div className="px-6 pb-6 space-y-6 text-sm">
              {/* Game 1 */}
              <div className="bg-slate-900/60 rounded-xl p-5 border border-purple-500/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-900/30 rounded-xl shrink-0">
                    <Trophy className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white font-display">Problem Hunt Detective</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Part 1 of the entrepreneurship curriculum (Chapters 1-6). Students step into 3D environments —
                      Greenfield School and Rajpur Market — searching for clues, interviewing NPCs, and identifying
                      real-world problems to turn into business opportunities.
                    </p>
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 font-semibold uppercase mt-2">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 3 Chapters</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" /> 10 Levels each</span>
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Exploration &amp; Quiz</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game 2 */}
              <div className="bg-slate-900/60 rounded-xl p-5 border border-blue-500/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-900/30 rounded-xl shrink-0">
                    <Building className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white font-display">Startup Simulator</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Part 2 of the curriculum (Chapters 7-10). Students build a brand, hire a team with complementary
                      skills, experiment with pricing models, run weekly business rounds, and pitch their startup
                      to a virtual Shark Tank panel.
                    </p>
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 font-semibold uppercase mt-2">
                      <span className="flex items-center gap-1"><Building className="h-3 w-3" /> 4 Chapters</span>
                      <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> 8 Levels each</span>
                      <span className="flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Simulation &amp; Mini-games</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Demo Credentials */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('credentials')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-yellow-400" />
              <h2 className="text-lg font-bold font-display text-white">Demo Accounts</h2>
            </div>
            {expandedSection === 'credentials' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {expandedSection === 'credentials' && (
            <div className="px-6 pb-6 space-y-3 text-sm">
              <p className="text-slate-400 text-xs">
                Pre-seeded accounts for exploring the platform. All passwords use <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">User@123</code> except admin.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border border-purple-500/20 bg-purple-950/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-semibold text-white text-xs">Student</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">aryan@student.com</p>
                  <p className="text-[11px] text-slate-500 font-mono">User@123</p>
                  <button
                    onClick={() => handleDemoLogin('student')}
                    disabled={loggingIn !== null}
                    className="mt-3 text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                  >
                    <Play className="h-3 w-3 fill-current" /> Login as Aryan
                  </button>
                </div>
                <div className="border border-blue-500/20 bg-blue-950/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-semibold text-white text-xs">Faculty</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">sharma@dps.in</p>
                  <p className="text-[11px] text-slate-500 font-mono">User@123</p>
                  <button
                    onClick={() => handleDemoLogin('faculty')}
                    disabled={loggingIn !== null}
                    className="mt-3 text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <LogIn className="h-3 w-3" /> Login as Ms. Sharma
                  </button>
                </div>
                <div className="border border-red-500/20 bg-red-950/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-semibold text-white text-xs">Admin</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">admin@campusedge.in</p>
                  <p className="text-[11px] text-slate-500 font-mono">Admin@123</p>
                  <button
                    onClick={() => handleDemoLogin('admin')}
                    disabled={loggingIn !== null}
                    className="mt-3 text-[11px] text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                  >
                    <ShieldAlert className="h-3 w-3" /> Login as Rajiv
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Tech Stack */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('techstack')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-green-400" />
              <h2 className="text-lg font-bold font-display text-white">Technology Stack</h2>
            </div>
            {expandedSection === 'techstack' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {expandedSection === 'techstack' && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                  <h4 className="font-semibold text-white text-xs mb-3 uppercase tracking-wider">Frontend</h4>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> React 18 with TypeScript</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Vite bundler</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Tailwind CSS with custom glassmorphism</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Zustand for state management</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> React Router v6 with role-based guards</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Three.js / React Three Fiber (3D scenes)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Axios with JWT interceptors</li>
                  </ul>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                  <h4 className="font-semibold text-white text-xs mb-3 uppercase tracking-wider">Backend</h4>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Node.js with Express</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Prisma ORM + SQLite (dev)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> JWT authentication with bcrypt</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Zod validation schemas</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Monorepo with npm workspaces</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Shared types package (@campusedge/shared)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500" /> Rate limiting &amp; error handling middleware</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: API Endpoints */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('api')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-orange-400" />
              <h2 className="text-lg font-bold font-display text-white">API Endpoints</h2>
            </div>
            {expandedSection === 'api' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {expandedSection === 'api' && (
            <div className="px-6 pb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                      <th className="pb-3 pr-4">Endpoint</th>
                      <th className="pb-3 pr-4">Method</th>
                      <th className="pb-3 pr-4">Auth</th>
                      <th className="pb-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/auth/register</code></td><td className="py-2 pr-4 text-green-400 font-mono">POST</td><td className="py-2 pr-4">No</td><td className="py-2">Register new user</td></tr>
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/auth/login</code></td><td className="py-2 pr-4 text-green-400 font-mono">POST</td><td className="py-2 pr-4">No</td><td className="py-2">Login with email &amp; password</td></tr>
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/auth/me</code></td><td className="py-2 pr-4 text-blue-400 font-mono">GET</td><td className="py-2 pr-4">JWT</td><td className="py-2">Get current user profile</td></tr>
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/health</code></td><td className="py-2 pr-4 text-blue-400 font-mono">GET</td><td className="py-2 pr-4">No</td><td className="py-2">Health check</td></tr>
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/games/:slug/progress</code></td><td className="py-2 pr-4 text-blue-400 font-mono">GET</td><td className="py-2 pr-4">JWT</td><td className="py-2">Get game progress for student</td></tr>
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/faculty/classroom</code></td><td className="py-2 pr-4 text-blue-400 font-mono">GET</td><td className="py-2 pr-4">JWT</td><td className="py-2">Get faculty classroom &amp; students</td></tr>
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/faculty/classroom/analytics</code></td><td className="py-2 pr-4 text-blue-400 font-mono">GET</td><td className="py-2 pr-4">JWT</td><td className="py-2">Get AI learning insights</td></tr>
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/faculty/assignments</code></td><td className="py-2 pr-4 text-blue-400 font-mono">GET</td><td className="py-2 pr-4">JWT</td><td className="py-2">List assignments</td></tr>
                    <tr className="border-b border-slate-900/60"><td className="py-2 pr-4"><code>/api/v1/faculty/assignments</code></td><td className="py-2 pr-4 text-green-400 font-mono">POST</td><td className="py-2 pr-4">JWT</td><td className="py-2">Create assignment</td></tr>
                    <tr><td className="py-2 pr-4"><code>/api/v1/admin/stats</code></td><td className="py-2 pr-4 text-blue-400 font-mono">GET</td><td className="py-2 pr-4">JWT</td><td className="py-2">Get admin platform stats</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Section: Gamification System */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleSection('gamification')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <h2 className="text-lg font-bold font-display text-white">Gamification System</h2>
            </div>
            {expandedSection === 'gamification' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {expandedSection === 'gamification' && (
            <div className="px-6 pb-6 space-y-4 text-sm text-slate-300">
              <p className="text-xs">The platform uses a comprehensive gamification system to keep students engaged:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-start gap-3">
                  <Coins className="h-5 w-5 text-yellow-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white text-xs">Virtual Currency (Coins)</span>
                    <p className="text-[11px] text-slate-400 mt-1">Earned by completing levels, achievements, and assignments. Used as a performance metric.</p>
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-start gap-3">
                  <Star className="h-5 w-5 text-purple-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white text-xs">XP &amp; Levels</span>
                    <p className="text-[11px] text-slate-400 mt-1">Experience points from gameplay. Leveling up unlocks new content and achievements.</p>
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-orange-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white text-xs">Achievements</span>
                    <p className="text-[11px] text-slate-400 mt-1">10 unique badges across 4 rarities (Common, Rare, Epic, Legendary) with XP bonuses.</p>
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-start gap-3">
                  <Flame className="h-5 w-5 text-orange-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white text-xs">Streak Tracking</span>
                    <p className="text-[11px] text-slate-400 mt-1">Daily activity streaks encourage consistent engagement with the platform.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            <span className="font-bold text-white text-sm">CampusEdge</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Educational Entrepreneurship Platform · Built with React, Express, Prisma &amp; Three.js
          </p>
          <p className="text-[10px] text-slate-700 mt-1">
            This is a demo overview page. All protected routes require authentication via the demo login buttons above.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="/login" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">Login Page</a>
            <a href="/register" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">Register</a>
            <span className="text-[11px] text-slate-600">|</span>
            <span className="text-[11px] text-slate-500">Claude Crawlable Demo Sitemap v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

