import { useEffect, useMemo, useState } from "react";
import { listNamespaces, pingTest, type NamespaceInfo } from "../../utils/testsApi";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Tests() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [namespaces, setNamespaces] = useState<NamespaceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const [src, setSrc] = useState<string>("");
  const [dstIp, setDstIp] = useState<string>("");

  const srcOptions = namespaces;

  const selectedSrc = useMemo(() => namespaces.find((n) => n.name === src) ?? null, [namespaces, src]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await listNamespaces();
      setNamespaces(list);
      if (!src && list.length) setSrc(list[0].name);
    } catch (e: any) {
      setError(e?.message || "Failed to load namespaces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  async function runPing() {
    setError(null);
    setResult(null);
    if (!user) {
      nav("/login");
      return;
    }
    if (!src || !dstIp) {
      setError("Please select a source namespace and destination IP.");
      return;
    }
    try {
      const res = await pingTest({ src_ns: src, dst_ip: dstIp, count: 3, timeout_seconds: 6 });
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "Ping failed");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
      <p className="text-sm text-gray-600 mt-1">
        Run connectivity checks inside Linux namespaces (server-side). Login required.
      </p>

      {!user ? (
        <div className="mt-4 p-3 rounded-lg bg-yellow-50 text-yellow-800 text-sm">
          Please login to run tests.{" "}
          <button className="underline" onClick={() => nav("/login")} type="button">
            Go to login
          </button>
        </div>
      ) : null}

      {error ? <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div> : null}

      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ping test</h2>
            <p className="text-sm text-gray-600">Run ping from a namespace to a destination IP.</p>
          </div>
          <button className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50" onClick={load} disabled={loading || !user} type="button">
            {loading ? "Refreshing..." : "Refresh namespaces"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Source namespace</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              disabled={!user}
            >
              <option value="" disabled>
                Select...
              </option>
              {srcOptions.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.name} {n.ips?.length ? `(${n.ips[0]})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Destination IP</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={dstIp}
              onChange={(e) => setDstIp(e.target.value)}
              placeholder="e.g. 10.0.0.2"
              disabled={!user}
            />
            {selectedSrc?.ips?.length ? (
              <p className="mt-1 text-xs text-gray-500">Tip: other hosts are typically 10.0.0.x</p>
            ) : null}
          </div>

          <div className="flex items-end">
            <button
              className="w-full bg-[#0a1128] text-white rounded-lg px-3 py-2 text-sm disabled:opacity-60"
              type="button"
              onClick={runPing}
              disabled={!user}
            >
              Run ping
            </button>
          </div>
        </div>

        {result ? (
          <div className="mt-2">
            <div className={`p-3 rounded-lg text-sm ${result.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
              {result.ok ? "Reachable" : "Unreachable"} · loss {result.loss_pct ?? "?"}% · avg rtt {result.rtt_avg_ms ?? "?"} ms
            </div>
            <details className="mt-2">
              <summary className="text-sm cursor-pointer text-gray-700">Raw output</summary>
              <pre className="mt-2 text-xs bg-gray-50 border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {String(result.raw ?? "")}
              </pre>
            </details>
          </div>
        ) : null}
      </div>
    </div>
  );
}




