"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import BarChart from "@/app/components/lt/BarChart";

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
    { label: "Estudiantes activos", value: stats.totalEstudiantes, href: "/admin/usuarios?rol=estudiante" },
    { label: "Profesores", value: stats.totalProfesores, href: "/admin/usuarios?rol=profesor" },
    { label: "Programas activos", value: stats.totalProgramas, href: "/admin/programas" },
    { label: "Grupos activos", value: stats.totalGrupos, href: "/admin/grupos" },
    { label: "Inscripciones activas", value: stats.inscripcionesActivas, href: "/admin/grupos" },
    { label: "Evaluaciones", value: stats.evaluacionesRecientes, href: "/admin/reportes" },
    { label: "Lista de espera", value: stats.listaEspera ?? 0, href: "/admin/grupos" },
    { label: "Estudiantes inactivos", value: stats.estudiantesInactivos ?? 0, href: "/admin/usuarios?rol=estudiante" },
  ];

  // Top 5 asistencia y top 5 inscripciones
  const topAsist = [...reporteAsist].sort((a, b) => b.asistenciaPorcentaje - a.asistenciaPorcentaje).slice(0, 6);
  const topInscr = [...reporteInscr].sort((a, b) => b.totalInscripciones - a.totalInscripciones).slice(0, 6);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Panel de administración</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 22px" }}>Resumen general del Centro Cultural Lucy Tejada</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {metrics.map(m => (
          <Link key={m.label} href={m.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: C.card, border: `1.5px solid ${C.metricBorder}`, borderRadius: 8,
              padding: "20px 14px", textAlign: "center", cursor: "pointer",
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.btn, marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{m.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 22 }}>
        <div style={card}>
          <h3 style={h3}>Inscripciones por programa</h3>
          <BarChart data={topInscr} labelKey="programa" valueKey="totalInscripciones" />
        </div>
        <div style={card}>
          <h3 style={h3}>% Asistencia por grupo</h3>
          <BarChart data={topAsist.map(r => ({ ...r, label: `${r.programa} · ${r.grupo}` }))} labelKey="label" valueKey="asistenciaPorcentaje" max={100} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div style={card}>
          <h3 style={h3}>Estudiantes por género</h3>
          <BarChart data={stats.generos || []} labelKey="genero" valueKey="count" color="#4a7a5e" />
        </div>
        <div style={card}>
          <h3 style={h3}>Estudiantes por ciudad</h3>
          <BarChart data={stats.ciudades || []} labelKey="ciudad" valueKey="count" color="#5a8a6e" />
        </div>
      </div>
    </div>
  );
}

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 22px" };
const h3 = { margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head };
