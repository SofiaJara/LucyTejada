"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import ConfirmModal from "./ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    const onRequestLogout = () => { setOpen(false); setConfirm(true); };
    window.addEventListener("lt:request-logout", onRequestLogout);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("lt:request-logout", onRequestLogout);
    };
  }, []);

  // Cierra el menú al cambiar de ruta
  useEffect(() => { setOpen(false); }, [pathname]);

  const roleLabel = user?.rol === "admin" ? "Administrador" : user?.rol === "profesor" ? "Profesor" : "Estudiante";
  const rolePath = user?.rol === "admin" ? "/admin" : user?.rol === "profesor" ? "/profesor" : "/estudiante";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 46,
      background: "#fff", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", zIndex: 100,
    }}>
      <ConfirmModal
        open={confirm}
        title="Cerrar sesión"
        message="¿Seguro que deseas cerrar tu sesión? Tendrás que volver a iniciar para continuar."
        type="warning"
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        onConfirm={() => { setConfirm(false); logout(); }}
        onCancel={() => setConfirm(false)}
      />
      <span style={{ fontFamily: "Georgia, serif", fontSize: 17, color: C.head, fontWeight: 700 }}>
        Lucy Tejada
      </span>
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Menú de usuario, ${user?.nombre || "Invitado"}`}
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
          <div role="menu" style={{
            position: "absolute", right: 0, top: 42, background: "#fff",
            border: `1px solid ${C.border}`, borderRadius: 8, minWidth: 220,
            boxShadow: "0 6px 24px rgba(28,38,32,0.12)", overflow: "hidden",
            zIndex: 200,
          }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.head }}>
                {user?.nombre} {user?.apellido}
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{roleLabel}</div>
            </div>
            {user && (
              <Link
                href={`${rolePath}/perfil`}
                role="menuitem"
                onClick={() => setOpen(false)}
                style={menuItemStyle}
              >
                Mi perfil
              </Link>
            )}
            {user?.rol === "admin" && (
              <Link
                href="/admin/bandeja"
                role="menuitem"
                onClick={() => setOpen(false)}
                style={menuItemStyle}
              >
                Bandeja
              </Link>
            )}
            <button
              onClick={() => { setOpen(false); setConfirm(true); }}
              role="menuitem"
              style={{
                ...menuItemStyle, width: "100%", textAlign: "left",
                background: "transparent", border: "none", cursor: "pointer",
                borderTop: `1px solid ${C.border}`,
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

const menuItemStyle = {
  display: "block",
  padding: "10px 16px",
  fontSize: 13,
  color: "#2c3a32",
  fontFamily: "Segoe UI, sans-serif",
  textDecoration: "none",
};
