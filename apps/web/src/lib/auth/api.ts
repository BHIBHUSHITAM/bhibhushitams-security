import type { AuthResponse } from "./types";
import { authFetch, parseApiJson } from "./http";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
  role: "student" | "company";
}) {
  const response = await authFetch(
    `${API_BASE_URL}/auth/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { retryOnUnauthorized: false }
  );

  return parseApiJson<AuthResponse>(response, { redirectOnUnauthorized: false });
}

export async function login(payload: { email: string; password: string }) {
  const response = await authFetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { retryOnUnauthorized: false }
  );

  return parseApiJson<AuthResponse>(response, { redirectOnUnauthorized: false });
}

export async function getCurrentUser() {
  const response = await authFetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
  });

  return parseApiJson<{ user: AuthResponse["user"] }>(response);
}

export async function logout() {
  const response = await authFetch(
    `${API_BASE_URL}/auth/logout`,
    {
    method: "POST",
    },
    { retryOnUnauthorized: false }
  );

  return parseApiJson<{ message: string }>(response, { redirectOnUnauthorized: false });
}
