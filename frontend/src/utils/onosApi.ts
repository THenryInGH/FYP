// src/utils/onosApi.ts
const ONOS_API = import.meta.env.VITE_ONOS_API;
const ONOS_USER = import.meta.env.VITE_ONOS_USERNAME;
const ONOS_PASS = import.meta.env.VITE_ONOS_PASSWORD;

const authHeader = {
  Authorization: "Basic " + btoa(`${ONOS_USER}:${ONOS_PASS}`),
};

async function get(endpoint: string) {
  try {
    const res = await fetch(`${ONOS_API}${endpoint}`, { headers: authHeader });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("ONOS API error:", err);
    return null;
  }
}

export const onosApi = {
  getDevices: () => get("/devices"),
  getHosts: () => get("/hosts"),
  getLinks: () => get("/links"),
  getFlows: () => get("/flows"),
  getIntents: () => get("/intents"),
  getMetrics: async () => {
    const [devices, hosts, links, flows] = await Promise.all([
      get("/devices"),
      get("/hosts"),
      get("/links"),
      get("/flows"),
    ]);
    return {
      devices: devices?.devices?.length || 0,
      hosts: hosts?.hosts?.length || 0,
      links: links?.links?.length || 0,
      flows: flows?.flows?.length || 0,
    };
  },
};
