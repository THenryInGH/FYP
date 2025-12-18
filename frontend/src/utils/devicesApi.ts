import { getAccessToken } from "./authStorage";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function getDevices() {
  const res = await fetch(`${API_BASE}/devices`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function setDeviceFriendlyName(deviceId: string, name: string | null) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/devices/${encodeURIComponent(deviceId)}/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || `HTTP ${res.status}`);
  }
}

