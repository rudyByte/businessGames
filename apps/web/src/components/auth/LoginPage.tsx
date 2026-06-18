import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldAlert, BookOpen, Gamepad2, Sparkles, ExternalLink, Heart, Rocket } from 'lucide-react';

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
      bg: 'btn-game-secondary',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    blue: {
      bg: 'btn-game-ghost !border-blue-500/20 !text-blue-400',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    red: {
      bg: 'btn-game-danger',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    green: {
      bg: 'btn-game-ghost !border-green-500/20 !text-green-400',
      border: 'border-green-500/30',
      text: 'text-green-400',
      badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-gradient px-4 py-10 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-96 h-96 bg-game-orange/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" 
      />
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-game-teal/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" 
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/3 left-1/4 w-48 h-48 border border-game-yellow/5 rounded-full"
      />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-sm w-full game-card rounded-2xl p-7 relative z-10"
      >
        {/* Logo + Title */}
        <div className="text-center mb-7">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-game-orange to-game-orange-dark rounded-2xl mb-4 shadow-game-glow"
          >
            <Rocket className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-game-round tracking-tight text-white text-glow">CampusEdge</h1>
          <p className="font-game-body text-game-text-muted mt-1.5 text-xs">Learn Business. Build Empires. One Quest at a Time.</p>
        </div>

        {/* Error display */}
        {(error || authError) && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 bg-game-danger/10 border border-game-danger/20 text-game-danger p-3 rounded-xl text-[11px] font-game-body"
          >
            ⚠️ {error || authError}
          </motion.div>
        )}

        {/* Demo Quick Login Buttons */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="h-3 w-3 text-game-yellow" />
            <span className="text-[9px] font-game-body font-bold uppercase tracking-widest text-game-text-muted">Quick Demo Access</span>
          </div>

          {DEMO_ACCOUNTS.map((account, idx) => {
            const Icon = account.icon;
            const colors = colorClasses[account.color];
            const loading = demoLoading === account.role;

            return (
              <motion.button
                key={account.role}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={() => handleDemoLogin(account)}
                disabled={demoLoading !== null}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-xs font-game-body font-bold transition-all ${colors.bg} disabled:opacity-60 disabled:cursor-not-allowed`}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`p-1.5 rounded-lg ${colors.badge}`}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className="text-xs font-bold">{account.label}</span>
                  <p className="text-[9px] text-white/50 font-normal">{account.description}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-white/30" />
              </motion.button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-game-dark px-3 text-[9px] text-slate-500 font-game-body font-bold uppercase tracking-wider">
              Or sign in manually
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-game-teal transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 pl-10 pr-3 text-xs font-game-body text-white outline-none transition-all group-focus-within:shadow-game-glow-teal"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-game-teal transition-colors" />
              <input
                type="password"
                required
                className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 pl-10 pr-3 text-xs font-game-body text-white outline-none transition-all group-focus-within:shadow-game-glow-teal"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full btn-game-primary text-sm py-3 rounded-xl"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🚀 Sign In
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </motion.button>
        </form>

        <div className="text-center mt-5">
          <p className="text-slate-500 text-[11px] font-game-body">
            Don't have an account?{' '}
            <Link to="/register" className="text-game-teal hover:text-game-teal-dark font-bold transition-colors">
              Create an account 🎮
            </Link>
          </p>
        </div>

        <div className="mt-4 border-t border-slate-800/30 pt-4">
          <p className="text-center text-[9px] text-slate-600 font-game-body">
            <Link to="/demo" className="text-game-teal/60 hover:text-game-teal transition-colors">
              View demo overview & sitemap ↗
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
