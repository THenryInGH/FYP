import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="flex justify-between items-center p-4 bg-[#0a1128] text-white shadow-md">
      <h1 className="text-lg font-semibold">FYP (For Your Ping)</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/docs" className="hover:underline">Docs</Link>
        {user ? (
          <>
            <span className="text-white/80">Hi, {user.username}</span>
            <button className="hover:underline" onClick={logout} type="button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default NavBar;