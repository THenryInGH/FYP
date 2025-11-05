const ONOS_API = import.meta.env.VITE_ONOS_API;
const ONOS_USER = import.meta.env.VITE_ONOS_USERNAME;
const ONOS_PASS = import.meta.env.VITE_ONOS_PASSWORD;

const baseAuth = "Basic " + btoa(`${ONOS_USER}:${ONOS_PASS}`);

async function get(endpoint: string) {
  try {
    const res = await fetch(`${ONOS_API}${endpoint}`, {
      headers: { Authorization: baseAuth },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("ONOS API error:", err);
    return null;
  }
}

async function post(endpoint: string, body: any) {
  try {
    const res = await fetch(`${ONOS_API}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: baseAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("ONOS POST error:", err);
    return null;
  }
}

async function del(endpoint: string) {
  try {
    const res = await fetch(`${ONOS_API}${endpoint}`, {
      method: "DELETE",
      headers: { Authorization: baseAuth },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error("ONOS DELETE error:", err);
    return false;
  }
}

// ------------------------------
// Exported ONOS API methods
// ------------------------------
export const onosApi = {
  // --- GETs ---
  getDevices: () => get("/devices"),
  getHosts: () => get("/hosts"),
  getLinks: () => get("/links"),
  getFlows: () => get("/flows"),
  getIntents: () => get("/intents"),

  // --- DELETE ---
  deleteIntent: (appId: string, key: string) => del(`/intents/${appId}/${key}`),

  // --- POST ---
  // Apply configuration (LLM-generated JSON or intent)
  applyConfiguration: (configText: string) => {
    try {
      // Step 1: Try to extract JSON block if response contains ```json ... ```
      const jsonMatch = configText.match(/```json\s*([\s\S]*?)```/i);
      const cleanJson = jsonMatch ? jsonMatch[1] : configText.trim();

      // Step 2: Try to parse JSON
      const parsed = JSON.parse(cleanJson);

      // Step 3: POST to ONOS
      return post("/intents", parsed);
    } catch (err) {
      console.error("Invalid configuration JSON:", err);
      alert("Invalid configuration format. Please ensure it's valid JSON.");
      return null;
    }
  },


  // --- METRICS ---
  getMetrics: async () => {
    const [devices, hosts, links, flows] = await Promise.all([
      get("/devices"),
      get("/hosts"),
      get("/links"),
      get("/flows"),
    ]);
    return {
      // Return counts of each entity, this is the variable holding the JSON response from the ONOS API
      // E.g., 1. if devices exists and inside devices there is a field called devices which is an array, return its length
      devices: devices?.devices?.length || 0,
      hosts: hosts?.hosts?.length || 0,
      links: links?.links?.length || 0,
      flows: flows?.flows?.length || 0,
    };
  },
};
