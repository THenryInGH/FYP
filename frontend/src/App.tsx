// acts as a wrapper for all pages, includes navbar, footer, and chat interface
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import ChatInterface from './components/chat/ChatInterface';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-4">
        {/* The Outlet renders child routes (Dashboard, Docs, Login, etc.) done by <Route> at main.tsx and {Link} at navbar */}
        <Outlet />
      </main>
      <Footer />
      <ChatInterface />
    </div>
  );
}

export default App;
