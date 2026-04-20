import { apiClient } from "./apiClient";
import type { LoginRequest, LoginResponse } from "../types";

type RawLoginResponse = {
  alias?: string;
  user?: {
    alias?: string;
    username?: string;
  };
};

function deriveAlias(response: RawLoginResponse, email: string) {
  return (
    response.alias ??
    response.user?.alias ??
    response.user?.username ??
    email.split("@")[0] ??
    null
  );
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<RawLoginResponse>(
    "/auth/login",
    credentials,
  );

  return {
    alias: deriveAlias(response, credentials.email),
  };
}
