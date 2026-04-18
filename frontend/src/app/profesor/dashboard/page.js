"use client";

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
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 2. Mockup dashboard principal del profesor.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 20px", textAlign: "center" }}>
        Resumen del día
      </h2>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: "#fff", border: "1px solid #333", borderRadius: 6,
            padding: "18px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#222", marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Próximas clases */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "16px 18px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#333" }}>Próximas clases</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {classes.map((c, i) => (
              <div key={i} style={{
                padding: "8px 12px", border: "1px solid #aaa", borderRadius: 4,
                fontSize: 12, color: "#555",
              }}>{c}</div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "16px 18px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#333" }}>Actividad reciente</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {activity.map((a, i) => (
              <div key={i} style={{
                padding: "8px 0",
                borderBottom: i < activity.length - 1 ? "1px solid #eee" : "none",
                fontSize: 12, color: "#777",
              }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
