import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  initialBlockedUsers,
  initialProfile,
  initialSettings,
} from "../data/mockData";
import {
  disconnectChatSocket,
  emitWithAck,
  ensureChatSocketConnected,
  getChatSocket,
} from "../services/chatSocket";
import { useAuthStore } from "../stores/authStore";
import type {
  ChatMessage,
  ChatSession,
  ChatType,
  FriendRequestState,
  Profile,
  ReportReason,
  ReportState,
  SettingsState,
} from "../types";

type QueueAck = {
  status: "waiting" | "matched";
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 1000 ? 1 : 0,
    notation: value >= 1000 ? "compact" : "standard",
  }).format(value);
}

function buildInitialProfile(currentUser: ReturnType<typeof useAuthStore.getState>["currentUser"]) {
  if (!currentUser) {
    return initialProfile;
  }

  return {
    ...initialProfile,
    alias: currentUser.name,
    avatar: currentUser.avatar,
    bio: currentUser.description || initialProfile.bio,
    createdAt: currentUser.createdAt,
    email: currentUser.email,
    id: currentUser._id,
    interests:
      currentUser.interests && currentUser.interests.length
        ? currentUser.interests
        : initialProfile.interests,
    rooms: formatCompactNumber(currentUser.stats?.totalSessions || 0),
    trust: currentUser.stats?.skipsReceived
      ? Math.max(40, 100 - currentUser.stats.skipsReceived * 3)
      : initialProfile.trust,
    updatedAt: currentUser.updatedAt,
    whispers: formatCompactNumber(currentUser.stats?.totalMessages || 0),
  };
}

function getDisconnectMessage(reason: string | null | undefined) {
  switch (reason) {
    case "skip":
      return "The other side chose to move on.";
    case "reported":
      return "This conversation was closed after a report.";
    case "user_left":
      return "The other participant left the room.";
    default:
      return "The conversation has ended.";
  }
}

function useDemoApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const alias = useAuthStore((state) => state.alias);
  const currentUser = useAuthStore((state) => state.currentUser);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginToStore = useAuthStore((state) => state.login);
  const logoutFromStore = useAuthStore((state) => state.logout);
  const [profile, setProfile] = useState<Profile>(() => buildInitialProfile(currentUser));
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [report, setReport] = useState<ReportState>({
    details: "",
    open: false,
    reason: "spam",
  });
  const [strangerTyping, setStrangerTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState<
    "idle" | "connecting" | "waiting" | "matched" | "disconnected"
  >("idle");
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [currentChatType, setCurrentChatType] = useState<ChatType | null>(null);
  const [disconnectedReason, setDisconnectedReason] = useState<string | null>(
    null,
  );
  const [friendRequest, setFriendRequest] = useState<FriendRequestState | null>(
    null,
  );
  const socketRef = useRef<ReturnType<typeof getChatSocket> | null>(null);
  const activeSessionRef = useRef<ChatSession | null>(null);
  const currentUserIdRef = useRef<string | null>(currentUser?._id || null);
  const typingActiveRef = useRef(false);
  const typingStopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    currentUserIdRef.current = currentUser?._id || null;
  }, [currentUser?._id]);

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
      setProfile(buildInitialProfile(currentUser));
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

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectChatSocket();
      return;
    }

    const socket = getChatSocket();
    socketRef.current = socket;

    const handleQueueWaiting = () => {
      setChatStatus("waiting");
    };

    const handleMatched = ({
      session,
    }: {
      roomId: string;
      session: ChatSession;
      stranger: ChatSession["stranger"];
    }) => {
      activeSessionRef.current = session;
      setActiveSession(session);
      setMessages([]);
      setStrangerTyping(false);
      setFriendRequest(null);
      setDisconnectedReason(null);
      setChatStatus("matched");
      navigate("/chat");
    };

    const handleTyping = ({ isTyping }: { isTyping: boolean }) => {
      setStrangerTyping(isTyping);
    };

    const handleNewMessage = ({ message }: { message: ChatMessage }) => {
      setMessages((current) => {
        const existing = current.findIndex((entry) => entry.id === message.id);
        if (existing >= 0) {
          const next = [...current];
          next[existing] = message;
          return next;
        }

        return [...current, message];
      });

      if (message.author === "stranger") {
        void emitWithAck("read_message", {
          messageId: message.id,
        }).catch(() => undefined);
      }
    };

    const handleMessageRead = ({
      messageId,
      readAt,
    }: {
      messageId: string;
      readAt: string;
    }) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? { ...message, readAt, status: "read" }
            : message,
        ),
      );
    };

    const handleSessionEnded = ({ reason }: { reason: string }) => {
      activeSessionRef.current = null;
      setActiveSession(null);
      setStrangerTyping(false);
      setChatStatus("disconnected");
      setDisconnectedReason(getDisconnectMessage(reason));
      navigate("/chat/disconnected");
    };

    const handleFriendRequest = ({
      request,
    }: {
      request: FriendRequestState;
    }) => {
      setFriendRequest(request);

      if (request.requester === currentUserIdRef.current) {
        toast.message("Friend request sent.");
        return;
      }

      toast.message("The stranger wants to stay in touch.");
    };

    const handleFriendRequestUpdated = ({
      request,
    }: {
      request: Pick<FriendRequestState, "id" | "respondedAt" | "status">;
    }) => {
      setFriendRequest((current) =>
        current && current.id === request.id
          ? { ...current, ...request }
          : current,
      );

      if (request.status === "accepted") {
        toast.success("Friend request accepted.");
      } else if (request.status === "rejected") {
        toast.message("Friend request rejected.");
      }
    };

    const handleChatError = ({ message }: { message: string }) => {
      toast.error(message);
    };

    const handleConnectError = () => {
      if (location.pathname === "/chat") {
        setChatStatus("disconnected");
        setDisconnectedReason("Realtime connection failed.");
      }
    };

    socket.on("queue_waiting", handleQueueWaiting);
    socket.on("matched", handleMatched);
    socket.on("stranger_typing", handleTyping);
    socket.on("new_message", handleNewMessage);
    socket.on("message_read", handleMessageRead);
    socket.on("session_ended", handleSessionEnded);
    socket.on("friend_request", handleFriendRequest);
    socket.on("friend_request_updated", handleFriendRequestUpdated);
    socket.on("chat_error", handleChatError);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("queue_waiting", handleQueueWaiting);
      socket.off("matched", handleMatched);
      socket.off("stranger_typing", handleTyping);
      socket.off("new_message", handleNewMessage);
      socket.off("message_read", handleMessageRead);
      socket.off("session_ended", handleSessionEnded);
      socket.off("friend_request", handleFriendRequest);
      socket.off("friend_request_updated", handleFriendRequestUpdated);
      socket.off("chat_error", handleChatError);
      socket.off("connect_error", handleConnectError);
    };
  }, [isAuthenticated, location.pathname, navigate]);

  useEffect(
    () => () => {
      if (typingStopTimerRef.current !== null) {
        window.clearTimeout(typingStopTimerRef.current);
      }
      disconnectChatSocket();
    },
    [],
  );

  function stopTyping() {
    if (typingStopTimerRef.current !== null) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }

    if (!typingActiveRef.current || !activeSessionRef.current) {
      return;
    }

    typingActiveRef.current = false;
    void emitWithAck("typing_stop", {
      sessionId: activeSessionRef.current.id,
    }).catch(() => undefined);
  }

  function login(nextAlias?: string) {
    loginToStore(nextAlias);
    navigate("/", { replace: true });
  }

  async function logout() {
    disconnectChatSocket();
    await logoutFromStore();
    navigate("/login", { replace: true });
  }

  async function startNewChat(chatType: ChatType = "text") {
    try {
      await ensureChatSocketConnected();
      stopTyping();
      activeSessionRef.current = null;
      setActiveSession(null);
      setMessages([]);
      setStrangerTyping(false);
      setFriendRequest(null);
      setDisconnectedReason(null);
      setCurrentChatType(chatType);
      setChatStatus("connecting");
      navigate("/chat");

      const result = await emitWithAck<QueueAck>("join_queue", {
        chatType,
        filters: currentUser?.matchPreferences || {},
        interests: currentUser?.interests || profile.interests,
      });

      if (result.status === "waiting") {
        setChatStatus("waiting");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot start chat right now.";
      setChatStatus("idle");
      setCurrentChatType(null);
      toast.error(message);
      navigate("/");
    }
  }

  async function sendMessage(text: string) {
    if (!activeSessionRef.current) {
      return;
    }

    stopTyping();

    try {
      await emitWithAck("send_message", {
        content: text,
        sessionId: activeSessionRef.current.id,
        type: "text",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot send message.";
      toast.error(message);
    }
  }

  function handleDraftActivity(value: string) {
    if (!activeSessionRef.current) {
      return;
    }

    const hasText = Boolean(value.trim());
    if (!hasText) {
      stopTyping();
      return;
    }

    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      void emitWithAck("typing_start", {
        sessionId: activeSessionRef.current.id,
      }).catch(() => undefined);
    }

    if (typingStopTimerRef.current !== null) {
      window.clearTimeout(typingStopTimerRef.current);
    }

    typingStopTimerRef.current = window.setTimeout(() => {
      stopTyping();
    }, 900);
  }

  async function skipChat() {
    stopTyping();

    if (!activeSessionRef.current) {
      navigate("/");
      return;
    }

    try {
      await emitWithAck("skip", {
        sessionId: activeSessionRef.current.id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot leave chat.";
      toast.error(message);
    }
  }

  function saveProfile(
    nextProfile: Pick<Profile, "alias" | "bio" | "interests">,
  ) {
    setProfile((current) => ({ ...current, ...nextProfile }));
    toast.success("Hồ sơ đã được lưu!");
  }

  function toggleSetting(key: keyof SettingsState) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function openReportModal() {
    if (!activeSessionRef.current) {
      toast.message("No active stranger to report.");
      return;
    }

    setReport((current) => ({ ...current, open: true }));
  }

  function closeReportModal() {
    setReport((current) => ({
      ...current,
      details: "",
      open: false,
      reason: "spam",
    }));
  }

  async function submitReport() {
    if (!activeSessionRef.current) {
      closeReportModal();
      return;
    }

    try {
      await emitWithAck("report_user", {
        description: report.details,
        reason: report.reason,
        sessionId: activeSessionRef.current.id,
      });
      closeReportModal();
      toast.success("Báo cáo đã được gửi.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot submit report.";
      toast.error(message);
    }
  }

  async function requestFriend() {
    if (!activeSessionRef.current) {
      return;
    }

    try {
      await emitWithAck("friend_request", {
        sessionId: activeSessionRef.current.id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot send friend request.";
      toast.error(message);
    }
  }

  async function respondToFriendRequest(accepted: boolean) {
    if (!friendRequest) {
      return;
    }

    try {
      await emitWithAck("friend_request_response", {
        accepted,
        requestId: friendRequest.id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot respond right now.";
      toast.error(message);
    }
  }

  function unblockUser(user: string) {
    setBlockedUsers((current) => current.filter((entry) => entry !== user));
  }

  return {
    activeSession,
    blockedUsers,
    chatStatus,
    closeReportModal,
    currentChatType,
    disconnectedReason,
    friendRequest,
    handleDraftActivity,
    isAuthenticated,
    isMatching: chatStatus === "connecting" || chatStatus === "waiting",
    login,
    logout,
    messages,
    openReportModal,
    profile,
    report,
    requestFriend,
    respondToFriendRequest,
    saveProfile,
    sendMessage,
    settings,
    setReportDetails: (details: string) =>
      setReport((current) => ({ ...current, details })),
    setReportReason: (reason: ReportReason) =>
      setReport((current) => ({ ...current, reason })),
    skipChat,
    startNewChat,
    stopTyping,
    strangerTyping,
    submitReport,
    toggleSetting,
    unblockUser,
  };
}

export type DemoAppController = ReturnType<typeof useDemoApp>;

export { useDemoApp };
export default useDemoApp;
