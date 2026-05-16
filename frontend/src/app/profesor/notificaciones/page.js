"use client";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/app/lib/api";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", borderUnread: "#3A6048", card: "#fff",
  divider: "#d8e8df", unread: "#3A6048",
};

const tabs = [
  { key: "todas",     label: "Todas" },
  { key: "no_leidas", label: "No leídas" },
  { key: "horarios",  label: "Horarios" },
  { key: "academico", label: "Académico" },
  { key: "sistema",   label: "Sistema" },
];

export default function NotificacionesProfesorPage() {
  const [notifs, setNotifs] = useState([]);
  const [active, setActive] = useState("todas");
  const [loading, setLoading] = useState(true);

  const cargar = () => api("/api/notificaciones").then(setNotifs).finally(() => setLoading(false));
  useEffect(cargar, []);

  const filtered = useMemo(() => {
    if (active === "todas") return notifs;
    if (active === "no_leidas") return notifs.filter(n => !n.leida);
    return notifs.filter(n => n.categoria === active);
  }, [active, notifs]);

  const marcarLeida = async (id) => {
    await api(`/api/notificaciones/${id}/leer`, { method: "POST" });
    cargar();
  };

  const marcarTodas = async () => {
    await api("/api/notificaciones/leer-todas", { method: "POST" });
    cargar();
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.head }}>Notificaciones</h2>
        <button onClick={marcarTodas} style={{
          background: "transparent", border: "none", fontSize: 13, color: C.btn,
          cursor: "pointer", fontWeight: 600,
        }}>Marcar todas como leídas</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActive(t.key)} style={{
            padding: "6px 14px", borderRadius: 5,
            border: `1.5px solid ${active === t.key ? C.btn : C.border}`,
            fontSize: 14, fontWeight: active === t.key ? 600 : 400,
            color: active === t.key ? C.btnT : C.body,
            background: active === t.key ? C.btn : C.card, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: C.muted }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, textAlign: "center", color: C.muted }}>
          No tienes notificaciones {active !== "todas" ? "en esta categoría" : ""}.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(n => (
            <div key={n.id} onClick={() => !n.leida && marcarLeida(n.id)} style={{
              background: C.card,
              border: `1px solid ${!n.leida ? C.borderUnread : C.border}`,
              borderRadius: 6, padding: "14px 16px",
              display: "flex", gap: 14, alignItems: "flex-start",
              cursor: !n.leida ? "pointer" : "default",
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                background: !n.leida ? C.unread : "transparent",
                border: !n.leida ? "none" : `1.5px solid ${C.border}`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: !n.leida ? 700 : 500, color: C.head, marginBottom: 4 }}>
                  {n.titulo}
                </div>
                <div style={{ fontSize: 14, color: C.body, marginBottom: 5 }}>{n.mensaje}</div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {new Date(n.createdAt).toLocaleString("es-CO")} · {n.categoria}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
