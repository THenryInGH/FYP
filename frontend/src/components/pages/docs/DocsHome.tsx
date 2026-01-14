import { Link } from "react-router-dom";
import { PageTitle } from "./DocBlocks";

export default function DocsHome() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Docs"
        subtitle="This is the in-app documentation for deploying and operating FYP (For Your Ping)."
      />

      <div className="max-w-4xl rounded-2xl border bg-white p-5">
        <div className="text-sm font-semibold text-gray-900">Quick links</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link className="rounded-xl border p-4 hover:bg-gray-50" to="/docs/introduction">
            <div className="text-sm font-semibold text-gray-900">Introduction</div>
            <div className="text-xs text-gray-600 mt-1">What the system does + architecture diagram.</div>
          </Link>
          <Link className="rounded-xl border p-4 hover:bg-gray-50" to="/docs/features">
            <div className="text-sm font-semibold text-gray-900">Features</div>
            <div className="text-xs text-gray-600 mt-1">How to use chat, devices, samples, tests.</div>
          </Link>
          <Link className="rounded-xl border p-4 hover:bg-gray-50" to="/docs/getting-started">
            <div className="text-sm font-semibold text-gray-900">Getting Started</div>
            <div className="text-xs text-gray-600 mt-1">How to run backend/frontend and configure env.</div>
          </Link>
          <Link className="rounded-xl border p-4 hover:bg-gray-50" to="/docs/evaluation">
            <div className="text-sm font-semibold text-gray-900">Evaluation</div>
            <div className="text-xs text-gray-600 mt-1">Charts for accuracy/latency.</div>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="text-sm font-semibold text-gray-900">Navigation</div>
        <p className="mt-2 text-sm text-gray-700">
          Use the left sidebar to browse sections like a docs site (similar to NetBox). The topology view in the UI is
          read-only by design; topology changes are done via predefined testbed scripts or by pointing the backend to a
          different ONOS controller at deployment time.
        </p>
      </div>
    </div>
  );
}

