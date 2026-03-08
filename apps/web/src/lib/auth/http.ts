import { clearSession } from "./session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  clearSession();
  window.location.replace("/login?session=expired");
}

async function tryRefreshToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({}),
  });

  return response.ok;
}

export async function authFetch(
  input: string,
  init?: RequestInit,
  options?: { retryOnUnauthorized?: boolean }
): Promise<Response> {
  const retryOnUnauthorized = options?.retryOnUnauthorized ?? true;

  const requestInit: RequestInit = {
    credentials: "include",
    ...init,
  };

  const response = await fetch(input, requestInit);
  if (response.status !== 401 || !retryOnUnauthorized) {
    return response;
  }

  const refreshed = await tryRefreshToken();
  if (!refreshed) {
    redirectToLogin();
    return response;
  }

  return fetch(input, requestInit);
}

export async function parseApiJson<T>(
  response: Response,
  options?: { redirectOnUnauthorized?: boolean }
): Promise<T> {
  const redirectOnUnauthorized = options?.redirectOnUnauthorized ?? true;
  const body = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    const message = body.message ?? "Request failed";

    if (response.status === 401 && redirectOnUnauthorized) {
      redirectToLogin();
      throw new Error("Session expired. Please login again.");
    }

    throw new Error(message);
  }

  return body;
}
