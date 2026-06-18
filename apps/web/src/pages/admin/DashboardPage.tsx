import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { School, Users, ShieldAlert, Plus, MapPin, Trophy, BookOpen, Megaphone, QrCode } from 'lucide-react';
import InviteCodeManager from '../../components/announcements/InviteCodeManager';
import AnnouncementManager from '../../components/announcements/AnnouncementManager';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New school form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [boardType, setBoardType] = useState('CBSE');
  const [curriculumVersion, setCurriculumVersion] = useState('grade-7');
  const [isSuccess, setIsSuccess] = useState(false);

  // Selected school for invite code / announcement management
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, schoolsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/schools'),
        ]);

        setStats(statsRes.data.data);
        setSchools(schoolsRes.data.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);

    try {
      await api.post('/admin/schools', {
        name,
        city,
        state,
        boardType,
        curriculumVersion,
      });

      setIsSuccess(true);
      setName('');
      setCity('');
      setState('');

      // Reload schools list
      const schoolsRes = await api.get('/admin/schools');
      setSchools(schoolsRes.data.data);
    } catch (err) {
      console.error('Failed to create school:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="neumorph p-5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg">
            <School className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">Total Schools</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{stats.totalSchools}</h3>
          </div>
        </div>

        <div className="neumorph p-5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">Total Students</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="neumorph p-5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">Total Faculty</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{stats.totalFaculty}</h3>
          </div>
        </div>

        <div className="neumorph p-5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 text-green-400 rounded-lg">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">Completions</span>
            <h3 className="text-xl font-bold text-white mt-0.5">{stats.completions}</h3>
          </div>
        </div>
      </section>

      {/* Grid: School Listings and Create School */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schools Table */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-bold font-display text-white text-sm">Registered Schools</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-500 font-semibold">
                  <th className="pb-2.5 pr-2">School Name</th>
                  <th className="pb-2.5 pr-2">Location</th>
                  <th className="pb-2.5 pr-2">Board</th>
                  <th className="pb-2.5 pr-2">Students</th>
                  <th className="pb-2.5">Faculty</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school: any) => (
                  <tr key={school.id} className="border-b border-slate-900/60 hover:bg-white/[0.02] text-slate-300 transition-colors">
                    <td className="py-2.5 pr-2 text-white font-medium">{school.name}</td>
                    <td className="py-2.5 pr-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {school.city}, {school.state}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 font-semibold text-red-400">{school.boardType}</td>
                    <td className="py-2.5 pr-2">{school._count.students}</td>
                    <td className="py-2.5">{school._count.faculty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add School Form */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-bold font-display text-white text-sm text-red-400">Add New School</h3>

          {isSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-2.5 rounded-lg text-[11px]">
              School registered successfully!
            </div>
          )}

          <form onSubmit={handleCreateSchool} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">School Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500/50 transition-colors"
                placeholder="e.g. Kendriya Vidyalaya"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">City</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500/50 transition-colors"
                  placeholder="e.g. Pune"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">State</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500/50 transition-colors"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Curriculum Version</label>
              <select
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500/50 transition-colors"
                value={curriculumVersion}
                onChange={(e) => setCurriculumVersion(e.target.value)}
              >
                <option value="grade-7">Grade 7</option>
                <option value="grade-8">Grade 8</option>
                <option value="grade-9">Grade 9</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Affiliation Board</label>
              <select
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500/50 transition-colors"
                value={boardType}
                onChange={(e) => setBoardType(e.target.value)}
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all border border-red-500/20 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add School
            </button>
          </form>
        </div>
      </div>

      {/* Enterprise Management */}
      <section className="border-t border-slate-800/40 pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold font-display text-white text-sm flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-500 rounded-full" />
            Enterprise Management
          </h3>
        </div>

        {/* School Selector */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 mb-4">
          <label className="block text-[10px] text-slate-400 font-semibold mb-2 uppercase tracking-wider">
            Select School to Manage
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedSchoolId(null)}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                !selectedSchoolId
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              All (Global)
            </button>
            {schools.map((s: any) => (
              <button
                key={s.id}
                onClick={() => setSelectedSchoolId(s.id)}
                className={`text-xs px-3 py-2 rounded-lg border transition-all text-left ${
                  selectedSchoolId === s.id
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Announcements */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <AnnouncementManager
              schools={schools.map((s: any) => ({ id: s.id, name: s.name }))}
            />
          </div>

          {/* Invite Codes */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <h3 className="font-bold font-display text-white text-sm mb-4">Invite Management</h3>
            {selectedSchoolId ? (
              <InviteCodeManager
                school={{
                  id: selectedSchoolId,
                  name: schools.find((s: any) => s.id === selectedSchoolId)?.name || 'Selected School',
                }}
              />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <QrCode className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Select a school above to manage invite codes</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
