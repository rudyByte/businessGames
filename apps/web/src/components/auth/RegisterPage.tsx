import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { ArrowRight, User as UserIcon, Mail, Lock, Phone, Rocket, Sparkles } from 'lucide-react';

interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  boardType: string;
  classrooms: {
    id: string;
    name: string;
    grade: number;
    section: string | null;
    _count: { students: number };
  }[];
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const authError = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'PARENT'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [childRollNumber, setChildRollNumber] = useState('');

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Fetch schools on mount
  useEffect(() => {
    async function fetchSchools() {
      try {
        const res = await api.get('/schools');
        const data: School[] = res.data.data;
        setSchools(data);
        if (data.length > 0) {
          setSelectedSchoolId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load schools:', err);
        setError('Could not load schools. Please try again later.');
      } finally {
        setIsLoadingSchools(false);
      }
    }
    fetchSchools();
  }, []);

  // Get classrooms for selected school
  const currentSchool = schools.find(s => s.id === selectedSchoolId);
  const classrooms = currentSchool?.classrooms || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !name) {
      setError('Please fill in all basic fields.');
      return;
    }

    if (role !== 'PARENT' && !selectedSchoolId) {
      setError('Please select a school.');
      return;
    }

    try {
      const payload: any = {
        email,
        password,
        role,
        name,
      };

      if (role === 'STUDENT') {
        payload.schoolId = selectedSchoolId;
        payload.rollNumber = rollNumber;
        payload.classroomId = selectedClassroomId || null;
      } else if (role === 'FACULTY') {
        payload.schoolId = selectedSchoolId;
      } else if (role === 'PARENT') {
        payload.phone = phone;
        payload.childRollNumber = childRollNumber;
        payload.schoolId = selectedSchoolId || undefined;
      }

      await register(payload);

      const user = useAuthStore.getState().user;
      if (user) {
        if (user.role === 'STUDENT') navigate('/student');
        else if (user.role === 'FACULTY') navigate('/faculty');
        else if (user.role === 'PARENT') navigate('/parent');
      }
    } catch (err) {
      // handled by store error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-gradient px-4 py-10 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-96 h-96 bg-game-teal/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" 
      />
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-game-orange/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" 
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
        className="max-w-md w-full game-card rounded-2xl p-7 relative z-10"
      >
        {/* Logo + Title */}
        <div className="text-center mb-7">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-game-teal to-game-teal-dark rounded-2xl mb-4 shadow-game-glow-teal"
          >
            <Rocket className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-game-round tracking-tight text-white text-glow-teal">Create Account</h1>
          <p className="font-game-body text-game-text-muted mt-1.5 text-xs">Start your entrepreneurial journey 🚀</p>
        </div>

        {/* Role Selector Tabs - Game Style */}
        <div className="grid grid-cols-3 gap-2 bg-game-deep/60 p-1.5 rounded-xl mb-6 border border-slate-700/40">
          {(['STUDENT', 'FACULTY', 'PARENT'] as const).map((r, idx) => (
            <motion.button
              key={r}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => { setRole(r); setError(null); }}
              className={`py-2.5 rounded-lg text-xs font-game-body font-bold transition-all ${
                role === r
                  ? 'bg-game-orange text-white shadow-game-glow'
                  : 'text-game-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {r === 'STUDENT' ? '🎓 ' : r === 'FACULTY' ? '👨‍🏫 ' : '👪 '}
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || authError) && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-game-danger/10 border border-game-danger/20 text-game-danger p-3 rounded-xl text-[11px] font-game-body"
            >
              ⚠️ {error || authError}
            </motion.div>
          )}

          <div className="relative group">
            <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-game-teal transition-colors" />
              <input
                type="text"
                required
                className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 pl-10 pr-3 text-xs font-game-body text-white outline-none transition-all"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-game-teal transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 pl-10 pr-3 text-xs font-game-body text-white outline-none transition-all"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="relative group">
            <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
              Password (min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-game-teal transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 pl-10 pr-3 text-xs font-game-body text-white outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* School selection for STUDENT and FACULTY */}
          {role !== 'PARENT' && (
            <div>
              <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
                Select School
              </label>
              {isLoadingSchools ? (
                <div className="w-full bg-game-deep/80 border border-slate-700/60 rounded-xl py-2.5 px-3 text-xs font-game-body text-game-text-muted">
                  Loading schools...
                </div>
              ) : (
                <select
                  className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 px-3 text-xs font-game-body text-white outline-none transition-all"
                  value={selectedSchoolId}
                  onChange={(e) => {
                    setSelectedSchoolId(e.target.value);
                    setSelectedClassroomId('');
                  }}
                >
                  <option value="">🏫 -- Select School --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city}, {s.state})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Classroom selection for STUDENT */}
          {role === 'STUDENT' && !isLoadingSchools && classrooms.length > 0 && (
            <div>
              <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
                Classroom (optional)
              </label>
              <select
                className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 px-3 text-xs font-game-body text-white outline-none transition-all"
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
              >
                <option value="">📚 -- Skip --</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Grade {c.grade}) — {c._count.students} students
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student: Roll Number */}
          {role === 'STUDENT' && (
            <div>
              <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
                Roll Number
              </label>
              <input
                type="text"
                required
                className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 px-3 text-xs font-game-body text-white outline-none transition-all"
                placeholder="🔢 Enter roll number (e.g. 01, 02)"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>
          )}

          {/* Parent-specific fields */}
          {role === 'PARENT' && (
            <>
              <div className="relative group">
                <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-game-teal transition-colors" />
                  <input
                    type="tel"
                    required
                    className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 pl-10 pr-3 text-xs font-game-body text-white outline-none transition-all"
                    placeholder="📞 +91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
                    Child's School
                  </label>
                  {isLoadingSchools ? (
                    <div className="w-full bg-game-deep/80 border border-slate-700/60 rounded-xl py-2.5 px-3 text-xs font-game-body text-game-text-muted">
                      Loading...
                    </div>
                  ) : (
                    <select
                      className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 px-3 text-xs font-game-body text-white outline-none transition-all"
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                    >
                      <option value="">🏫 -- Select --</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-game-body font-bold uppercase tracking-wider text-game-text-muted mb-1.5">
                    Child Roll Number
                  </label>
                  <input
                    type="text"
                    className="w-full bg-game-deep/80 border border-slate-700/60 focus:border-game-teal/50 rounded-xl py-2.5 px-3 text-xs font-game-body text-white outline-none transition-all"
                    placeholder="🔢 e.g. 01, 10"
                    value={childRollNumber}
                    onChange={(e) => setChildRollNumber(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <motion.button
            type="submit"
            disabled={isLoading || isLoadingSchools}
            className="w-full btn-game-primary text-sm py-3 rounded-xl"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🚀 Create Account
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </motion.button>
        </form>

        <div className="text-center mt-5">
          <p className="text-slate-500 text-[11px] font-game-body">
            Already have an account?{' '}
            <Link to="/login" className="text-game-orange hover:text-game-orange-dark font-bold transition-colors">
              Sign In 🎮
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
