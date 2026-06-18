import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Home, School, Settings, LogOut, ShieldAlert, BarChart } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: Home },
    { name: 'Schools', path: '/admin/schools', icon: School },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const admin = user?.superAdmin || { name: 'Admin' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-slate-800/40 p-4 shrink-0 neumorph-inset">
        <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-white font-display text-sm shadow-lg shadow-red-500/20">
            CE
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-white block">CampusEdge</span>
            <span className="text-[10px] text-red-400 font-medium tracking-wider uppercase block">Global Admin</span>
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
                    ? 'bg-red-500/15 text-red-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.03)]'
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
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Platform Administrator</span>
            <h2 className="text-base font-bold text-white tracking-tight">{admin.name}</h2>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/8 border border-red-500/15 text-red-400 rounded-lg text-[11px] font-semibold">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Root Secure</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-ambient relative">
          {/* Glassmorphism-enhancing background orbs */}
          <div className="absolute top-20 -left-20 w-96 h-96 bg-orb-amber rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-orb-blue rounded-full pointer-events-none" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
