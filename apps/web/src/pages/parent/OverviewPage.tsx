import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Heart, Star, BookOpen, Clock, Award, Landmark } from 'lucide-react';

export default function ParentOverviewPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/parent/children');
        setChildren(res.data.data);
      } catch (err) {
        console.error('Failed to load parent dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      <section className="glass-panel p-6 rounded-2xl border border-green-500/10 bg-green-950/5">
        <h1 className="text-2xl font-bold font-display text-white">Family Learning Hub 🏡</h1>
        <p className="text-slate-400 text-xs mt-1">
          Monitor your children's progression as they learn business foundations and practice financial calculations.
        </p>
      </section>

      {children.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
          <p className="text-slate-400 text-sm">No registered children linked to your parent account.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {children.map((child) => (
            <div key={child.id} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center font-bold text-sm">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{child.name}</h3>
                    <p className="text-slate-400 text-xs">{child.school.name} | Class {child.classroom?.name || '7th Grade'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
                    <Star className="h-3.5 w-3.5 fill-green-400/20" />
                    <span>Level {child.level}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-semibold">
                    <Landmark className="h-3.5 w-3.5" />
                    <span>₹{child.coins} Coins</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Progress Card */}
                <div className="bg-slate-900/60 border border-slate-800/40 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Active Chapter</span>
                  </div>
                  <p className="text-sm font-semibold text-white">Chapter 2: Understanding Businesses</p>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <span className="text-[10px] text-slate-500 block">40% of first game completed</span>
                </div>

                {/* Last Active Card */}
                <div className="bg-slate-900/60 border border-slate-800/40 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Time Invested</span>
                  </div>
                  <p className="text-sm font-semibold text-white">4 Hours 30 Mins</p>
                  <span className="text-[10px] text-slate-500 block">
                    Last active: {child.lastActiveAt ? new Date(child.lastActiveAt).toLocaleDateString() : 'Yesterday'}
                  </span>
                </div>

                {/* Achievements Card */}
                <div className="bg-slate-900/60 border border-slate-800/40 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Award className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Achievements</span>
                  </div>
                  <p className="text-sm font-semibold text-white">2 Badges Unlocked</p>
                  <span className="text-[10px] text-slate-500 block">Awarded: Clue Hunter, First Steps</span>
                </div>
              </div>

              {/* Parents Context */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300 block mb-1">What is {child.name} learning?</span>
                Currently practicing observation and problem evaluation. This helps them learn to look around, spot problems, and judge if a solution can form a viable entrepreneurship idea.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
