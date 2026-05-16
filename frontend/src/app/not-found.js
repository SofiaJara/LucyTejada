"use client";
import Link from "next/link";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", bg: "#f5f5f5",
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, fontFamily: "Segoe UI, sans-serif", padding: 20,
    }}>
      <div style={{
        width: 480, background: C.card, borderRadius: 14, border: `2px solid ${C.border}`,
        padding: 40, textAlign: "center", boxShadow: "0 4px 20px rgba(58,96,72,0.10)",
      }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 56, fontWeight: 700, color: C.head, lineHeight: 1 }}>
          404
        </div>
        <h2 style={{ margin: "10px 0 8px", fontSize: 20, fontWeight: 700, color: C.head }}>
          Página no encontrada
        </h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, margin: "0 0 24px" }}>
          La ruta que buscas no existe o fue movida. Vuelve al inicio para continuar usando el sistema.
        </p>
        <Link href="/" style={{
          padding: "10px 28px", border: "none", borderRadius: 6,
          fontSize: 14, fontWeight: 600, color: C.btnT, background: C.btn, textDecoration: "none",
        }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
