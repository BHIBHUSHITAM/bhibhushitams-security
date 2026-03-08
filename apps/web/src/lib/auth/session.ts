import type { AuthUser } from "./types";

const ACCESS_TOKEN_KEY = "bss_access_token";
const REFRESH_TOKEN_KEY = "bss_refresh_token";

export function persistSession(
  user: AuthUser,
  tokens?: { accessToken?: string; refreshToken?: string }
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("bss_user", JSON.stringify(user));
  if (tokens?.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  }
  if (tokens?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
  document.cookie = `userRole=${user.role}; path=/; max-age=604800; samesite=lax`;
}

export function persistTokens(tokens: { accessToken?: string; refreshToken?: string }) {
  if (typeof window === "undefined") {
    return;
  }

  if (tokens.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  }

  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("bss_user");
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = "userRole=; path=/; max-age=0";
}
