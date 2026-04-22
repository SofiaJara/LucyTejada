"use client";
import Link from "next/link";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", bg: "#f5f5f5",
};

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: C.bg,
      fontFamily: "Segoe UI, sans-serif",
    }}>

      <div style={{
        width: 620, background: C.card, borderRadius: 18, border: `2px solid ${C.border}`,
        display: "flex", overflow: "hidden", boxShadow: "0 4px 20px rgba(58,96,72,0.12)",
      }}>
        {/* Panel izquierdo — Marca */}
        <div style={{
          width: 230, minHeight: 360, borderRight: `1.5px solid ${C.border}`,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 8, padding: 28,
          background: "#eef5f0",
        }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 28, color: C.head, fontWeight: 700 }}>Lucy Tejada</span>
          <span style={{ fontSize: 14, color: C.muted }}>Centro Cultural</span>
        </div>

        {/* Panel derecho — Formulario */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "36px", gap: 16,
        }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.head }}>Bienvenido</h2>
          <input type="text" placeholder="usuario" readOnly style={{
            width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`,
            borderRadius: 6, fontSize: 15, color: C.body, background: C.card,
            boxSizing: "border-box", outline: "none",
          }} />
          <input type="password" placeholder="contraseña" readOnly style={{
            width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`,
            borderRadius: 6, fontSize: 15, color: C.body, background: C.card,
            boxSizing: "border-box", outline: "none",
          }} />
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <a href="/estudiante/informacion" style={{
              padding: "9px 22px", border: "none", borderRadius: 6,
              fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn, textDecoration: "none",
            }}>Estudiante</a>
            <a href="/profesor/dashboard" style={{
              padding: "9px 22px", border: "none", borderRadius: 6,
              fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn, textDecoration: "none",
            }}>Profesor</a>
          </div>
          <span style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
            ¿no tienes cuenta?{" "}
            <span style={{ color: C.btn, cursor: "pointer", fontWeight: 600 }}>Regístrate</span>
          </span>
        </div>
      </div>

      <p style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center",
        fontSize: 13, color: C.muted, margin: 0 }}>
        Fuente: Elaboración propia.
      </p>
    </div>
  );
}
