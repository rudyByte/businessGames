import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Home, Gamepad2, Trophy, BarChart3, User, LogOut, Coins, Star } from 'lucide-react';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Home', path: '/student', icon: Home },
    { name: 'Games', path: '/student/games', icon: Gamepad2 },
    { name: 'Achievements', path: '/student/achievements', icon: Trophy },
    { name: 'Leaderboard', path: '/student/leaderboard', icon: BarChart3 },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const student = user?.student || {
    name: 'Student',
    level: 1,
    totalXP: 0,
    coins: 0
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-slate-800/40 p-4 shrink-0 neumorph-inset">
        <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center font-bold text-white font-display text-sm shadow-lg shadow-purple-500/20">
            CE
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-white block">CampusEdge</span>
            <span className="text-[10px] text-purple-400 font-medium tracking-wider uppercase block">Launchpad</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-500/15 text-purple-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.03)]'
                    : 'text-slate-400 hover:text-white neumorph-btn'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all mt-auto"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen pb-16 md:pb-0">
        {/* Top Header Bar */}
        <header className="bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/60 px-5 py-3 flex items-center justify-between z-20">
          <div className="md:hidden flex items-center gap-2">
            <span className="font-bold font-display text-lg text-white">CE Launchpad</span>
          </div>

          <div className="hidden md:block">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Student Dashboard</span>
            <h2 className="text-base font-bold text-white tracking-tight">{student.name}</h2>
          </div>

          {/* Gamification indicators */}
          <div className="flex items-center gap-3">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/8 border border-yellow-500/15 text-yellow-400 rounded-lg text-[11px] font-semibold">
              <Coins className="h-3.5 w-3.5" />
              <span>₹{student.coins}</span>
            </div>

            {/* Level & XP */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500/8 border border-purple-500/15 text-purple-400 rounded-lg text-[11px] font-semibold">
              <Star className="h-3.5 w-3.5 fill-purple-400/20" />
              <span>Lv.{student.level}</span>
            </div>

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-[11px] uppercase">
              {student.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-ambient relative">
          {/* Glassmorphism-enhancing background orbs */}
          <div className="absolute top-20 -left-20 w-96 h-96 bg-orb-purple rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-orb-blue rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orb-amber rounded-full pointer-events-none" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/60 flex justify-around py-2 z-30">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center px-2 py-1 text-[9px] font-medium transition-colors ${
                isActive ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
