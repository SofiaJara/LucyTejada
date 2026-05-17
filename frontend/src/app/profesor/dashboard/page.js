"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import BarChart from "@/app/components/lt/BarChart";
import Spinner from "@/app/components/lt/Spinner";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
  metricBorder: "#3A6048",
};

export default function DashboardProfesorPage() {
  const [grupos, setGrupos] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [asistPorGrupo, setAsistPorGrupo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([
      api("/api/grupos"),
      api("/api/notificaciones"),
    ]).then(async ([g, n]) => {
      setGrupos(g);
      setNotifs(n);
      if (g.length > 0) {
        const detalles = await Promise.all(
          g.map(async (gr) => {
            const clases = await api(`/api/asistencia/grupos/${gr.id}/clases`).catch(() => []);
            let total = 0, presentes = 0;
            clases.forEach(c => {
              total += c.asistencias.length;
              presentes += c.asistencias.filter(a => a.asistio).length;
            });
            return {
              label: `${gr.programa.nombre} · ${gr.nombre}`,
              pct: total > 0 ? Math.round((presentes / total) * 100) : 0,
              registradas: total,
            };
          })
        );
        setAsistPorGrupo(detalles);
      }
    }).catch((e) => {
      console.error(e);
      setLoadError(e?.message || "No se pudo cargar el panel.");
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Cargando dashboard..." />;
  if (loadError) {
    return (
      <div role="alert" style={{
        background: "#fdf1ec", border: "1px solid #f0b6a5", color: "#a8442e",
        padding: "16px 18px", borderRadius: 8, fontSize: 14, maxWidth: 600,
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

  const totalEstudiantes = grupos.reduce((sum, g) => sum + (g._count?.inscripciones || 0), 0);
  const totalClases = grupos.reduce((sum, g) => sum + (g._count?.clases || 0), 0);
  const noLeidas = notifs.filter(n => !n.leida).length;
  const conRegistro = asistPorGrupo.filter(a => a.registradas > 0);

  const metrics = [
    { label: "Grupos activos", value: grupos.length, href: "/profesor/grupos" },
    { label: "Estudiantes", value: totalEstudiantes, href: "/profesor/grupos" },
    { label: "Clases registradas", value: totalClases, href: "/profesor/asistencia" },
    { label: "Notificaciones", value: noLeidas, href: "/profesor/notificaciones" },
  ];

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 22px" }}>
        Resumen del día
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 26 }}>
        {metrics.map(m => (
          <Link key={m.label} href={m.href} style={{ textDecoration: "none" }}>
            <div className="lt-metric-card" style={{
              background: C.card, border: `1.5px solid ${C.metricBorder}`, borderRadius: 8,
              padding: "20px 16px", textAlign: "center", cursor: "pointer",
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.btn, marginBottom: 6 }}>{m.value}</div>
              <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{m.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {grupos.length > 0 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "18px 22px", marginBottom: 22,
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head }}>
            % Asistencia por grupo
          </h3>
          {conRegistro.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>
              Aún no has registrado asistencia. Empieza desde{" "}
              <Link href="/profesor/asistencia" style={{ color: C.btn, fontWeight: 600 }}>Asistencia</Link>.
            </p>
          ) : (
            <BarChart data={conRegistro} labelKey="label" valueKey="pct" max={100} />
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head }}>Mis grupos</h3>
          {grupos.length === 0 ? (
            <p style={{ fontSize: 14, color: C.muted }}>Aún no tienes grupos asignados.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {grupos.map(g => (
                <Link
                  key={g.id}
                  href={`/profesor/grupos?grupo=${g.id}`}
                  style={{
                    padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
                    fontSize: 14, color: C.body, textDecoration: "none", display: "block",
                  }}
                >
                  <strong style={{ color: C.head }}>{g.programa.nombre} · {g.nombre}</strong>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                    {g.horario} · {g.salon} · {g._count?.inscripciones || 0} estudiantes
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head }}>Actividad reciente</h3>
          {notifs.length === 0 ? (
            <p style={{ fontSize: 14, color: C.muted }}>Sin actividad reciente.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {notifs.slice(0, 5).map((n, i) => (
                <div key={n.id} style={{
                  padding: "10px 0",
                  borderBottom: i < Math.min(4, notifs.length - 1) ? `1px solid ${C.divider}` : "none",
                  fontSize: 14, color: C.body,
                }}>
                  <div style={{ fontWeight: !n.leida ? 700 : 500, color: C.head }}>{n.titulo}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {new Date(n.createdAt).toLocaleString("es-CO")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
