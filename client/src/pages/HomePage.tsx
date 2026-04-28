import FeatureCard from '../components/ui/FeatureCard';
import { useAppContext } from '../components/layout/AppLayout';
import { Icons } from '@/utils/icon';

function HomePage() {
  const app = useAppContext();

  return (
    <main className="relative z-[1] min-h-screen px-6 pb-[7.5rem] pt-[6rem] animate-[page-fade_320ms_ease-out]">
      <section className="mx-auto flex w-full max-w-[70rem] min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-6 text-center">
        <div className="relative grid h-28 w-28 place-items-center rounded-full bg-surface-highest/92 shadow-soft">
          <div className="absolute inset-[-0.6rem] rounded-full bg-[radial-gradient(circle,rgba(127,44,203,0.35),transparent_70%)] animate-[pulse-ring_2.2s_infinite]" />
          <span className="material-symbols-outlined text-[2.5rem] text-primary">diversity_3</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.04em]">
            Ready to meet <span className="text-primary">someone new?</span>
          </h1>
          <div className="inline-flex min-h-[2rem] items-center gap-[0.55rem] rounded-full bg-surface-high/88 px-[0.9rem] py-[0.45rem] text-text-muted">
            <span className="h-[0.55rem] w-[0.55rem] rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
            <span>1,248 users online</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="inline-flex min-h-[3.5rem] min-w-[15rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] text-[1.05rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98] cursor-pointer"
            onClick={app.startNewChat}
            type="button"
          >
            <Icons.FaMessage size={20} />
            Text
          </button>
          <button
            className="inline-flex min-h-[3.5rem] min-w-[15rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] text-[1.05rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98] cursor-pointer"
            onClick={app.startNewChat}
            type="button"
          >
            <Icons.IoIosVideocam size={28} />
            Video
          </button>
        </div>

        <p className="max-w-[18rem] text-text-muted leading-[1.65]">
          Connect instantly with a random person. Keep it respectful, keep it real.
        </p>

        <div className="grid w-full grid-cols-2 gap-4 max-[767px]:grid-cols-1">
          <FeatureCard icon="lock" subtitle="Your identity stays hidden until you share it." title="Anonymous" />
          <FeatureCard icon="bolt" subtitle="Get matched in seconds and keep the flow fast." title="Instant" />
        </div>
      </section>
    </main>
  );
}

export default HomePage;
