import { create } from 'zustand';
import type { UserProfile } from '@/types/api';

export type AuthStatus = 'unknown' | 'unauthenticated' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: UserProfile | null;

  setSession: (s: { token: string; refreshToken: string; expiresAt: number; user: UserProfile }) => void;
  setToken: (token: string, expiresAt: number) => void;
  setUnauthenticated: () => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'unknown',
  token: null,
  refreshToken: null,
  expiresAt: null,
  user: null,

  setSession: ({ token, refreshToken, expiresAt, user }) =>
    set({ status: 'authenticated', token, refreshToken, expiresAt, user }),

  setToken: (token, expiresAt) => set({ token, expiresAt }),

  setUnauthenticated: () => set({ status: 'unauthenticated' }),

  clearSession: () =>
    set({ status: 'unauthenticated', token: null, refreshToken: null, expiresAt: null, user: null }),
}));

/** Non-reactive accessor for the API client and WebSocket auth handshake. */
export const getAuthToken = (): string | null => useAuthStore.getState().token;
export const getRefreshToken = (): string | null => useAuthStore.getState().refreshToken;
