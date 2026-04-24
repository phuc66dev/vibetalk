import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

/**
 * ProtectedRoute – bảo vệ các route yêu cầu đăng nhập.
 * Nếu chưa auth → redirect về /login.
 */
function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate replace to="/login" />;
}

export default ProtectedRoute;
