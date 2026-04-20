import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createStarterConversation,
  initialBlockedUsers,
  initialProfile,
  initialSettings,
  strangerReplies,
} from "../data/mockData";
import { useAuthStore } from "../stores/authStore";
import type {
  ChatAuthor,
  ChatMessage,
  Profile,
  ReportState,
  SettingsState,
} from "../types";

function useDemoApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const alias = useAuthStore((state) => state.alias);
  const currentUser = useAuthStore((state) => state.currentUser);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginToStore = useAuthStore((state) => state.login);
  const logoutFromStore = useAuthStore((state) => state.logout);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createStarterConversation(),
  );
  const [report, setReport] = useState<ReportState>({
    open: false,
    reason: "spam",
    details: "",
  });
  const [strangerTyping, setStrangerTyping] = useState(false);
  const messageIdRef = useRef(messages.length + 1);
  const replyCursorRef = useRef(0);
  const replyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const titleMap: Record<string, string> = {
      "/": "Vibetalk | Matching",
      "/chat": "Vibetalk | Chat",
      "/chat/disconnected": "Vibetalk | Disconnected",
      "/login": "Vibetalk | Login",
      "/register": "Vibetalk | Register",
      "/profile": "Vibetalk | Profile",
      "/profile/edit": "Vibetalk | Edit Profile",
      "/settings": "Vibetalk | Settings",
    };

    document.title = titleMap[location.pathname] ?? "Vibetalk";
  }, [location.pathname]);

  useEffect(() => {
    if (currentUser) {
      setProfile((current) => ({
        ...current,
        alias: currentUser.name,
        avatar: currentUser.avatar,
        createdAt: currentUser.createdAt,
        email: currentUser.email,
        id: currentUser._id,
        updatedAt: currentUser.updatedAt,
      }));
      return;
    }

    if (alias) {
      setProfile((current) => ({ ...current, alias }));
    }
  }, [alias, currentUser]);

  useEffect(() => {
    if (!isAuthenticated || currentUser) {
      return;
    }

    void fetchCurrentUser().catch(() => {
      logoutFromStore();
      navigate("/login", { replace: true });
    });
  }, [
    currentUser,
    fetchCurrentUser,
    isAuthenticated,
    logoutFromStore,
    navigate,
  ]);

  useEffect(
    () => () => {
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
      }
    },
    [],
  );

  function buildMessage(author: ChatAuthor, text: string): ChatMessage {
    return {
      id: messageIdRef.current++,
      author,
      text,
      time: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    };
  }

  function resetChat() {
    if (replyTimerRef.current !== null) {
      window.clearTimeout(replyTimerRef.current);
    }

    const refreshed = createStarterConversation();
    messageIdRef.current = refreshed.length + 1;
    replyCursorRef.current = 0;
    setMessages(refreshed);
    setStrangerTyping(false);
  }

  function login(nextAlias?: string) {
    loginToStore(nextAlias);
    navigate("/", { replace: true });
  }

  function logout() {
    logoutFromStore();
    navigate("/login", { replace: true });
  }

  function startNewChat() {
    resetChat();
    navigate("/chat");
  }

  function sendMessage(text: string) {
    const nextMessage = buildMessage("me", text);
    setMessages((current) => [...current, nextMessage]);
    setStrangerTyping(true);

    if (replyTimerRef.current !== null) {
      window.clearTimeout(replyTimerRef.current);
    }

    replyTimerRef.current = window.setTimeout(() => {
      const reply =
        strangerReplies[replyCursorRef.current % strangerReplies.length];
      replyCursorRef.current += 1;
      setMessages((existing) => [...existing, buildMessage("stranger", reply)]);
      setStrangerTyping(false);
    }, 1200);
  }

  function skipChat() {
    if (replyTimerRef.current !== null) {
      window.clearTimeout(replyTimerRef.current);
    }

    setStrangerTyping(false);
    navigate("/chat/disconnected");
  }

  function saveProfile(
    nextProfile: Pick<Profile, "alias" | "bio" | "interests">,
  ) {
    setProfile((current) => ({ ...current, ...nextProfile }));
  }

  function toggleSetting(key: keyof SettingsState) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function openReportModal() {
    setReport((current) => ({ ...current, open: true }));
  }

  function closeReportModal() {
    setReport((current) => ({
      ...current,
      open: false,
      reason: "spam",
      details: "",
    }));
  }

  function submitReport() {
    setReport({ open: false, reason: "spam", details: "" });
  }

  function unblockUser(user: string) {
    setBlockedUsers((current) => current.filter((entry) => entry !== user));
  }

  return {
    blockedUsers,
    closeReportModal,
    isAuthenticated,
    login,
    logout,
    messages,
    openReportModal,
    profile,
    report,
    saveProfile,
    sendMessage,
    settings,
    setReportDetails: (details: string) =>
      setReport((current) => ({ ...current, details })),
    setReportReason: (reason: string) =>
      setReport((current) => ({ ...current, reason })),
    skipChat,
    startNewChat,
    strangerTyping,
    submitReport,
    toggleSetting,
    unblockUser,
  };
}

export type DemoAppController = ReturnType<typeof useDemoApp>;

export default useDemoApp;
