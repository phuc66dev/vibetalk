import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/ui/Field';
import { useAuthStore } from '../stores/authStore';

function RegisterPage() {
  const [name, setName] = useState('GhostWalker');
  const [email, setEmail] = useState('you@anonymous.com');
  const [password, setPassword] = useState('private-channel');
  const [confirmPassword, setConfirmPassword] = useState('private-channel');

  const navigate = useNavigate();

  const registerWithCredentials = useAuthStore(
    (state) => state.registerWithCredentials,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    await registerWithCredentials({ name, email, password });
    navigate('/login', { replace: true });
  }

  return (
    <main className="relative z-[1] flex min-h-screen items-center justify-center px-6 py-8">
      <section className="flex w-full max-w-[26rem] flex-col gap-[1.75rem] animate-[page-fade_320ms_ease-out]">
        <div className="flex flex-col items-center gap-[0.5rem] text-center">
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.04em]">Create Identity</h1>
          <p className="text-text-muted">Join the digital confessional.</p>
        </div>

        <div className="relative rounded-3xl border border-outline bg-[#1f1f23]/88 p-8 shadow-main">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field icon="person" label="Anonymous Name" onChange={setName} value={name} />
            <Field icon="alternate_email" label="Email" onChange={setEmail} type="email" value={email} />
            <Field icon="lock" label="Secret Key" onChange={setPassword} type="password" value={password} />
            <div className="relative flex items-center gap-[0.75rem] text-[0.72rem] font-extrabold uppercase text-primary before:h-2 before:flex-1 before:rounded-full before:bg-[#0e0e12]/90 before:content-['']">
              <div className="absolute left-0 h-2 w-[60%] rounded-full bg-gradient-to-br from-primary to-primary-strong" />
              <span className="relative">Secure</span>
            </div>
            <Field
              icon="verified_user"
              label="Confirm Key"
              onChange={setConfirmPassword}
              type="password"
              value={confirmPassword}
            />

            <button
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
              type="submit"
            >
              Register Identity
            </button>
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
