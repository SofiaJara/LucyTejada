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
  documento: "", nombre: "", apellido: "", correo: "", contrasena: "",
  rol: "estudiante", telefono: "", direccion: "", ciudad: "Pereira",
  barrio: "", genero: "Masculino", fechaNacimiento: "", activo: true,
};

export default function AdminUsuariosPageWrapper() {
  return (
    <Suspense fallback={<p style={{ color: "#4a5a52" }}>Cargando...</p>}>
      <AdminUsuariosPage />
    </Suspense>
  );
}

function AdminUsuariosPage() {
  const search = useSearchParams();
  const [usuarios, setUsuarios] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [rolFiltro, setRolFiltro] = useState(search.get("rol") || "");
  const [generoFiltro, setGeneroFiltro] = useState(search.get("genero") || "");
  const [ciudadFiltro, setCiudadFiltro] = useState(search.get("ciudad") || "");
  const [barrioFiltro, setBarrioFiltro] = useState(search.get("barrio") || "");
  const [grupoFiltro, setGrupoFiltro] = useState(search.get("grupoId") || "");
  const [activoFiltro, setActivoFiltro] = useState(search.get("activo") || "");
  const [minEdad, setMinEdad] = useState(search.get("minEdad") || "");
  const [maxEdad, setMaxEdad] = useState(search.get("maxEdad") || "");
  const [busqueda, setBusqueda] = useState(search.get("busqueda") || "");
  const [editar, setEditar] = useState(null);
  const [form, setForm] = useState(empty);
  const [confirmDel, setConfirmDel] = useState(null);
  const [modal, setModal] = useState({ open: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/grupos").then(setGrupos).catch(() => setGrupos([]));
  }, []);

  const cargar = () => {
    const params = new URLSearchParams();
    if (rolFiltro) params.set("rol", rolFiltro);
    if (generoFiltro) params.set("genero", generoFiltro);
    if (ciudadFiltro) params.set("ciudad", ciudadFiltro);
    if (barrioFiltro) params.set("barrio", barrioFiltro);
    if (grupoFiltro) params.set("grupoId", grupoFiltro);
    if (activoFiltro) params.set("activo", activoFiltro);
    if (minEdad) params.set("minEdad", minEdad);
    if (maxEdad) params.set("maxEdad", maxEdad);
    if (busqueda) params.set("busqueda", busqueda);
    const q = params.toString() ? `?${params.toString()}` : "";
    api(`/api/admin/usuarios${q}`).then(setUsuarios);
  };
  useEffect(() => { cargar(); }, [rolFiltro, generoFiltro, ciudadFiltro, barrioFiltro, grupoFiltro, activoFiltro, minEdad, maxEdad, busqueda]);

  const abrirNuevo = () => { setEditar("nuevo"); setForm(empty); };
  const abrirEditar = (u) => {
    setEditar(u.id);
    setForm({ ...empty, ...u, contrasena: "", fechaNacimiento: u.fechaNacimiento ? u.fechaNacimiento.split("T")[0] : "" });
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.documento || !form.nombre || !form.apellido || !form.correo) {
      setModal({ open: true, title: "Faltan datos", message: "Completa documento, nombre, apellido y correo.", type: "warning" });
      return;
    }
    if (editar === "nuevo" && !form.contrasena) {
      setModal({ open: true, title: "Falta contraseña", message: "Indica una contraseña inicial para el usuario.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      if (editar === "nuevo") {
        await api("/api/admin/usuarios", { method: "POST", body: form });
      } else {
        const body = { ...form };
        if (!body.contrasena) delete body.contrasena;
        await api(`/api/admin/usuarios/${editar}`, { method: "PUT", body });
      }
      setEditar(null);
      cargar();
      setModal({ open: true, title: "Guardado", message: "Usuario guardado correctamente.", type: "success" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async () => {
    if (!confirmDel) return;
    try {
      await api(`/api/admin/usuarios/${confirmDel.id}`, { method: "DELETE" });
      setConfirmDel(null);
      cargar();
      setModal({ open: true, title: "Usuario desactivado", message: "El usuario fue desactivado.", type: "success" });
    } catch (err) {
      setConfirmDel(null);
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    }
  };

  const reactivar = async (u) => {
    try {
      await api(`/api/admin/usuarios/${u.id}`, { method: "PUT", body: { ...u, activo: true } });
      cargar();
      setModal({ open: true, title: "Usuario reactivado", message: `${u.nombre} ${u.apellido} fue reactivado.`, type: "success" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    }
  };

  const limpiarFiltros = () => {
    setRolFiltro(""); setGeneroFiltro(""); setCiudadFiltro(""); setBarrioFiltro(""); setGrupoFiltro(""); setActivoFiltro(""); setMinEdad(""); setMaxEdad(""); setBusqueda("");
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal
        open={!!confirmDel}
        title="Desactivar usuario"
        message={confirmDel ? `¿Desactivar a ${confirmDel.nombre} ${confirmDel.apellido}? Podrá ser reactivado más tarde.` : ""}
        type="warning"
        confirmText="Sí, desactivar"
        onConfirm={eliminar}
        onCancel={() => setConfirmDel(null)}
      />
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      {editar && (
        <UsuarioForm
          form={form}
          setForm={setForm}
          esNuevo={editar === "nuevo"}
          onCancel={() => setEditar(null)}
          onSubmit={guardar}
          loading={loading}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.head }}>Gestión de usuarios</h2>
        <button onClick={abrirNuevo} style={btnPrimary}>+ Nuevo usuario</button>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10 }}>
          <input placeholder="Buscar por nombre, correo o documento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={input} />
          <select value={rolFiltro} onChange={(e) => setRolFiltro(e.target.value)} style={input}>
            <option value="">Todos los roles</option>
            <option value="estudiante">Estudiantes</option>
            <option value="profesor">Profesores</option>
            <option value="admin">Administradores</option>
          </select>
          <select value={generoFiltro} onChange={(e) => setGeneroFiltro(e.target.value)} style={input}>
            <option value="">Todos los géneros</option>
            <option>Masculino</option>
            <option>Femenino</option>
            <option>Otro</option>
          </select>
          <select value={grupoFiltro} onChange={(e) => setGrupoFiltro(e.target.value)} style={input} title="Filtrar por grupo">
            <option value="">Todos los grupos</option>
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.programa.nombre} · {g.nombre}</option>
            ))}
          </select>
          <select value={activoFiltro} onChange={(e) => setActivoFiltro(e.target.value)} style={input} title="Estado">
            <option value="">Activos e inactivos</option>
            <option value="true">Sólo activos</option>
            <option value="false">Sólo inactivos</option>
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10 }}>
          <input placeholder="Ciudad" value={ciudadFiltro} onChange={(e) => setCiudadFiltro(e.target.value)} style={input} />
          <input placeholder="Barrio" value={barrioFiltro} onChange={(e) => setBarrioFiltro(e.target.value)} style={input} />
          <input type="number" min="0" placeholder="Edad mínima" value={minEdad} onChange={(e) => setMinEdad(e.target.value)} style={input} title="Edad mínima (años)" />
          <input type="number" min="0" placeholder="Edad máxima" value={maxEdad} onChange={(e) => setMaxEdad(e.target.value)} style={input} title="Edad máxima (años)" />
          <button onClick={limpiarFiltros} style={{ ...btnGhost, padding: "9px 18px" }}>Limpiar filtros</button>
        </div>
      </div>

      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 10px" }}>{usuarios.length} usuario(s)</p>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
              {["Documento", "Nombre completo", "Correo", "Rol", "Género", "Ciudad", "Estado", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 13, fontWeight: 700, color: C.head }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                <td style={td}>{u.documento}</td>
                <td style={{ ...td, fontWeight: 500 }}>{u.nombre} {u.apellido}</td>
                <td style={{ ...td, color: C.muted }}>{u.correo}</td>
                <td style={td}><span style={pill(u.rol)}>{u.rol}</span></td>
                <td style={td}>{u.genero || "—"}</td>
                <td style={td}>{u.ciudad || "—"}</td>
                <td style={td}>
                  <span style={{
                    fontSize: 12, padding: "2px 10px", borderRadius: 4, fontWeight: 600,
                    color: u.activo ? C.btn : C.danger,
                    background: u.activo ? "#eef5f0" : "#fdf1ec",
                  }}>{u.activo ? "Activo" : "Inactivo"}</span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <button onClick={() => abrirEditar(u)} style={btnSm}>Editar</button>
                  {u.activo ? (
                    <button onClick={() => setConfirmDel(u)} style={{ ...btnSm, color: C.danger, marginLeft: 6 }}>Desactivar</button>
                  ) : (
                    <button onClick={() => reactivar(u)} style={{ ...btnSm, marginLeft: 6 }}>Reactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && (
          <p style={{ padding: 22, margin: 0, textAlign: "center", color: C.muted, fontSize: 14 }}>Sin usuarios.</p>
        )}
      </div>
    </div>
  );
}

