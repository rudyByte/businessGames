import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Home, LineChart, MessageSquare, LogOut, Heart } from 'lucide-react';

export default function ParentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Overview', path: '/parent', icon: Home },
    { name: 'Reports', path: '/parent/reports', icon: LineChart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const parent = user?.parent || { name: 'Parent' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-slate-800/40 p-4 shrink-0 neumorph-inset">
        <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-bold text-white font-display text-sm shadow-lg shadow-green-500/20">
            CE
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-white block">CampusEdge</span>
            <span className="text-[10px] text-green-400 font-medium tracking-wider uppercase block">Parent Hub</span>
          </div>
        </div>

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
                    ? 'bg-green-500/15 text-green-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.03)]'
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen">
        <header className="bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/60 px-5 py-3 flex items-center justify-between z-20">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Parent Dashboard</span>
            <h2 className="text-base font-bold text-white tracking-tight">{parent.name}</h2>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500/8 border border-green-500/15 text-green-400 rounded-lg text-[11px] font-semibold">
            <Heart className="h-3.5 w-3.5 fill-green-400/20" />
            <span>Family First</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-ambient relative">
          {/* Glassmorphism-enhancing background orbs */}
          <div className="absolute top-20 -left-20 w-96 h-96 bg-orb-green rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-orb-purple rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-orb-amber rounded-full pointer-events-none" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
