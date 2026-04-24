import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters').
    max(50, 'Name is too long')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Name contains invalid characters (only letters, numbers, and spaces allowed)'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password is too long'),
});

type RegisterFormValues = z.infer<typeof RegisterSchema>;

function RegisterPage() {

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const registerWithCredentials = useAuthStore(
    (state) => state.registerWithCredentials,
  );

  async function onSubmit(data: RegisterFormValues) {
    try {
      await registerWithCredentials(data);
      navigate('/login', { replace: true });
    } catch {
      // lỗi được xử lý trong store (toast)
    }
  }

  return (
    <main className="relative z-[1] flex min-h-screen items-center justify-center px-6 py-8">
      <section className="flex w-full max-w-[26rem] flex-col gap-[1.75rem] animate-[page-fade_320ms_ease-out]">
        <div className="flex flex-col items-center gap-[0.5rem] text-center">
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.04em]">Create Identity</h1>
          <p className="text-text-muted">Join the digital confessional.</p>
        </div>

        <div className="relative rounded-3xl border border-outline bg-[#1f1f23]/88 p-8 shadow-main">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="flex flex-col gap-[0.55rem]">
              <Label className="uppercase">Your name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Type your name"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-danger">{errors.name?.message}</p>
              )}
            </div>
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
            {/* Button register */}
            <Button
              className="w-full mt-1 text-lg"
              disabled={isSubmitting}
              size="lg"
              type="submit"
              variant="auth"
            >
              {isSubmitting ? 'Submiting...' : 'Register Identity'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[0.95rem] text-text-muted">
          Known presence? <Link className="font-extrabold text-primary" to="/login">Log in here</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
