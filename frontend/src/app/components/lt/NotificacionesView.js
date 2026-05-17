"use client";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/app/lib/api";
import Spinner from "./Spinner";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", borderUnread: "#3A6048", card: "#fff",
  divider: "#d8e8df", unread: "#3A6048",
};

const tabs = [
  { key: "todas",          label: "Todas" },
  { key: "no_leidas",      label: "No leídas" },
  { key: "horarios",       label: "Horarios" },
  { key: "academico",      label: "Académico" },
  { key: "eventos",        label: "Eventos" },
  { key: "administrativo", label: "Administrativo" },
  { key: "sistema",        label: "Sistema" },
];

export default function NotificacionesView({ titulo = "Notificaciones", descripcion }) {
  const [notifs, setNotifs] = useState([]);
  const [active, setActive] = useState("todas");
  const [loading, setLoading] = useState(true);

  const cargar = () => api("/api/notificaciones").then(setNotifs).finally(() => setLoading(false));
  useEffect(() => { cargar(); }, []);

  const filtered = useMemo(() => {
    if (active === "todas") return notifs;
    if (active === "no_leidas") return notifs.filter(n => !n.leida);
    return notifs.filter(n => n.categoria === active);
  }, [active, notifs]);

  const marcarLeida = async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    try {
      await api(`/api/notificaciones/${id}/leer`, { method: "POST" });
      window.dispatchEvent(new Event("lt:notifs-changed"));
    } catch {
      cargar();
    }
  };

  const marcarTodas = async () => {
    if (!notifs.some(n => !n.leida)) return;
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    try {
      await api("/api/notificaciones/leer-todas", { method: "POST" });
      window.dispatchEvent(new Event("lt:notifs-changed"));
    } catch {
      cargar();
    }
  };

  const noLeidasCount = useMemo(() => notifs.filter(n => !n.leida).length, [notifs]);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: descripcion ? 6 : 18 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.head }}>
          {titulo}
          {noLeidasCount > 0 && (
            <span style={{
              marginLeft: 10, fontSize: 13, fontWeight: 600, color: C.btnT,
              background: C.btn, padding: "2px 9px", borderRadius: 12,
              verticalAlign: "middle",
            }}>{noLeidasCount}</span>
          )}
        </h2>
        <button
          onClick={marcarTodas}
          disabled={noLeidasCount === 0}
          style={{
            background: "transparent", border: "none", fontSize: 13,
            color: noLeidasCount === 0 ? C.muted : C.btn,
            cursor: noLeidasCount === 0 ? "default" : "pointer",
            fontWeight: 600, opacity: noLeidasCount === 0 ? 0.6 : 1,
          }}
        >Marcar todas como leídas</button>
      </div>
      {descripcion && (
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>{descripcion}</p>
      )}

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
        <Spinner label="Cargando notificaciones..." />
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, textAlign: "center", color: C.muted }}>
          No tienes notificaciones {active !== "todas" ? "en esta categoría" : ""}.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => !n.leida && marcarLeida(n.id)}
              onKeyDown={(e) => {
                if (!n.leida && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  marcarLeida(n.id);
                }
              }}
              role={!n.leida ? "button" : undefined}
              tabIndex={!n.leida ? 0 : undefined}
              aria-label={!n.leida ? `Marcar como leída: ${n.titulo}` : undefined}
              style={{
                background: C.card,
                border: `1px solid ${!n.leida ? C.borderUnread : C.border}`,
                borderRadius: 6, padding: "14px 16px",
                display: "flex", gap: 14, alignItems: "flex-start",
                cursor: !n.leida ? "pointer" : "default",
                outline: "none",
              }}
              onFocus={(e) => { if (!n.leida) e.currentTarget.style.boxShadow = `0 0 0 2px ${C.btn}40`; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
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
