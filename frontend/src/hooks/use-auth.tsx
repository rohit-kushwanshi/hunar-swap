// src/hooks/use-auth.tsx
// STANDALONE version — no @workspace packages needed

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, setToken, type User } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(!!localStorage.getItem("hs_token"));

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.me(),
    enabled: hasToken,
    retry: false,
  });

  async function login(data: { email: string; password: string }) {
    const res = await api.login(data);
    setToken(res.token);
    setHasToken(true);
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }

  async function register(data: { name: string; email: string; password: string }) {
    const res = await api.register(data);
    setToken(res.token);
    setHasToken(true);
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }

  async function logout() {
    await api.logout();
    setToken(null);
    setHasToken(false);
    queryClient.clear();
  }

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading: hasToken ? isLoading : false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
