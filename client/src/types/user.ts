export type User = {
  _id: string;
  dateOfBirth?: string;
  description?: string;
  name: string;
  email: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  avatar: string | null;
  createdAt: string;
  interests?: string[];
  language?: string;
  matchPreferences?: {
    ageMax: number;
    ageMin: number;
    genderFilter: "any" | "male" | "female" | "other";
    interestMatching: boolean;
    languageFilter: string;
  };
  stats?: {
    likesReceived: number;
    skipsGiven: number;
    skipsReceived: number;
    totalMessages: number;
    totalSessions: number;
    totalTimeSpent: number;
  };
  updatedAt: string;
  __v?: number;
};

export type GetMeResponse = {
  message: string;
  user: User;
};
