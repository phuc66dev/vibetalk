export type ChatAuthor = 'me' | 'stranger';
export type ChatType = 'text' | 'video';
export type ChatMessageStatus = 'sent' | 'delivered' | 'read';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'nudity'
  | 'violence'
  | 'underage'
  | 'scam'
  | 'other';

export type ChatMessage = {
  author: ChatAuthor;
  content: string;
  createdAt: string;
  id: string;
  readAt: string | null;
  sessionId: string;
  status: ChatMessageStatus;
  type: string;
};

export type ChatStranger = {
  avatar?: string | null;
  id: string | null;
  name: string;
};

export type ChatSession = {
  endReason: string | null;
  id: string;
  matchedInterests: string[];
  messageCount: number;
  roomId: string;
  startedAt: string | null;
  status: string;
  stranger: ChatStranger;
  type: ChatType;
};

export type FriendRequestState = {
  id: string;
  recipient: string;
  requester: string;
  respondedAt?: string | null;
  sessionId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
};

export type Profile = {
  avatar?: string | null;
  alias: string;
  bio: string;
  createdAt?: string;
  email?: string;
  id?: string;
  interests: string[];
  whispers: string;
  rooms: string;
  trust: number;
  updatedAt?: string;
};

export type SettingsState = {
  darkMode: boolean;
  notifications: boolean;
  privacyMode: boolean;
};

export type ReportState = {
  open: boolean;
  reason: ReportReason;
  details: string;
};

