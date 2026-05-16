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

export default function DashboardProfesorPage() {
  const [grupos, setGrupos] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/api/grupos"),
      api("/api/notificaciones"),
    ]).then(([g, n]) => {
      setGrupos(g);
      setNotifs(n);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: C.muted }}>Cargando...</p>;

  const totalEstudiantes = grupos.reduce((sum, g) => sum + (g._count?.inscripciones || 0), 0);
  const totalClases = grupos.reduce((sum, g) => sum + (g._count?.clases || 0), 0);
  const noLeidas = notifs.filter(n => !n.leida).length;

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
            <div style={{
              background: C.card, border: `1.5px solid ${C.metricBorder}`, borderRadius: 8,
              padding: "20px 16px", textAlign: "center", cursor: "pointer",
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.btn, marginBottom: 6 }}>{m.value}</div>
              <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{m.label}</div>
            </div>
          </Link>
        ))}
      </div>

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
