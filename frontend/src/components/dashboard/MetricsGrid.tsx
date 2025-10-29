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
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.5rem",
            color: "var(--text-primary)",
          }}
        >
          <h3 className="text-lg font-semibold capitalize">{key}</h3>
          <p
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "var(--accent-blue)",
            }}
          >
            {value}
          </p>
        </div>
      ))}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1.5rem",
          color: "var(--text-primary)",
        }}
      >
        <h3 className="text-lg font-semibold">Total</h3>
        <p
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "var(--accent-green)",
          }}
        >
          {total}
        </p>
      </div>
    </div>
  );
}
