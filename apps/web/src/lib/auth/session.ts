import type { AuthUser } from "./types";

export function persistSession(user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("bss_user", JSON.stringify(user));
  document.cookie = `userRole=${user.role}; path=/; max-age=604800; samesite=lax`;
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("bss_user");
  document.cookie = "userRole=; path=/; max-age=0";
}
