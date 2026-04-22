"use client";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
  metricBorder: "#3A6048",
};

const metrics = [
  { label: "Grupos activos", value: 4 },
  { label: "Clases hoy",     value: 2 },
  { label: "Eval. pendientes", value: 7 },
  { label: "Notif.",         value: 3 },
];

const classes = [
  "Piano básico · Grupo A · Salón 3 · 8:00 am",
  "Guitarra · Grupo B · Salón 1 · 10:00 am",
];

const activity = [
  "Asistencia registrada · Grupo C · ayer",
  "Evaluación enviada · Grupo A · hace 2 días",
  "Horario actualizado · Grupo B · hace 3 días",
];

export default function DashboardProfesorPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 22px", textAlign: "center" }}>
        Resumen del día
      </h2>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 26 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: C.card, border: `1.5px solid ${C.metricBorder}`, borderRadius: 8,
            padding: "20px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.btn, marginBottom: 6 }}>{m.value}</div>
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Próximas clases */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head }}>Próximas clases</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {classes.map((c, i) => (
              <div key={i} style={{
                padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
                fontSize: 14, color: C.body,
              }}>{c}</div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head }}>Actividad reciente</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {activity.map((a, i) => (
              <div key={i} style={{
                padding: "10px 0",
                borderBottom: i < activity.length - 1 ? `1px solid ${C.divider}` : "none",
                fontSize: 14, color: C.body,
              }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
