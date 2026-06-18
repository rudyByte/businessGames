import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldAlert, BookOpen, Gamepad2, Sparkles, ExternalLink, Heart } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'STUDENT' as const,
    email: 'aryan@student.com',
    password: 'User@123',
    label: 'Student Demo',
    description: 'Play quests, earn XP, climb leaderboards',
    icon: Gamepad2,
    color: 'purple',
    redirect: '/student',
  },
  {
    role: 'FACULTY' as const,
    email: 'sharma@dps.in',
    password: 'User@123',
    label: 'Faculty Demo',
    description: 'Track progress, create assignments',
    icon: BookOpen,
    color: 'blue',
    redirect: '/faculty',
  },
  {
    role: 'SUPER_ADMIN' as const,
    email: 'admin@campusedge.in',
    password: 'Admin@123',
    label: 'Admin Demo',
    description: 'Manage schools, view platform stats',
    icon: ShieldAlert,
    color: 'red',
    redirect: '/admin',
  },
  {
    role: 'PARENT' as const,
    email: 'parent.goel@parent.com',
    password: 'User@123',
    label: 'Parent Demo',
    description: 'Monitor your child\'s learning progress',
    icon: Heart,
    color: 'green',
    redirect: '/parent',
  },
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const authError = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await login({ email, passwordHash: password });
      const user = useAuthStore.getState().user;
      if (user) {
        if (user.role === 'STUDENT') navigate('/student');
        else if (user.role === 'FACULTY') navigate('/faculty');
        else if (user.role === 'PARENT') navigate('/parent');
        else if (user.role === 'SUPER_ADMIN') navigate('/admin');
      }
    } catch (err) {
      // Handled by store
    }
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[number]) => {
    setDemoLoading(account.role);
    setError(null);

    try {
      await login({ email: account.email, passwordHash: account.password });
      const user = useAuthStore.getState().user;
      if (user) {
        navigate(account.redirect);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Demo login failed. Make sure the API server is running.');
    } finally {
      setDemoLoading(null);
    }
  };

  const colorClasses = {
    purple: {
      bg: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    blue: {
      bg: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    red: {
      bg: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    green: {
      bg: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
      border: 'border-green-500/30',
      text: 'text-green-400',
      badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-md w-full glass-panel-heavy rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-purple-600/20 text-purple-400 rounded-xl mb-4 border border-purple-500/20">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">CampusEdge</h1>
          <p className="text-slate-400 mt-2 text-sm">Learn Business. Build Empires. One Quest at a Time.</p>
        </div>

        {/* Error display */}
        {(error || authError) && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
            {error || authError}
          </div>
        )}

        {/* Demo Quick Login Buttons */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Quick Demo Access</span>
          </div>

          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            const colors = colorClasses[account.color];
            const isLoading = demoLoading === account.role;

            return (
              <button
                key={account.role}
                onClick={() => handleDemoLogin(account)}
                disabled={demoLoading !== null}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all ${colors.bg} ${colors.border} border disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] disabled:scale-100`}
              >
                <div className={`p-1.5 rounded-lg ${colors.badge}`}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className="text-xs font-semibold">{account.label}</span>
                  <p className="text-[10px] text-white/60">{account.description}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-white/40" />
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-950/80 px-3 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Or sign in manually
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-colors"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-purple-500/30"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-xs">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 border-t border-slate-900 pt-5">
          <p className="text-center text-[10px] text-slate-500">
            <Link to="/demo" className="text-purple-400 hover:underline">
              View demo overview & sitemap ↗
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
