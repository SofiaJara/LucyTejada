"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, redirectByRol } from "./lib/AuthContext";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace(redirectByRol(user.rol));
    else router.replace("/login");
  }, [user, loading, router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f5f5f5",
      fontFamily: "Segoe UI, sans-serif", color: "#4a5a52", fontSize: 14,
    }}>
      Cargando...
    </div>
  );
}
