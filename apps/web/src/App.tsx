import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Components
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

// Demo Page
import DemoPage from './pages/DemoPage';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import ParentLayout from './layouts/ParentLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages — eagerly loaded (always needed)
import StudentHomePage from './pages/student/HomePage';
import OnboardingPage from './pages/student/OnboardingPage';
import GamesPage from './pages/student/GamesPage';
import AchievementsPage from './pages/student/AchievementsPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import ProfilePage from './pages/student/ProfilePage';

import FacultyDashboardPage from './pages/faculty/DashboardPage';
import ParentOverviewPage from './pages/parent/OverviewPage';
import ParentSettingsPage from './pages/parent/SettingsPage';
import AdminDashboardPage from './pages/admin/DashboardPage';

// Game pages — lazily loaded (avoid loading 3D libraries on login)
import ToastContainer from './components/ui/ToastContainer';
import ComingSoon from './pages/ComingSoon';

const DetectiveGamePage = lazy(() => import('./components/game/detective/DetectiveGamePage'));
const SimulatorGamePage = lazy(() => import('./components/game/simulator/SimulatorGamePage'));

function GameSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

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
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connect socket.io after login
  useEffect(() => {
    if (token && user) {
      import('./lib/socketClient').then(({ connectSocket, joinClassroom, joinSchool }) => {
        const socket = connectSocket(token);

        // Join appropriate rooms based on role
        if (user.student?.classroomId) {
          joinClassroom(user.student.classroomId);
        }
        if (user.student?.schoolId) {
          joinSchool(user.student.schoolId);
        }
        if (user.faculty?.schoolId) {
          joinSchool(user.faculty.schoolId);
        }
      }).catch((err) => {
        console.warn('[App] Socket import failed (non-critical):', err);
      });
    }
  }, [token, user]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/demo" element={<DemoPage />} />

        {/* Student Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentHomePage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          {/* Onboarding — full screen, no sidebar */}
          <Route path="/student/onboarding" element={<OnboardingPage />} />
          {/* Game views are full-canvas and do not use the standard layout sidebar */}
          <Route path="/student/games/detective" element={
            <GameSuspense><DetectiveGamePage /></GameSuspense>
          } />
          <Route path="/student/games/simulator" element={
            <GameSuspense><SimulatorGamePage /></GameSuspense>
          } />
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
          <Route path="/parent/settings" element={<ParentLayout />}>
            <Route index element={<ParentSettingsPage />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="schools" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* 404 Fallback — show a proper page instead of blind redirect */}
        <Route path="/404" element={<ComingSoon title="Page Not Found" message="The page you're looking for doesn't exist or has been moved." backPath="/student" />} />
        <Route
          path="*"
          element={
            token ? (
              <Navigate to="/404" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
