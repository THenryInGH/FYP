import { getAccessToken } from "./authStorage";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function getDevices() {
  const res = await fetch(`${API_BASE}/devices`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function getManagedDevices() {
  const res = await fetch(`${API_BASE}/devices/managed`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function getHosts() {
  const res = await fetch(`${API_BASE}/hosts`);
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

export async function deleteManagedDevice(deviceId: string) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/devices/${encodeURIComponent(deviceId)}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || `HTTP ${res.status}`);
  }
}

