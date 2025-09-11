import TopologyCanvas from './TopologyCanvas';
import MetricsGrid from './MetricsGrid';
import TimeSeriesChart from './TimeSeriesChart';
import IntentSummary from './IntentSummary';

function Dashboard() {
  return (
    <div className="grid gap-4">
      <TopologyCanvas />
      <MetricsGrid />
      <TimeSeriesChart />
      <IntentSummary />
    </div>
  );
}

export default Dashboard;
 