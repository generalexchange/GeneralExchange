import { API_BASE_URL } from '@/lib/constants';
import { useAuthStore, getAuthToken, getRefreshToken } from '@/stores/authStore';
import type { ApiEnvelope, ApiError, AuthResponse } from '@/types/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** skip the Authorization header (used by the login call) */
  anonymous?: boolean;
  /** internal: prevents infinite refresh recursion */
  _retried?: boolean;
  signal?: AbortSignal;
}

function buildError(status: number, code: string, message: string): ApiError {
  return { status, code, message };
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Attempt a silent token refresh using the stored refresh token. De-duplicates
 * concurrent refreshes so a burst of 401s only triggers one network call.
 */
export async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const env = (await res.json()) as ApiEnvelope<AuthResponse>;
      const { token, refreshToken: nextRefresh, expiresAt, user } = env.data;
      useAuthStore.getState().setSession({ token, refreshToken: nextRefresh, expiresAt, user });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, anonymous = false, signal } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!anonymous) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (e) {
    throw buildError(0, 'network_error', e instanceof Error ? e.message : 'Network request failed');
  }

  if (res.status === 401 && !anonymous && !options._retried) {
    const ok = await refreshSession();
    if (ok) return request<T>(path, { ...options, _retried: true });
    useAuthStore.getState().clearSession();
    throw buildError(401, 'unauthorized', 'Session expired');
  }

  if (!res.ok) {
    let code = 'http_error';
    let message = res.statusText;
    try {
      const errBody = await res.json();
      code = errBody.code ?? code;
      message = errBody.message ?? message;
    } catch {
      /* keep defaults */
    }
    throw buildError(res.status, code, message);
  }

  if (res.status === 204) return undefined as T;

  const env = (await res.json()) as ApiEnvelope<T>;
  return env.data;
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
