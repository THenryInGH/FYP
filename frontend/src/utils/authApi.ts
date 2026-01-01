const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

function formatFastApiDetail(detail: any): string {
  if (!detail) return "Request failed";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Typical FastAPI/Pydantic v2 shape for 422:
    // [{loc: [...], msg: "...", type: "..."}]
    const parts = detail
      .map((e) => {
        const loc = Array.isArray(e?.loc) ? e.loc.join(".") : undefined;
        const msg = e?.msg ?? e?.message ?? String(e);
        return loc ? `${loc}: ${msg}` : msg;
      })
      .filter(Boolean);
    return parts.length ? parts.join("; ") : "Request failed";
  }
  if (typeof detail === "object") {
    // Sometimes we get {detail: {...}} or other objects
    try {
      return JSON.stringify(detail);
    } catch {
      return String(detail);
    }
  }
  return String(detail);
}

export type UserPublic = {
  user_id: number;
  username: string;
  email: string;
  created_at?: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: UserPublic;
};

export async function registerUser(payload: {
  username: string;
  email: string;
  password: string;
}): Promise<UserPublic> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatFastApiDetail(data?.detail) || `HTTP ${res.status}`);
  return data as UserPublic;
}

export async function loginUser(payload: {
  usernameOrEmail: string;
  password: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username_or_email: payload.usernameOrEmail,
      password: payload.password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatFastApiDetail(data?.detail) || `HTTP ${res.status}`);
  return data as TokenResponse;
}

export async function getMe(token: string): Promise<UserPublic> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatFastApiDetail(data?.detail) || `HTTP ${res.status}`);
  return data as UserPublic;
}

