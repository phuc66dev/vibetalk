const ACCESS_TOKEN_KEY = "vibetalk.access_token";
const REFRESH_TOKEN_KEY = "vibetalk.refresh_token";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readToken(key: string) {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(key);
}

function writeToken(key: string, value: string | null) {
  if (!canUseStorage()) {
    return;
  }

  if (value) {
    window.localStorage.setItem(key, value);
    return;
  }

  window.localStorage.removeItem(key);
}

export function getAccessToken() {
  return readToken(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return readToken(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens) {
  writeToken(ACCESS_TOKEN_KEY, tokens.accessToken);
  writeToken(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  writeToken(ACCESS_TOKEN_KEY, null);
  writeToken(REFRESH_TOKEN_KEY, null);
}
