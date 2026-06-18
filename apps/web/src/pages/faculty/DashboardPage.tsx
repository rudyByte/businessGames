import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Users, BookOpen, Star, AlertCircle, FileSpreadsheet, Plus, CheckCircle2 } from 'lucide-react';
import FacultyAnnouncementComposer from '../../components/announcements/FacultyAnnouncementComposer';

export default function FacultyDashboardPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New assignment form state
  const [title, setTitle] = useState('');
  const [gameSlug, setGameSlug] = useState('problem-hunt');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [classroomId, setClassroomId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [classRes, analyticsRes, assignRes] = await Promise.all([
          api.get('/faculty/classroom'),
          api.get('/faculty/classroom/analytics'),
          api.get('/faculty/assignments'),
        ]);

        setClassrooms(classRes.data.data);
        setAnalytics(analyticsRes.data.data);
        setAssignments(assignRes.data.data);
        
        if (classRes.data.data.length > 0) {
          setClassroomId(classRes.data.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load faculty portal data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);

    try {
      await api.post('/faculty/assignments', {
        classroomId,
        title,
        gameSlug,
        chapterNumber: Number(chapterNumber),
        description: `Complete Chapter ${chapterNumber} of the game.`
      });

      setIsSuccess(true);
      setTitle('');
      
      // Reload assignments
      const assignRes = await api.get('/faculty/assignments');
      setAssignments(assignRes.data.data);
    } catch (err) {
      console.error('Failed to create assignment:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Aggregate stats
  const activeStudents = classrooms.reduce((sum, cl) => sum + cl.students.length, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Top Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="neumorph p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Students Enrolled</span>
            <h3 className="text-2xl font-bold text-white mt-1">{activeStudents}</h3>
          </div>
        </div>

        <div className="neumorph p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Today</span>
            <h3 className="text-2xl font-bold text-white mt-1">
              {classrooms.reduce((sum, cl) => sum + cl.students.filter((s: any) => s.lastActiveAt).length, 0)}
            </h3>
          </div>
        </div>

        <div className="neumorph p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Avg Class Level</span>
            <h3 className="text-2xl font-bold text-white mt-1">2.3</h3>
          </div>
        </div>

        <div className="neumorph p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Assignments</span>
            <h3 className="text-2xl font-bold text-white mt-1">{assignments.length}</h3>
          </div>
        </div>
      </section>

      {/* Announcement Composer */}
      <section className="glass-panel p-6 rounded-2xl border border-slate-800">
        <FacultyAnnouncementComposer
          classrooms={classrooms}
          onCreated={() => {
            // Refresh announcements if needed
          }}
        />
      </section>

      {/* AI Learning Insights */}
      {analytics.aiInsight && (
        <section className="glass-panel p-6 rounded-2xl border border-blue-500/10 bg-blue-950/5 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Classroom Insights</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{analytics.aiInsight}</p>
          </div>
        </section>
      )}

      {/* Grid: Classroom table and Assignment creation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold font-display text-white text-base">Classroom Progress</h3>
            <button className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                  <th className="pb-3 pr-2">Roll</th>
                  <th className="pb-3 pr-2">Name</th>
                  <th className="pb-3 pr-2">Level</th>
                  <th className="pb-3 pr-2">XP</th>
                  <th className="pb-3 pr-2">Coins</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.flatMap(cl => cl.students).map((student: any) => (
                  <tr key={student.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-300 transition-colors">
                    <td className="py-3 pr-2 font-medium">{student.rollNumber || '-'}</td>
                    <td className="py-3 pr-2 text-white font-medium">{student.name}</td>
                    <td className="py-3 pr-2 font-semibold text-blue-400">Level {student.level}</td>
                    <td className="py-3 pr-2">{student.totalXP} XP</td>
                    <td className="py-3 pr-2 text-yellow-400 font-semibold">₹{student.coins}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        student.lastActiveAt ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {student.lastActiveAt ? 'On Track' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Assignment */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="font-bold font-display text-white text-base">New Assignment</h3>

          {isSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-xs">
              Assignment created successfully and students notified!
            </div>
          )}

          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Classroom</label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
              >
                {classrooms.map(cl => (
                  <option key={cl.id} value={cl.id}>{cl.name} ({cl.students.length} students)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Assignment Title</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-blue-500/50 transition-colors"
                placeholder="e.g. Complete Chapters 1 to 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Target Game</label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                value={gameSlug}
                onChange={(e) => setGameSlug(e.target.value)}
              >
                <option value="problem-hunt">Problem Hunt Detective</option>
                <option value="startup-simulator">Startup Simulator</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Complete Up To Chapter</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(Number(e.target.value))}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-blue-500/20"
            >
              <Plus className="h-4 w-4" /> Create Assignment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
