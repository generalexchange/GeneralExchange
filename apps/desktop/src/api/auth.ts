import { apiClient, refreshSession } from '@/api/client';
import type { AuthResponse } from '@/types/api';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/v1/auth/login', { email, password }, { anonymous: true }),

  logout: () => apiClient.post<{ ok: boolean }>('/v1/auth/logout'),

  /** Re-export the de-duplicated refresh from the client. */
  refresh: refreshSession,
};
