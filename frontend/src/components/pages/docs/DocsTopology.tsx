import { CodeBlock, PageTitle } from "./DocBlocks";

export default function DocsTopology() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Topology & Controller"
        subtitle="Why topology is read-only in UI, and how to change topology safely via profiles or controller configuration."
      />

      <div className="max-w-4xl space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Read-only topology (design decision)</div>
          <p className="mt-2 text-sm text-gray-700">
            The UI does not allow drag-and-drop topology editing. In real networks, topology changes are provisioning tasks
            (physical changes / underlay automation) rather than operational dashboard actions. This keeps the system safe
            and aligned with real-world workflows.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Topology profiles (testbed scripts)</div>
          <p className="mt-2 text-sm text-gray-700">
            You can redeploy a predefined topology profile and the UI will adapt because it always reads topology from ONOS.
          </p>
          <CodeBlock>
            {`cd /home/henry/FYP/onos-testbed/scripts

# Reset
bash clean-topo.sh

# Choose a profile
bash mesh-topo.sh
# or
bash tree-topo.sh
# or
bash test-topo.sh`}
          </CodeBlock>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-900">Pointing to another ONOS controller</div>
          <p className="mt-2 text-sm text-gray-700">
            At deployment time, configure the backend to use a different ONOS controller endpoint:
          </p>
          <CodeBlock>
            {`export ONOS_API_URL="http://<onos-host>:8181/onos/v1/"
export ONOS_USER="onos"
export ONOS_PASS="rocks"

# Restart backend after updating env`}
          </CodeBlock>
        </div>
      </div>
    </div>
  );
}

