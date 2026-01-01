import { getAccessToken } from "./authStorage";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export type Conversation = {
  conversation_id: number;
  title?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Message = {
  message_id: number;
  conversation_id: number;
  role: "user" | "assistant" | "system" | string;
  content: string;
  created_at?: string | null;
};

function authHeaders() {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function readError(res: Response) {
  const data = await res.json().catch(() => ({}));
  const detail = (data as any)?.detail;
  return typeof detail === "string" ? detail : `HTTP ${res.status}`;
}

export async function listConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/chat/conversations`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Conversation[];
}

export async function createConversation(title?: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/chat/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title: title ?? null }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Conversation;
}

export async function listMessages(conversationId: number): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Message[];
}

export async function sendMessage(conversationId: number, payload: { content: string; model?: string; use_rag?: boolean }) {
  const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      content: payload.content,
      model: payload.model,
      use_rag: payload.use_rag ?? true,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as any)?.detail;
    throw new Error(typeof detail === "string" ? detail : `HTTP ${res.status}`);
  }
  return data as {
    conversation: Conversation;
    user_message: Message;
    assistant_message: Message;
  };
}

