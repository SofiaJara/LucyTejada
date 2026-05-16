"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const roleLabel = user?.rol === "admin" ? "Administrador" : user?.rol === "profesor" ? "Profesor" : "Estudiante";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 46,
      background: "#fff", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", zIndex: 100,
    }}>
      <span style={{ fontFamily: "Georgia, serif", fontSize: 17, color: C.head, fontWeight: 700 }}>
        Lucy Tejada
      </span>
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: "Segoe UI, sans-serif", fontSize: 13, color: C.body,
            display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
            borderRadius: 6,
          }}
        >
          <span style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#eef5f0", color: C.btn, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, border: `1.5px solid ${C.btn}`,
          }}>
            {(user?.nombre?.[0] || "?") + (user?.apellido?.[0] || "")}
          </span>
          <span>Hola, {user?.nombre || "Invitado"} ▾</span>
        </button>
        {open && (
          <div style={{
            position: "absolute", right: 0, top: 42, background: "#fff",
            border: `1px solid ${C.border}`, borderRadius: 8, minWidth: 200,
            boxShadow: "0 6px 24px rgba(28,38,32,0.12)", overflow: "hidden",
            zIndex: 200,
          }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.head }}>
                {user?.nombre} {user?.apellido}
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{roleLabel}</div>
            </div>
            <button onClick={() => { setOpen(false); logout(); }} style={{
              width: "100%", padding: "10px 16px", textAlign: "left",
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 13, color: C.body, fontFamily: "Segoe UI, sans-serif",
            }}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </nav>
  );
}
