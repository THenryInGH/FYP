import NavBar from './components/layout/NavBar';
import Dashboard from './components/dashboard/Dashboard';
import Footer from './components/layout/Footer';
import ChatInterface from './components/chat/ChatInterface';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-4">
        <Dashboard />
      </main>
      <Footer />
      <ChatInterface />
    </div>
  );
}

export default App;
