import { useState } from "react";
import { Link } from "react-router-dom";
import Field from "../components/ui/Field";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

function LoginPage() {
  const navigate = useNavigate();
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const loginWithCredentials = useAuthStore(
    (state) => state.loginWithCredentials,
  );
  const status = useAuthStore((state) => state.status);
  const [email, setEmail] = useState("you@anonymous.com");
  const [password, setPassword] = useState("midnight-access");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loginWithCredentials({ email, password });
    navigate("/", { replace: true });
  }

  return (
    <main className="relative z-[1] flex min-h-screen items-center justify-center px-6 py-8">
      <section className="flex w-full max-w-[26rem] flex-col gap-[1.75rem] animate-[page-fade_320ms_ease-out]">
        <div className="flex flex-col items-center gap-[0.75rem] text-center">
          <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-[#2c0051] shadow-soft">
            <span className="text-[2rem] material-symbols-outlined">masks</span>
          </div>
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.04em] text-text">Vibetalk</h1>
          <p className="text-text-muted">Real connection, absolute anonymity.</p>
        </div>

        <div className="relative rounded-3xl border border-outline bg-[#1f1f23]/88 p-8 shadow-main">
          <div className="absolute inset-x-0 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
          <header className="mb-6 flex flex-col gap-[0.35rem]">
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text">Welcome back</h2>
            <p className="text-text-muted">Sign in to rejoin the confessional.</p>
          </header>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field
              icon="alternate_email"
              label="Email Address"
              onChange={(value) => {
                clearAuthError();
                setEmail(value);
              }}
              type="email"
              value={email}
            />
            <Field
              icon="lock"
              label="Password"
              onChange={(value) => {
                clearAuthError();
                setPassword(value);
              }}
              type="password"
              value={password}
            />

            {authError ? (
              <p className="rounded-2xl border border-[#ef4444]/18 bg-[#7f1d1d]/22 px-4 py-[0.85rem] text-[0.92rem] text-[#fecaca]">{authError}</p>
            ) : null}

            <button
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:saturate-[0.85]"
              disabled={status === "loading"}
              type="submit"
            >
              {status === "loading" ? "Logging In..." : "Log In"}
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center text-[0.8rem] text-text-muted before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-outline/22 before:content-['']">
            <span className="relative z-[1] bg-[#1f1f23]/98 px-3">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl border border-outline/18 bg-[#1b1b1f]/92 px-[1.2rem] py-[0.95rem] font-extrabold text-text transition-all duration-160 hover:-translate-y-px active:scale-[0.98]" type="button">
              <span className="material-symbols-outlined">language</span>
              Google
            </button>
            <button className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl border border-outline/18 bg-[#1b1b1f]/92 px-[1.2rem] py-[0.95rem] font-extrabold text-text transition-all duration-160 hover:-translate-y-px active:scale-[0.98]" type="button">
              <span className="material-symbols-outlined">devices</span>
              Apple
            </button>
          </div>
        </div>

        <p className="text-center text-[0.95rem] text-text-muted">
          New to the void? <Link className="font-extrabold text-primary" to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
