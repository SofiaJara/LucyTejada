"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
  metricBorder: "#3A6048",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reporteAsist, setReporteAsist] = useState([]);
  const [reporteInscr, setReporteInscr] = useState([]);

  useEffect(() => {
    api("/api/admin/dashboard").then(setStats).catch(console.error);
    api("/api/admin/reportes/asistencia").then(setReporteAsist).catch(console.error);
    api("/api/admin/reportes/inscripciones").then(setReporteInscr).catch(console.error);
  }, []);

  if (!stats) return <p style={{ color: C.muted }}>Cargando...</p>;

  const metrics = [
    { label: "Estudiantes", value: stats.totalEstudiantes, href: "/admin/usuarios?rol=estudiante" },
    { label: "Profesores", value: stats.totalProfesores, href: "/admin/usuarios?rol=profesor" },
    { label: "Programas activos", value: stats.totalProgramas, href: "/admin/programas" },
    { label: "Grupos activos", value: stats.totalGrupos, href: "/admin/grupos" },
    { label: "Inscripciones", value: stats.inscripcionesActivas, href: "/admin/grupos" },
    { label: "Evaluaciones", value: stats.evaluacionesRecientes, href: "/admin/reportes" },
  ];

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Panel de administración</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 22px" }}>Resumen general del Centro Cultural Lucy Tejada</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 28 }}>
        {metrics.map(m => (
          <Link key={m.label} href={m.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: C.card, border: `1.5px solid ${C.metricBorder}`, borderRadius: 8,
              padding: "20px 14px", textAlign: "center", cursor: "pointer",
              transition: "transform 0.15s",
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.btn, marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{m.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 22px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head }}>
            Inscripciones por programa
          </h3>
          {reporteInscr.length === 0 ? (
            <p style={{ fontSize: 14, color: C.muted }}>Sin datos.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={th}>Programa</th>
                  <th style={th}>Categoría</th>
                  <th style={th}>Grupos</th>
                  <th style={th}>Inscritos</th>
                </tr>
              </thead>
              <tbody>
                {reporteInscr.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                    <td style={td}>{r.programa}</td>
                    <td style={{ ...td, color: C.muted }}>{r.categoria}</td>
                    <td style={td}>{r.totalGrupos}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{r.totalInscripciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 22px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head }}>
            Asistencia por grupo
          </h3>
          {reporteAsist.length === 0 ? (
            <p style={{ fontSize: 14, color: C.muted }}>Sin datos.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={th}>Programa · Grupo</th>
                  <th style={th}>Clases</th>
                  <th style={th}>Estudiantes</th>
                  <th style={th}>% Asist.</th>
                </tr>
              </thead>
              <tbody>
                {reporteAsist.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                    <td style={td}>{r.programa} · {r.grupo}</td>
                    <td style={td}>{r.clases}</td>
                    <td style={td}>{r.estudiantes}</td>
                    <td style={{ ...td, fontWeight: 600, color: r.asistenciaPorcentaje >= 75 ? C.btn : "#a06b1f" }}>
                      {r.asistenciaPorcentaje}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const th = { padding: "8px 10px", textAlign: "left", color: "#1E2D26", fontWeight: 700, fontSize: 12 };
const td = { padding: "8px 10px", color: "#2c3a32", fontSize: 13 };
