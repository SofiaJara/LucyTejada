"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/app/lib/api";
import { exportCSV, exportXLS, exportPDF } from "@/app/lib/exporters";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
  danger: "#a8442e",
};

export default function ReportesPageWrapper() {
  return (
    <Suspense fallback={<p style={{ color: "#4a5a52" }}>Cargando...</p>}>
      <ReportesPage />
    </Suspense>
  );
}

function ReportesPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [tab, setTab] = useState(search.get("tab") || "asistencia");
  const cambiarTab = (nuevo) => {
    setTab(nuevo);
    setBuscarEnResultados("");
    const params = new URLSearchParams(search.toString());
    params.set("tab", nuevo);
    router.replace(`/admin/reportes?${params.toString()}`, { scroll: false });
  };
  const [asist, setAsist] = useState([]);
  const [inscr, setInscr] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [evals, setEvals] = useState([]);
  const [demografia, setDemografia] = useState(null);
  const [desercion, setDesercion] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [programaFiltro, setProgramaFiltro] = useState("");
  const [profesorFiltro, setProfesorFiltro] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [ventana, setVentana] = useState("30");
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [buscarEnResultados, setBuscarEnResultados] = useState("");

  useEffect(() => {
    api("/api/admin/usuarios?rol=estudiante").then(setEstudiantes);
    api("/api/admin/reportes/demografia").then(setDemografia);
    api("/api/programas", { auth: false }).then(setProgramas);
    api("/api/users/profesores").then(setProfesores);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (programaFiltro) params.set("programaId", programaFiltro);
    if (profesorFiltro) params.set("profesorId", profesorFiltro);
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    const q = params.toString() ? `?${params.toString()}` : "";

    if (tab === "asistencia") {
      api(`/api/admin/reportes/asistencia${q}`).then(setAsist);
    } else if (tab === "inscripciones") {
      const p = new URLSearchParams();
      if (programaFiltro) p.set("programaId", programaFiltro);
      if (desde) p.set("desde", desde);
      if (hasta) p.set("hasta", hasta);
      api(`/api/admin/reportes/inscripciones${p.toString() ? `?${p}` : ""}`).then(setInscr);
    } else if (tab === "evaluaciones") {
      api(`/api/admin/reportes/evaluaciones${q}`).then(setEvals);
    } else if (tab === "desercion") {
      const v = ventana ? `?ventana=${ventana}` : "";
      api(`/api/admin/reportes/desercion${v}`).then(setDesercion);
    }
  }, [tab, programaFiltro, profesorFiltro, desde, hasta, ventana]);

  const demografiaRows = demografia
    ? [
        ...demografia.porGenero.map(d => ({ dimension: "Género", valor: d.valor, total: d.total })),
        ...demografia.porCiudad.map(d => ({ dimension: "Ciudad", valor: d.valor, total: d.total })),
        ...demografia.porBarrio.map(d => ({ dimension: "Barrio", valor: d.valor, total: d.total })),
        ...demografia.porEdad.map(d => ({ dimension: "Edad", valor: d.rango, total: d.total })),
      ]
    : [];

  const datos = {
    asistencia: asist,
    inscripciones: inscr,
    estudiantes: estudiantes.map(({ contrasena, inscripciones, ...e }) => ({
      documento: e.documento, nombre: `${e.nombre} ${e.apellido}`, correo: e.correo,
      genero: e.genero || "", ciudad: e.ciudad || "", barrio: e.barrio || "",
    })),
    evaluaciones: evals,
    demografia: demografiaRows,
    desercion: desercion.map(d => ({
      estudiante: d.estudiante,
      documento: d.documento,
      correo: d.correo,
      programa: d.programa,
      grupo: d.grupo,
      clases: d.clasesEvaluadas,
      asistencias: d.asistencias,
      porcentaje: `${d.porcentajeAsistencia}%`,
      ultimaAsistencia: d.ultimaAsistencia || "Nunca",
    })),
  };
  const titulos = {
    asistencia: "Reporte de Asistencia por Grupo",
    inscripciones: "Reporte de Inscripciones por Programa",
    estudiantes: "Listado de Estudiantes",
    evaluaciones: "Reporte de Evaluaciones",
    demografia: "Demografía estudiantil",
    desercion: "Estudiantes en riesgo de deserción",
  };

  const exportar = async (formato) => {
    setExportando(true);
    setAviso("");
    try {
      const filename = `${tab}-${new Date().toISOString().split("T")[0]}`;
      if (formato === "csv") exportCSV(`${filename}.csv`, datos[tab]);
      if (formato === "xlsx") exportXLS(`${filename}.xls`, datos[tab], titulos[tab]);
      if (formato === "pdf") exportPDF(titulos[tab], datos[tab]);
      setAviso(`Exportado como ${formato.toUpperCase()}.`);
    } catch (err) {
      setAviso(`No se pudo exportar: ${err.message}`);
    } finally {
      setExportando(false);
      setTimeout(() => setAviso(""), 2500);
    }
  };

  const limpiarFiltros = () => {
    setProgramaFiltro("");
    setProfesorFiltro("");
    setDesde("");
    setHasta("");
  };

  const filasFiltradas = (() => {
    const rows = datos[tab];
    if (!buscarEnResultados.trim() || !rows.length) return rows;
    const q = buscarEnResultados.toLowerCase();
    return rows.filter(r =>
      Object.values(r).some(v => String(v ?? "").toLowerCase().includes(q))
    );
  })();

  const filtrosAplicables = ["asistencia", "inscripciones", "evaluaciones"].includes(tab);
  const mostrarPrograma = ["asistencia", "inscripciones", "evaluaciones"].includes(tab);
  const mostrarProfesor = ["asistencia", "evaluaciones"].includes(tab);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 700, color: C.head }}>Reportes</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[
          { key: "asistencia", label: "Asistencia" },
          { key: "inscripciones", label: "Inscripciones" },
          { key: "estudiantes", label: "Estudiantes" },
          { key: "evaluaciones", label: "Evaluaciones" },
          { key: "demografia", label: "Demografía" },
          { key: "desercion", label: "Deserción" },
        ].map(t => (
          <button key={t.key} onClick={() => cambiarTab(t.key)} style={{
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
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>{titulos[tab]}</h3>
            <span style={{ fontSize: 12, color: C.muted }}>
              ({buscarEnResultados ? `${filasFiltradas.length} de ${datos[tab].length}` : `${datos[tab].length}`} registros)
            </span>
            {datos[tab].length > 5 && (
              <input
                type="search"
                placeholder="Buscar en resultados..."
                value={buscarEnResultados}
                onChange={(e) => setBuscarEnResultados(e.target.value)}
                aria-label="Buscar dentro del reporte"
                style={{ ...selStyle, fontSize: 12, minWidth: 180 }}
              />
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {filtrosAplicables && (
              <>
                {mostrarPrograma && (
                  <select value={programaFiltro} onChange={(e) => setProgramaFiltro(e.target.value)} style={selStyle} aria-label="Filtrar por programa">
                    <option value="">Todos los programas</option>
                    {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                )}
                {mostrarProfesor && (
                  <select value={profesorFiltro} onChange={(e) => setProfesorFiltro(e.target.value)} style={selStyle} aria-label="Filtrar por profesor">
                    <option value="">Todos los profesores</option>
                    {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                  </select>
                )}
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={selStyle} aria-label="Desde" />
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={selStyle} aria-label="Hasta" />
                {(programaFiltro || profesorFiltro || desde || hasta) && (
                  <button onClick={limpiarFiltros} style={btnGhost} title="Limpiar filtros">×</button>
                )}
              </>
            )}
            {tab === "desercion" && (
              <select
                value={ventana}
                onChange={(e) => setVentana(e.target.value)}
                style={selStyle}
                aria-label="Ventana de análisis para deserción"
                title="Cuántos días hacia atrás se consideran clases recientes"
              >
                <option value="30">Últimos 30 días</option>
                <option value="60">Últimos 60 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="180">Últimos 180 días</option>
                <option value="">Sin límite</option>
              </select>
            )}
            <button onClick={() => exportar("csv")} disabled={exportando || datos[tab].length === 0} style={{ ...btnExp, opacity: exportando || datos[tab].length === 0 ? 0.55 : 1, cursor: exportando ? "wait" : (datos[tab].length === 0 ? "not-allowed" : "pointer") }} aria-label="Exportar como CSV">{exportando ? "..." : "CSV"}</button>
            <button onClick={() => exportar("xlsx")} disabled={exportando || datos[tab].length === 0} style={{ ...btnExp, opacity: exportando || datos[tab].length === 0 ? 0.55 : 1, cursor: exportando ? "wait" : (datos[tab].length === 0 ? "not-allowed" : "pointer") }} aria-label="Exportar como Excel">{exportando ? "..." : "Excel"}</button>
            <button onClick={() => exportar("pdf")} disabled={exportando || datos[tab].length === 0} style={{ ...btnExp, opacity: exportando || datos[tab].length === 0 ? 0.55 : 1, cursor: exportando ? "wait" : (datos[tab].length === 0 ? "not-allowed" : "pointer") }} aria-label="Exportar como PDF">{exportando ? "..." : "PDF"}</button>
          </div>
        </div>
        {aviso && (
          <div style={{ padding: "8px 18px", fontSize: 12, color: C.muted, borderBottom: `1px solid ${C.divider}` }}>{aviso}</div>
        )}

        {datos[tab].length === 0 ? (
          <p style={{ padding: 22, margin: 0, textAlign: "center", color: C.muted, fontSize: 14 }}>
            {tab === "desercion" ? "No hay estudiantes en riesgo identificados con los criterios actuales." : "Sin datos."}
          </p>
        ) : filasFiltradas.length === 0 ? (
          <p style={{ padding: 22, margin: 0, textAlign: "center", color: C.muted, fontSize: 14 }}>
            Sin coincidencias para &quot;{buscarEnResultados}&quot;.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                  {Object.keys(datos[tab][0]).map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filasFiltradas.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                    {Object.keys(datos[tab][0]).map(h => (
                      <td key={h} style={td}>{
                        r[h] && typeof r[h] === "string" && r[h].includes("T") && !isNaN(Date.parse(r[h]))
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
const btnGhost = { padding: "6px 10px", border: `1.5px solid ${C.border}`, borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.muted, background: "#fff", cursor: "pointer" };
const selStyle = { padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.body, background: "#fff" };
