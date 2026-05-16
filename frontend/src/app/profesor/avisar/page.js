"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/app/lib/api";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

export default function ProfesorAvisarPage() {
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [categoria, setCategoria] = useState("horarios");
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState({ open: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/grupos").then(gs => {
      setGrupos(gs);
      if (gs.length > 0) setGrupoId(gs[0].id);
    });
  }, []);

  const grupo = useMemo(() => grupos.find(g => g.id === Number(grupoId)), [grupoId, grupos]);
  const destinatarios = grupo?.inscripciones?.map(i => i.estudiante.id) || [];

  const enviar = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      if (destinatarios.length === 0) {
        setModal({ open: true, title: "Sin destinatarios", message: "El grupo seleccionado no tiene estudiantes inscritos.", type: "warning" });
        return;
      }
      await api("/api/notificaciones", {
        method: "POST",
        body: { usuarioIds: destinatarios, titulo, mensaje, categoria },
      });
      setModal({ open: true, title: "Aviso enviado", message: `Se notificó a ${destinatarios.length} estudiante(s).`, type: "success" });
      setTitulo(""); setMensaje("");
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!titulo || !mensaje) {
      setModal({ open: true, title: "Faltan datos", message: "Título y mensaje son obligatorios.", type: "warning" });
      return;
    }
    setConfirm(true);
  };

  if (grupos.length === 0) {
    return (
      <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 20, fontWeight: 700, color: C.head }}>Avisar al grupo</h2>
        <div style={{ padding: 30, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, textAlign: "center" }}>
          Aún no tienes grupos asignados. Contacta al administrador.
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal
        open={confirm}
        title="Confirmar envío"
        message={`Vas a enviar este aviso a ${destinatarios.length} estudiante(s) del grupo ${grupo?.programa?.nombre} · ${grupo?.nombre}. ¿Continuar?`}
        type="confirm"
        confirmText="Sí, enviar"
        onConfirm={enviar}
        onCancel={() => setConfirm(false)}
      />
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: C.head }}>Avisar al grupo</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
        Envía una notificación a todos los estudiantes inscritos en uno de tus grupos.
      </p>

      <form onSubmit={onSubmit} style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: 22, maxWidth: 720,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Field label="Grupo">
            <select value={grupoId} onChange={(e) => setGrupoId(Number(e.target.value))} style={inputStyle}>
              {grupos.map(g => (
                <option key={g.id} value={g.id}>
                  {g.programa.nombre} · {g.nombre} ({g._count?.inscripciones || 0} est.)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Categoría">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={inputStyle}>
              <option value="horarios">Horarios</option>
              <option value="academico">Académico</option>
              <option value="eventos">Eventos</option>
              <option value="administrativo">Administrativo</option>
              <option value="sistema">Sistema</option>
            </select>
          </Field>
        </div>

        <Field label="Título *">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} style={inputStyle} placeholder="Recordatorio · clase del jueves" />
        </Field>

        <Field label="Mensaje *">
          <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} style={{ ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: "Segoe UI, sans-serif" }}
            placeholder="Detalle del aviso..." />
        </Field>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 13, color: C.muted }}>
            Se enviará a <strong style={{ color: C.btn }}>{destinatarios.length}</strong> estudiante(s)
          </span>
          <button type="submit" disabled={loading || destinatarios.length === 0} style={{
            padding: "10px 26px", border: "none", borderRadius: 6,
            fontSize: 15, fontWeight: 600, color: "#fff", background: C.btn,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Enviando..." : "Enviar aviso"}
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

const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid #b8cdc0`, borderRadius: 6, fontSize: 14, color: "#2c3a32", background: "#fff", outline: "none", boxSizing: "border-box" };
