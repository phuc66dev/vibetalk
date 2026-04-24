import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const loginWithCredentials = useAuthStore((state) => state.loginWithCredentials);
  const status = useAuthStore((state) => state.status);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = status === 'loading';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await loginWithCredentials({ email, password });
      navigate('/', { replace: true });
    } catch {
      // lỗi đã được xử lý trong store (toast + authError state)
    }
  }

  return (
    <main className="relative z-[1] flex min-h-screen items-center justify-center px-6 py-8">
      <section className="flex w-full max-w-[26rem] flex-col gap-[1.75rem] animate-[page-fade_320ms_ease-out]">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-[0.75rem] text-center">
          <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-[#2c0051] shadow-soft">
            <span className="text-[2rem] material-symbols-outlined">masks</span>
          </div>
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.04em] text-text">Vibetalk</h1>
          <p className="text-text-muted">Real connection, absolute anonymity.</p>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl border border-outline bg-[#1f1f23]/88 p-8 shadow-main">
          {/* gradient top border */}
          <div className="absolute inset-x-0 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

          <header className="mb-6 flex flex-col gap-[0.35rem]">
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text">Welcome back</h2>
            <p className="text-text-muted">Sign in to rejoin the confessional.</p>
          </header>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field
              icon="email"
              label="Email Address"
              onChange={(value) => { clearAuthError(); setEmail(value); }}
              placeholder="Type your email address"
              type="email"
              value={email}
            />
            <Field
              icon="lock"
              label="Password"
              onChange={(value) => { clearAuthError(); setPassword(value); }}
              placeholder="Type your password"
              type="password"
              value={password}
            />

            {/* Nút submit – dùng Button component */}
            <Button
              className="w-full mt-1"
              disabled={isLoading}
              loading={isLoading}
              size="lg"
              type="submit"
              variant="default"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center text-[0.8rem] text-text-muted before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-outline/22 before:content-['']">
            <span className="relative z-[1] bg-[#1f1f23]/98 px-3">Or continue with</span>
          </div>

          {/* OAuth buttons – dùng Button variant="secondary" */}
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" type="button" variant="secondary">
              <span className="material-symbols-outlined">language</span>
              Google
            </Button>
            <Button size="lg" type="button" variant="secondary">
              <span className="material-symbols-outlined">devices</span>
              Apple
            </Button>
          </div>
        </div>

        <p className="text-center text-[0.95rem] text-text-muted">
          New to the void?{' '}
          <Link className="font-extrabold text-primary" to="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
