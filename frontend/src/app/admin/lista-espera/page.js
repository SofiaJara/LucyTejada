"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
  warn: "#a06b1f",
};

export default function ListaEsperaPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmPromo, setConfirmPromo] = useState(null);
  const [modal, setModal] = useState({ open: false });

  const cargar = () => {
    setLoading(true);
    api("/api/admin/lista-espera")
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  // agrupar por grupo
  const porGrupo = items.reduce((acc, i) => {
    const k = `${i.grupoId}`;
    if (!acc[k]) acc[k] = { grupoId: i.grupoId, grupo: i.grupo, programa: i.programa, cupoMaximo: i.cupoMaximo, activos: i.activos, cuposLibres: i.cuposLibres, espera: [] };
    acc[k].espera.push(i);
    return acc;
  }, {});
  const grupos = Object.values(porGrupo).sort((a, b) => `${a.programa} ${a.grupo}`.localeCompare(`${b.programa} ${b.grupo}`));

  const promover = async (grupoId) => {
    setConfirmPromo(null);
    setBusy(true);
    try {
      const r = await api(`/api/admin/grupos/${grupoId}/promover-espera`, { method: "POST", body: {} });
      cargar();
      setModal({
        open: true, type: "success",
        title: "Promoción completada",
        message: r.promovidos.length === 0
          ? "No hay cupos disponibles para promover en este grupo."
          : `${r.promovidos.length} estudiante(s) promovidos a inscripción activa.`,
      });
    } catch (e) {
      setModal({ open: true, type: "error", title: "Error", message: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal
        open={!!confirmPromo}
        title="Promover lista de espera"
        message={confirmPromo
          ? `Vas a promover hasta ${confirmPromo.cuposLibres} estudiante(s) de la lista de espera de "${confirmPromo.programa} · ${confirmPromo.grupo}" (FIFO). Se les notificará el cupo asignado.`
          : ""}
        type="confirm"
        confirmText="Sí, promover"
        onConfirm={() => promover(confirmPromo.grupoId)}
        onCancel={() => setConfirmPromo(null)}
      />
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: C.head }}>Lista de espera</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
        Estudiantes en espera de cupo (orden FIFO por fecha). Al liberarse un cupo o aumentar el cupo del grupo se promociona automáticamente; también puedes hacerlo manualmente.
      </p>

      {loading ? (
        <p style={{ color: C.muted }}>Cargando...</p>
      ) : grupos.length === 0 ? (
        <div style={{ padding: 36, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, textAlign: "center", color: C.muted, fontSize: 14 }}>
          No hay estudiantes en lista de espera actualmente.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {grupos.map(g => (
            <div key={g.grupoId} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.head }}>{g.programa} · {g.grupo}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    Cupo: {g.activos}/{g.cupoMaximo}
                    {g.cuposLibres > 0
                      ? <span style={{ color: C.btn, fontWeight: 600 }}> · {g.cuposLibres} cupo(s) libre(s)</span>
                      : <span style={{ color: C.warn, fontWeight: 600 }}> · sin cupos libres</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/admin/grupos?busqueda=${encodeURIComponent(g.grupo)}`} style={btnGhost}>Ver grupo</Link>
                  <button
                    onClick={() => setConfirmPromo(g)}
                    disabled={busy || g.cuposLibres === 0}
                    style={{ ...btnPrimary, opacity: (busy || g.cuposLibres === 0) ? 0.55 : 1, cursor: (busy || g.cuposLibres === 0) ? "not-allowed" : "pointer" }}
                    title={g.cuposLibres === 0 ? "No hay cupos libres en este grupo" : "Promover lista de espera (FIFO)"}
                  >Promover ahora</button>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                    {["#", "Documento", "Estudiante", "Correo", "Fecha solicitud"].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.espera.map((i, idx) => (
                    <tr key={i.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                      <td style={{ ...td, color: C.muted, width: 30 }}>{idx + 1}</td>
                      <td style={td}>{i.documento}</td>
                      <td style={{ ...td, fontWeight: 500 }}>{i.estudiante}</td>
                      <td style={{ ...td, color: C.muted }}>{i.correo}</td>
                      <td style={{ ...td, color: C.muted }}>{new Date(i.fechaInscripcion).toLocaleString("es-CO")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 700, color: C.head };
const td = { padding: "8px 14px", fontSize: 13, color: C.body };
const btnPrimary = { padding: "7px 16px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, color: "#fff", background: C.btn };
const btnGhost = { padding: "7px 16px", border: `1.5px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, color: C.muted, background: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center" };
