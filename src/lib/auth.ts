'use client';

// Token-based admin auth. The admin app talks ONLY to the backend — it never
// connects to Supabase. The backend verifies credentials server-side and returns
// a signed JWT, which we store and send as a Bearer token on every API call.

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const TOKEN_KEY = 'fc_admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

/** Decode the JWT payload without verifying (verification is the backend's job). */
function decode(token: string): { exp?: number } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/** Cheap client-side check: do we have a token that hasn't obviously expired? */
export function hasValidToken(): boolean {
  const token = getToken();
  if (!token) return false;
  const payload = decode(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    let message = 'Login failed';
    try {
      message = (await res.json()).error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const data = (await res.json()) as { token: string };
  setToken(data.token);
}

/** Validate the current token against the backend. */
export async function me(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${BASE}/api/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function logout() {
  clearToken();
}
