import { Link } from 'react-router-dom';
import type { BottomNavKey } from '../../types';

type BottomNavProps = {
  active: BottomNavKey;
};

type BottomNavLinkProps = {
  active: boolean;
  icon: string;
  label: string;
  to: string;
};

function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 hidden px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-[767px]:block">
      <div className="mx-auto grid w-full max-w-[70rem] grid-cols-3 gap-[0.75rem] rounded-t-[1.7rem] border border-outline/12 bg-[#131317]/96 p-[0.85rem] shadow-[0_-12px_28px_rgba(127,44,203,0.1)]">
        <BottomNavLink active={active === 'home'} icon="home" label="Home" to="/" />
        <BottomNavLink active={active === 'profile'} icon="person" label="Profile" to="/profile" />
        <BottomNavLink active={active === 'settings'} icon="settings" label="Settings" to="/settings" />
      </div>
    </nav>
  );
}

function BottomNavLink({ active, icon, label, to }: BottomNavLinkProps) {
  return (
    <Link
      className={`flex min-h-auto flex-col items-center justify-center gap-[0.25rem] rounded-2xl border border-transparent px-5 py-[0.7rem] font-extrabold transition-all duration-160 active:scale-[0.98] hover:-translate-y-px ${
        active
          ? 'bg-gradient-to-br from-primary/28 to-primary-strong/92 text-text'
          : 'text-text-muted'
      }`}
      to={to}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default BottomNav;
