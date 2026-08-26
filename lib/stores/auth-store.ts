import { create } from 'zustand';
import { AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    // Set lightweight cookie for Next.js middleware routing
    if (typeof document !== 'undefined') {
      document.cookie = `auth_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
    }
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setAccessToken: (accessToken) => {
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    if (typeof document !== 'undefined') {
      document.cookie = `auth_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
    }
    set({ user });
  },

  clearAuth: () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Lax';
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
