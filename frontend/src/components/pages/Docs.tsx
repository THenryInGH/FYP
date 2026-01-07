function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 text-xs bg-gray-50 border rounded-lg p-3 overflow-x-auto whitespace-pre">
      <code>{children}</code>
    </pre>
  );
}

function Docs() {
  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Docs</h1>
      <p className="mt-2 text-sm text-gray-600">
        This page documents how to run the system, what it does, and how to operate the ONOS testbed safely.
      </p>

      <div className="mt-6 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
          <p className="mt-2 text-sm text-gray-700">
            FYP is a network operations dashboard focused on <span className="font-medium">intent translation</span>,{" "}
            <span className="font-medium">deployment</span>, and <span className="font-medium">monitoring</span>. The UI
            visualizes topology discovered from ONOS and provides authenticated actions (install intents, manage config
            samples, run dataplane tests).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Architecture (high-level)</h2>
          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>
              <span className="font-medium">Frontend (React)</span>: dashboard, chat, devices, samples, tests.
            </li>
            <li>
              <span className="font-medium">Backend (FastAPI)</span>: authentication, ONOS proxy, chat + RAG, tests runner.
            </li>
            <li>
              <span className="font-medium">ONOS</span>: controller that exposes topology, intents, flows via REST.
            </li>
            <li>
              <span className="font-medium">PostgreSQL</span>: users, conversations/messages, devices friendly names, config samples.
            </li>
          </ul>
          <p className="mt-2 text-sm text-gray-700">
            The browser never talks directly to ONOS credentials. All ONOS access goes through the backend.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Topology policy (read-only UI by design)</h2>
          <p className="mt-2 text-sm text-gray-700">
            The topology canvas is intentionally <span className="font-medium">read-only</span>. In real networks,
            topology changes are provisioning tasks (cabling/underlay changes), not actions performed in an operational
            dashboard. This dashboard focuses on intent deployment and monitoring.
          </p>
          <p className="mt-2 text-sm text-gray-700">
            The system is <span className="font-medium">not hardcoded</span> to a single topology: it discovers devices,
            links, and hosts from ONOS at runtime. You can switch testbed topologies using predefined scripts (profiles)
            and the UI will adapt after refresh.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-900">Switch topology profile (example)</div>
              <CodeBlock>
                {`# From repo root
cd onos-testbed/scripts
bash clean-topo.sh
bash mesh-topo.sh   # profile A
# ... later ...
bash clean-topo.sh
bash tree-topo.sh   # profile B`}
              </CodeBlock>
              <p className="mt-2 text-xs text-gray-600">
                After running a profile script, refresh the dashboard to fetch the new topology from ONOS.
              </p>
            </div>

            <div className="p-4 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-900">Connect to a different ONOS (deployment-time)</div>
              <p className="mt-2 text-sm text-gray-700">
                The backend supports changing ONOS controller endpoint via environment variables.
              </p>
              <CodeBlock>
                {`# Backend env
export ONOS_API_URL="http://<onos-host>:8181/onos/v1/"
export ONOS_USER="onos"
export ONOS_PASS="rocks"

# Restart backend after changing env`}
              </CodeBlock>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Running the system (dev)</h2>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-900">Backend</div>
              <p className="mt-2 text-sm text-gray-700">From repo root:</p>
              <CodeBlock>
                {`cd /home/henry/FYP
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`}
              </CodeBlock>
              <p className="mt-2 text-xs text-gray-600">
                If you use port forwarding, configure CORS via <span className="font-medium">FRONTEND_ORIGINS</span> or{" "}
                <span className="font-medium">FRONTEND_ORIGIN_REGEX</span>.
              </p>
            </div>

            <div className="p-4 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-900">Frontend</div>
              <p className="mt-2 text-sm text-gray-700">From repo root:</p>
              <CodeBlock>
                {`cd frontend
npm install
npm run dev`}
              </CodeBlock>
              <p className="mt-2 text-xs text-gray-600">
                Configure backend URL via <span className="font-medium">VITE_API_BASE</span> (defaults to{" "}
                <span className="font-medium">http://localhost:8000</span>).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Dataplane tests (Ping + iperf3)</h2>
          <p className="mt-2 text-sm text-gray-700">
            The Tests page runs commands inside Linux network namespaces on the server. This is an authenticated feature.
          </p>

          <div className="mt-3 p-4 rounded-xl border bg-white">
            <div className="text-sm font-semibold text-gray-900">Security model</div>
            <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>Backend does not run as root.</li>
              <li>
                Backend calls a single allowlisted runner script via <span className="font-medium">sudo -n</span> (no
                password prompts).
              </li>
              <li>The runner validates inputs and returns structured JSON.</li>
            </ul>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-900">One-time runner setup</div>
              <CodeBlock>
                {`# Install runner
sudo install -m 0755 "/home/henry/FYP/onos-testbed/scripts/fyp-netns-test.sh" /usr/local/bin/fyp-netns-test

# Allowlist in sudoers
sudo visudo
# Add:
# henry ALL=(root) NOPASSWD: /usr/local/bin/fyp-netns-test *

# Point backend to installed runner
export NETNS_TEST_RUNNER=/usr/local/bin/fyp-netns-test`}
              </CodeBlock>
            </div>

            <div className="p-4 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-900">Manual CLI checks</div>
              <CodeBlock>
                {`# List namespaces
sudo -n /usr/local/bin/fyp-netns-test list

# Ping from h1 to 10.0.0.2
sudo -n /usr/local/bin/fyp-netns-test ping h1 10.0.0.2 3 6

# iperf UDP from h1 -> h2 (10.0.0.2)
sudo -n /usr/local/bin/fyp-netns-test iperf h1 h2 10.0.0.2 udp 5201 5 10`}
              </CodeBlock>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Common issues</h2>
          <div className="mt-3 space-y-3">
            <div className="p-4 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-900">Tests dropdown is empty</div>
              <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Ensure you are logged in (tests are protected).</li>
                <li>
                  Ensure sudoers allowlist is configured: <span className="font-medium">sudo -n</span> must not prompt.
                </li>
                <li>Ensure the testbed namespaces exist (run a topology script).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border bg-white">
              <div className="text-sm font-semibold text-gray-900">CORS errors when using port forwarding</div>
              <p className="mt-2 text-sm text-gray-700">
                Configure backend CORS via environment variables so your laptop origin is allowed.
              </p>
              <CodeBlock>
                {`# Example: allow a specific origin
export FRONTEND_ORIGINS="http://localhost:5173"

# Or allow any origin during development
export FRONTEND_ORIGIN_REGEX=".*"`}
              </CodeBlock>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Docs;