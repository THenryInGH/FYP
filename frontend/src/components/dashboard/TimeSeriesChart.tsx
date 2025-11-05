import { useEffect, useMemo, useRef, useState } from 'react';
import { onosApi } from '../../utils/onosApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Metrics = { devices: number; hosts: number; links: number; flows: number };
const MAX_POINTS = 30;

export default function TimeSeriesChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<{ devices: number[]; hosts: number[]; links: number[]; flows: number[] }>({
    devices: [],
    hosts: [],
    links: [],
    flows: [],
  });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const m: Metrics | null = await onosApi.getMetrics();
      if (!alive || !m) return;
      const now = new Date();
      const label = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setLabels((prev) => {
        const next = [...prev, label];
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
      });

      setSeries((prev) => {
        const next = {
          devices: [...prev.devices, m.devices],
          hosts: [...prev.hosts, m.hosts],
          links: [...prev.links, m.links],
          flows: [...prev.flows, m.flows],
        };
        return {
          devices: next.devices.slice(-MAX_POINTS),
          hosts: next.hosts.slice(-MAX_POINTS),
          links: next.links.slice(-MAX_POINTS),
          flows: next.flows.slice(-MAX_POINTS),
        };
      });
    };

    tick();
    timer.current = window.setInterval(tick, 3000);

    return () => {
      alive = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        { label: 'Devices', data: series.devices, borderColor: '#2563eb', backgroundColor: '#2563eb20', tension: 0.3, fill: true, pointRadius: 0 },
        { label: 'Hosts', data: series.hosts, borderColor: '#22c55e', backgroundColor: '#22c55e20', tension: 0.3, fill: true, pointRadius: 0 },
        { label: 'Links', data: series.links, borderColor: '#f59e0b', backgroundColor: '#f59e0b20', tension: 0.3, fill: true, pointRadius: 0 },
        { label: 'Flows', data: series.flows, borderColor: '#ef4444', backgroundColor: '#ef444420', tension: 0.3, fill: true, pointRadius: 0 },
      ],
    }),
    [labels, series]
  );

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'Time Series',
        font: { size: 16, weight: 600 }, // was "600"
        // or: font: { size: 16, weight: 'bold' }
        padding: { bottom: 10 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#475569', font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { color: '#475569', precision: 0, font: { size: 10 } },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 h-72 relative">
      <Line options={options} data={data} />
    </div>
  );
}
