import { useEffect, useRef, useState } from "react";
import TopBar from "../components/layout/TopBar";
import { useAppContext } from "../components/layout/AppLayout";
import { Icons } from "@/utils/icon";

function ChatPage() {
  const app = useAppContext();
  const {
    activeSession,
    chatStatus,
    currentChatType,
    friendRequest,
    handleDraftActivity,
    messages,
    openReportModal,
    profile,
    requestFriend,
    respondToFriendRequest,
    sendMessage,
    skipChat,
    strangerTyping,
  } = app;

  const [draft, setDraft] = useState("");
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [messages, strangerTyping]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = draft.trim();
    if (!next || !activeSession) return;
    void sendMessage(next);
    setDraft("");
    handleDraftActivity("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const next = draft.trim();
      if (next && activeSession) {
        void sendMessage(next);
        setDraft("");
        handleDraftActivity("");
      }
    }
  }

  function formatMessageTime(value: string) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  }

  const isIncomingFriendRequest =
    friendRequest?.status === "pending" &&
    friendRequest.requester !== profile.id;

  const canRequestFriend =
    activeSession &&
    (!friendRequest ||
      (friendRequest.requester === profile.id &&
        friendRequest.status === "rejected"));

  return (
    <main className="relative z-[1] flex min-h-screen flex-col px-6 pb-[6.5rem] pt-[7.5rem] animate-[page-fade_320ms_ease-out]">
      <TopBar
        chatMode
        onOpenReport={openReportModal}
        onSkip={() => void skipChat()}
        statusLabel={
          activeSession
            ? "Connected"
            : chatStatus === "waiting"
              ? "Matching..."
              : "Connecting..."
        }
      />

      <section className="mx-auto flex w-full max-w-[70rem] flex-1 flex-col pb-4">
        {!activeSession ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="flex w-full max-w-[28rem] flex-col items-center gap-4 rounded-[2rem] border border-[rgba(152,141,159,0.14)] bg-[rgba(14,14,18,0.82)] p-8 text-center shadow-main">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-highest/82">
                <span className="material-symbols-outlined animate-[pulse-ring_2.2s_infinite] text-[2.2rem] text-primary">
                  travel_explore
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-[1.6rem] font-extrabold tracking-[-0.04em] text-text">
                  {chatStatus === "waiting"
                    ? "Looking for a stranger"
                    : "Connecting you to the queue"}
                </h2>
                <p className="text-text-muted">
                  {chatStatus === "waiting"
                    ? "Your request is live. The first compatible stranger will be routed into this room."
                    : "Realtime channel is warming up before we place you into the matching pool."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-surface-high/88 px-4 py-2 text-[0.78rem] uppercase tracking-[0.18em] text-text-muted">
                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
                {currentChatType === "video" ? "Video Queue" : "Text Queue"}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex-1 flex flex-col gap-[1.4rem] px-6 py-4 pb-28 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-highest"
            ref={streamRef}
          >
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col items-center gap-[0.3rem] text-[#a1a1aa]/55">
                <p className="m-0 uppercase tracking-[0.18em] text-[0.72rem]">
                  Stranger connected
                </p>
                <span className="text-[0.78rem]">
                  {activeSession.stranger.name} joined your {activeSession.type} room
                </span>
              </div>

              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[rgba(152,141,159,0.14)] bg-[rgba(14,14,18,0.82)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.18em] text-text-muted">
                      Session live
                    </p>
                    <h2 className="text-[1.1rem] font-extrabold text-text">
                      {activeSession.type === "video" ? "Video chat" : "Text chat"} with{" "}
                      {activeSession.stranger.name}
                    </h2>
                  </div>
                  {canRequestFriend ? (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-[0.95rem] border border-primary/20 bg-primary/12 px-4 py-[0.7rem] font-extrabold text-primary transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
                      onClick={() => void requestFriend()}
                      type="button"
                    >
                      <Icons.FaRegUser className="h-4 w-4" />
                      Add Friend
                    </button>
                  ) : null}
                </div>

                {activeSession.matchedInterests.length ? (
                  <div className="flex flex-wrap gap-2">
                    {activeSession.matchedInterests.map((interest) => (
                      <span
                        className="inline-flex items-center rounded-full border border-outline/16 bg-surface-highest/40 px-3 py-1 text-[0.78rem] text-text"
                        key={interest}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {friendRequest ? (
                <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[rgba(152,141,159,0.14)] bg-[rgba(14,14,18,0.82)] p-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-text-muted">
                    Friend request
                  </p>
                  <p className="text-text">
                    {friendRequest.status === "pending" && isIncomingFriendRequest
                      ? `${activeSession.stranger.name} wants to keep in touch after this chat.`
                      : friendRequest.status === "pending"
                        ? "Friend request sent. Waiting for the stranger to respond."
                        : friendRequest.status === "accepted"
                          ? "Friend request accepted. Private chat can be unlocked later."
                          : "Friend request was declined."}
                  </p>

                  {friendRequest.status === "pending" &&
                  isIncomingFriendRequest ? (
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-[0.95rem] bg-gradient-to-br from-primary to-primary-strong px-4 py-[0.7rem] font-extrabold text-[#2c0051] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
                        onClick={() => void respondToFriendRequest(true)}
                        type="button"
                      >
                        Accept
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-[0.95rem] border border-white/8 bg-surface-highest/18 px-4 py-[0.7rem] font-extrabold text-text-muted transition-all duration-160 hover:-translate-y-px hover:text-text active:scale-[0.98]"
                        onClick={() => void respondToFriendRequest(false)}
                        type="button"
                      >
                        Decline
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {messages.map((message) => (
              <article
                className={`flex flex-col gap-[0.45rem] max-w-[min(85%,30rem)] ${
                  message.author === "me" ? "ml-auto items-end" : "items-start"
                }`}
                key={message.id}
              >
                <div
                  className={`p-[0.95rem_1rem] rounded-[1.1rem] leading-[1.6] ${
                    message.author === "me"
                      ? "text-[#2c0051] bg-gradient-to-br from-primary to-primary-strong rounded-br-[0.35rem]"
                      : "bg-surface-highest rounded-bl-[0.35rem]"
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-[0.72rem] tracking-[0.16em] uppercase text-[#a1a1aa]/80">
                  {formatMessageTime(message.createdAt)}
                  {message.author === "me" ? ` · ${message.status}` : ""}
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
        )}

        <form
          className="fixed left-1/2 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] -translate-x-1/2 flex items-end gap-[0.75rem] w-[min(calc(100vw-3rem),45rem)] p-[0.65rem] rounded-[1.5rem] border border-[rgba(152,141,159,0.14)] bg-[rgba(14,14,18,0.94)] shadow-main max-[767px]:left-[1rem] max-[767px]:right-[1rem] max-[767px]:w-auto max-[767px]:translate-x-0"
          onSubmit={handleSubmit}
        >
          <textarea
            className="flex-1 min-h-[3rem] max-h-[10rem] text-text bg-transparent border-0 outline-0 resize-none px-[0.85rem] py-[0.7rem] disabled:opacity-60"
            disabled={!activeSession}
            onChange={(event) => {
              setDraft(event.target.value);
              handleDraftActivity(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={activeSession ? "Say something real..." : "Waiting for a stranger..."}
            rows={1}
            value={draft}
          />
          <button
            className="inline-flex h-12 w-12 min-w-[3rem] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-strong font-extrabold text-[#2c0051] transition-all duration-160 hover:-translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!activeSession}
            type="submit"
          >
            <Icons.LuSendHorizontal strokeWidth={2} size={20} />
          </button>
        </form>
      </section>
    </main>
  );
}

export default ChatPage;
