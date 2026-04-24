export type ChatAuthor = 'me' | 'stranger';

export type ChatMessage = {
  id: number;
  author: ChatAuthor;
  text: string;
  time: string;
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
  reason: string;
  details: string;
};

export type BottomNavKey = 'home' | 'profile' | 'settings';
