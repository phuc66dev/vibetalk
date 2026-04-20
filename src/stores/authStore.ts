import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { login as loginService } from '../services/authService';
import { getMe } from '../services/userService';
import type { AuthStatus, LoginRequest, User } from '../types';

type AuthSession = {
  alias: string | null;
  currentUser: User | null;
};

type AuthStore = AuthSession & {
  authError: string | null;
  fetchCurrentUser: () => Promise<User>;
  isAuthenticated: boolean;
  loginWithCredentials: (payload: LoginRequest) => Promise<void>;
  clearAuthError: () => void;
  login: (alias?: string) => void;
  logout: () => void;
  status: AuthStatus;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      alias: null,
      authError: null,
      currentUser: null,
      isAuthenticated: false,
      clearAuthError: () => set({ authError: null, status: 'idle' }),
      fetchCurrentUser: async () => {
        const currentUser = await getMe();
        set({
          alias: currentUser.name,
          currentUser,
          isAuthenticated: true,
        });
        return currentUser;
      },
      loginWithCredentials: async (payload) => {
        set({ authError: null, status: 'loading' });

        try {
          await loginService(payload);
          const currentUser = await getMe();
          set({
            alias: currentUser.name,
            authError: null,
            currentUser,
            isAuthenticated: true,
            status: 'authenticated',
          });
        } catch (error) {
          set({
            alias: null,
            authError: error instanceof Error ? error.message : 'Unable to log in right now.',
            currentUser: null,
            isAuthenticated: false,
            status: 'error',
          });
          throw error;
        }
      },
      status: 'idle',
      login: (alias) =>
        set({
          alias: alias ?? null,
          authError: null,
          currentUser: null,
          isAuthenticated: true,
          status: 'authenticated',
        }),
      logout: () =>
        set({
          alias: null,
          authError: null,
          currentUser: null,
          isAuthenticated: false,
          status: 'idle',
        }),
    }),
    {
      name: 'stranger-auth',
      partialize: (state) => ({
        alias: state.alias,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
      storage: createJSONStorage(() => window.localStorage),
    },
  ),
);
