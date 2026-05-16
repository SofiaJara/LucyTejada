"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("lt_token") : null;
    if (!token) { setLoading(false); return; }
    api("/api/auth/me", { auth: true })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("lt_token");
        localStorage.removeItem("lt_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (correo, contrasena) => {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: { correo, contrasena },
      auth: false,
    });
    localStorage.setItem("lt_token", data.token);
    localStorage.setItem("lt_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (datos) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: datos,
      auth: false,
    });
    localStorage.setItem("lt_token", data.token);
    localStorage.setItem("lt_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    api("/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("lt_token");
    localStorage.removeItem("lt_user");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}

export function redirectByRol(rol) {
  if (rol === "admin") return "/admin/dashboard";
  if (rol === "profesor") return "/profesor/dashboard";
  return "/estudiante/informacion";
}
