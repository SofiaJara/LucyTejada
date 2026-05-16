"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/app/lib/api";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", bg: "#f5f5f5",
  danger: "#a8442e", ok: "#3A6048",
};

export default function ResetPage() {
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState({ tipo: "", mensaje: "" });
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (!correo) {
      setEstado({ tipo: "error", mensaje: "Indica tu correo institucional." });
      return;
    }
    setEnviando(true);
    setEstado({ tipo: "", mensaje: "" });
    try {
      await api("/api/auth/solicitar-reset", { method: "POST", body: { correo }, auth: false });
      setEstado({
        tipo: "ok",
        mensaje: "Si el correo está registrado, los administradores recibirán una notificación para restablecer tu contraseña. Recibirás respuesta por los canales internos.",
      });
      setCorreo("");
    } catch (err) {
      setEstado({ tipo: "error", mensaje: err.message || "No se pudo procesar la solicitud." });
    } finally {
      setEnviando(false);
    }
  };

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
        <p style={{ fontSize: 14, color: C.muted, textAlign: "center", margin: "0 0 22px", lineHeight: 1.5 }}>
          Ingresa tu correo institucional. El equipo administrativo del Centro Cultural Lucy Tejada recibirá tu solicitud y restablecerá tu contraseña.
        </p>

        <form onSubmit={enviar}>
          <label style={{ fontSize: 13, color: C.head, fontWeight: 600, display: "block", marginBottom: 6 }}>
            Correo
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="tu.correo@lucytejada.edu.co"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 6,
              border: `1px solid ${C.border}`, fontSize: 14, color: C.body,
              boxSizing: "border-box", outline: "none", marginBottom: 14,
            }}
          />

          {estado.mensaje && (
            <p style={{
              margin: "0 0 14px", fontSize: 13, lineHeight: 1.5,
              color: estado.tipo === "ok" ? C.ok : C.danger,
              background: estado.tipo === "ok" ? "#eef5f0" : "#fdf1ec",
              padding: "10px 12px", borderRadius: 6,
            }}>{estado.mensaje}</p>
          )}

          <button type="submit" disabled={enviando} style={{
            width: "100%", padding: "10px 22px", border: "none", borderRadius: 6,
            fontSize: 14, fontWeight: 700, color: C.btnT, background: C.btn,
            cursor: enviando ? "wait" : "pointer", opacity: enviando ? 0.7 : 1, marginBottom: 16,
          }}>
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <Link href="/login" style={{
            fontSize: 13, color: C.btn, textDecoration: "none", fontWeight: 600,
          }}>← Volver al login</Link>
        </div>
      </div>
    </div>
  );
}
