import { useEffect, useState } from "react";
import { onosApi } from "../../utils/onosApi";

interface Metrics {
  devices: number;
  hosts: number;
  links: number;
  flows: number;
}

export default function MetricsGrid() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      const data = await onosApi.getMetrics();
      setMetrics(data);
    }
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div className="text-gray-500">Loading metrics...</div>;

  // Only include 4 items (exclude total)
  const entries = [
    { label: "Devices", value: metrics.devices },
    { label: "Hosts", value: metrics.hosts },
    { label: "Links", value: metrics.links },
    { label: "Flows", value: metrics.flows },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
      {entries.map(({ label, value }) => (
        <div
          key={label}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 text-center"
        >
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
      ))}
    </div>
  );
}
