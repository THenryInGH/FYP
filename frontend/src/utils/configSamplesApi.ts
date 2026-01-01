import { getAccessToken } from "./authStorage";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export type ConfigSample = {
  sample_id: number;
  category?: string | null;
  intent_text?: string | null;
  config_json?: any;
  extra_metadata?: any;
};

function qs(params: Record<string, any>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export async function listConfigSamples(params: {
  q?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<ConfigSample[]> {
  const res = await fetch(`${API_BASE}/config-samples${qs(params)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ConfigSample[];
}

export async function createConfigSample(payload: {
  category: string;
  intent_text: string;
  config_json: any;
  extra_metadata?: any;
}): Promise<ConfigSample> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/config-samples`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
  return data as ConfigSample;
}

export async function deleteConfigSample(sampleId: number) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/config-samples/${sampleId}`, {
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

