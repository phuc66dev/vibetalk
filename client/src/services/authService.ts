import { API_BASE_URL, apiClient } from "./apiClient";
import type { AuthResponse, LoginRequest, RegisterRequest, ResetPasswordRequest } from "../types";

export function getOAuthAuthorizeUrl(provider: "google" | "github") {
  return `${API_BASE_URL}/auth/${provider}`;
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", credentials);
}

export async function register(credentials: RegisterRequest): Promise<void> {
  await apiClient.post("/auth/register", credentials);
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  await apiClient.post(`/auth/reset-password?token=${payload.token}`, { resetPassword: payload.newPassword });
}

