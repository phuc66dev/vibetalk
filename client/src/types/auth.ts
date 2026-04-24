export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  alias: string | null;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
};
