// Response envelopes shared by every REST call.

export interface ApiEnvelope<T> {
  data: T;
  requestId?: string;
  asOf?: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  plan: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  user: UserProfile;
}

export interface WsMessage<T = unknown> {
  topic: string;
  payload: T;
  at?: number;
}
