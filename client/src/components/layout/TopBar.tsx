import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Icons } from "@/utils/icon";

type TopBarProps = {
  backTo?: string;
  chatMode?: boolean;
  onOpenReport: () => void;
  onSkip?: () => void;
  statusLabel?: string;
  title?: string;
};

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/chat": "Live Chat",
  "/chat/disconnected": "Disconnected",
  "/profile": "Profile",
  "/profile/edit": "Edit Profile",
  "/settings": "Settings",
};

const navigationItems = [
  {
    description: "Back to the lobby",
    icon: <Icons.FaHome className="h-5 w-5" />,
    label: "Home",
    to: "/",
  },
  {
    description: "Your public identity",
    icon: <Icons.FaRegUser className="h-4 w-4" />,
    label: "Profile",
    to: "/profile",
  },
  {
    description: "Privacy and preferences",
    icon: <Icons.IoMdSettings className="h-5 w-5" />,
    label: "Settings",
    to: "/settings",
  },
];

function TopBar({
  backTo,
  chatMode = false,
  onOpenReport,
  onSkip,
  statusLabel = "Connected",
  title = "Vibetalk",
}: TopBarProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const resolvedTitle =
    title === "Vibetalk" ? (routeTitles[location.pathname] ?? title) : title;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-4">
        <div className="mx-auto flex w-full max-w-[70rem] items-center gap-3 rounded-[1.75rem] border border-white/8 bg-[linear-gradient(135deg,rgba(27,27,31,0.92),rgba(19,19,23,0.82))] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.26)] backdrop-blur-[24px] sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {backTo ? (
              <Link
                className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] border border-white/8 bg-surface-highest/18 text-text-muted transition-all duration-160 hover:-translate-y-[1px] hover:text-text active:scale-[0.98]"
                to={backTo}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
            ) : null}
            <div className="flex min-w-0 items-center gap-3">
              <Link
                className="inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/8 bg-[linear-gradient(145deg,rgba(221,184,255,0.16),rgba(127,44,203,0.2))] p-1.5 shadow-soft"
                to="/"
              >
                <img
                  src="/logo.png"
                  alt="Vibetalk"
                  className="h-full w-full object-contain drop-shadow-sm"
                />
              </Link>
              <div className="min-w-0">
                <span className="block text-[0.68rem] font-bold uppercase tracking-[0.22em] text-text-muted">
                  Vibetalk
                </span>
                <h2 className="truncate text-[1rem] font-extrabold tracking-[-0.03em] text-text sm:text-[1.15rem]">
                  {resolvedTitle}
                </h2>
              </div>
            </div>
          </div>

          {!chatMode ? (
            <nav
              className="hidden items-center gap-2 rounded-full border border-white/6 bg-surface-low/72 p-1 lg:flex"
              aria-label="Primary"
            >
              {navigationItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    `inline-flex min-h-[2.85rem] items-center justify-center gap-[0.45rem] rounded-full px-4 py-3 text-[0.9rem] font-bold transition-all duration-160 hover:-translate-y-[1px] hover:text-text ${
                      isActive
                        ? "bg-gradient-to-br from-primary/24 to-primary-strong/84 text-text shadow-[0_10px_24px_rgba(127,44,203,0.2)]"
                        : "text-text-muted"
                    }`
                  }
                  end={item.to === "/"}
                  key={item.to}
                  to={item.to}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            {chatMode ? (
              <div className="inline-flex min-h-[2rem] items-center gap-[0.55rem] rounded-full bg-surface-high/88 px-[0.7rem] py-[0.35rem] text-[0.72rem] text-text-muted">
                <span className="h-[0.55rem] w-[0.55rem] rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
                <span>{statusLabel}</span>
              </div>
            ) : null}
            {chatMode ? (
              <button
                className="inline-flex items-center justify-center gap-2 rounded-[0.95rem] bg-danger/12 px-4 py-[0.7rem] font-extrabold text-[#fecaca] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
                onClick={onSkip}
                type="button"
              >
                Skip
              </button>
            ) : null}
            {chatMode ? (
              <button
                className="inline-grid h-11 w-11 place-items-center rounded-[1rem] border border-white/8 bg-surface-highest/18 text-text-muted transition-all duration-160 hover:-translate-y-[1px] hover:text-text active:scale-[0.98]"
                onClick={onOpenReport}
                type="button"
              >
                <Icons.MdOutlineReport className="h-6 w-6" />
              </button>
            ) : null}
            {!chatMode ? (
              <button
                aria-expanded={menuOpen}
                aria-label="Open navigation menu"
                className="inline-grid h-11 w-11 place-items-center rounded-[1rem] border border-white/8 bg-surface-highest/18 text-text-muted transition-all duration-160 hover:-translate-y-[1px] hover:text-text active:scale-[0.98] lg:hidden"
                onClick={() => setMenuOpen((current) => !current)}
                type="button"
              >
                <span className="material-symbols-outlined">
                  {menuOpen ? "close" : "menu"}
                </span>
              </button>
            ) : null}
            {!chatMode ? (
              <button
                className="hidden h-11 items-center justify-center gap-2 rounded-[0.95rem] border border-white/8 bg-surface-highest/18 px-4 font-extrabold text-text-muted transition-all duration-160 hover:-translate-y-px hover:text-text active:scale-[0.98] lg:inline-flex"
                onClick={onOpenReport}
                type="button"
              >
                <Icons.MdOutlineReport className="h-5 w-5" />
                <span>Report</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {!chatMode && menuOpen ? (
        <>
          <button
            aria-label="Close navigation menu"
            className="fixed inset-0 z-20 bg-[rgba(7,7,10,0.68)] backdrop-blur-[2px] lg:hidden"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <div className="fixed right-3 top-[5.85rem] z-30 w-[min(calc(100vw-1.5rem),22rem)] rounded-[1.75rem] border border-white/8 bg-[linear-gradient(160deg,rgba(27,27,31,0.96),rgba(14,14,18,0.95))] p-3 shadow-[0_24px_48px_rgba(0,0,0,0.36)] backdrop-blur-[28px] lg:hidden">
            <div className="mb-3 flex items-center justify-between rounded-[1.3rem] border border-white/6 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-text-muted">
                  Quick Menu
                </p>
                <h3 className="text-[1rem] font-extrabold tracking-[-0.03em] text-text">
                  Navigate fast
                </h3>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-white/[0.04] text-text-muted">
                <Icons.MdOutlineWidgets size={20} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-[1.25rem] border px-4 py-3 transition-all duration-160 ${
                      isActive
                        ? "border-primary/22 bg-gradient-to-r from-primary/16 to-primary-strong/18 text-text"
                        : "border-white/5 bg-white/[0.02] text-text-muted hover:border-white/10 hover:bg-white/[0.04] hover:text-text"
                    }`
                  }
                  end={item.to === "/"}
                  key={item.to}
                  to={item.to}
                >
                  <span className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] bg-surface-highest/34">
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.95rem] font-extrabold text-inherit">
                      {item.label}
                    </span>
                    <span className="block truncate text-[0.78rem] text-text-muted">
                      {item.description}
                    </span>
                  </span>
                </NavLink>
              ))}

              <button
                className="flex items-center gap-3 rounded-[1.25rem] border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-text-muted transition-all duration-160 hover:border-white/10 hover:bg-white/[0.04] hover:text-text"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenReport();
                }}
                type="button"
              >
                <span className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] bg-[rgba(239,68,68,0.08)] text-[#fecaca]">
                  <Icons.MdOutlineReport className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[0.95rem] font-extrabold text-inherit">
                    Report
                  </span>
                  <span className="block text-[0.78rem] text-text-muted">
                    Send feedback about abuse
                  </span>
                </span>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export default TopBar;
