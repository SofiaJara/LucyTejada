"use client";
import Link from "next/link";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", bg: "#f5f5f5",
};

export default function ResetPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, fontFamily: "Segoe UI, sans-serif", padding: 20,
    }}>
      <div style={{
        width: 480, background: C.card, borderRadius: 14, border: `2px solid ${C.border}`,
        padding: 36, boxShadow: "0 4px 20px rgba(58,96,72,0.10)",
      }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 700, color: C.head, textAlign: "center" }}>
          Recuperar contraseña
        </h2>
        <p style={{ fontSize: 14, color: C.muted, textAlign: "center", margin: "0 0 18px", lineHeight: 1.5 }}>
          Para restablecer tu contraseña, contacta al administrador del Centro Cultural Lucy Tejada.
        </p>
        <div style={{ textAlign: "center" }}>
          <Link href="/login" style={{
            padding: "9px 22px", border: "none", borderRadius: 6,
            fontSize: 14, fontWeight: 600, color: C.btnT, background: C.btn, textDecoration: "none",
          }}>← Volver al login</Link>
        </div>
      </div>
    </div>
  );
}
