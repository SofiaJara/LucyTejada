"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { exportCSV, exportXLS, exportPDF } from "@/app/lib/exporters";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

const accionColors = {
  login:  { bg: "#eef5f0", fg: "#3A6048" },
  logout: { bg: "#f5eef0", fg: "#8a5a4a" },
  create: { bg: "#e8eef5", fg: "#2e4a73" },
  update: { bg: "#fdf5e8", fg: "#a06b1f" },
  delete: { bg: "#fdf1ec", fg: "#a8442e" },
};

export default function BitacoraPage() {
  const [registros, setRegistros] = useState([]);
  const [accion, setAccion] = useState("");
  const [entidad, setEntidad] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [loading, setLoading] = useState(false);

  const cargar = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (accion) params.set("accion", accion);
    if (entidad) params.set("entidad", entidad);
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", new Date(hasta + "T23:59:59").toISOString());
    params.set("limit", "500");
    api(`/api/admin/bitacora?${params.toString()}`)
      .then(setRegistros)
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [accion, entidad, desde, hasta]);

  const exportData = registros.map(r => ({
    fecha: new Date(r.createdAt).toLocaleString("es-CO"),
    accion: r.accion,
    entidad: r.entidad,
    descripcion: r.descripcion,
    usuario: r.usuarioCorreo || "—",
    ip: r.ip || "—",
  }));

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: C.head }}>Bitácora de auditoría</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
        Registro de actividad: inicios de sesión, creación, modificación y eliminación de información.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto auto", gap: 10, marginBottom: 16 }}>
        <select value={accion} onChange={(e) => setAccion(e.target.value)} style={input}>
          <option value="">Todas las acciones</option>
          <option value="login">Login</option>
          <option value="create">Crear</option>
          <option value="update">Actualizar</option>
          <option value="delete">Eliminar</option>
        </select>
        <select value={entidad} onChange={(e) => setEntidad(e.target.value)} style={input}>
          <option value="">Todas las entidades</option>
          <option value="usuario">Usuario</option>
          <option value="programa">Programa</option>
          <option value="grupo">Grupo</option>
          <option value="inscripcion">Inscripción</option>
        </select>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={input} title="Desde" />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={input} title="Hasta" />
        <button onClick={() => exportCSV("bitacora.csv", exportData)} style={btnExp}>CSV</button>
        <button onClick={() => exportPDF("Bitácora de Auditoría", exportData)} style={btnExp}>PDF</button>
      </div>

      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 8px" }}>
        {loading ? "Cargando..." : `${registros.length} registro(s)`}
      </p>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
              {["Fecha", "Acción", "Entidad", "Descripción", "Usuario", "IP"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 13, fontWeight: 700, color: C.head }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registros.map(r => {
              const ac = accionColors[r.accion] || { bg: "#eee", fg: "#555" };
              return (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <td style={{ ...td, color: C.muted, whiteSpace: "nowrap" }}>
                    {new Date(r.createdAt).toLocaleString("es-CO")}
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 4, fontWeight: 700, background: ac.bg, color: ac.fg, textTransform: "uppercase" }}>
                      {r.accion}
                    </span>
                  </td>
                  <td style={{ ...td, fontWeight: 500 }}>{r.entidad}</td>
                  <td style={td}>{r.descripcion}</td>
                  <td style={{ ...td, color: C.muted }}>{r.usuarioCorreo || "—"}</td>
                  <td style={{ ...td, color: C.muted, fontFamily: "monospace", fontSize: 11 }}>{r.ip || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {registros.length === 0 && !loading && (
          <p style={{ padding: 22, margin: 0, textAlign: "center", color: C.muted, fontSize: 14 }}>Sin registros con esos filtros.</p>
        )}
      </div>
    </div>
  );
}

const input = { padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.body, background: "#fff", outline: "none" };
const td = { padding: "8px 12px", fontSize: 13, color: C.body };
const btnExp = { padding: "8px 14px", border: `1.5px solid ${C.btn}`, borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.btn, background: "#fff", cursor: "pointer" };
