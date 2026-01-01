import { useEffect, useMemo, useState } from "react";
import { getDevices, setDeviceFriendlyName } from "../../utils/devicesApi";
import { useAuth } from "../../auth/AuthContext";

type DeviceRow = {
  id: string;
  type?: string;
  friendly_name?: string | null;
};

function stripOfPrefix(id: string) {
  return id.replace(/^of:/, "");
}

export default function DeviceNameManager() {
  const { user } = useAuth();
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await getDevices();
      const list: DeviceRow[] = (data?.devices ?? []).map((d: any) => ({
        id: d.id,
        type: d.type,
        friendly_name: d.friendly_name ?? null,
      }));
      setRows(list);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const d of list) {
          if (!(d.id in next)) next[d.id] = d.friendly_name ?? "";
        }
        return next;
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => stripOfPrefix(a.id).localeCompare(stripOfPrefix(b.id)));
  }, [rows]);

  async function save(deviceId: string) {
    setSaving(deviceId);
    setError(null);
    setSuccess(null);
    try {
      const name = (drafts[deviceId] ?? "").trim();
      await setDeviceFriendlyName(deviceId, name.length ? name : null);
      setRows((prev) =>
        prev.map((r) => (r.id === deviceId ? { ...r, friendly_name: name.length ? name : null } : r))
      );
      setSuccess("Saved device name.");
    } catch (e: any) {
      setError(e?.message || "Failed to save name");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Device names</h3>
          <p className="text-sm text-gray-600 mt-1">
            Friendly names are stored in the database and used in the topology canvas.
          </p>
        </div>
        <button
          className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
          onClick={load}
          type="button"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!user ? (
        <div className="mt-4 p-3 rounded-lg bg-yellow-50 text-yellow-800 text-sm">
          Login is required to edit device names.
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      ) : null}
      {success ? (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">{success}</div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-3">Device ID</th>
              <th className="py-2 pr-3">Current label</th>
              <th className="py-2 pr-3">Friendly name</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => {
              const currentLabel = d.friendly_name?.trim()
                ? d.friendly_name
                : stripOfPrefix(d.id);
              const isSaving = saving === d.id;
              return (
                <tr key={d.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-3 font-mono text-xs text-gray-700">{d.id}</td>
                  <td className="py-3 pr-3 text-gray-900">{currentLabel}</td>
                  <td className="py-3 pr-3">
                    <input
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring disabled:bg-gray-50"
                      value={drafts[d.id] ?? ""}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [d.id]: e.target.value }))}
                      placeholder="e.g. CoreSwitch-1"
                      disabled={!user || isSaving}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      className="text-sm px-3 py-2 rounded-lg bg-[#0a1128] text-white disabled:opacity-60"
                      type="button"
                      onClick={() => save(d.id)}
                      disabled={!user || isSaving}
                      title={!user ? "Login required" : "Save"}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!sorted.length ? (
              <tr>
                <td className="py-4 text-gray-500" colSpan={4}>
                  {loading ? "Loading..." : "No devices found."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

