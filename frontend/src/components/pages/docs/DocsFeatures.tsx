import { PageTitle } from "./DocBlocks";

export default function DocsFeatures() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Features"
        subtitle="How to use the main parts of the system."
      />

      <div className="max-w-4xl space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Dashboard</div>
          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>Topology canvas (read-only) with devices/hosts discovered from ONOS.</li>
            <li>Metrics grid and time-series charts (reads ONOS state via backend proxy).</li>
            <li>Intent summary list (install/delete actions require login).</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Chat (LLM Agent)</div>
          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>Multi-conversation chat history per user (persistent in DB).</li>
            <li>Grounding includes current network state + optional RAG config samples.</li>
            <li>“Apply Configuration” posts intent JSON via backend ONOS proxy (login required).</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Devices</div>
          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>Rename devices and hosts with global friendly names.</li>
            <li>Friendly names persist in DB across topology refreshes.</li>
            <li>Host naming survives topology resets by mapping to stable identifiers and re-resolving current ONOS host IDs.</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Samples (Config Library)</div>
          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>Browse latest samples; search/filter by category.</li>
            <li>Create/delete samples (login required).</li>
            <li>New samples are embedded immediately for RAG.</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Tests</div>
          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>Ping and iperf3 tests executed server-side inside Linux namespaces.</li>
            <li>Backend calls a single allowlisted runner script via sudo (no password prompts).</li>
            <li>Results are returned as structured JSON and displayed in UI.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

