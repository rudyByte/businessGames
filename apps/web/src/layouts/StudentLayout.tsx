import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  Home, Gamepad2, Trophy, BarChart3, User, LogOut, Coins, Star,
  Shield, Sparkles,
} from 'lucide-react';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isHomePage = location.pathname === '/student';

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
    coins: 0,
  };

  // On the home page, render full-screen without sidebar/header
  if (isHomePage) {
    return (
      <div className="min-h-screen bg-game-deep text-white">
        <main className="h-screen overflow-hidden">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-gradient text-white flex flex-col md:flex-row relative">
      {/* Background ambient pattern */}
      <div className="fixed inset-0 bg-ambient pointer-events-none" />
      <div className="fixed top-20 -left-20 w-96 h-96 bg-orb-orange rounded-full pointer-events-none" />
      <div className="fixed bottom-10 right-0 w-80 h-80 bg-orb-teal rounded-full pointer-events-none" />
      <div className="fixed top-1/2 left-1/3 w-64 h-64 bg-orb-purple rounded-full pointer-events-none" />

      {/* ─── Sidebar Rail - Desktop ─── */}
      <aside className="hidden md:flex sidebar-rail relative z-10 flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center w-full px-4 py-4 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-game flex items-center justify-center font-game-round font-bold text-white text-sm shadow-lg shadow-game-btn">
            CE
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`sidebar-rail-item rounded-lg ${isActive ? 'sidebar-rail-item-active' : ''}`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-game-teal' : 'text-slate-500'}`} />
                <span className="sidebar-label">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="w-full px-2 pb-4">
          <button
            onClick={handleLogout}
            className="sidebar-rail-item rounded-lg text-red-400/60 hover:text-red-400"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen pb-16 md:pb-0 relative z-10">
        {/* Top Header Bar */}
        <header className="bg-game-dark/70 backdrop-blur-xl border-b border-slate-700/30 px-5 py-3 flex items-center justify-between header-gradient">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-game flex items-center justify-center font-game-round font-bold text-white text-xs shadow-lg">
              CE
            </div>
            <span className="font-game-round font-bold text-sm text-white">Launchpad</span>
          </div>

          {/* Desktop breadcrumb */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-game-body font-bold text-slate-500 uppercase tracking-widest">
              Student Dashboard
            </span>
          </div>

          {/* Right side indicators */}
          <div className="flex items-center gap-3">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-game-yellow/8 border border-game-yellow/15 rounded-full">
              <Coins className="h-3.5 w-3.5 text-game-yellow" />
              <span className="text-xs font-game-score font-bold text-game-yellow">₹{student.coins}</span>
            </div>

            {/* Level + XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/8 border border-purple-500/15 rounded-full">
              <Star className="h-3.5 w-3.5 text-purple-400 fill-purple-400/20" />
              <span className="text-xs font-game-score font-bold text-purple-400">Lv.{student.level}</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-game flex items-center justify-center font-game-round font-bold text-white text-xs shadow-lg shadow-game-btn">
              {student.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 relative">
          <div className="relative z-10 student-game">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ─── Bottom Navigation - Mobile ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 tab-bar z-30">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`tab-item ${isActive ? 'tab-item-active' : 'tab-item-inactive'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-game-body font-bold uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
