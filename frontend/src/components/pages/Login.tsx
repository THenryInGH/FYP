import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function Login() {
  const nav = useNavigate();
  const { login, register, loading, error, user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login(usernameOrEmail, password);
        nav("/");
      } else {
        await register(username, email, password);
        nav("/");
      }
    } catch {
      // AuthContext already sets a user-friendly error message.
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {mode === "login" ? "Login" : "Create account"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === "login"
            ? "Sign in to access protected actions (e.g. device renaming)."
            : "Register a new user for this system."}
        </p>

        {user ? (
          <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">
            You are already logged in as <span className="font-medium">{user.username}</span>.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {mode === "register" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  type="email"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Username or Email</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              type="password"
              required
            />
            {mode === "register" ? (
              <div className="mt-2 text-xs text-gray-600">
                <p className="font-medium text-gray-700">Password requirements:</p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li>8–72 characters</li>
                  <li>Any characters allowed (letters, numbers, symbols)</li>
                  <li className="text-gray-500">
                    Tip: use a mix of upper/lowercase, numbers, and symbols for stronger security.
                  </li>
                </ul>
              </div>
            ) : null}
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#0a1128] text-white rounded-lg px-3 py-2 font-medium disabled:opacity-60"
            type="submit"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-700">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                className="text-blue-700 hover:underline"
                onClick={() => setMode("register")}
                type="button"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-700 hover:underline"
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
