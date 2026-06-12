import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Components
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import ParentLayout from './layouts/ParentLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import StudentHomePage from './pages/student/HomePage';
import GamesPage from './pages/student/GamesPage';
import AchievementsPage from './pages/student/AchievementsPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import ProfilePage from './pages/student/ProfilePage';

import FacultyDashboardPage from './pages/faculty/DashboardPage';
import ParentOverviewPage from './pages/parent/OverviewPage';
import AdminDashboardPage from './pages/admin/DashboardPage';

// Game placeholders
import DetectiveGamePage from './components/game/detective/DetectiveGamePage';
import SimulatorGamePage from './components/game/simulator/SimulatorGamePage';

// Role Guard Component
interface ProtectedRouteProps {
  allowedRoles: ('STUDENT' | 'FACULTY' | 'PARENT' | 'SUPER_ADMIN')[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard
    if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty" replace />;
    if (user.role === 'PARENT') return <Navigate to="/parent" replace />;
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentHomePage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          {/* Game views are full-canvas and do not use the standard layout sidebar */}
          <Route path="/student/games/detective" element={<DetectiveGamePage />} />
          <Route path="/student/games/simulator" element={<SimulatorGamePage />} />
        </Route>

        {/* Faculty Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
          <Route path="/faculty" element={<FacultyLayout />}>
            <Route index element={<FacultyDashboardPage />} />
            <Route path="assignments" element={<FacultyDashboardPage />} />
            <Route path="analytics" element={<FacultyDashboardPage />} />
          </Route>
        </Route>

        {/* Parent Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<ParentOverviewPage />} />
            <Route path="reports" element={<ParentOverviewPage />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="schools" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* Root Fallback Redirect */}
        <Route
          path="*"
          element={
            token ? (
              <Navigate to="/student" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
