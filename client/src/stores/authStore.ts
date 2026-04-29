import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { clearTokens, setTokens } from '../services/tokenStorage';
import { resetPassword as resetPasswordService, forgotPassword as forgotPasswordService, logout, login as loginService, register as registerService } from '../services/authService';
import { getMe } from '../services/userService';
import type { AuthStatus, AuthTokens, LoginRequest, RegisterRequest, User, ResetPasswordRequest } from '../types';

type AuthSession = {
  alias: string | null;
  currentUser: User | null;
};

type AuthStore = AuthSession & {
  clearSession: () => void;
  fetchCurrentUser: () => Promise<User>;
  isAuthenticated: boolean;
  loginWithCredentials: (payload: LoginRequest) => Promise<void>;
  registerWithCredentials: (payload: RegisterRequest) => Promise<void>;
  clearAuthError: () => void;
  login: (alias?: string) => void;
  logout: () => Promise<void>;
  setSessionTokens: (tokens: AuthTokens) => void;
  forgotPassword: (payload: string) => Promise<void>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<void>;
  status: AuthStatus;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      alias: null,
      currentUser: null,
      isAuthenticated: false,
      clearAuthError: () => set({ status: 'idle' }),
      clearSession: () => {
        clearTokens();
        set({
          alias: null,
          currentUser: null,
          isAuthenticated: false,
          status: 'idle',
        });
      },
      fetchCurrentUser: async () => {
        const currentUser = await getMe();
        set({
          alias: currentUser.name,
          currentUser,
          isAuthenticated: true,
        });
        return currentUser;
      },
      setSessionTokens: (tokens) => {
        setTokens(tokens);
      },
      loginWithCredentials: async (payload) => {
        set({ status: 'loading' });

        try {
          const session = await loginService(payload);
          setTokens(session);
          set({
            alias: session.user.name,
            currentUser: session.user,
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
      logout: async () => {
        try {
          await logout();
        } finally {
          clearTokens();
          set({
            alias: null,
            currentUser: null,
            isAuthenticated: false,
            status: 'idle',
          });
        }
        toast.success('Đăng xuất thành công!');
      },

      forgotPassword: async (payload) => {
        try {
          await forgotPasswordService(payload);
          toast.success('Recovery code sent to your email!');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cannot send password reset request.';
          toast.error(message);
          throw error;
        }
      },
      resetPassword: async (payload) => {
        try {
          await resetPasswordService(payload);
          toast.success('Password reset successfully! Login again!');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Cannot reset password.';
          toast.error(message);
          throw error;
        }
      },
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
