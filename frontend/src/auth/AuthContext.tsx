import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, loginUser, registerUser, type UserPublic } from "../utils/authApi";
import { clearAccessToken, getAccessToken, setAccessToken } from "../utils/authStorage";

type AuthState = {
  user: UserPublic | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      setLoading(true);
      setError(null);
      const t = getAccessToken();
      if (!t) {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }
      try {
        const me = await getMe(t);
        if (!cancelled) {
          setToken(t);
          setUser(me);
        }
      } catch (e: any) {
        clearAccessToken();
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setError(e?.message || "Session expired");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(usernameOrEmail: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser({ usernameOrEmail, password });
      setAccessToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (e: any) {
      setError(e?.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function register(username: string, email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      await registerUser({ username, email, password });
      // convenience: login immediately after successful registration
      await login(username, password);
    } catch (e: any) {
      setError(e?.message || "Registration failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAccessToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthState>(
    () => ({ user, token, loading, error, login, register, logout }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

