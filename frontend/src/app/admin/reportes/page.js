"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { exportCSV, exportXLS, exportPDF } from "@/app/lib/exporters";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

export default function ReportesPage() {
  const [tab, setTab] = useState("asistencia");
  const [asist, setAsist] = useState([]);
  const [inscr, setInscr] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [evals, setEvals] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [programaFiltro, setProgramaFiltro] = useState("");

  useEffect(() => {
    api("/api/admin/reportes/inscripciones").then(setInscr);
    api("/api/admin/usuarios?rol=estudiante").then(setEstudiantes);
    api("/api/admin/reportes/evaluaciones").then(setEvals);
    api("/api/programas", { auth: false }).then(setProgramas);
  }, []);

  useEffect(() => {
    const q = programaFiltro ? `?programaId=${programaFiltro}` : "";
    api(`/api/admin/reportes/asistencia${q}`).then(setAsist);
  }, [programaFiltro]);

  const datos = {
    asistencia: asist,
    inscripciones: inscr,
    estudiantes: estudiantes.map(({ contrasena, inscripciones, ...e }) => ({
      documento: e.documento, nombre: `${e.nombre} ${e.apellido}`, correo: e.correo,
      genero: e.genero || "", ciudad: e.ciudad || "", barrio: e.barrio || "",
    })),
    evaluaciones: evals,
  };
  const titulos = {
    asistencia: "Reporte de Asistencia por Grupo",
    inscripciones: "Reporte de Inscripciones por Programa",
    estudiantes: "Listado de Estudiantes",
    evaluaciones: "Reporte de Evaluaciones",
  };

  const exportar = (formato) => {
    const filename = `${tab}-${new Date().toISOString().split("T")[0]}`;
    if (formato === "csv") exportCSV(`${filename}.csv`, datos[tab]);
    if (formato === "xlsx") exportXLS(`${filename}.xls`, datos[tab], titulos[tab]);
    if (formato === "pdf") exportPDF(titulos[tab], datos[tab]);
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 700, color: C.head }}>Reportes</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[
          { key: "asistencia", label: "Asistencia" },
          { key: "inscripciones", label: "Inscripciones" },
          { key: "estudiantes", label: "Estudiantes" },
          { key: "evaluaciones", label: "Evaluaciones" },
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

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>{titulos[tab]}</h3>
            <span style={{ fontSize: 12, color: C.muted }}>({datos[tab].length} registros)</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {tab === "asistencia" && (
              <select value={programaFiltro} onChange={(e) => setProgramaFiltro(e.target.value)} style={{
                padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6,
                fontSize: 13, color: C.body, background: "#fff",
              }}>
                <option value="">Todos los programas</option>
                {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            )}
            <button onClick={() => exportar("csv")} style={btnExp}>CSV</button>
            <button onClick={() => exportar("xlsx")} style={btnExp}>Excel</button>
            <button onClick={() => exportar("pdf")} style={btnExp}>PDF</button>
          </div>
        </div>

        {datos[tab].length === 0 ? (
          <p style={{ padding: 22, margin: 0, textAlign: "center", color: C.muted, fontSize: 14 }}>Sin datos.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                  {Object.keys(datos[tab][0]).map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {datos[tab].map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                    {Object.keys(datos[tab][0]).map(h => (
                      <td key={h} style={td}>{
                        r[h] && typeof r[h] === "string" && r[h].includes("T")
                          ? new Date(r[h]).toLocaleDateString("es-CO")
                          : r[h] ?? "—"
                      }</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.head, textTransform: "capitalize" };
const td = { padding: "8px 14px", fontSize: 12, color: C.body };
const btnExp = { padding: "6px 14px", border: `1.5px solid ${C.btn}`, borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.btn, background: "#fff", cursor: "pointer" };
