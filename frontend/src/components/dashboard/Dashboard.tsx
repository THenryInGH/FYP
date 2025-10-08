import ChatInterface from "../chat/ChatInterface";
import MetricsGrid from "./MetricsGrid";
import TopologyCanvas from "./TopologyCanvas";
import TimeSeriesChart from './TimeSeriesChart';
import IntentSummary from "./IntentSummary";

function Dashboard() {
  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="p-6 grid gap-4">
        <TopologyCanvas />
        <MetricsGrid />
        <IntentSummary />
        <TimeSeriesChart />
      </div>
      <ChatInterface />
    </div>
  );
}

export default Dashboard;
