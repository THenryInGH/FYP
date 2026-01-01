import { useEffect, useMemo, useState } from "react";
import { deleteManagedDevice, getManagedDevices, setDeviceFriendlyName } from "../../utils/devicesApi";
import { useAuth } from "../../auth/AuthContext";

type ManagedRow = {
  device_id: string;
  name: string | null;
  type: string | null;
  active: boolean | null;
};

function stripOfPrefix(id: string) {
  return id.replace(/^of:/, "");
}

export default function Devices() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ManagedRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await getManagedDevices();
      const list: ManagedRow[] = data?.devices ?? [];
      setRows(list);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const d of list) {
          if (!(d.device_id in next)) next[d.device_id] = d.name ?? "";
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
    return [...rows].sort((a, b) => stripOfPrefix(a.device_id).localeCompare(stripOfPrefix(b.device_id)));
  }, [rows]);

  async function save(deviceId: string) {
    setSaving(deviceId);
    setError(null);
    setSuccess(null);
    try {
      const name = (drafts[deviceId] ?? "").trim();
      await setDeviceFriendlyName(deviceId, name.length ? name : null);
      setRows((prev) =>
        prev.map((r) => (r.device_id === deviceId ? { ...r, name: name.length ? name : null } : r))
      );
      setSuccess("Saved.");
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(null);
    }
  }

  async function remove(deviceId: string) {
    if (!confirm(`Delete ${deviceId} from DB? This does not delete it from ONOS.`)) return;
    setDeleting(deviceId);
    setError(null);
    setSuccess(null);
    try {
      await deleteManagedDevice(deviceId);
      setRows((prev) => prev.filter((r) => r.device_id !== deviceId));
      setSuccess("Deleted.");
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage friendly names stored in the DB. You can also delete stale rows that are no longer present.
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
          Login is required to edit or delete device rows.
        </div>
      ) : null}

      {error ? <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div> : null}
      {success ? (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">{success}</div>
      ) : null}

      <div className="mt-4 overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Active (ONOS)</th>
              <th className="py-3 px-4">Friendly name</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const isSaving = saving === r.device_id;
              const isDeleting = deleting === r.device_id;
              return (
                <tr key={r.device_id} className="border-b last:border-b-0">
                  <td className="py-3 px-4 font-mono text-xs text-gray-700">{r.device_id}</td>
                  <td className="py-3 px-4 text-gray-800">{r.type ?? "-"}</td>
                  <td className="py-3 px-4 text-gray-800">
                    {r.active === null ? "-" : r.active ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring disabled:bg-gray-50"
                      value={drafts[r.device_id] ?? ""}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [r.device_id]: e.target.value }))}
                      placeholder={r.type === "host" ? "e.g. Host-1" : "e.g. CoreSwitch-1"}
                      disabled={!user || isSaving || isDeleting}
                    />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      className="text-sm px-3 py-2 rounded-lg bg-[#0a1128] text-white disabled:opacity-60"
                      type="button"
                      onClick={() => save(r.device_id)}
                      disabled={!user || isSaving || isDeleting}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="ml-2 text-sm px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                      type="button"
                      onClick={() => remove(r.device_id)}
                      disabled={!user || isSaving || isDeleting}
                      title={r.active ? "Device is active in ONOS; deletion only removes DB row" : "Delete DB row"}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!sorted.length ? (
              <tr>
                <td className="py-6 px-4 text-gray-500" colSpan={5}>
                  {loading ? "Loading..." : "No rows in DB devices table yet."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

