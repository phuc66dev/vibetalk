import { Outlet } from 'react-router-dom';
import AuraBackdrop from '../ui/AuraBackdrop'
/**
 * AuthLayout – dùng cho /login và /register.
 * Không có TopBar, BottomNav, chỉ có backdrop + outlet.
 */
function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuraBackdrop />
      <Outlet />
    </div>
  );
}

export default AuthLayout;
