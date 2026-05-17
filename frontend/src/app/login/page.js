"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, redirectByRol } from "@/app/lib/AuthContext";
import ConfirmModal from "@/app/components/lt/ConfirmModal";
import PasswordInput from "@/app/components/lt/PasswordInput";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", bg: "#f5f5f5",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: C.bg }} />}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const expired = search.get("expired") === "1";
  const { user, loading: authLoading, login } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "", type: "error" });

  useEffect(() => {
    if (!authLoading && user) router.replace(redirectByRol(user.rol));
  }, [authLoading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) {
      setModal({ open: true, title: "Datos incompletos", message: "Por favor ingresa correo y contraseña.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      const user = await login(correo, contrasena);
      router.push(redirectByRol(user.rol));
    } catch (err) {
      setModal({ open: true, title: "Error al iniciar sesión", message: err.message || "Credenciales inválidas", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: C.bg,
      fontFamily: "Segoe UI, sans-serif",
    }}>
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onCancel={() => setModal({ ...modal, open: false })} onConfirm={() => setModal({ ...modal, open: false })} />

      <form onSubmit={handleSubmit} style={{
        width: 620, background: C.card, borderRadius: 18, border: `2px solid ${C.border}`,
        display: "flex", overflow: "hidden", boxShadow: "0 4px 20px rgba(58,96,72,0.12)",
      }}>
        <div style={{
          width: 230, minHeight: 360, borderRight: `1.5px solid ${C.border}`,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 8, padding: 28,
          background: "#eef5f0",
        }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 28, color: C.head, fontWeight: 700 }}>Lucy Tejada</span>
          <span style={{ fontSize: 14, color: C.muted }}>Centro Cultural</span>
        </div>

        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "36px", gap: 16,
        }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.head }}>Bienvenido</h2>
          {expired && (
            <div style={{
              width: "100%", padding: "8px 12px", borderRadius: 6,
              background: "#fdf5e8", color: "#a06b1f", fontSize: 13,
              border: "1px solid #f0c884", textAlign: "center",
            }}>
              Tu sesión expiró. Inicia sesión de nuevo para continuar.
            </div>
          )}
          <input
            id="login-correo"
            type="email"
            placeholder="correo electrónico"
            aria-label="Correo electrónico"
            autoComplete="email"
            autoFocus
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={loading}
            style={{
              width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`,
              borderRadius: 6, fontSize: 15, color: C.body, background: C.card,
              boxSizing: "border-box", outline: "none",
            }}
          />
          <PasswordInput
            id="login-contrasena"
            placeholder="contraseña"
            ariaLabel="Contraseña"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 30px", border: "none", borderRadius: 6,
              fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              width: "100%", marginTop: 4,
            }}
          >
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>
          <span style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
            ¿no tienes cuenta?{" "}
            <Link href="/register" style={{ color: C.btn, cursor: "pointer", fontWeight: 600, textDecoration: "none" }}>
              Regístrate
            </Link>
          </span>
          <Link href="/login/reset" style={{ fontSize: 12, color: C.muted, textDecoration: "none", marginTop: -6 }}>
            ¿olvidaste tu contraseña?
          </Link>
        </div>
      </form>

      <p style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center",
        fontSize: 12, color: C.muted, margin: 0 }}>
        Centro Cultural Lucy Tejada · Pereira
      </p>
    </div>
  );
}
