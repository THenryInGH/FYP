import { CodeBlock, PageTitle } from "./DocBlocks";

export default function DocsGettingStarted() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Getting Started"
        subtitle="How to run the system locally (development mode) and configure environment variables."
      />

      <div className="max-w-4xl space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Backend (FastAPI)</div>
          <CodeBlock>
            {`cd /home/henry/FYP
source .venv/bin/activate

# Configure env (examples)
export GROQ_API_KEY="..."
export ONOS_API_URL="http://<onos-host>:8181/onos/v1/"
export ONOS_USER="onos"
export ONOS_PASS="rocks"

uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`}
          </CodeBlock>
          <p className="mt-2 text-sm text-gray-700">
            If you access the UI from another machine (port-forwarding), configure CORS via{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">FRONTEND_ORIGINS</code> or{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">FRONTEND_ORIGIN_REGEX</code>.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Frontend (Vite + React)</div>
          <CodeBlock>
            {`cd /home/henry/FYP/frontend
npm install

# Optional: point to backend
export VITE_API_BASE="http://localhost:8000"

npm run dev`}
          </CodeBlock>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Database</div>
          <p className="mt-2 text-sm text-gray-700">
            FYP uses PostgreSQL. You can run it as a system service (current setup) or containerise it later for portability.
          </p>
        </div>
      </div>
    </div>
  );
}

