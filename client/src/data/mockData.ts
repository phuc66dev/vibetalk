import type { ChatMessage, Profile, SettingsState } from '../types';

export const starterMessages = [
  "Have you ever felt like you're living inside someone else's memory?",
  "Every day. Like I know the lines, but I never wrote the script.",
  "Then let's make this room ours for a minute. What would you say if nobody knew your name?",
];

export const strangerReplies = [
  "Maybe honesty feels easier when the lights stay low.",
  "I like that answer. It sounds like a door opening.",
  "What part of yourself do you protect the most?",
  "This app feels less like chat and more like a midnight tunnel.",
  "You can stay anonymous here and still be real.",
];

export const suggestedInterests = [
  "Cyberpunk",
  "Meditation",
  "Journaling",
  "Urban Decay",
  "Night Drives",
];

export const initialProfile: Profile = {
  alias: "Echo_Night",
  bio: "Architect of silence, collector of whispers. I find beauty in the void and stories in the shadows. Let's talk about everything we're afraid to say out loud.",
  interests: [
    "Existentialism",
    "Late Night Jazz",
    "Digital Art",
    "Cybernetics",
    "Urban Exploration",
    "Philosophy",
  ],
  whispers: "1.2k",
  rooms: "42",
  trust: 98,
};

export const initialSettings: SettingsState = {
  darkMode: true,
  notifications: false,
  privacyMode: true,
};

export const initialBlockedUsers = [
  "Silent_Watcher_42",
  "Neon_Ghost",
  "VoidWalker_99",
];

export function createStarterConversation(): ChatMessage[] {
  return starterMessages.map((text, index) => ({
    author: index === 1 ? "me" : "stranger",
    id: index + 1,
    text,
    time: `11:0${index + 2} PM`,
  }));
}
