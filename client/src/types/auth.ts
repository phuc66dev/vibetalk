import type { User } from './user';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = AuthTokens & {
  user: User;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};
