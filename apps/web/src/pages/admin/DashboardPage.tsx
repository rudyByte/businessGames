import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { School, Users, ShieldAlert, Plus, MapPin } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New school form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [boardType, setBoardType] = useState('CBSE');
  const [isSuccess, setIsSuccess] = useState(false);

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
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-red-500/10 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <School className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Schools</span>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalSchools}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-red-500/10 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Students</span>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-red-500/10 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Faculty</span>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.totalFaculty}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-red-500/10 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Completed Runs</span>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.completions}</h3>
          </div>
        </div>
      </section>

      {/* Grid: School Listings and Create School */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schools Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="font-bold font-display text-white text-base">Registered Schools</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                  <th className="pb-3 pr-2">School Name</th>
                  <th className="pb-3 pr-2">Location</th>
                  <th className="pb-3 pr-2">Board</th>
                  <th className="pb-3 pr-2">Students</th>
                  <th className="pb-3">Faculty</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school: any) => (
                  <tr key={school.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-350 transition-colors">
                    <td className="py-3 pr-2 text-white font-medium">{school.name}</td>
                    <td className="py-3 pr-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {school.city}, {school.state}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-semibold text-red-400">{school.boardType}</td>
                    <td className="py-3 pr-2">{school._count.students}</td>
                    <td className="py-3">{school._count.faculty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add School Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="font-bold font-display text-white text-base text-red-400">Add New School</h3>

          {isSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-xs">
              School registered successfully!
            </div>
          )}

          <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">School Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-white outline-none focus:border-red-500"
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
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-white outline-none focus:border-red-500"
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
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-white outline-none focus:border-red-500"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Affiliation Board</label>
              <select
                className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-white outline-none focus:border-red-500"
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
              className="w-full bg-red-650 hover:bg-red-750 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-red-500/20"
            >
              <Plus className="h-4 w-4" /> Add School
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
