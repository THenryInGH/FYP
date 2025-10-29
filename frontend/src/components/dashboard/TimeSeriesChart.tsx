import { useEffect, useMemo, useRef, useState } from 'react';
import { onosApi } from '../../utils/onosApi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Metrics = { devices: number; hosts: number; links: number; flows: number };

const MAX_POINTS = 30; // ~last N samples

export default function TimeSeriesChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<{ devices: number[]; hosts: number[]; links: number[]; flows: number[] }>({
    devices: [], hosts: [], links: [], flows: [],
  });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const m: Metrics | null = await onosApi.getMetrics();
      if (!alive || !m) return;
      const now = new Date();
      const label = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setLabels(prev => {
        const next = [...prev, label];
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
      });

      setSeries(prev => {
        const next = {
          devices: [...prev.devices, m.devices],
          hosts:   [...prev.hosts,   m.hosts],
          links:   [...prev.links,   m.links],
          flows:   [...prev.flows,   m.flows],
        };
        return {
          devices: next.devices.slice(-MAX_POINTS),
          hosts:   next.hosts.slice(-MAX_POINTS),
          links:   next.links.slice(-MAX_POINTS),
          flows:   next.flows.slice(-MAX_POINTS),
        };
      });
    };

    // prime once quickly, then interval
    tick();
    timer.current = window.setInterval(tick, 3000);

    return () => {
      alive = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const data = useMemo(() => ({
    labels,
    datasets: [
      { label: 'Devices', data: series.devices, borderColor: '#2563eb', backgroundColor: '#2563eb20', tension: 0.25, fill: true, pointRadius: 2 },
      { label: 'Hosts',   data: series.hosts,   borderColor: '#22c55e', backgroundColor: '#22c55e20', tension: 0.25, fill: true, pointRadius: 2 },
      { label: 'Links',   data: series.links,   borderColor: '#f59e0b', backgroundColor: '#f59e0b20', tension: 0.25, fill: true, pointRadius: 2 },
      { label: 'Flows',   data: series.flows,   borderColor: '#ef4444', backgroundColor: '#ef444420', tension: 0.25, fill: true, pointRadius: 2 },
    ],
  }), [labels, series]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'ONOS Metrics (last samples)' },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  }), []);

  return (
    <div className="bg-white dark:bg-gray-800 h-64 p-3 rounded-2xl border border-gray-200">
      <Line options={options} data={data} />
    </div>
  );
}
