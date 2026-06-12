import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { ArrowLeft, ArrowRight, User as UserIcon, Mail, Lock, Phone } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-md w-full glass-panel-heavy rounded-2xl p-8 relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/login" className="text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Back to Login</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">Join CampusEdge</h1>
          <p className="text-slate-400 mt-2 text-xs">Create your customized dashboard profile</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-1.5 rounded-xl mb-6 border border-slate-800">
          {(['STUDENT', 'FACULTY', 'PARENT'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                role === r
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || authError) && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
              {error || authError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                required
                className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-200 outline-none transition-colors"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-200 outline-none transition-colors"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password (min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-200 outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* School selection for STUDENT and FACULTY */}
          {role !== 'PARENT' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Select School
              </label>
              {isLoadingSchools ? (
                <div className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-500">
                  Loading schools...
                </div>
              ) : (
                <select
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none transition-colors"
                  value={selectedSchoolId}onChange={(e) => {
                  setSelectedSchoolId(e.target.value);
                  setSelectedClassroomId('');
                }}
                >
                <option value="">-- Select School --</option>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Classroom (optional)
              </label>
              <select
                className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none transition-colors"
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
              >
                <option value="">-- Skip --</option>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Roll Number
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none transition-colors"
                placeholder="Enter roll number (e.g. 01, 02)"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>
          )}

          {/* Parent-specific fields */}
          {role === 'PARENT' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-200 outline-none transition-colors"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Child's School
                  </label>
                  {isLoadingSchools ? (
                    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-500">
                      Loading...
                    </div>
                  ) : (
                    <select
                      className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none transition-colors"
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Child Roll Number
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none transition-colors"
                    placeholder="e.g. 01, 10"
                    value={childRollNumber}
                    onChange={(e) => setChildRollNumber(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading || isLoadingSchools}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-purple-500/30 mt-6"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
