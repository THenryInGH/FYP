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

  if (!metrics) return <div>Loading metrics...</div>;

  const total = Object.values(metrics).reduce(
    (sum: number, value: number) => sum + value,
    0
  );

  return (
    <div className="grid grid-cols-5 gap-4">
      {Object.entries(metrics).map(([key, value]) => (
        <div
          key={key}
          className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4 text-center border border-gray-200"
        >
          <h3 className="text-lg font-semibold capitalize">{key}</h3>
          <p className="text-3xl font-bold text-blue-500">{value}</p>
        </div>
      ))}
      <div className="bg-gray-50 dark:bg-gray-700 shadow rounded-2xl p-4 text-center border border-gray-200">
        <h3 className="text-lg font-semibold">Total</h3>
        <p className="text-3xl font-bold text-green-500">{total}</p>
      </div>
    </div>
  );
}
