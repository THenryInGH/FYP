import { getAccessToken } from "./authStorage";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

function authHeaders() {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export type NamespaceInfo = { name: string; ips: string[] };

export async function listNamespaces(): Promise<NamespaceInfo[]> {
  const res = await fetch(`${API_BASE}/tests/namespaces`, { headers: { ...authHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
  return (data?.namespaces ?? []) as NamespaceInfo[];
}

export async function pingTest(payload: { src_ns: string; dst_ip: string; count?: number; timeout_seconds?: number }) {
  const res = await fetch(`${API_BASE}/tests/ping`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
  return data as any;
}

export type IperfPayload = {
  src_ns: string;
  dst_ns: string;
  dst_ip: string;
  protocol: "tcp" | "udp";
  port?: number;
  duration_seconds?: number;
  udp_mbps?: number; // only used for udp
  tos?: string | null; // e.g. "0xb8"
};

export async function iperfTest(payload: IperfPayload) {
  const res = await fetch(`${API_BASE}/tests/iperf`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
  return data as any;
}




