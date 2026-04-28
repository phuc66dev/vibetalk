import ToggleRow from '../components/ui/ToggleRow';
import { useAppContext } from '../components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';

function SettingsPage() {
  const app = useAppContext();
  const { blockedUsers, settings, toggleSetting, unblockUser } = app;

  const logout = useAuthStore((state) => state.logout)


  return (
    <main className="relative z-[1] min-h-screen px-6 pb-[7.5rem] pt-[6rem] animate-[page-fade_320ms_ease-out]">
      <section className="mx-auto flex w-full max-w-[70rem] flex-col gap-6">
        <header className="flex flex-col gap-[0.35rem]">
          <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text">Settings</h2>
          <p className="text-text-muted">Manage your presence and privacy within the void.</p>
        </header>

        <section className="flex flex-col gap-4">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-text-muted">Preferences</p>
          <ToggleRow
            description="The default confessional aesthetic"
            icon="dark_mode"
            isActive={settings.darkMode}
            label="Dark Mode"
            onToggle={() => toggleSetting('darkMode')}
          />
          <ToggleRow
            description="Be alerted when a new confession begins"
            icon="notifications"
            isActive={settings.notifications}
            label="Notifications"
            onToggle={() => toggleSetting('notifications')}
          />
          <ToggleRow
            description="Hide your presence status from others"
            icon="lock"
            isActive={settings.privacyMode}
            label="Privacy Mode"
            onToggle={() => toggleSetting('privacyMode')}
          />
        </section>

        <section className="relative rounded-3xl border border-outline bg-[#1f1f23]/88 shadow-main p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 font-jakarta font-extrabold tracking-tight">Blocked Users</h3>
            <span className="inline-flex min-h-[2rem] items-center gap-[0.55rem] rounded-full bg-surface-high/88 px-[0.9rem] py-[0.45rem] text-[0.72rem] uppercase tracking-[0.16em] text-text-muted">
              {blockedUsers.length} Total
            </span>
          </div>

          <div className="flex flex-col">
            {blockedUsers.map((user) => (
              <div className="flex items-center justify-between gap-4 py-4 lg:px-[1.2rem]" key={user}>
                <div className="flex items-center gap-3">
                  <div className="grid h-[2.6rem] w-[2.6rem] place-items-center rounded-[0.9rem] bg-primary/14 text-primary">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <span className="text-text">{user}</span>
                </div>
                <button
                  className="cursor-pointer border-0 bg-transparent font-extrabold text-primary"
                  onClick={() => unblockUser(user)}
                  type="button"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex flex-col gap-4 rounded-3xl border border-outline bg-[#1f1f23]/88 p-6 shadow-main">
          <div>
            <h3 className="m-0 font-jakarta font-extrabold tracking-tight">Session</h3>
            <p className="text-text-muted mt-1">
              Authenticated session is managed by the backend via HttpOnly cookie.
            </p>
          </div>
          <code className="block overflow-x-auto rounded-2xl bg-surface-lowest p-[0.85rem] px-4 text-primary">
            Cookie session active on requests sent with credentials included.
          </code>
        </section>

        <div className="flex flex-col gap-4">
          <button
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
            onClick={logout}
            type="button"
          >
            Sign Out
          </button>
          <small className="text-center text-[0.72rem] uppercase tracking-[0.16em] text-text-muted/70">
            Vibetalk v1.0.42 - anonymity guaranteed
          </small>
        </div>
      </section>
    </main>
  );
}

export default SettingsPage;
