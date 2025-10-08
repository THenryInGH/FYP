import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-[#0a1128] text-white shadow-md">
      <h1 className="text-lg font-semibold">FYP (For Your Ping)</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/docs" className="hover:underline">Docs</Link>
        <Link to="/login" className="hover:underline">Login</Link>
      </div>
    </nav>
  );
}

export default NavBar;