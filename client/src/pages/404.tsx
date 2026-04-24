import { Link } from 'react-router-dom';

function Page404() {
  return (
    <main className="relative z-[1] min-h-screen px-6 animate-[page-fade_320ms_ease-out] flex flex-col items-center justify-center bg-background">
      <section className="mx-auto flex w-full max-w-[40rem] flex-col items-center justify-center gap-6 text-center">
        <div className="mb-4 grid h-24 w-24 place-items-center rounded-full bg-surface-high/66 text-text-muted">
          <span className="material-symbols-outlined text-[3rem]">explore_off</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-[clamp(4rem,8vw,6rem)] font-extrabold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-strong">
            404
          </h1>
          <p className="text-[clamp(1.4rem,3vw,2rem)] font-semibold text-text">Oops! Page not found.</p>
          <p className="text-text-muted max-w-[22rem]">
            The URL you entered seems to be incorrect or the page has dissolved back into the void.
          </p>
        </div>

        <div className="flex w-full mt-4 justify-center">
          <Link
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[3rem] py-[0.95rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
            to="/"
          >
            <span className="material-symbols-outlined text-[1.4rem]">home</span>
            Return to Homepage
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Page404;
