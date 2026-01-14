import { PageTitle } from "./DocBlocks";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export default function DocsIntroduction() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Introduction"
        subtitle="FYP is a network intent assistant + operations dashboard built on ONOS."
      />

      <div className="max-w-4xl space-y-3">
        <p className="text-sm text-gray-700">
          The core idea is to translate natural language (user intent) into ONOS Intent Framework JSON, apply it safely,
          and monitor the network state. Topology is discovered from ONOS in real-time and visualized in the dashboard.
        </p>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
          <li>
            <span className="font-medium">Frontend (React)</span>: dashboard + docs + management pages.
          </li>
          <li>
            <span className="font-medium">Backend (FastAPI)</span>: auth, ONOS proxy, LLM integration, RAG samples, tests runner.
          </li>
          <li>
            <span className="font-medium">ONOS</span>: controller providing topology/intents/flows via REST.
          </li>
          <li>
            <span className="font-medium">PostgreSQL</span>: persistent users, conversations/messages, config samples, friendly names.
          </li>
        </ul>
      </div>

      <div className="max-w-4xl rounded-2xl border bg-white p-5">
        <div className="text-sm font-semibold text-gray-900">System architecture</div>
        <p className="mt-2 text-sm text-gray-700">
          Diagram rendered from the repo file <code className="px-1 py-0.5 bg-gray-100 rounded">diagram/system architecture.png</code>.
        </p>
        <img
          className="mt-4 w-full rounded-xl border bg-gray-50"
          src={`${API_BASE}/docs-assets/system-architecture.png`}
          alt="System architecture diagram"
        />
      </div>
    </div>
  );
}

