import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '../stores/authStore';

/* ── Validation schema ─────────────────────────────────────────── */
const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format').max(255, 'Email is too long'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters').max(50, 'Password is too long'),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

/* ── Component ─────────────────────────────────────────────────── */
function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const loginWithCredentials = useAuthStore((state) => state.loginWithCredentials);
  const status = useAuthStore((state) => state.status);

  // Lắng nghe lỗi từ URL (ví dụ chuyển hướng thất bại từ OAuth2)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'oauth_failed') {
        toast.error('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
      } else {
        toast.error('Có lỗi xảy ra trong quá trình đăng nhập.');
      }

      // Xoá tham số error ra khỏi URL để tránh báo lỗi lại lúc chuyển trang
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const isLoading = status === 'loading';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  // RHF handleSubmit validate xong → gọi onSubmit với data đã validated
  async function onSubmit(data: LoginFormValues) {
    clearAuthError();
    try {
      await loginWithCredentials(data);
      navigate('/', { replace: true });
    } catch {
      // lỗi được xử lý trong store (toast)
    }
  }

  // Redirect trình duyệt trực tiếp — KHÔNG dùng fetch/axios cho OAuth
  // Google redirect lại server → server set cookie → redirect về /auth/callback
  function handleLoginWithGoogle() {
    window.location.href = 'http://localhost:8000/api/auth/google';
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

          {/* handleSubmit(onSubmit) — RHF tự preventDefault và validate */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>

            {/* Email */}
            <div className="flex flex-col gap-[0.55rem]">
              <Label className="uppercase">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Type your email address"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-danger">{errors.email?.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-[0.55rem]">
              <Label className="uppercase">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Type your password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-danger">{errors.password?.message}</p>
              )}
            </div>

            <Button
              className="w-full mt-1 text-lg"
              disabled={isLoading}
              size="lg"
              type="submit"
              variant="auth"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center text-[0.8rem] text-text-muted before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-outline/22 before:content-['']">
            <span className="relative z-[1] bg-[#1f1f23]/98 px-3">Or continue with</span>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleLoginWithGoogle} size="lg" type="button" variant="secondary">
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
