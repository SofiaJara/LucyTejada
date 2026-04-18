"use client";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f5f5f5",
      fontFamily: "Segoe UI, sans-serif",
    }}>
      <p style={{ position: "absolute", top: 16, left: 0, right: 0, textAlign: "center",
        fontSize: 12, color: "#888", margin: 0 }}>
        Ilustración 1. Mockup inicio de sesión.
      </p>

      <div style={{
        width: 600, background: "#fff", borderRadius: 18, border: "2px solid #222",
        display: "flex", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}>
        {/* Panel izquierdo — Marca */}
        <div style={{
          width: 220, minHeight: 340, borderRight: "1.5px solid #222",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 24,
        }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#222" }}>Lucy Tejada</span>
          <span style={{ fontSize: 11, color: "#666" }}>Centro Cultural</span>
        </div>

        {/* Panel derecho — Formulario */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "32px", gap: 14,
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: "#222" }}>Bienvenido</h2>
          <input type="text" placeholder="usuario" readOnly style={{
            width: "100%", padding: "8px 12px", border: "1.5px solid #333",
            borderRadius: 6, fontSize: 13, color: "#888", background: "#fff",
            boxSizing: "border-box", outline: "none",
          }} />
          <input type="password" placeholder="contraseña" readOnly style={{
            width: "100%", padding: "8px 12px", border: "1.5px solid #333",
            borderRadius: 6, fontSize: 13, color: "#888", background: "#fff",
            boxSizing: "border-box", outline: "none",
          }} />
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <a href="/estudiante/informacion" style={{
              padding: "7px 18px", border: "1.5px solid #333", borderRadius: 6,
              fontSize: 13, color: "#222", background: "#fff", textDecoration: "none",
            }}>Estudiante</a>
            <a href="/profesor/dashboard" style={{
              padding: "7px 18px", border: "1.5px solid #333", borderRadius: 6,
              fontSize: 13, color: "#222", background: "#fff", textDecoration: "none",
            }}>Profesor</a>
          </div>
          <span style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            ¿no tienes cuenta?{" "}
            <span style={{ color: "#333", cursor: "pointer" }}>Regístrate</span>
          </span>
        </div>
      </div>

      <p style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center",
        fontSize: 12, color: "#666", margin: 0 }}>
        Fuente: Elaboración propia.
      </p>
    </div>
  );
}
