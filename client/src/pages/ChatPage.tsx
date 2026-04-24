import { useEffect, useRef, useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { useAppContext } from '../components/layout/AppLayout';

/**
 * ChatPage – layout riêng, KHÔNG dùng TopBar/BottomNav từ AppLayout.
 * Vì chat cần TopBar đặc biệt (chatMode, nút Skip) và không cần BottomNav.
 * AppLayout vẫn cung cấp AuraBackdrop và ReportModal.
 */
function ChatPage() {
  const app = useAppContext();
  const { messages, openReportModal, sendMessage, skipChat, strangerTyping } = app;

  const [draft, setDraft] = useState('');
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [messages, strangerTyping]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = draft.trim();
    if (!next) return;
    sendMessage(next);
    setDraft('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const next = draft.trim();
      if (next) {
        sendMessage(next);
        setDraft('');
      }
    }
  }

  return (
    <main className="relative z-[1] flex min-h-screen flex-col px-6 pb-[6rem] pt-[6rem] animate-[page-fade_320ms_ease-out]">
      {/* TopBar chat mode riêng — override TopBar từ AppLayout */}
      <TopBar chatMode onOpenReport={openReportModal} onSkip={skipChat} />

      <section className="mx-auto flex w-full max-w-[70rem] flex-1 flex-col pb-4">
        <div
          className="flex-1 flex flex-col gap-[1.4rem] px-6 py-4 pb-28 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-highest"
          ref={streamRef}
        >
          <div className="flex flex-col items-center gap-[0.3rem] pt-4 text-[#a1a1aa]/55">
            <p className="m-0 uppercase tracking-[0.18em] text-[0.72rem]">Entering the void</p>
            <span className="text-[0.78rem]">Both participants are anonymous</span>
          </div>

          {messages.map((message) => (
            <article
              className={`flex flex-col gap-[0.45rem] max-w-[min(85%,30rem)] ${
                message.author === 'me' ? 'ml-auto items-end' : 'items-start'
              }`}
              key={message.id}
            >
              <div
                className={`p-[0.95rem_1rem] rounded-[1.1rem] leading-[1.6] ${
                  message.author === 'me'
                    ? 'text-[#2c0051] bg-gradient-to-br from-primary to-primary-strong rounded-br-[0.35rem]'
                    : 'bg-surface-highest rounded-bl-[0.35rem]'
                }`}
              >
                {message.text}
              </div>
              <span className="text-[0.72rem] tracking-[0.16em] uppercase text-[#a1a1aa]/80">
                {message.time}
              </span>
            </article>
          ))}

          {strangerTyping ? (
            <div className="inline-flex items-center gap-[0.35rem] w-fit p-[0.65rem] px-[0.85rem] rounded-full border border-[rgba(152,141,159,0.14)] bg-[rgba(14,14,18,0.94)]">
              <span className="w-[0.35rem] h-[0.35rem] rounded-full bg-[rgba(161,161,170,0.8)] animate-[typing-bounce_0.9s_infinite_ease-in-out]" />
              <span className="w-[0.35rem] h-[0.35rem] rounded-full bg-[rgba(161,161,170,0.8)] animate-[typing-bounce_0.9s_infinite_ease-in-out] [animation-delay:120ms]" />
              <span className="w-[0.35rem] h-[0.35rem] rounded-full bg-[rgba(161,161,170,0.8)] animate-[typing-bounce_0.9s_infinite_ease-in-out] [animation-delay:240ms]" />
            </div>
          ) : null}
        </div>

        <form
          className="fixed left-1/2 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] -translate-x-1/2 flex items-end gap-[0.75rem] w-[min(calc(100vw-3rem),45rem)] p-[0.65rem] rounded-[1.5rem] border border-[rgba(152,141,159,0.14)] bg-[rgba(14,14,18,0.94)] shadow-main max-[767px]:left-[1rem] max-[767px]:right-[1rem] max-[767px]:w-auto max-[767px]:translate-x-0"
          onSubmit={handleSubmit}
        >
          <textarea
            className="flex-1 min-h-[3rem] max-h-[10rem] text-text bg-transparent border-0 outline-0 resize-none px-[0.85rem] py-[0.7rem]"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something real..."
            rows={1}
            value={draft}
          />
          <button
            className="inline-flex h-12 w-12 min-w-[3rem] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-strong font-extrabold text-[#2c0051] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
            type="submit"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </section>
    </main>
  );
}

export default ChatPage;
