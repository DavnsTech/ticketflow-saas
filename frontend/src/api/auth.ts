import client from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  displayName: string;
  role: string;
}

export function login(payload: LoginPayload) {
  return client.post<AuthResponse>("/auth/login", payload);
}

export function register(payload: { email: string; password: string; displayName: string }) {
  return client.post<AuthResponse>("/auth/register", payload);
}
