import client from "./client";

export interface LoginPayload {
  email: string;
  password: string;
  website?: string;
  captchaToken?: string;
  captchaAngle?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AuthConfig {
  publicRegistration: boolean;
  emailEnabled: boolean;
}

export function getAuthConfig() {
  return client.get<AuthConfig>("/auth/config");
}

export function login(payload: LoginPayload) {
  return client.post<AuthResponse>("/auth/login", payload);
}

export function register(payload: {
  email: string;
  password: string;
  displayName: string;
  website?: string;
  captchaToken?: string;
  captchaAngle?: number;
  inviteToken?: string;
}) {
  return client.post<AuthResponse>("/auth/register", payload);
}

export function forgotPassword(payload: {
  email: string;
  website?: string;
  captchaToken?: string;
  captchaAngle?: number;
}) {
  return client.post<{ message: string }>("/auth/forgot-password", payload);
}

export function resetPassword(payload: { token: string; password: string }) {
  return client.post<{ message: string }>("/auth/reset-password", payload);
}

export function verifyEmail(token: string) {
  return client.get<{ message: string }>("/auth/verify-email", { params: { token } });
}

export function validateInvite(token: string) {
  return client.get<{ email: string; role: string }>("/auth/invite/validate", { params: { token } });
}
