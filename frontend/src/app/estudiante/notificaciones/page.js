"use client";

const notifs = [
  { unread: true, title: "Cambio de horario · Piano básico",
    body: "Tu clase del miércoles 15 de abril se traslada al salón 2.",
    meta: "Hoy · 8:14 am · Horarios" },
  { unread: true, title: "Recordatorio de clase · mañana",
    body: "Recuerda tu clase de Piano básico el martes a las 8:00 am.",
    meta: "Hoy · 7:00 am · Recordatorio" },
  { unread: false, title: "Evaluación disponible · Período 2026-1",
    body: "Tu evaluación cualitativa del período ya está disponible.",
    meta: "Ayer · 5:00 pm · Académico" },
  { unread: false, title: "Actualización académica · Grupo A",
    body: "Se ajustaron los indicadores de evaluación del período 2026-1.",
    meta: "Hace 2 días · Académico" },
  { unread: false, title: "Nuevo evento · Concierto fin de semestre",
    body: "El centro organiza un concierto el 28 de junio. ¡Participa!",
    meta: "Hace 3 días · Eventos" },
];

const tabs = ["Todas", "No leídas", "Horarios", "Académico"];

export default function NotificacionesEstudiantePage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 8. Mockup notificaciones (estudiante).
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Notificaciones</h2>
        <span style={{ fontSize: 11, color: "#888", cursor: "pointer" }}>Marcar todas como leídas</span>
      </div>

      {/* Filtros tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {tabs.map((t, i) => (
          <button key={t} disabled style={{
            padding: "4px 12px", borderRadius: 5,
            border: `1px solid ${i === 0 ? "#333" : "#ccc"}`,
            fontSize: 12, color: i === 0 ? "#222" : "#777",
            background: "#fff", cursor: "not-allowed",
          }}>{t}</button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifs.map((n, i) => (
          <div key={i} style={{
            background: "#fff",
            border: `1px solid ${n.unread ? "#aaa" : "#ddd"}`,
            borderRadius: 4, padding: "12px 14px",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4,
              background: n.unread ? "#333" : "#fff",
              border: n.unread ? "none" : "1px solid #bbb",
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, color: "#222", marginBottom: 3 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{n.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
