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
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center font-bold text-white font-display text-lg">
            CE
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-white block">CampusEdge</span>
            <span className="text-[10px] text-green-400 font-medium tracking-wider uppercase block">Parent Hub</span>
          </div>
        </div>

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
                    ? 'bg-green-600/20 text-green-400 border border-green-500/20'
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen">
        <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between z-20">
          <div>
            <span className="text-xs text-slate-400">Parent Dashboard</span>
            <h2 className="text-lg font-bold text-white tracking-tight">{parent.name}</h2>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-semibold">
            <Heart className="h-4 w-4 fill-green-400/20" />
            <span>Family First</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
