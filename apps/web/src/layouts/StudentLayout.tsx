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
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white font-display text-lg">
            CE
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-white block">CampusEdge</span>
            <span className="text-[10px] text-purple-400 font-medium tracking-wider uppercase block">Launchpad</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-auto border border-transparent hover:border-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen pb-16 md:pb-0">
        {/* Top Header Bar */}
        <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between z-20">
          <div className="md:hidden flex items-center gap-2">
            <span className="font-bold font-display text-lg text-white">CE Launchpad</span>
          </div>

          <div className="hidden md:block">
            <span className="text-xs text-slate-400">Student Dashboard</span>
            <h2 className="text-lg font-bold text-white tracking-tight">{student.name}</h2>
          </div>

          {/* Gamification indicators */}
          <div className="flex items-center gap-4">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
              <Coins className="h-4 w-4" />
              <span>₹{student.coins}</span>
            </div>

            {/* Level & XP */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                <Star className="h-4 w-4 fill-purple-400/20" />
                <span>Level {student.level}</span>
              </div>
              <span className="hidden sm:inline text-xs text-slate-500">{student.totalXP} XP</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-purple-400 text-xs uppercase">
              {student.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-2 z-30">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center p-1.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
