import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { loginGoogle, login as loginService, register as registerService } from '../services/authService';
import { getMe } from '../services/userService';
import type { AuthStatus, LoginRequest, RegisterRequest, User } from '../types';

type AuthSession = {
  alias: string | null;
  currentUser: User | null;
};

type AuthStore = AuthSession & {
  fetchCurrentUser: () => Promise<User>;
  isAuthenticated: boolean;
  loginWithCredentials: (payload: LoginRequest) => Promise<void>;
  registerWithCredentials: (payload: RegisterRequest) => Promise<void>;
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
      clearAuthError: () => set({ status: 'idle' }),
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
        set({ status: 'loading' });

        try {
          await loginService(payload);
          const currentUser = await getMe();
          set({
            alias: currentUser?.name,
            currentUser,
            isAuthenticated: true,
            status: 'authenticated',
          });
          toast.success('Đăng nhập thành công!');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Không thể đăng nhập lúc này.';
          set({
            alias: null,
            currentUser: null,
            isAuthenticated: false,
            status: 'error',
          });
          toast.error(message);
          throw error;
        }
      },
      registerWithCredentials: async (payload) => {
        set({ status: 'loading' });

        try {
          await registerService(payload);
          set({
            status: 'idle',
          });
          toast.success('Đăng ký thành công!');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Không thể đăng ký lúc này.';
          set({
            status: 'error',
          });
          toast.error(message);
          throw error;
        }
      },
      status: 'idle',
      login: (alias) =>
        set({
          alias: alias ?? null,
          currentUser: null,
          isAuthenticated: true,
          status: 'authenticated',
        }),
      loginWithGoogle: async () => {
        set({ status: 'loading' });

        try {
          await loginGoogle();
          const currentUser = await getMe();
          set({
            alias: currentUser?.name,
            currentUser,
            isAuthenticated: true,
            status: 'authenticated',
          });
          toast.success('Đăng nhập thành công!');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Không thể đăng nhập lúc này.';
          set({
            alias: null,
            currentUser: null,
            isAuthenticated: false,
            status: 'error',
          });
          toast.error(message);
          throw error;
        }
      },

      logout: () =>
        set({
          alias: null,
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
