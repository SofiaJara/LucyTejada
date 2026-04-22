"use client";
import Link from "next/link";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff",
};

export default function ClasesPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 20px" }}>Mis clases</h2>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: "36px", textAlign: "center",
      }}>
        <p style={{ color: C.muted, fontSize: 15, marginBottom: 16 }}>Vista en construcción — prototipo visual.</p>
        <Link href="/estudiante/informacion" style={{
          display: "inline-block",
          padding: "9px 20px", border: "none", borderRadius: 6,
          fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn, textDecoration: "none",
        }}>← Volver a mi información</Link>
      </div>
    </div>
  );
}
