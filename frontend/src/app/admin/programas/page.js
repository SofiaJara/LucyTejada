"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
  danger: "#a8442e",
};

const empty = { nombre: "", categoria: "Música", descripcion: "", duracion: "Semestre" };

export default function AdminProgramasPage() {
  const [programas, setProgramas] = useState([]);
  const [editar, setEditar] = useState(null);
  const [form, setForm] = useState(empty);
  const [confirmDel, setConfirmDel] = useState(null);
  const [modal, setModal] = useState({ open: false });
  const [loading, setLoading] = useState(false);

  const cargar = () => api("/api/programas", { auth: false }).then(setProgramas);
  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setEditar("nuevo"); setForm(empty); };
  const abrirEditar = (p) => { setEditar(p.id); setForm({ ...empty, ...p }); };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.categoria) {
      setModal({ open: true, title: "Faltan datos", message: "Nombre y categoría son obligatorios.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      if (editar === "nuevo") {
        await api("/api/programas", { method: "POST", body: form });
      } else {
        await api(`/api/programas/${editar}`, { method: "PUT", body: form });
      }
      setEditar(null);
      cargar();
      setModal({ open: true, title: "Guardado", message: "Programa guardado.", type: "success" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally { setLoading(false); }
  };

  const eliminar = async () => {
    try {
      await api(`/api/programas/${confirmDel.id}`, { method: "DELETE" });
      setConfirmDel(null);
      cargar();
      setModal({ open: true, title: "Programa desactivado", message: "El programa fue desactivado.", type: "success" });
    } catch (err) {
      setConfirmDel(null);
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal
        open={!!confirmDel}
        title="Desactivar programa"
        message={confirmDel ? `¿Desactivar el programa "${confirmDel.nombre}"? Los grupos existentes seguirán visibles pero no se podrán inscribir nuevos estudiantes.` : ""}
        type="warning"
        confirmText="Sí, desactivar"
        onConfirm={eliminar}
        onCancel={() => setConfirmDel(null)}
      />
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      {editar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(28,38,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditar(null); }}
        >
          <form onSubmit={guardar} style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 500, border: `1.5px solid ${C.border}` }}>
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.head }}>
                {editar === "nuevo" ? "Nuevo programa" : "Editar programa"}
              </h3>
            </div>
            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Nombre *"><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} /></Field>
              <Field label="Categoría *">
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={inputStyle}>
                  {["Música", "Artes escénicas", "Artes visuales", "Danza", "Teatro", "Literatura"].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Duración">
                <select value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })} style={inputStyle}>
                  {["Semestre", "Trimestre", "6 meses", "1 año"].map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Descripción">
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ ...inputStyle, minHeight: 70, resize: "vertical", fontFamily: "Segoe UI, sans-serif" }} />
              </Field>
            </div>
            <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setEditar(null)} style={btnGhost}>Cancelar</button>
              <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.head }}>Gestión de programas</h2>
        <button onClick={abrirNuevo} style={btnPrimary}>+ Nuevo programa</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {programas.map(p => (
          <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.head, marginBottom: 4 }}>{p.nombre}</div>
            <div style={{ fontSize: 12, color: C.btn, fontWeight: 600, marginBottom: 10 }}>{p.categoria} · {p.duracion}</div>
            <p style={{ fontSize: 13, color: C.body, margin: "0 0 10px", lineHeight: 1.5 }}>
              {p.descripcion || "Sin descripción."}
            </p>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
              <strong>{p.grupos?.length || 0}</strong> grupo(s)
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => abrirEditar(p)} style={btnSm}>Editar</button>
              <button onClick={() => setConfirmDel(p)} style={{ ...btnSm, color: C.danger }}>Desactivar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 12, color: "#4a5a52", marginBottom: 4, display: "block", fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

const inputStyle = { width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.body, background: "#fff", outline: "none", boxSizing: "border-box" };
const btnPrimary = { padding: "8px 18px", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, color: "#fff", background: C.btn, cursor: "pointer" };
const btnGhost = { padding: "8px 18px", border: `1.5px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.muted, background: "#fff", cursor: "pointer" };
const btnSm = { padding: "5px 12px", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12, color: C.btn, background: "#fff", cursor: "pointer", fontWeight: 600 };
