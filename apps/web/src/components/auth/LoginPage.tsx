import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { GraduationCap, Lock, Mail, Users, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const authError = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await login({ email, passwordHash: password });
      // Redirect based on role cached in localStorage or store
      const user = useAuthStore.getState().user;
      if (user) {
        if (user.role === 'STUDENT') navigate('/student');
        else if (user.role === 'FACULTY') navigate('/faculty');
        else if (user.role === 'PARENT') navigate('/parent');
        else if (user.role === 'SUPER_ADMIN') navigate('/admin');
      }
    } catch (err) {
      // Handled by store, but let's keep error local if needed
    }
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || authError) && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
              {error || authError}
            </div>
          )}

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

        <div className="mt-8 border-t border-slate-900 pt-6">
          <p className="text-center text-[10px] text-slate-500">
            Delhi Public School & Mumbai International School Demo Logins:<br />
            Student: <code className="text-slate-400">aryan@student.com</code> | Teacher: <code className="text-slate-400">sharma@dps.in</code> | Parent: <code className="text-slate-400">parent.goel@parent.com</code> | Admin: <code className="text-slate-400">admin@campusedge.in</code><br />
            Password: <code className="text-slate-400">User@123</code> (Admin: <code className="text-slate-400">Admin@123</code>)
          </p>
        </div>
      </div>
    </div>
  );
}
