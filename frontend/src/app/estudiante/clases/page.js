"use client";
import Link from "next/link";

export default function ClasesPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 16px" }}>Mis clases</h2>
      <div style={{
        background: "#fff", border: "1px solid #ddd", borderRadius: 8,
        padding: "32px", textAlign: "center",
      }}>
        <p style={{ color: "#888", fontSize: 13 }}>Vista en construcción — prototipo visual.</p>
        <Link href="/estudiante/informacion" style={{
          marginTop: 12, display: "inline-block",
          padding: "7px 18px", border: "1.5px solid #333", borderRadius: 6,
          fontSize: 13, color: "#222", background: "#fff", textDecoration: "none",
        }}>← Volver a mi información</Link>
      </div>
    </div>
  );
}
