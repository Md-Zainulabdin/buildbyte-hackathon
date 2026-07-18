import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../lib/api";
import type { UserResponse, TokenResponse } from "../lib/api";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: () => void;
  handleGoogleCallback: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  api.defaults.baseURL = API_BASE;

  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
      }
      return Promise.reject(error);
    }
  );

  async function fetchUser() {
    try {
      const res = await api.get<UserResponse>("/users/me");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  async function login(email: string, password: string) {
    const res = await api.post<TokenResponse>("/auth/login", { email, password });
    const { access_token, user } = res.data;
    setToken(access_token);
    localStorage.setItem("token", access_token);
    setUser(user);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post<TokenResponse>("/auth/register", { name, email, password });
    const { access_token, user } = res.data;
    setToken(access_token);
    localStorage.setItem("token", access_token);
    setUser(user);
  }

  function googleLogin() {
    window.location.href = `${API_BASE}/api/auth/google/login`;
  }

  async function handleGoogleCallback(code: string) {
    const res = await api.post<TokenResponse>("/auth/google", { code });
    const { access_token, user } = res.data;
    setToken(access_token);
    localStorage.setItem("token", access_token);
    setUser(user);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
  }

  async function refreshUser() {
    await fetchUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        googleLogin,
        handleGoogleCallback,
        logout,
        refreshUser,
      }}
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