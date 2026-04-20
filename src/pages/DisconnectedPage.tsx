import { Link } from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";
import TopBar from "../components/layout/TopBar";
import StatBox from "../components/ui/StatBox";

type DisconnectedPageProps = {
  onFindNewChat: () => void;
  onOpenReport: () => void;
};

function DisconnectedPage({
  onFindNewChat,
  onOpenReport,
}: DisconnectedPageProps) {
  return (
    <main className="relative z-[1] min-h-screen px-6 pb-[7.5rem] pt-[6rem] animate-[page-fade_320ms_ease-out]">
      <TopBar onOpenReport={onOpenReport} title="Conversation ended" />
      <section className="mx-auto flex w-full max-w-[70rem] min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-6 text-center">
        <div className="mb-4 grid h-24 w-24 place-items-center rounded-full bg-surface-high/66 text-text-muted">
          <span className="material-symbols-outlined text-[2.5rem]">person_off</span>
        </div>

        <div className="flex max-w-[22rem] flex-col items-center gap-4">
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.04em]">Vibetalk has disconnected</h1>
          <p className="text-text-muted">
            The conversation has dissolved back into the void. Ready for a new
            connection?
          </p>
        </div>

        <div className="flex w-full max-w-[20rem] flex-col gap-4">
          <button
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
            onClick={onFindNewChat}
            type="button"
          >
            Find new chat
          </button>
          <Link
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl border border-outline/18 bg-[#1b1b1f]/92 px-[1.2rem] py-[0.95rem] font-extrabold text-text transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
            to="/"
          >
            Return to lobby
          </Link>
        </div>

        <div className="mt-4 flex w-full justify-center gap-8 border-t border-outline/12 pt-8">
          <StatBox label="Online Now" value="1.2k" />
          <StatBox label="Avg. Wait" value="40s" />
        </div>
      </section>
      <BottomNav active="home" />
    </main>
  );
}

export default DisconnectedPage;
