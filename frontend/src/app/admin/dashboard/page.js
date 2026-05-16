"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, apiUrl } from "@/app/lib/api";
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
  const [backups, setBackups] = useState([]);
  const [backupOk, setBackupOk] = useState("");
  const [backupErr, setBackupErr] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);

  const cargarBackups = () => api("/api/admin/backups").then(setBackups).catch(() => {});

  useEffect(() => {
    api("/api/admin/dashboard").then(setStats).catch(console.error);
    api("/api/admin/reportes/asistencia").then(setReporteAsist).catch(console.error);
    api("/api/admin/reportes/inscripciones").then(setReporteInscr).catch(console.error);
    cargarBackups();
  }, []);

  const generarBackup = async () => {
    setBackupBusy(true); setBackupErr(""); setBackupOk("");
    try {
      const info = await api("/api/admin/backups", { method: "POST" });
      setBackupOk(`Backup ${info.archivo} generado (${(info.tamanoBytes / 1024).toFixed(1)} KB).`);
      cargarBackups();
    } catch (e) {
      setBackupErr(e.message);
    } finally {
      setBackupBusy(false);
      setTimeout(() => { setBackupOk(""); setBackupErr(""); }, 4000);
    }
  };

  const descargarBackup = (archivo) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("lt_token") : null;
    if (!token) return;
    // descarga con header de auth vía fetch -> blob
    fetch(`${apiUrl}/api/admin/backups/${archivo}/descargar`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = archivo;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      });
  };

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
    { label: "En riesgo de deserción", value: stats.enRiesgoDesercion ?? 0, href: "/admin/reportes?tab=desercion", highlight: (stats.enRiesgoDesercion ?? 0) > 0 },
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
              background: m.highlight ? "#fdf1ec" : C.card,
              border: `1.5px solid ${m.highlight ? "#a8442e" : C.metricBorder}`,
              borderRadius: 8, padding: "20px 14px", textAlign: "center", cursor: "pointer",
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: m.highlight ? "#a8442e" : C.btn, marginBottom: 4 }}>{m.value}</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 22 }}>
        <div style={card}>
          <h3 style={h3}>Estudiantes por género</h3>
          <BarChart data={stats.generos || []} labelKey="genero" valueKey="count" color="#4a7a5e" />
        </div>
        <div style={card}>
          <h3 style={h3}>Estudiantes por ciudad</h3>
          <BarChart data={stats.ciudades || []} labelKey="ciudad" valueKey="count" color="#5a8a6e" />
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ ...h3, marginBottom: 4 }}>Respaldos del sistema</h3>
            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>Genera y descarga copias de la base de datos para garantizar la continuidad operativa.</p>
          </div>
          <button onClick={generarBackup} disabled={backupBusy} style={{
            padding: "8px 18px", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600,
            color: "#fff", background: C.btn, cursor: backupBusy ? "wait" : "pointer", opacity: backupBusy ? 0.7 : 1,
          }}>{backupBusy ? "Generando..." : "+ Generar backup"}</button>
        </div>
        {backupOk && <p style={{ margin: "0 0 10px", fontSize: 13, color: C.btn }}>{backupOk}</p>}
        {backupErr && <p style={{ margin: "0 0 10px", fontSize: 13, color: "#a8442e" }}>{backupErr}</p>}
        {backups.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Sin respaldos generados todavía.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                <th style={thBk}>Archivo</th>
                <th style={thBk}>Tamaño</th>
                <th style={thBk}>Generado</th>
                <th style={{ ...thBk, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {backups.slice(0, 5).map(b => (
                <tr key={b.archivo} style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <td style={tdBk}>{b.archivo}</td>
                  <td style={tdBk}>{(b.tamanoBytes / 1024).toFixed(1)} KB</td>
                  <td style={tdBk}>{new Date(b.creadoEn).toLocaleString("es-CO")}</td>
                  <td style={{ ...tdBk, textAlign: "right" }}>
                    <button onClick={() => descargarBackup(b.archivo)} style={btnSm}>Descargar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thBk = { padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.head };
const tdBk = { padding: "8px 10px", fontSize: 12, color: C.body };
const btnSm = { padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12, color: C.btn, background: "#fff", cursor: "pointer", fontWeight: 600 };

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 22px" };
const h3 = { margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head };
