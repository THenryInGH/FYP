import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function NavBar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node | null;
      if (target && menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const createdAt =
    user?.created_at ? new Date(user.created_at).toLocaleString() : "—";

  return (
    <nav className="flex justify-between items-center p-4 bg-[#0a1128] text-white shadow-md">
      <h1 className="text-lg font-semibold">FYP (For Your Ping)</h1>
      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/devices" className="hover:underline">Devices</Link>
        <Link to="/config-library" className="hover:underline">Samples</Link>
        <Link to="/tests" className="hover:underline">Tests</Link>
        <Link to="/docs" className="hover:underline">Docs</Link>
        {user ? (
          <div className="relative inline-block" ref={menuRef}>
            <button
              type="button"
              className="text-yellow-300 hover:text-yellow-200 font-medium"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              Hi, {user.username}
            </button>

            {open ? (
              <div
                className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded-xl shadow-lg border overflow-hidden z-50"
                role="menu"
              >
                <div className="px-4 py-3 border-b">
                  <div className="text-sm font-semibold">{user.username}</div>
                  <div className="text-xs text-gray-600">{user.email}</div>
                </div>

                <div className="px-4 py-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900">{createdAt}</span>
                  </div>
                </div>

                <div className="px-4 py-3 border-t">
                  <button
                    type="button"
                    className="w-full text-sm px-3 py-2 rounded-lg bg-[#0a1128] text-white hover:opacity-95"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Link to="/login" className="hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default NavBar;