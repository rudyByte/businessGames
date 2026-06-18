import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { Flame, Coins, Trophy, Play, Star, MapPin, Building, ArrowRight } from 'lucide-react';

export default function StudentHomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [detProgress, setDetProgress] = useState<any>(null);
  const [simProgress, setSimProgress] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const student = user?.student || {
    name: 'Student',
    level: 1,
    totalXP: 0,
    coins: 0,
    streak: 3
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [detRes, simRes, leadRes] = await Promise.all([
          api.get('/games/problem-hunt/progress'),
          api.get('/games/startup-simulator/progress'),
          // simple mocked response for leaderboard for demo simplicity
          Promise.resolve({
            data: {
              data: [
                { name: 'Aryan Goel', score: 1200, rank: 1 },
                { name: 'Priya Patel', score: 1050, rank: 2 },
                { name: 'Rahul Sen', score: 900, rank: 3 }
              ]
            }
          })
        ]);
        
        setDetProgress(detRes.data.data);
        setSimProgress(simRes.data.data);
        setLeaderboard(leadRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLaunchDetective = () => {
    navigate('/student/games/detective');
  };

  const handleLaunchSimulator = () => {
    navigate('/student/games/simulator');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Hero Section */}
      <section className="relative overflow-hidden glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-purple-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="space-y-2">
          <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Entrepreneur Launchpad</span>
          <h1 className="text-3xl font-bold font-display text-white">Namaste, {student.name}! 👋</h1>
          <p className="text-slate-400 text-sm max-w-md">
            Ready to explore your school and market to spot business ideas and build your financial empire?
          </p>
        </div>

        <div className="flex items-center gap-6 neumorph p-4 rounded-xl self-stretch md:self-auto justify-around">
          <div className="text-center px-4 border-r border-slate-800">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <Flame className="h-5 w-5 fill-orange-400/20" />
              <span className="font-bold text-xl">{student.streak || 3}</span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Day Streak</span>
          </div>

          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-1.5 text-yellow-400 mb-1">
              <Coins className="h-5 w-5" />
              <span className="font-bold text-xl">₹{student.coins}</span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Virtual Cash</span>
          </div>
        </div>
      </section>

      {/* Grid: Games & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Cards Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-wide font-display">Active Quests</h2>

          {/* Game 1: Problem Hunt Detective */}
          <div className="glass-panel hover:border-purple-500/20 transition-all rounded-2xl overflow-hidden flex flex-col md:flex-row border border-slate-800">
            <div className="md:w-48 bg-purple-900/20 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800 shrink-0">
              <Trophy className="h-12 w-12 text-purple-400 mb-2" />
              <span className="text-xs text-purple-400 font-bold uppercase tracking-wider text-center">Part 1</span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white font-display">Problem Hunt Detective</h3>
                <p className="text-slate-400 text-xs mt-2 line-clamp-2">
                  Chapter 1-6: Find clues in the Greenfield School and Rajpur Market. Interview shopkeepers and rank problems.
                </p>
                <div className="flex gap-4 mt-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Chapter {detProgress?.currentChapter || 1}/3
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {detProgress?.totalScore || 0} Score
                  </span>
                </div>
              </div>
              <button
                onClick={handleLaunchDetective}
                className="mt-6 self-start bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 border border-purple-500/20 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {detProgress?.status === 'COMPLETED' ? 'Replay Investigation' : 'Investigate Clues'}
              </button>
            </div>
          </div>

          {/* Game 2: Startup Simulator */}
          <div className="glass-panel hover:border-blue-500/20 transition-all rounded-2xl overflow-hidden flex flex-col md:flex-row border border-slate-800">
            <div className="md:w-48 bg-blue-900/20 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800 shrink-0">
              <Building className="h-12 w-12 text-blue-400 mb-2" />
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider text-center">Part 2</span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white font-display">Startup Simulator</h3>
                <p className="text-slate-400 text-xs mt-2 line-clamp-2">
                  Chapter 7-10: Choose a business model, hire your team, run price experiments, and present to Shark Tank!
                </p>
                <div className="flex gap-4 mt-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {simProgress?.simulatorSave?.startupName || 'Not Started'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    Chapter {simProgress?.currentChapter || 1}/4
                  </span>
                </div>
              </div>
              <button
                onClick={handleLaunchSimulator}
                disabled={detProgress?.status !== 'COMPLETED' && (!simProgress || simProgress.status === 'NOT_STARTED')}
                className="mt-6 self-start bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-800/40 text-white text-xs font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 border border-blue-500/20 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Launch Simulator
              </button>
            </div>
          </div>
        </div>

        {/* Side Panels (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Class Leaderboard Sneak Peek */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold font-display text-white text-sm">Class Leaderboard</h3>
              <button
                onClick={() => navigate('/student/leaderboard')}
                className="text-purple-400 hover:text-purple-300 text-xs font-medium flex items-center gap-0.5"
              >
                Full <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              {leaderboard.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 neumorph rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      idx === 1 ? 'bg-slate-500/20 text-slate-300' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {entry.rank}
                    </span>
                    <span className="text-xs text-slate-200 font-medium">{entry.name}</span>
                  </div>
                  <span className="text-xs text-purple-400 font-semibold">{entry.score} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Socratic Owl Quote */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 bg-purple-950/5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
            <div className="flex items-start gap-4">
              <div className="text-3xl">🦉</div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Prof. Vikash says:</span>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "Socho! A problem is just an opportunity wearing a mask. Find what makes people frustrated, and you will find your business idea!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
