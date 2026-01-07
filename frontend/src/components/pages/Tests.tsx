import { useEffect, useMemo, useState } from "react";
import { iperfTest, listNamespaces, pingTest, type NamespaceInfo } from "../../utils/testsApi";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Tests() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [namespaces, setNamespaces] = useState<NamespaceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [iperfResult, setIperfResult] = useState<any | null>(null);

  const [src, setSrc] = useState<string>("");
  const [dstIp, setDstIp] = useState<string>("");
  const [dstNs, setDstNs] = useState<string>("");
  const [iperfProto, setIperfProto] = useState<"tcp" | "udp">("udp");
  const [iperfDuration, setIperfDuration] = useState<number>(5);
  const [iperfPort, setIperfPort] = useState<number>(5201);
  const [iperfUdpMbps, setIperfUdpMbps] = useState<number>(10);

  const srcOptions = namespaces;

  const selectedSrc = useMemo(() => namespaces.find((n) => n.name === src) ?? null, [namespaces, src]);
  const selectedDst = useMemo(() => namespaces.find((n) => n.name === dstNs) ?? null, [namespaces, dstNs]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await listNamespaces();
      setNamespaces(list);
      if (!src && list.length) setSrc(list[0].name);
      if (!dstNs && list.length) setDstNs(list[0].name);
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
    setIperfResult(null);
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

  async function runIperf() {
    setError(null);
    setResult(null);
    setIperfResult(null);
    if (!user) {
      nav("/login");
      return;
    }
    if (!src || !dstNs) {
      setError("Please select a source and destination namespace.");
      return;
    }
    const ip = selectedDst?.ips?.[0] ?? "";
    if (!ip) {
      setError("Destination namespace has no IP address.");
      return;
    }
    try {
      const res = await iperfTest({
        src_ns: src,
        dst_ns: dstNs,
        dst_ip: ip,
        protocol: iperfProto,
        port: iperfPort,
        duration_seconds: iperfDuration,
        udp_mbps: iperfProto === "udp" ? iperfUdpMbps : undefined,
      });
      setIperfResult(res);
    } catch (e: any) {
      setError(e?.message || "iperf failed");
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

      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">iperf3 test</h2>
            <p className="text-sm text-gray-600">
              Run iperf3 with server in the destination namespace and client in the source namespace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-gray-700">Destination namespace</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={dstNs}
              onChange={(e) => setDstNs(e.target.value)}
              disabled={!user}
            >
              <option value="" disabled>
                Select...
              </option>
              {namespaces.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.name} {n.ips?.length ? `(${n.ips[0]})` : ""}
                </option>
              ))}
            </select>
            {selectedDst?.ips?.[0] ? <p className="mt-1 text-xs text-gray-500">Destination IP: {selectedDst.ips[0]}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Protocol</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={iperfProto}
              onChange={(e) => setIperfProto(e.target.value as "tcp" | "udp")}
              disabled={!user}
            >
              <option value="udp">UDP (loss/jitter)</option>
              <option value="tcp">TCP (throughput)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              className="w-full bg-[#0a1128] text-white rounded-lg px-3 py-2 text-sm disabled:opacity-60"
              type="button"
              onClick={runIperf}
              disabled={!user}
            >
              Run iperf
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              type="number"
              min={1}
              max={60}
              value={iperfDuration}
              onChange={(e) => setIperfDuration(Number(e.target.value))}
              disabled={!user}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Port</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              type="number"
              min={1}
              max={65535}
              value={iperfPort}
              onChange={(e) => setIperfPort(Number(e.target.value))}
              disabled={!user}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">UDP bandwidth (Mbps)</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              type="number"
              min={1}
              max={10000}
              value={iperfUdpMbps}
              onChange={(e) => setIperfUdpMbps(Number(e.target.value))}
              disabled={!user || iperfProto !== "udp"}
            />
            <p className="mt-1 text-xs text-gray-500">Only used for UDP tests.</p>
          </div>
        </div>

        {iperfResult ? (
          <div className="mt-2">
            <div className={`p-3 rounded-lg text-sm ${iperfResult.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
              {iperfResult.ok ? "Completed" : "Failed"} · throughput{" "}
              {iperfResult.summary?.throughput_mbps != null ? `${iperfResult.summary.throughput_mbps.toFixed(2)} Mbps` : "?"}
              {iperfResult.protocol === "udp" ? (
                <>
                  {" "}
                  · jitter {iperfResult.summary?.jitter_ms ?? "?"} ms · loss {iperfResult.summary?.loss_pct ?? "?"}%
                </>
              ) : null}
            </div>
            <details className="mt-2">
              <summary className="text-sm cursor-pointer text-gray-700">Raw output (client/server)</summary>
              <pre className="mt-2 text-xs bg-gray-50 border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {String(iperfResult.client_raw ?? "")}
              </pre>
              <pre className="mt-2 text-xs bg-gray-50 border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {String(iperfResult.server_raw ?? "")}
              </pre>
            </details>
          </div>
        ) : null}
      </div>
    </div>
  );
}




