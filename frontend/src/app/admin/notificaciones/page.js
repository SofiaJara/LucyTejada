"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

export default function AdminNotificacionesPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [destino, setDestino] = useState("todos"); // todos | estudiantes | profesores | especificos
  const [seleccion, setSeleccion] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [categoria, setCategoria] = useState("sistema");
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState({ open: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/admin/usuarios").then(us => setUsuarios(us.filter(u => u.activo)));
  }, []);

  const destinatarios = () => {
    if (destino === "todos") return usuarios.map(u => u.id);
    if (destino === "estudiantes") return usuarios.filter(u => u.rol === "estudiante").map(u => u.id);
    if (destino === "profesores") return usuarios.filter(u => u.rol === "profesor").map(u => u.id);
    return seleccion;
  };

  const enviar = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      const ids = destinatarios();
      if (ids.length === 0) {
        setModal({ open: true, title: "Sin destinatarios", message: "Selecciona al menos un destinatario.", type: "warning" });
        return;
      }
      await api("/api/notificaciones", {
        method: "POST",
        body: { usuarioIds: ids, titulo, mensaje, categoria },
      });
      setModal({ open: true, title: "Notificación enviada", message: `La notificación fue enviada a ${ids.length} usuario(s).`, type: "success" });
      setTitulo(""); setMensaje(""); setSeleccion([]);
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally { setLoading(false); }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!titulo || !mensaje) {
      setModal({ open: true, title: "Faltan datos", message: "Título y mensaje son obligatorios.", type: "warning" });
      return;
    }
    setConfirm(true);
  };

  const ids = destinatarios();

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal
        open={confirm}
        title="Confirmar envío"
        message={`Vas a enviar esta notificación a ${ids.length} usuario(s). ¿Deseas continuar?`}
        type="confirm"
        confirmText="Sí, enviar"
        onConfirm={enviar}
        onCancel={() => setConfirm(false)}
      />
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 700, color: C.head }}>Enviar notificación</h2>

      <form onSubmit={onSubmit} style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: 22, maxWidth: 720,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Field label="Destinatarios">
            <select value={destino} onChange={(e) => setDestino(e.target.value)} style={inputStyle}>
              <option value="todos">Todos los usuarios</option>
              <option value="estudiantes">Todos los estudiantes</option>
              <option value="profesores">Todos los profesores</option>
              <option value="especificos">Usuarios específicos</option>
            </select>
          </Field>
          <Field label="Categoría">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={inputStyle}>
              <option value="sistema">Sistema</option>
              <option value="horarios">Horarios</option>
              <option value="academico">Académico</option>
              <option value="eventos">Eventos</option>
              <option value="administrativo">Administrativo</option>
            </select>
          </Field>
        </div>

        {destino === "especificos" && (
          <Field label={`Seleccionar usuarios (${seleccion.length} seleccionados)`}>
            <div style={{
              maxHeight: 200, overflowY: "auto", border: `1px solid ${C.border}`,
              borderRadius: 6, padding: 8,
            }}>
              {usuarios.map(u => (
                <label key={u.id} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "4px 6px",
                  fontSize: 13, color: C.body, cursor: "pointer",
                }}>
                  <input
                    type="checkbox"
                    checked={seleccion.includes(u.id)}
                    onChange={() => setSeleccion(s => s.includes(u.id) ? s.filter(x => x !== u.id) : [...s, u.id])}
                  />
                  {u.nombre} {u.apellido} <span style={{ color: C.muted, marginLeft: "auto" }}>{u.rol}</span>
                </label>
              ))}
            </div>
          </Field>
        )}

        <Field label="Título *">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} style={inputStyle} placeholder="Cambio de horario · Piano básico" />
        </Field>

        <Field label="Mensaje *">
          <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} style={{ ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: "Segoe UI, sans-serif" }}
            placeholder="Detalle de la notificación..." />
        </Field>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 13, color: C.muted }}>
            Se enviará a <strong style={{ color: C.btn }}>{ids.length}</strong> usuario(s)
          </span>
          <button type="submit" disabled={loading || ids.length === 0} style={{
            padding: "10px 26px", border: "none", borderRadius: 6,
            fontSize: 15, fontWeight: 600, color: "#fff", background: C.btn,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Enviando..." : "Enviar notificación"}
          </button>
        </div>
      </form>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontSize: 13, color: "#4a5a52", marginBottom: 4, display: "block", fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.body, background: "#fff", outline: "none", boxSizing: "border-box" };