function UsuarioForm({ form, setForm, esNuevo, onCancel, onSubmit, loading }) {
  const oc = (e) => setForm({ ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 800, background: "rgba(28,38,32,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <form onSubmit={onSubmit} style={{
        background: "#fff", borderRadius: 10, width: "100%", maxWidth: 640,
        border: `1.5px solid ${C.border}`, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.head }}>
            {esNuevo ? "Nuevo usuario" : "Editar usuario"}
          </h3>
          <button type="button" onClick={onCancel} style={{ background: "transparent", border: "none", fontSize: 22, color: C.muted, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Documento *" name="documento" value={form.documento} onChange={oc} />
          <Input label="Rol *" name="rol" value={form.rol} onChange={oc} as="select" options={[["estudiante","Estudiante"],["profesor","Profesor"],["admin","Administrador"]]} />
          <Input label="Nombre *" name="nombre" value={form.nombre} onChange={oc} />
          <Input label="Apellido *" name="apellido" value={form.apellido} onChange={oc} />
          <Input label="Correo *" name="correo" type="email" value={form.correo} onChange={oc} />
          <Input label={esNuevo ? "Contraseña *" : "Nueva contraseña (opcional)"} name="contrasena" type="password" value={form.contrasena} onChange={oc} />
          <Input label="Teléfono" name="telefono" value={form.telefono} onChange={oc} />
          <Input label="Fecha de nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={oc} />
          <Input label="Género" name="genero" value={form.genero} onChange={oc} as="select" options={[["Masculino","Masculino"],["Femenino","Femenino"],["Otro","Otro"]]} />
          <Input label="Ciudad" name="ciudad" value={form.ciudad} onChange={oc} />
          <Input label="Barrio" name="barrio" value={form.barrio} onChange={oc} />
          <Input label="Dirección" name="direccion" value={form.direccion} onChange={oc} colSpan={2} />
        </div>
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onCancel} style={btnGhost}>Cancelar</button>
          <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, colSpan = 1, as, options, ...props }) {
  return (
    <div style={{ gridColumn: colSpan === 2 ? "1 / 3" : "auto" }}>
      <label style={{ fontSize: 12, color: "#4a5a52", marginBottom: 4, display: "block", fontWeight: 500 }}>{label}</label>
      {as === "select" ? (
        <select {...props} style={input}>
          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <input {...props} style={input} />
      )}
    </div>
  );
}

const input = { width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.body, background: "#fff", outline: "none", boxSizing: "border-box" };
const td = { padding: "9px 12px", fontSize: 13, color: C.body };
const btnPrimary = { padding: "8px 18px", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, color: "#fff", background: C.btn, cursor: "pointer" };
const btnGhost = { padding: "8px 18px", border: `1.5px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.muted, background: "#fff", cursor: "pointer" };
const btnSm = { padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12, color: C.btn, background: "#fff", cursor: "pointer", fontWeight: 600 };
function pill(rol) {
  const colors = {
    estudiante: { bg: "#eef5f0", color: "#3A6048" },
    profesor: { bg: "#fdf5e8", color: "#a06b1f" },
    admin: { bg: "#e8eef5", color: "#2e4a73" },
  };
  const c = colors[rol] || colors.estudiante;
  return { fontSize: 11, padding: "2px 10px", borderRadius: 4, fontWeight: 700, color: c.color, background: c.bg, textTransform: "uppercase" };
}
