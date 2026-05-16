"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (roles && !roles.includes(user.rol)) {
      router.push("/login");
    }
  }, [user, loading, router, roles]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "Segoe UI, sans-serif",
        color: "#4a5a52", fontSize: 15,
      }}>
        Cargando...
      </div>
    );
  }

  if (!user) return null;
  if (roles && !roles.includes(user.rol)) return null;
  return children;
}
