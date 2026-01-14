import { CodeBlock, PageTitle } from "./DocBlocks";

export default function DocsTroubleshooting() {
  return (
    <div className="space-y-6">
      <PageTitle title="Troubleshooting" subtitle="Common issues and how to fix them." />

      <div className="max-w-4xl space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">CORS errors</div>
          <p className="mt-2 text-sm text-gray-700">
            If you open the UI from a different hostname (e.g. laptop via port forwarding), allow that origin on the backend.
          </p>
          <CodeBlock>
            {`export FRONTEND_ORIGINS="http://localhost:5173"
# or, development-only:
export FRONTEND_ORIGIN_REGEX=".*"`}
          </CodeBlock>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Tests dropdown is empty / sudo error</div>
          <p className="mt-2 text-sm text-gray-700">
            Tests require an allowlisted runner script. The backend uses <code className="px-1 py-0.5 bg-gray-100 rounded">sudo -n</code>{" "}
            so it will fail immediately if sudoers is not configured.
          </p>
          <CodeBlock>
            {`sudo install -m 0755 "/home/henry/FYP/onos-testbed/scripts/fyp-netns-test.sh" /usr/local/bin/fyp-netns-test
sudo visudo
# Add:
# henry ALL=(root) NOPASSWD: /usr/local/bin/fyp-netns-test *
export NETNS_TEST_RUNNER=/usr/local/bin/fyp-netns-test`}
          </CodeBlock>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Ping fails when reactive forwarding is disabled</div>
          <p className="mt-2 text-sm text-gray-700">
            If you disable ONOS reactive forwarding, ARP/broadcast behavior may change and hosts may not discover each other.
            Enabling proxy ARP resolves this in many testbeds.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Intent apply returns 401</div>
          <p className="mt-2 text-sm text-gray-700">
            ONOS write operations are protected by backend auth. Ensure you are logged in and the UI has a valid JWT token.
          </p>
        </div>
      </div>
    </div>
  );
}

