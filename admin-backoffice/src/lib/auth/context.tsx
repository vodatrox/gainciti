"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { API_URL } from "@/lib/constants";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gc_access");
    if (token) {
      fetchCurrentUser(token).then(setUser).catch(() => {
        localStorage.removeItem("gc_access");
        localStorage.removeItem("gc_refresh");
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("gc_access", data.access);
    localStorage.setItem("gc_refresh", data.refresh);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem("gc_refresh");
    if (refresh) {
      await fetch(`${API_URL}/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("gc_access")}`,
        },
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    }
    localStorage.removeItem("gc_access");
    localStorage.removeItem("gc_refresh");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function fetchCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/admin/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}
