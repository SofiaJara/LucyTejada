"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

function exportCSV(filename, rows) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportesPage() {
  const [tab, setTab] = useState("asistencia");
  const [asist, setAsist] = useState([]);
  const [inscr, setInscr] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    api("/api/admin/reportes/asistencia").then(setAsist);
    api("/api/admin/reportes/inscripciones").then(setInscr);
    api("/api/admin/usuarios?rol=estudiante").then(setEstudiantes);
  }, []);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 700, color: C.head }}>Reportes</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[
          { key: "asistencia", label: "Asistencia por grupo" },
          { key: "inscripciones", label: "Inscripciones por programa" },
          { key: "estudiantes", label: "Demografía de estudiantes" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 16px", borderRadius: 6,
            border: `1.5px solid ${tab === t.key ? C.btn : C.border}`,
            background: tab === t.key ? C.btn : "#fff",
            color: tab === t.key ? "#fff" : C.body,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "asistencia" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>Asistencia por grupo</h3>
            <button onClick={() => exportCSV("asistencia.csv", asist)} style={btnSecondary}>Exportar CSV</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                {["Programa", "Grupo", "Clases", "Estudiantes", "Asistencia"].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {asist.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <td style={td}>{r.programa}</td>
                  <td style={td}>{r.grupo}</td>
                  <td style={td}>{r.clases}</td>
                  <td style={td}>{r.estudiantes}</td>
                  <td style={{ ...td, fontWeight: 700, color: r.asistenciaPorcentaje >= 75 ? C.btn : "#a06b1f" }}>
                    {r.asistenciaPorcentaje}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "inscripciones" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>Inscripciones por programa</h3>
            <button onClick={() => exportCSV("inscripciones.csv", inscr)} style={btnSecondary}>Exportar CSV</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                {["Programa", "Categoría", "Grupos", "Inscripciones"].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {inscr.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <td style={td}>{r.programa}</td>
                  <td style={{ ...td, color: C.muted }}>{r.categoria}</td>
                  <td style={td}>{r.totalGrupos}</td>
                  <td style={{ ...td, fontWeight: 700, color: C.btn }}>{r.totalInscripciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "estudiantes" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>Listado de estudiantes</h3>
            <button onClick={() => exportCSV("estudiantes.csv", estudiantes.map(({ contrasena, inscripciones, ...e }) => e))} style={btnSecondary}>Exportar CSV</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                {["Documento", "Nombre", "Correo", "Género", "Ciudad", "Barrio"].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {estudiantes.map(e => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <td style={td}>{e.documento}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{e.nombre} {e.apellido}</td>
                  <td style={{ ...td, color: C.muted }}>{e.correo}</td>
                  <td style={td}>{e.genero || "—"}</td>
                  <td style={td}>{e.ciudad || "—"}</td>
                  <td style={td}>{e.barrio || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 700, color: C.head };
const td = { padding: "9px 14px", fontSize: 13, color: C.body };
const btnSecondary = { padding: "6px 14px", border: `1.5px solid ${C.btn}`, borderRadius: 6, fontSize: 12, fontWeight: 600, color: C.btn, background: "#fff", cursor: "pointer" };
