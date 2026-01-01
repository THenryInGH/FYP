import { useEffect, useMemo, useState } from "react";
import { createConfigSample, deleteConfigSample, listConfigSamples, type ConfigSample } from "../../utils/configSamplesApi";
import { useAuth } from "../../auth/AuthContext";

function pretty(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function safeParseJson(text: string): { ok: true; value: any } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

export default function ConfigLibrary() {
  const { user } = useAuth();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ConfigSample[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [newCategory, setNewCategory] = useState("");
  const [newIntent, setNewIntent] = useState("");
  const [newConfigText, setNewConfigText] = useState("{\n  \n}");
  const [newExtraText, setNewExtraText] = useState("{}");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load(params?: { q?: string; category?: string }) {
    setLoading(true);
    setError(null);
    try {
      const data = await listConfigSamples({
        q: params?.q ?? q,
        category: params?.category ?? category,
        limit: 20,
        offset: 0,
      });
      setRows(data);
      if (data.length && selectedId == null) setSelectedId(data[0].sample_id);
      if (selectedId != null && !data.some((r) => r.sample_id === selectedId)) {
        setSelectedId(data[0]?.sample_id ?? null);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load samples");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({ q: "", category: "" }); // latest 20
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(() => rows.find((r) => r.sample_id === selectedId) ?? null, [rows, selectedId]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    await load();
  }

  async function onUploadJson(file: File) {
    const text = await file.text();
    const parsed = safeParseJson(text);
    if (!parsed.ok) {
      setError(`Invalid JSON file: ${parsed.error}`);
      return;
    }
    setNewConfigText(pretty(parsed.value));
  }

  async function onCreate() {
    setError(null);
    setSuccess(null);
    if (!user) {
      setError("Login required to add samples.");
      return;
    }
    if (!newCategory.trim() || !newIntent.trim()) {
      setError("Category and intent text are required.");
      return;
    }
    const cfg = safeParseJson(newConfigText);
    if (!cfg.ok) {
      setError(`Config JSON invalid: ${cfg.error}`);
      return;
    }
    const extra = safeParseJson(newExtraText);
    if (!extra.ok) {
      setError(`Extra metadata JSON invalid: ${extra.error}`);
      return;
    }

    setCreating(true);
    try {
      const created = await createConfigSample({
        category: newCategory.trim(),
        intent_text: newIntent.trim(),
        config_json: cfg.value,
        extra_metadata: extra.value,
      });
      setSuccess("Sample added.");
      setRows((prev) => [created, ...prev].slice(0, 20));
      setSelectedId(created.sample_id);
      setNewIntent("");
      setNewConfigText("{\n  \n}");
      setNewExtraText("{}");
    } catch (e: any) {
      setError(e?.message || "Failed to create sample");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(sampleId: number) {
    if (!user) {
      setError("Login required to delete samples.");
      return;
    }
    if (!confirm(`Delete sample ${sampleId}?`)) return;
    setDeleting(sampleId);
    setError(null);
    setSuccess(null);
    try {
      await deleteConfigSample(sampleId);
      setRows((prev) => prev.filter((r) => r.sample_id !== sampleId));
      setSuccess("Deleted.");
      if (selectedId === sampleId) setSelectedId(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Samples</h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse and add configuration examples stored in <code className="font-mono">config_samples</code>. Latest 20 are shown by default.
          </p>
        </div>
        <button
          className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
          onClick={() => load()}
          type="button"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!user ? (
        <div className="mt-4 p-3 rounded-lg bg-yellow-50 text-yellow-800 text-sm">
          You can browse the library, but login is required to add or delete samples.
        </div>
      ) : null}

      {error ? <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div> : null}
      {success ? <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">{success}</div> : null}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: search + list */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-4">
          <form className="flex flex-col gap-3" onSubmit={onSearch}>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Search intent or category..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Category filter (optional)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <button className="px-3 py-2 rounded-lg bg-[#0a1128] text-white text-sm" type="submit" disabled={loading}>
              Search
            </button>
          </form>

          <div className="mt-4 max-h-[60vh] overflow-y-auto divide-y">
            {rows.map((r) => (
              <button
                key={r.sample_id}
                type="button"
                onClick={() => setSelectedId(r.sample_id)}
                className={`w-full text-left px-2 py-3 hover:bg-gray-50 ${
                  r.sample_id === selectedId ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-gray-900">#{r.sample_id}</div>
                  <div className="text-xs text-gray-600">{r.category ?? "-"}</div>
                </div>
                <div className="text-xs text-gray-700 mt-1 line-clamp-2">
                  {r.intent_text ?? ""}
                </div>
              </button>
            ))}
            {!rows.length ? (
              <div className="py-6 text-sm text-gray-500">{loading ? "Loading..." : "No samples found."}</div>
            ) : null}
          </div>
        </div>

        {/* Right: details + create */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                <p className="text-sm text-gray-600">Click a sample on the left to inspect it.</p>
              </div>
              {selected ? (
                <button
                  className="text-sm px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                  type="button"
                  onClick={() => onDelete(selected.sample_id)}
                  disabled={!user || deleting === selected.sample_id}
                >
                  {deleting === selected.sample_id ? "Deleting..." : "Delete"}
                </button>
              ) : null}
            </div>

            {selected ? (
              <div className="mt-4 space-y-3">
                <div className="text-sm">
                  <div className="text-gray-600">Category</div>
                  <div className="font-medium text-gray-900">{selected.category ?? "-"}</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-600">Intent</div>
                  <div className="text-gray-900 whitespace-pre-wrap">{selected.intent_text ?? ""}</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-600 flex items-center justify-between">
                    <span>Config JSON</span>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                      onClick={async () => {
                        await navigator.clipboard.writeText(pretty(selected.config_json ?? {}));
                        setSuccess("Copied JSON to clipboard.");
                      }}
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="mt-1 text-xs bg-gray-50 border rounded-lg p-3 overflow-x-auto">
                    {pretty(selected.config_json ?? {})}
                  </pre>
                </div>
                <div className="text-sm">
                  <div className="text-gray-600">Extra metadata</div>
                  <pre className="mt-1 text-xs bg-gray-50 border rounded-lg p-3 overflow-x-auto">
                    {pretty(selected.extra_metadata ?? {})}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-500">No sample selected.</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900">Add a new sample</h2>
            <p className="text-sm text-gray-600 mt-1">
              Provide an intent + example JSON. The system will embed the intent immediately so RAG can retrieve it.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. QoS"
                  disabled={!user || creating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload JSON (optional)</label>
                <input
                  className="mt-1 w-full text-sm"
                  type="file"
                  accept="application/json"
                  disabled={!user || creating}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadJson(f);
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Intent text</label>
                <textarea
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm h-24"
                  value={newIntent}
                  onChange={(e) => setNewIntent(e.target.value)}
                  placeholder="Describe the intent this config solves..."
                  disabled={!user || creating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Config JSON</label>
                <textarea
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono h-40"
                  value={newConfigText}
                  onChange={(e) => setNewConfigText(e.target.value)}
                  disabled={!user || creating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Extra metadata (JSON)</label>
                <textarea
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono h-24"
                  value={newExtraText}
                  onChange={(e) => setNewExtraText(e.target.value)}
                  disabled={!user || creating}
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                className="px-4 py-2 rounded-lg bg-[#0a1128] text-white text-sm disabled:opacity-60"
                type="button"
                onClick={onCreate}
                disabled={!user || creating}
              >
                {creating ? "Adding..." : "Add sample"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

