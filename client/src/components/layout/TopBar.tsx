import { Link, NavLink } from "react-router-dom";

type TopBarProps = {
  backTo?: string;
  chatMode?: boolean;
  onOpenReport: () => void;
  onSkip?: () => void;
  title?: string;
};

function TopBar({
  backTo,
  chatMode = false,
  onOpenReport,
  onSkip,
  title = "Vibetalk",
}: TopBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-10 bg-background/62 backdrop-blur-[20px]">
      <div className="mx-auto flex w-full max-w-[70rem] items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          {backTo ? (
            <Link
              className="inline-grid h-12 w-12 place-items-center rounded-full bg-surface-highest/28 text-text-muted transition-all duration-160 hover:-translate-y-[1px] active:scale-[0.98]"
              to={backTo}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
          ) : null}
          <div className="flex items-center gap-[0.9rem]">
            <Link
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-[#2c0051] shadow-soft"
              to="/"
            >
              <span className="material-symbols-outlined">masks</span>
            </Link>
            <div className="flex flex-col items-start gap-[0.2rem]">
              <span className="hidden text-[0.68rem] font-bold tracking-[0.18em] uppercase text-text-muted min-[768px]:inline">
                Vibetalk
              </span>
              <h2 className="text-base font-extrabold tracking-tight min-[768px]:text-[1.1rem]">
                {title}
              </h2>
            </div>
          </div>
        </div>

        <nav
          className="hidden items-center gap-[0.65rem] rounded-full border border-outline/12 bg-surface-low/72 p-[0.35rem] min-[768px]:flex"
          aria-label="Primary"
        >
          <NavLink
            className={({ isActive }) =>
              `inline-flex items-center justify-center gap-[0.45rem] min-h-[2.75rem] px-4 py-3 rounded-full text-[0.88rem] font-bold transition-all duration-160 hover:text-text hover:-translate-y-[1px] ${
                isActive
                  ? "bg-gradient-to-br from-primary/26 to-primary-strong/85 text-text"
                  : "text-text-muted"
              }`
            }
            to="/"
            end
          >
            <span className="material-symbols-outlined">home</span>
            <span>Home</span>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `inline-flex items-center justify-center gap-[0.45rem] min-h-[2.75rem] px-4 py-3 rounded-full text-[0.88rem] font-bold transition-all duration-160 hover:text-text hover:-translate-y-[1px] ${
                isActive
                  ? "bg-gradient-to-br from-primary/26 to-primary-strong/85 text-text"
                  : "text-text-muted"
              }`
            }
            to="/profile"
          >
            <span className="material-symbols-outlined">person</span>
            <span>Profile</span>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `inline-flex items-center justify-center gap-[0.45rem] min-h-[2.75rem] px-4 py-3 rounded-full text-[0.88rem] font-bold transition-all duration-160 hover:text-text hover:-translate-y-[1px] ${
                isActive
                  ? "bg-gradient-to-br from-primary/26 to-primary-strong/85 text-text"
                  : "text-text-muted"
              }`
            }
            to="/settings"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="flex items-center justify-end gap-3 md:gap-4">
          <div className="topbar__status">
            {chatMode ? (
              <div className="inline-flex min-h-[2rem] items-center gap-[0.55rem] rounded-full bg-surface-high/88 px-[0.7rem] py-[0.35rem] text-[0.72rem] text-text-muted">
                <span className="h-[0.55rem] w-[0.55rem] rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
                <span>Connected</span>
              </div>
            ) : null}
          </div>
          {chatMode ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-[0.8rem] bg-danger/12 px-4 py-[0.65rem] font-extrabold text-[#fecaca] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
              onClick={onSkip}
              type="button"
            >
              Skip
            </button>
          ) : null}
          <button
            className="inline-grid h-12 w-12 place-items-center rounded-full bg-surface-highest/28 text-text-muted transition-all duration-160 hover:-translate-y-[1px] active:scale-[0.98]"
            onClick={onOpenReport}
            type="button"
          >
            <span className="material-symbols-outlined">report</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
