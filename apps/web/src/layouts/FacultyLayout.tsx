import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Home, LineChart, BookOpen, Settings, LogOut, Users, Bell } from 'lucide-react';

export default function FacultyLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', path: '/faculty', icon: Home },
    { name: 'Assignments', path: '/faculty/assignments', icon: BookOpen },
    { name: 'Analytics', path: '/faculty/analytics', icon: LineChart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const faculty = user?.faculty || { name: 'Teacher' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white font-display text-lg">
            CE
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-white block">CampusEdge</span>
            <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase block">Faculty portal</span>
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
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
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
            <span className="text-xs text-slate-400">Class Instructor</span>
            <h2 className="text-lg font-bold text-white tracking-tight">{faculty.name}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center font-bold text-blue-400 text-xs">
              {faculty.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
