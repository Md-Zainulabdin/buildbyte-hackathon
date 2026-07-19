import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../lib/api";
import type { UserResponse, TokenResponse } from "../lib/api";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: () => void;
  logout: () => void;
  refreshUser: () => Promise<UserResponse | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) config.headers.Authorization = `Bearer ${storedToken}`;
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
  }, []);

  async function fetchUser(): Promise<UserResponse | null> {
    try {
      const res = await api.get<UserResponse>("/users/me");
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser().finally(() => setIsLoading(false));
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
    window.location.href = `${api.defaults.baseURL}/auth/google/login`;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  }

  async function refreshUser(): Promise<UserResponse | null> {
    return await fetchUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        googleLogin,
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