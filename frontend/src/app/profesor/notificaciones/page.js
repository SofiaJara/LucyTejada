"use client";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", borderUnread: "#3A6048", card: "#fff",
  divider: "#d8e8df", unread: "#3A6048",
};

const notifs = [
  { unread: true,  title: "Cambio de horario · Grupo B",
    body: "La clase del miércoles 15 de abril se traslada al salón 2.",
    meta: "Hoy · 8:14 am · Administrativo" },
  { unread: true,  title: "Recordatorio · Entrega de evaluaciones",
    body: "Tienes 7 evaluaciones pendientes del período 2026-1.",
    meta: "Hoy · 7:00 am · Sistema" },
  { unread: false, title: "Nuevo evento · Concierto fin de semestre",
    body: "El centro cultural organiza concierto el 28 de junio.",
    meta: "Ayer · 3:45 pm · Eventos" },
  { unread: false, title: "Actualización académica · Grupo A",
    body: "Se ajustaron los indicadores de evaluación del período.",
    meta: "Hace 2 días · Administrativo" },
  { unread: false, title: "Recordatorio · Registro de asistencia",
    body: "No se registró asistencia del Grupo C el lunes 7 de abril.",
    meta: "Hace 3 días · Sistema" },
];

const tabs = ["Todas", "No leídas", "Horarios", "Eventos"];

export default function NotificacionesProfesorPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.head }}>Notificaciones</h2>
        <span style={{ fontSize: 13, color: C.muted, cursor: "pointer" }}>Marcar todas como leídas</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {tabs.map((t, i) => (
          <button key={t} disabled style={{
            padding: "6px 14px", borderRadius: 5,
            border: `1.5px solid ${i === 0 ? C.btn : C.border}`,
            fontSize: 14, fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? C.btnT : C.body,
            background: i === 0 ? C.btn : C.card,
            cursor: "not-allowed",
          }}>{t}</button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifs.map((n, i) => (
          <div key={i} style={{
            background: C.card,
            border: `1px solid ${n.unread ? C.borderUnread : C.border}`,
            borderRadius: 6, padding: "14px 16px",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 5,
              background: n.unread ? C.unread : "transparent",
              border: n.unread ? "none" : `1.5px solid ${C.border}`,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: n.unread ? 700 : 500, color: C.head, marginBottom: 4 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 14, color: C.body, marginBottom: 5 }}>{n.body}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{n.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
