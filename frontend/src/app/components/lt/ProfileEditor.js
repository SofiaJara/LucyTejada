"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/AuthContext";
import ConfirmModal from "./ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

const inputStyle = {
  width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`,
  borderRadius: 6, fontSize: 14, color: C.body, background: C.card,
  outline: "none", boxSizing: "border-box",
};

const Field = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 12, color: C.muted, marginBottom: 4, display: "block", fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

export default function ProfileEditor() {
  const { user, setUser } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false });
  const [pwd, setPwd] = useState({ nueva: "", confirmar: "" });

  useEffect(() => {
    api("/api/users/me/perfil").then(setPerfil);
  }, []);

  if (!perfil) return <p style={{ color: C.muted }}>Cargando perfil...</p>;

  const oc = (e) => setPerfil({ ...perfil, [e.target.name]: e.target.value });

  const guardarDatos = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        nombre: perfil.nombre, apellido: perfil.apellido,
        telefono: perfil.telefono, direccion: perfil.direccion,
        ciudad: perfil.ciudad, barrio: perfil.barrio,
      };
      const updated = await api("/api/users/me", { method: "PUT", body });
      setPerfil({ ...perfil, ...updated });
      if (user) setUser({ ...user, ...updated });
      setModal({ open: true, title: "Datos actualizados", message: "Tus datos personales fueron actualizados correctamente.", type: "success" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally { setLoading(false); }
  };

  const cambiarContrasena = async (e) => {
    e.preventDefault();
    if (!pwd.nueva || pwd.nueva.length < 6) {
      setModal({ open: true, title: "Contraseña inválida", message: "La nueva contraseña debe tener al menos 6 caracteres.", type: "warning" });
      return;
    }
    if (pwd.nueva !== pwd.confirmar) {
      setModal({ open: true, title: "No coincide", message: "La confirmación no coincide con la nueva contraseña.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      await api("/api/users/me", { method: "PUT", body: { contrasena: pwd.nueva } });
      setPwd({ nueva: "", confirmar: "" });
      setModal({ open: true, title: "Contraseña actualizada", message: "Tu contraseña fue cambiada. Úsala en tu próximo inicio de sesión.", type: "success" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: C.head }}>Mi perfil</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 22px" }}>
        Actualiza tus datos personales y tu contraseña.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22, alignItems: "start" }}>
        <form onSubmit={guardarDatos} style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "20px 22px",
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head, borderBottom: `1px solid ${C.divider}`, paddingBottom: 8 }}>
            Datos personales
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Field label="Documento (no editable)">
              <input value={perfil.documento} disabled style={{ ...inputStyle, background: "#f5f7f6", color: C.muted }} />
            </Field>
            <Field label="Correo (no editable)">
              <input value={perfil.correo} disabled style={{ ...inputStyle, background: "#f5f7f6", color: C.muted }} />
            </Field>
            <Field label="Nombre *">
              <input name="nombre" value={perfil.nombre || ""} onChange={oc} style={inputStyle} required />
            </Field>
            <Field label="Apellido *">
              <input name="apellido" value={perfil.apellido || ""} onChange={oc} style={inputStyle} required />
            </Field>
            <Field label="Teléfono">
              <input name="telefono" value={perfil.telefono || ""} onChange={oc} style={inputStyle} />
            </Field>
            <Field label="Ciudad">
              <input name="ciudad" value={perfil.ciudad || ""} onChange={oc} style={inputStyle} />
            </Field>
            <Field label="Barrio">
              <input name="barrio" value={perfil.barrio || ""} onChange={oc} style={inputStyle} />
            </Field>
            <Field label="Dirección">
              <input name="direccion" value={perfil.direccion || ""} onChange={oc} style={inputStyle} />
            </Field>
          </div>

          <button type="submit" disabled={loading} style={{
            padding: "9px 24px", border: "none", borderRadius: 6,
            fontSize: 14, fontWeight: 600, color: "#fff", background: C.btn,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        <form onSubmit={cambiarContrasena} style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "20px 22px",
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head, borderBottom: `1px solid ${C.divider}`, paddingBottom: 8 }}>
            Cambiar contraseña
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
            <Field label="Nueva contraseña *">
              <input type="password" value={pwd.nueva} onChange={(e) => setPwd({ ...pwd, nueva: e.target.value })} style={inputStyle} placeholder="Mínimo 6 caracteres" />
            </Field>
            <Field label="Confirmar nueva contraseña *">
              <input type="password" value={pwd.confirmar} onChange={(e) => setPwd({ ...pwd, confirmar: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          <button type="submit" disabled={loading || !pwd.nueva} style={{
            padding: "9px 24px", border: "none", borderRadius: 6,
            fontSize: 14, fontWeight: 600, color: "#fff", background: C.btn,
            cursor: (loading || !pwd.nueva) ? "not-allowed" : "pointer",
            opacity: (loading || !pwd.nueva) ? 0.6 : 1,
          }}>
            {loading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
