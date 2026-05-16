"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/app/lib/api";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
  danger: "#a8442e",
};

const empty = {
  nombre: "Grupo A", cupoMaximo: 20, totalClases: 19,
  horario: "", salon: "", programaId: "", profesorId: "",
};

export default function AdminGruposPageWrapper() {
  return (
    <Suspense fallback={<p style={{ color: "#4a5a52" }}>Cargando...</p>}>
      <AdminGruposPage />
    </Suspense>
  );
}

function AdminGruposPage() {
  const search = useSearchParams();
  const [grupos, setGrupos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [editar, setEditar] = useState(null);
  const [form, setForm] = useState(empty);
  const [confirmDel, setConfirmDel] = useState(null);
  const [modal, setModal] = useState({ open: false });
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState(search.get("busqueda") || "");
  const [programaFiltro, setProgramaFiltro] = useState(search.get("programaId") || "");
  const [activoFiltro, setActivoFiltro] = useState(search.get("activo") || "");
  const [inscribir, setInscribir] = useState(null); // grupo a inscribir
  const [inscribirEstId, setInscribirEstId] = useState("");
  const [inscribirBusy, setInscribirBusy] = useState(false);

  const cargar = () => {
    Promise.all([
      api("/api/grupos?incluirInactivos=true"),
      api("/api/programas?incluirInactivos=true", { auth: false }),
      api("/api/users/profesores"),
      api("/api/admin/usuarios?rol=estudiante&activo=true"),
    ]).then(([g, p, prof, est]) => {
      setGrupos(g);
      setProgramas(p);
      setProfesores(prof);
      setEstudiantes(est);
    });
  };
  useEffect(() => { cargar(); }, []);

  const gruposFiltrados = grupos.filter(g => {
    if (programaFiltro && g.programaId !== Number(programaFiltro)) return false;
    if (activoFiltro === "true" && !g.activo) return false;
    if (activoFiltro === "false" && g.activo) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const haystack = `${g.nombre} ${g.programa.nombre} ${g.horario} ${g.salon} ${g.profesor ? g.profesor.nombre + " " + g.profesor.apellido : ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const idsInscritos = (grupo) => new Set((grupo.inscripciones || []).map(i => i.estudiante?.id ?? i.estudianteId));
  // Backend rechaza si el estudiante ya tiene inscripción activa o en lista de espera
  // en otro grupo del mismo programa. Excluimos esos casos del selector para no mostrar
  // candidatos que de todos modos no se podrán inscribir.
  const candidatosParaGrupo = (grupo) => {
    if (!grupo) return [];
    const ya = idsInscritos(grupo);
    const otroGrupoDelPrograma = (estudiante) =>
      (estudiante.inscripciones || []).some(i =>
        i.grupoId !== grupo.id && i.grupo?.programaId === grupo.programaId
      );
    return estudiantes.filter(e => !ya.has(e.id) && !otroGrupoDelPrograma(e));
  };

  const abrirInscribir = (g) => {
    setInscribir(g);
    setInscribirEstId("");
  };
  const cerrarInscribir = () => { setInscribir(null); setInscribirEstId(""); };

  const confirmarInscribir = async () => {
    if (!inscribir || !inscribirEstId) return;
    setInscribirBusy(true);
    try {
      await api("/api/admin/inscripciones", {
        method: "POST",
        body: { estudianteId: Number(inscribirEstId), grupoId: inscribir.id },
      });
      cerrarInscribir();
      cargar();
      setModal({ open: true, title: "Estudiante inscrito", message: "La inscripción se registró y se notificó al estudiante.", type: "success" });
    } catch (err) {
      setModal({ open: true, title: "No se pudo inscribir", message: err.message, type: "error" });
    } finally {
      setInscribirBusy(false);
    }
  };

  const reactivar = async (g) => {
    try {
      await api(`/api/grupos/${g.id}`, {
        method: "PUT",
        body: {
          nombre: g.nombre, cupoMaximo: g.cupoMaximo, totalClases: g.totalClases,
          horario: g.horario, salon: g.salon, activo: true,
          profesorId: g.profesorId || null,
        },
      });
      cargar();
      setModal({ open: true, title: "Grupo reactivado", message: `"${g.programa?.nombre} · ${g.nombre}" volvió a estar activo.`, type: "success" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    }
  };

  const abrirNuevo = () => { setEditar("nuevo"); setForm({ ...empty, programaId: programas[0]?.id || "" }); };
  const abrirEditar = (g) => {
    setEditar(g.id);
    setForm({
      nombre: g.nombre, cupoMaximo: g.cupoMaximo, totalClases: g.totalClases,
      horario: g.horario, salon: g.salon,
      programaId: g.programaId,
      profesorId: g.profesorId || "",
    });
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.programaId) {
      setModal({ open: true, title: "Faltan datos", message: "Nombre y programa son obligatorios.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      const body = {
        ...form,
        cupoMaximo: Number(form.cupoMaximo),
        totalClases: Number(form.totalClases),
        programaId: Number(form.programaId),
        profesorId: form.profesorId ? Number(form.profesorId) : null,
      };
      if (editar === "nuevo") {
        await api("/api/grupos", { method: "POST", body });
      } else {
        await api(`/api/grupos/${editar}`, { method: "PUT", body });
      }
      setEditar(null);
      cargar();
      setModal({ open: true, title: "Guardado", message: "Grupo guardado.", type: "success" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally { setLoading(false); }
  };

  const eliminar = async () => {
    try {
      await api(`/api/grupos/${confirmDel.id}`, { method: "DELETE" });
      setConfirmDel(null);
      cargar();
      setModal({ open: true, title: "Grupo desactivado", message: "El grupo fue desactivado.", type: "success" });
    } catch (err) {
      setConfirmDel(null);
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal open={!!confirmDel}
        title="Desactivar grupo"
        message={confirmDel ? `¿Desactivar el grupo "${confirmDel.programa?.nombre} · ${confirmDel.nombre}"?` : ""}
        type="warning" confirmText="Sí, desactivar"
        onConfirm={eliminar} onCancel={() => setConfirmDel(null)} />
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      {editar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(28,38,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditar(null); }}>
          <form onSubmit={guardar} style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 560, border: `1.5px solid ${C.border}` }}>
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.head }}>
                {editar === "nuevo" ? "Nuevo grupo" : "Editar grupo"}
              </h3>
            </div>
            <div style={{ padding: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Programa *">
                <select value={form.programaId} onChange={(e) => setForm({ ...form, programaId: e.target.value })} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </Field>
              <Field label="Nombre del grupo *">
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} placeholder="Grupo A" />
              </Field>
              <Field label="Profesor">
                <select value={form.profesorId} onChange={(e) => setForm({ ...form, profesorId: e.target.value })} style={inputStyle}>
                  <option value="">Sin asignar</option>
                  {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </Field>
              <Field label="Salón">
                <input value={form.salon} onChange={(e) => setForm({ ...form, salon: e.target.value })} style={inputStyle} placeholder="Salón 3" />
              </Field>
              <Field label="Cupo máximo">
                <input type="number" min="1" value={form.cupoMaximo} onChange={(e) => setForm({ ...form, cupoMaximo: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Total clases">
                <input type="number" min="1" value={form.totalClases} onChange={(e) => setForm({ ...form, totalClases: e.target.value })} style={inputStyle} />
              </Field>
              <div style={{ gridColumn: "1 / 3" }}>
                <Field label="Horario">
                  <input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} style={inputStyle} placeholder="Lun y mié · 8:00 am" />
                </Field>
              </div>
            </div>
            <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setEditar(null)} style={btnGhost}>Cancelar</button>
              <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.head }}>Gestión de grupos</h2>
        <button onClick={abrirNuevo} style={btnPrimary}>+ Nuevo grupo</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, marginBottom: 14 }}>
        <input
          placeholder="Buscar por grupo, programa, profesor, salón..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={inputStyle}
        />
        <select value={programaFiltro} onChange={(e) => setProgramaFiltro(e.target.value)} style={inputStyle}>
          <option value="">Todos los programas</option>
          {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={activoFiltro} onChange={(e) => setActivoFiltro(e.target.value)} style={inputStyle}>
          <option value="">Activos e inactivos</option>
          <option value="true">Sólo activos</option>
          <option value="false">Sólo inactivos</option>
        </select>
        <button
          onClick={() => { setBusqueda(""); setProgramaFiltro(""); setActivoFiltro(""); }}
          disabled={!busqueda && !programaFiltro && !activoFiltro}
          style={{ ...btnGhost, opacity: (busqueda || programaFiltro || activoFiltro) ? 1 : 0.55 }}
        >Limpiar</button>
      </div>

      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 10px" }}>{gruposFiltrados.length} grupo(s)</p>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
              {["Programa", "Grupo", "Profesor", "Horario", "Salón", "Inscritos", "Cupos", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 13, fontWeight: 700, color: C.head }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gruposFiltrados.map(g => (
              <tr key={g.id} style={{ borderBottom: `1px solid ${C.divider}`, opacity: g.activo ? 1 : 0.6 }}>
                <td style={td}>
                  {g.programa.nombre}
                  {!g.activo && <span style={{ marginLeft: 6, fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700, color: C.danger, background: "#fdf1ec", textTransform: "uppercase" }}>Inactivo</span>}
                </td>
                <td style={{ ...td, fontWeight: 500 }}>{g.nombre}</td>
                <td style={td}>{g.profesor ? `${g.profesor.nombre} ${g.profesor.apellido}` : <span style={{ color: C.muted, fontStyle: "italic" }}>Sin asignar</span>}</td>
                <td style={td}>{g.horario}</td>
                <td style={td}>{g.salon}</td>
                <td style={{ ...td, fontWeight: 600, color: C.btn }}>{g._count?.inscripciones || 0}</td>
                <td style={td}>{g.cupoMaximo}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  {g.activo && (
                    <button onClick={() => abrirInscribir(g)} style={{ ...btnSm, marginRight: 6 }} title="Inscribir estudiante manualmente">+ Inscribir</button>
                  )}
                  <button onClick={() => abrirEditar(g)} style={btnSm}>Editar</button>
                  {g.activo ? (
                    <button onClick={() => setConfirmDel(g)} style={{ ...btnSm, color: C.danger, marginLeft: 6 }}>Desactivar</button>
                  ) : (
                    <button onClick={() => reactivar(g)} style={{ ...btnSm, marginLeft: 6 }}>Reactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gruposFiltrados.length === 0 && (
          <p style={{ padding: 22, margin: 0, textAlign: "center", color: C.muted, fontSize: 14 }}>
            {grupos.length === 0 ? "Sin grupos. Crea uno nuevo." : "Ningún grupo coincide con los filtros."}
          </p>
        )}
      </div>

      {inscribir && (
        <div style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(28,38,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) cerrarInscribir(); }}>
          <div style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 520, border: `1.5px solid ${C.border}` }}>
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.head }}>Inscribir estudiante manualmente</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
                {inscribir.programa.nombre} · {inscribir.nombre} — cupo {inscribir._count?.inscripciones || 0}/{inscribir.cupoMaximo}
              </p>
            </div>
            <div style={{ padding: 22 }}>
              <label style={{ fontSize: 12, color: "#4a5a52", marginBottom: 4, display: "block", fontWeight: 500 }}>Estudiante *</label>
              <select value={inscribirEstId} onChange={(e) => setInscribirEstId(e.target.value)} style={inputStyle} autoFocus>
                <option value="">— Selecciona un estudiante —</option>
                {candidatosParaGrupo(inscribir).map(e => (
                  <option key={e.id} value={e.id}>{e.nombre} {e.apellido} · {e.documento}</option>
                ))}
              </select>
              {candidatosParaGrupo(inscribir).length === 0 && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: C.muted }}>
                  Todos los estudiantes activos ya están inscritos en este grupo.
                </p>
              )}
              <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
                Si no quedan cupos, la inscripción quedará en lista de espera y el estudiante recibirá una notificación.
              </p>
            </div>
            <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={cerrarInscribir} style={btnGhost}>Cancelar</button>
              <button
                onClick={confirmarInscribir}
                disabled={inscribirBusy || !inscribirEstId}
                style={{ ...btnPrimary, opacity: (inscribirBusy || !inscribirEstId) ? 0.55 : 1, cursor: (inscribirBusy || !inscribirEstId) ? "not-allowed" : "pointer" }}
              >{inscribirBusy ? "Inscribiendo..." : "Inscribir"}</button>
            </div>
          </div>
        </div>
      )}
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
const td = { padding: "9px 12px", fontSize: 13, color: C.body };
const btnPrimary = { padding: "8px 18px", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, color: "#fff", background: C.btn, cursor: "pointer" };
const btnGhost = { padding: "8px 18px", border: `1.5px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.muted, background: "#fff", cursor: "pointer" };
const btnSm = { padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12, color: C.btn, background: "#fff", cursor: "pointer", fontWeight: 600 };
