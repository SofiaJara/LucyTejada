"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, apiUrl } from "@/app/lib/api";
import BarChart from "@/app/components/lt/BarChart";
import ConfirmModal from "@/app/components/lt/ConfirmModal";
import Spinner from "@/app/components/lt/Spinner";

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
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [evalsDist, setEvalsDist] = useState([]);
  const [loadError, setLoadError] = useState("");

  const cargarBackups = () => api("/api/admin/backups").then(setBackups).catch(() => {});

  useEffect(() => {
    const handleErr = (label) => (e) => {
      setLoadError(prev => prev || `No se pudo cargar ${label}. ${e?.message || ""}`.trim());
    };
    api("/api/admin/dashboard").then(setStats).catch(handleErr("el resumen"));
    api("/api/admin/reportes/asistencia").then(setReporteAsist).catch(handleErr("el reporte de asistencia"));
    api("/api/admin/reportes/inscripciones").then(setReporteInscr).catch(handleErr("el reporte de inscripciones"));
    api("/api/admin/reportes/evaluaciones").then(evals => {
      const orden = ["Excelente", "Bueno", "Regular", "Deficiente"];
      const conteo = orden.map(v => ({
        valoracion: v,
        count: evals.filter(e => e.valoracion === v).length,
      }));
      setEvalsDist(conteo);
    }).catch(handleErr("la distribución de evaluaciones"));
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

  const restaurarBackup = async (archivo) => {
    setConfirmRestore(null);
    setBackupBusy(true); setBackupErr(""); setBackupOk("");
    try {
      const info = await api(`/api/admin/backups/${archivo}/restaurar`, { method: "POST" });
      setBackupOk(`Backup ${info.restaurado} restaurado. Snapshot previo guardado como ${info.backupPrevio}.`);
      cargarBackups();
    } catch (e) {
      setBackupErr(e.message);
    } finally {
      setBackupBusy(false);
      setTimeout(() => { setBackupOk(""); setBackupErr(""); }, 6000);
    }
  };

  const eliminarBackup = async (archivo) => {
    setConfirmDelete(null);
    setBackupBusy(true); setBackupErr(""); setBackupOk("");
    try {
      await api(`/api/admin/backups/${archivo}`, { method: "DELETE" });
      setBackupOk(`Backup ${archivo} eliminado.`);
      cargarBackups();
    } catch (e) {
      setBackupErr(e.message);
    } finally {
      setBackupBusy(false);
      setTimeout(() => { setBackupOk(""); setBackupErr(""); }, 4000);
    }
  };

  const descargarBackup = async (archivo) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("lt_token") : null;
    if (!token) return;
    try {
      const r = await fetch(`${apiUrl}/api/admin/backups/${archivo}/descargar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`No se pudo descargar (${r.status})`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = archivo;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setBackupErr(e.message);
      setTimeout(() => setBackupErr(""), 4000);
    }
  };

  if (!stats) {
    if (loadError) {
      return (
        <div role="alert" style={{
          background: "#fdf1ec", border: "1px solid #f0b6a5", color: "#a8442e",
          padding: "16px 18px", borderRadius: 8, fontSize: 14, maxWidth: 640,
        }}>
          <strong style={{ display: "block", marginBottom: 4 }}>No se pudo cargar el panel</strong>
          {loadError}
          <button onClick={() => window.location.reload()} style={{
            marginTop: 10, padding: "6px 14px", borderRadius: 6, border: "1px solid #a8442e",
            background: "#fff", color: "#a8442e", fontWeight: 600, cursor: "pointer", fontSize: 13,
          }}>Reintentar</button>
        </div>
      );
    }
    return <Spinner label="Cargando dashboard..." />;
  }

  const metrics = [
    { label: "Estudiantes activos", value: stats.totalEstudiantes, href: "/admin/usuarios?rol=estudiante&activo=true" },
    { label: "Profesores", value: stats.totalProfesores, href: "/admin/usuarios?rol=profesor&activo=true" },
    { label: "Programas activos", value: stats.totalProgramas, href: "/admin/programas" },
    { label: "Grupos activos", value: stats.totalGrupos, href: "/admin/grupos" },
    { label: "Inscripciones activas", value: stats.inscripcionesActivas, href: "/admin/reportes?tab=inscripciones" },
    { label: "Evaluaciones", value: stats.evaluacionesRecientes, href: "/admin/reportes?tab=evaluaciones" },
    { label: "Lista de espera", value: stats.listaEspera ?? 0, href: "/admin/lista-espera" },
    { label: "Estudiantes inactivos", value: stats.estudiantesInactivos ?? 0, href: "/admin/usuarios?rol=estudiante&activo=false" },
    { label: "En riesgo de deserción", value: stats.enRiesgoDesercion ?? 0, href: "/admin/reportes?tab=desercion", highlight: (stats.enRiesgoDesercion ?? 0) > 0 },
  ];

  // Top 5 asistencia y top 5 inscripciones
  const topAsist = [...reporteAsist].sort((a, b) => b.asistenciaPorcentaje - a.asistenciaPorcentaje).slice(0, 6);
  const topInscr = [...reporteInscr].sort((a, b) => b.totalInscripciones - a.totalInscripciones).slice(0, 6);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal
        open={!!confirmRestore}
        title="Restaurar respaldo"
        message={confirmRestore
          ? `Vas a reemplazar la base de datos actual con ${confirmRestore.archivo} (${(confirmRestore.tamanoBytes / 1024).toFixed(1)} KB, generado ${new Date(confirmRestore.creadoEn).toLocaleString("es-CO")}). Se guardará un snapshot del estado previo. ¿Continuar?`
          : ""}
        type="warning"
        confirmText="Sí, restaurar"
        onConfirm={() => restaurarBackup(confirmRestore.archivo)}
        onCancel={() => setConfirmRestore(null)}
      />
      <ConfirmModal
        open={!!confirmDelete}
        title="Eliminar respaldo"
        message={confirmDelete
          ? `Vas a eliminar permanentemente ${confirmDelete.archivo}. Esta acción no se puede deshacer.`
          : ""}
        type="warning"
        confirmText="Sí, eliminar"
        onConfirm={() => eliminarBackup(confirmDelete.archivo)}
        onCancel={() => setConfirmDelete(null)}
      />
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Panel de administración</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 22px" }}>Resumen general del Centro Cultural Lucy Tejada</p>
      {loadError && (
        <div role="alert" style={{
          background: "#fdf1ec", border: "1px solid #f0b6a5", color: "#a8442e",
          padding: "10px 14px", borderRadius: 6, fontSize: 13, marginBottom: 16,
        }}>
          {loadError}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {metrics.map(m => (
          <Link key={m.label} href={m.href} style={{ textDecoration: "none" }}>
            <div className="lt-metric-card" style={{
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

      <div style={{ ...card, marginBottom: 22 }}>
        <h3 style={h3}>Distribución de evaluaciones cualitativas</h3>
        {evalsDist.every(e => e.count === 0) ? (
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Aún no se han registrado evaluaciones.</p>
        ) : (
          <BarChart data={evalsDist} labelKey="valoracion" valueKey="count" color="#3A6048" />
        )}
      </div>

      <div style={{ ...card, marginBottom: 22 }}>
        <h3 style={h3}>Inscripciones por mes (últimos 6 meses)</h3>
        {!stats.tendenciaInscripciones || stats.tendenciaInscripciones.every(t => t.count === 0) ? (
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Sin inscripciones recientes en el período.</p>
        ) : (
          <BarChart data={stats.tendenciaInscripciones} labelKey="mes" valueKey="count" color="#5a8a6e" />
        )}
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
                <th style={thBk}>Integridad</th>
                <th style={{ ...thBk, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {backups.slice(0, 5).map(b => {
                const intColor = b.integridad === "ok" ? C.btn : b.integridad === "alterado" ? "#a8442e" : "#a06b1f";
                const intLabel = b.integridad === "ok" ? "OK" : b.integridad === "alterado" ? "ALTERADO" : "SIN HASH";
                return (
                  <tr key={b.archivo} style={{ borderBottom: `1px solid ${C.divider}` }}>
                    <td style={tdBk} title={b.sha256 ? `SHA-256: ${b.sha256}` : ""}>{b.archivo}</td>
                    <td style={tdBk}>{(b.tamanoBytes / 1024).toFixed(1)} KB</td>
                    <td style={tdBk}>{new Date(b.creadoEn).toLocaleString("es-CO")}</td>
                    <td style={tdBk}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700, color: intColor, background: "#f5f7f5" }}>
                        {intLabel}
                      </span>
                    </td>
                    <td style={{ ...tdBk, textAlign: "right" }}>
                      <button onClick={() => descargarBackup(b.archivo)} style={btnSm}>Descargar</button>
                      <button
                        onClick={() => setConfirmRestore(b)}
                        disabled={b.integridad === "alterado" || backupBusy}
                        style={{ ...btnSm, marginLeft: 6, color: b.integridad === "alterado" ? "#bbb" : "#a06b1f", cursor: b.integridad === "alterado" ? "not-allowed" : "pointer" }}
                        title={b.integridad === "alterado" ? "Integridad alterada — no se puede restaurar" : "Restaurar este respaldo (reemplaza la base de datos actual)"}
                      >Restaurar</button>
                      <button
                        onClick={() => setConfirmDelete(b)}
                        disabled={backupBusy}
                        style={{ ...btnSm, marginLeft: 6, color: "#a8442e", cursor: backupBusy ? "not-allowed" : "pointer" }}
                        title="Eliminar definitivamente este respaldo"
                      >Eliminar</button>
                    </td>
                  </tr>
                );
              })}
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
