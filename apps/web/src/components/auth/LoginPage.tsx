// apps/web/src/components/auth/LoginPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

type Role = 'STUDENT' | 'FACULTY' | 'PARENT' | 'SUPER_ADMIN';
const ROLES: { id: Role; icon: string; label: string; color: string }[] = [
  { id: 'STUDENT',     icon: '🎮', label: 'Student',  color: '#FF6B35' },
  { id: 'FACULTY',     icon: '📚', label: 'Teacher',  color: '#4ECDC4' },
  { id: 'PARENT',      icon: '👨‍👩‍👧', label: 'Parent',   color: '#FFE66D' },
  { id: 'SUPER_ADMIN', icon: '👑', label: 'Admin',    color: '#8B5CF6' },
];

// Particle dots for background
function ParticleDot({ delay }: { delay: number }) {
  const startX = Math.random() * 100;
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full"
      style={{
        left: `${startX}%`,
        bottom: '-4px',
        background: ['#FF6B35', '#4ECDC4', '#FFE66D'][Math.floor(Math.random() * 3)],
        opacity: 0.35,
      }}
      animate={{ y: [0, -(window.innerHeight + 10)], opacity: [0, 0.4, 0] }}
      transition={{ duration: 12 + Math.random() * 8, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// City skyline SVG silhouette
function CitySkyline() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full"
      viewBox="0 0 1440 180"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0,180 L0,140 L60,140 L60,100 L90,100 L90,60 L110,60 L110,100 L140,100 L140,80 L180,80 L180,50 L220,50 L220,80 L260,80 L260,100 L300,100 L300,120 L340,120 L340,70 L380,70 L380,50 L410,50 L410,30 L430,30 L430,50 L460,50 L460,70 L500,70 L500,90 L540,90 L540,60 L570,60 L570,40 L600,40 L600,20 L625,20 L625,40 L650,40 L650,60 L680,60 L680,80 L720,80 L720,50 L760,50 L760,30 L790,30 L790,50 L820,50 L820,70 L850,70 L850,90 L880,90 L880,60 L910,60 L910,40 L940,40 L940,70 L980,70 L980,100 L1020,100 L1020,70 L1060,70 L1060,50 L1090,50 L1090,30 L1120,30 L1120,50 L1150,50 L1150,70 L1190,70 L1190,90 L1230,90 L1230,60 L1270,60 L1270,80 L1310,80 L1310,100 L1360,100 L1360,120 L1400,120 L1400,140 L1440,140 L1440,180 Z"
        fill="#0A0F2C"
        opacity="0.85"
      />
      {/* Window lights */}
      {[90, 110, 180, 220, 410, 430, 600, 625, 790, 1060, 1090, 1120].map((x, i) => (
        <rect
          key={i}
          x={x + 5}
          y={i % 2 === 0 ? 38 : 55}
          width="8"
          height="7"
          fill="#FFE66D"
          opacity={0.4 + Math.random() * 0.4}
        />
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const particles = useRef(Array.from({ length: 40 }, (_, i) => i * 0.5));

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Demo quick-login fill
  const fillDemo = (role: Role) => {
    const demos: Record<Role, { email: string; password: string }> = {
      STUDENT:     { email: 'aryan@student.com',       password: 'User@123' },
      FACULTY:     { email: 'sharma@dps.in',           password: 'User@123' },
      PARENT:      { email: 'parent.goel@parent.com',  password: 'User@123' },
      SUPER_ADMIN: { email: 'admin@campusedge.in',     password: 'Admin@123' },
    };
    setValue('email', demos[role].email);
    setValue('password', demos[role].password);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      await login({ email: data.email, passwordHash: data.password });
      setLoginSuccess(true);
      setTimeout(() => {
        const role = useAuthStore.getState().user?.role;
        if (role === 'STUDENT') navigate('/student');
        else if (role === 'FACULTY') navigate('/faculty');
        else if (role === 'PARENT') navigate('/parent');
        else if (role === 'SUPER_ADMIN') navigate('/admin');
      }, 600);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 60%, #0D1B3E 100%)' }}
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.current.map((d, i) => (
          <ParticleDot key={i} delay={d} />
        ))}
      </div>

      {/* City skyline */}
      <CitySkyline />

      {/* Main card */}
      <motion.div
        className="card-glass relative z-10 w-full max-w-md mx-4 p-8"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="text-5xl mb-2 animate-float inline-block">🚀</div>
          <h1
            className="text-3xl font-game text-gradient-hero leading-tight"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            BUILD YOUR EMPIRE
          </h1>
          <p className="text-sm mt-1" style={{ color: '#A8B2D8', fontFamily: "'Nunito', sans-serif" }}>
            The only school subject where you can become a billionaire
          </p>
        </motion.div>

        {/* Role selector */}
        <motion.div
          className="grid grid-cols-4 gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {ROLES.map((role, i) => (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => { setSelectedRole(role.id); fillDemo(role.id); }}
              className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all duration-200"
              style={{
                background: selectedRole === role.id ? `rgba(${hexToRgb(role.color)}, 0.15)` : 'rgba(22,33,62,0.6)',
                borderColor: selectedRole === role.id ? role.color : 'rgba(78,205,196,0.1)',
                boxShadow: selectedRole === role.id ? `0 0 16px rgba(${hexToRgb(role.color)}, 0.3)` : 'none',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">{role.icon}</span>
              <span
                className="text-xs font-game"
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: selectedRole === role.id ? role.color : '#6B7A9B',
                }}
              >
                {role.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📧</span>
              <input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 font-body"
                style={{
                  background: '#16213E',
                  border: errors.email ? '2px solid #EF476F' : '2px solid rgba(78,205,196,0.2)',
                  fontFamily: "'Nunito', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4ECDC4')}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? '#EF476F' : 'rgba(78,205,196,0.2)')}
              />
            </div>
            {errors.email && (
              <p className="text-xs mt-1 pl-1" style={{ color: '#EF476F', fontFamily: "'Nunito', sans-serif" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔒</span>
              <input
                {...register('password')}
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200"
                style={{
                  background: '#16213E',
                  border: errors.password ? '2px solid #EF476F' : '2px solid rgba(78,205,196,0.2)',
                  fontFamily: "'Nunito', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4ECDC4')}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.password ? '#EF476F' : 'rgba(78,205,196,0.2)')}
              />
            </div>
            {errors.password && (
              <p className="text-xs mt-1 pl-1" style={{ color: '#EF476F', fontFamily: "'Nunito', sans-serif" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="px-4 py-3 rounded-xl text-sm text-center"
                style={{ background: 'rgba(239,71,111,0.15)', border: '1px solid rgba(239,71,111,0.4)', color: '#EF476F', fontFamily: "'Nunito', sans-serif" }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || loginSuccess}
            className="btn-game btn-primary btn-shine w-full text-lg flex items-center justify-center gap-2"
            whileTap={loading ? {} : { scale: 0.98 }}
            whileHover={loading ? {} : { scale: 1.02 }}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </>
            ) : loginSuccess ? (
              <>✅ Let's Go!</>
            ) : (
              <>🚀 Let's Build!</>
            )}
          </motion.button>
        </form>

        {/* Footer links */}
        <div className="flex justify-between items-center mt-5 text-xs" style={{ color: '#6B7A9B', fontFamily: "'Nunito', sans-serif" }}>
          <Link to="/register" className="hover:text-teal-400 transition-colors">
            New student? Register →
          </Link>
          <span className="opacity-50">CampusEdge Launchpad v2</span>
        </div>
      </motion.div>

      {/* Success flash overlay */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none"
            style={{ background: 'rgba(6, 214, 160, 0.12)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
