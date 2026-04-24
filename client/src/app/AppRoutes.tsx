import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';
import DisconnectedPage from '../pages/DisconnectedPage';
import ProfilePage from '../pages/ProfilePage';
import EditProfilePage from '../pages/EditProfilePage';
import SettingsPage from '../pages/SettingsPage';
import Page404 from '../pages/404';
import { useAuthStore } from '../stores/authStore';

function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* ── Auth routes: không có TopBar / BottomNav ─────────────────── */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate replace to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate replace to="/" /> : <RegisterPage />}
        />
      </Route>

      {/* ── Protected routes: có TopBar + BottomNav ───────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/disconnected" element={<DisconnectedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ── Fallback ──────────────────────────────────────────────────── */}
      <Route
        path="*"
        element={<Page404 />}
      />
    </Routes>
  );
}

export default AppRoutes;
