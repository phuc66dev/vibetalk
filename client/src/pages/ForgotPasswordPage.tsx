import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';

const EmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

const ResetSchema = z.object({
  resetPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type EmailFormValues = z.infer<typeof EmailSchema>;
type ResetFormValues = z.infer<typeof ResetSchema>;

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const forgotPassword = useAuthStore((state) => state.forgotPassword)
  const resetPassword = useAuthStore((state) => state.resetPassword)

  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      setStep(2);
      // Xóa token khỏi URL để bảo mật
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: '' },
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { resetPassword: '' },
  });

  // Step 1: Request Email
  const onSubmitEmail = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setStep(2);
    } catch (error: any) {
      // Error toast is already handled by authStore  
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const onSubmitReset = async (data: ResetFormValues) => {
    if (!token) {
      toast.error('Please check your email and click the recovery link first!');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token: token, newPassword: data.resetPassword })
      navigate('/login', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative z-[1] flex min-h-screen items-center justify-center px-6 py-8">
      <section className="flex w-full max-w-[26rem] flex-col gap-[1.75rem] animate-[page-fade_320ms_ease-out]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-[0.75rem] text-center">
          <div className="grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full shadow-soft p-3 overflow-hidden">
            <img src="/logo.png" alt="Vibetalk" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.04em] text-text">Vibetalk</h1>
          <p className="text-text-muted">Reset your password.</p>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl border border-outline bg-[#1f1f23]/88 p-8 shadow-main">
          <div className="absolute inset-x-0 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

          {step === 1 && (
            <>
              <header className="mb-6 flex flex-col gap-[0.35rem]">
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text">Forgot Password</h2>
                <p className="text-text-muted">Enter your email to receive a recovery code.</p>
              </header>

              <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit(onSubmitEmail)}>
                <div className="flex flex-col gap-[0.55rem]">
                  <Label className="uppercase">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    aria-invalid={!!emailErrors.email}
                    {...registerEmail('email')}
                  />
                  {emailErrors.email && (
                    <p className="text-xs text-danger">{emailErrors.email?.message}</p>
                  )}
                </div>

                <Button className="w-full mt-1 text-lg" disabled={isLoading} size="lg" type="submit" variant="auth">
                  {isLoading ? 'Sending...' : 'Send Recovery Code'}
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <header className="mb-6 flex flex-col gap-[0.35rem]">
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text">Set New Password</h2>
                {!token && (
                  <p className="text-[#f59e0b] text-sm bg-[#f59e0b]/10 mt-3 p-3 rounded-xl border border-[#f59e0b]/20">
                    A recovery link has been sent. Please click the link in your email to authenticate before setting a new password.
                  </p>
                )}
              </header>

              <form className="flex flex-col gap-4" onSubmit={handleResetSubmit(onSubmitReset)}>

                <div className="flex flex-col gap-[0.55rem]">
                  <Label className="uppercase">New Password</Label>
                  <Input
                    type="password"
                    placeholder="Type your new password"
                    aria-invalid={!!resetErrors.resetPassword}
                    {...registerReset('resetPassword')}
                  />
                  {resetErrors.resetPassword && (
                    <p className="text-xs text-danger">{resetErrors.resetPassword?.message}</p>
                  )}
                </div>

                <Button className="w-full mt-1 text-lg" disabled={isLoading} size="lg" type="submit" variant="auth">
                  {isLoading ? 'Processing...' : 'Confirm'}
                </Button>
              </form>
            </>
          )}

        </div>

        <p className="text-center text-[0.95rem] text-text-muted">
          Remembered your password?{' '}
          <Link className="font-extrabold text-primary" to="/login">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
