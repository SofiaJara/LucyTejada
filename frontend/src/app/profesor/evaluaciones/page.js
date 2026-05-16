"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/app/lib/api";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

const valoraciones = ["Excelente", "Bueno", "Regular", "Deficiente"];
const periodoActual = `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? "1" : "2"}`;

const indicadores = [
  { key: "participacion", label: "Participación en clase" },
  { key: "practica",      label: "Práctica y ensayo" },
  { key: "actitud",       label: "Actitud y compromiso" },
  { key: "progreso",      label: "Progreso técnico" },
];

export default function EvaluacionesPage() {
  const search = useSearchParams();
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState("");
  const [grupo, setGrupo] = useState(null);
  const [estudianteId, setEstudianteId] = useState("");
  const [periodo, setPeriodo] = useState(periodoActual);
  const [evalu, setEvalu] = useState({
    participacion: "Bueno", practica: "Bueno", actitud: "Bueno", progreso: "Bueno",
    valoracionGeneral: "Bueno", comentario: "",
  });
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState({ open: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/grupos").then(gs => {
      setGrupos(gs);
      const initGrupoId = Number(search.get("grupoId")) || gs[0]?.id || "";
      setGrupoId(initGrupoId);
      const initEst = Number(search.get("estudianteId"));
      if (initEst) setEstudianteId(initEst);
    });
  }, []);

  useEffect(() => {
    if (!grupoId) return;
    api(`/api/grupos/${grupoId}`).then(g => {
      setGrupo(g);
      if (!estudianteId && g.inscripciones.length > 0) {
        setEstudianteId(g.inscripciones[0].estudiante.id);
      }
    });
  }, [grupoId]);

  // cargar evaluación existente
  useEffect(() => {
    if (!grupoId || !estudianteId || !periodo) return;
    api(`/api/evaluaciones/estudiante/${estudianteId}`).then(evals => {
      const existing = evals.find(e => e.grupoId === Number(grupoId) && e.periodo === periodo);
      if (existing) {
        setEvalu({
          participacion: existing.participacion,
          practica: existing.practica,
          actitud: existing.actitud,
          progreso: existing.progreso,
          valoracionGeneral: existing.valoracionGeneral,
          comentario: existing.comentario || "",
        });
      } else {
        setEvalu({
          participacion: "Bueno", practica: "Bueno", actitud: "Bueno", progreso: "Bueno",
          valoracionGeneral: "Bueno", comentario: "",
        });
      }
    });
  }, [grupoId, estudianteId, periodo]);

  const guardar = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      await api("/api/evaluaciones", {
        method: "POST",
        body: {
          estudianteId: Number(estudianteId), grupoId: Number(grupoId), periodo,
          ...evalu,
        },
      });
      setModal({ open: true, title: "Evaluación guardada", message: "La evaluación fue registrada y notificada al estudiante.", type: "success" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const estudiante = grupo?.inscripciones.find(ins => ins.estudiante.id === Number(estudianteId))?.estudiante;

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal
        open={confirm}
        title="Confirmar evaluación"
        message={`¿Guardar la evaluación de ${estudiante?.nombre} ${estudiante?.apellido} para el período ${periodo}?\nValoración general: ${evalu.valoracionGeneral}`}
        type="confirm"
        confirmText="Sí, guardar"
        onConfirm={guardar}
        onCancel={() => setConfirm(false)}
      />
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 20px" }}>
        Evaluación cualitativa
      </h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <select value={grupoId} onChange={(e) => { setGrupoId(Number(e.target.value)); setEstudianteId(""); }} style={selectStyle}>
          {grupos.map(g => <option key={g.id} value={g.id}>{g.programa.nombre} · {g.nombre}</option>)}
        </select>
        <select value={estudianteId} onChange={(e) => setEstudianteId(Number(e.target.value))} style={selectStyle}>
          <option value="">— Seleccionar estudiante —</option>
          {grupo?.inscripciones.map(ins => (
            <option key={ins.estudiante.id} value={ins.estudiante.id}>
              {ins.estudiante.nombre} {ins.estudiante.apellido}
            </option>
          ))}
        </select>
        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={selectStyle}>
          {["2025-1", "2025-2", "2026-1", "2026-2"].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {estudiante && (
        <>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 6,
            padding: "12px 18px", marginBottom: 18,
            display: "flex", gap: 24, fontSize: 14, color: C.body, flexWrap: "wrap",
          }}>
            <span><strong style={{ color: C.head }}>Estudiante:</strong> {estudiante.nombre} {estudiante.apellido}</span>
            <span><strong style={{ color: C.head }}>Programa:</strong> {grupo.programa.nombre}</span>
            <span><strong style={{ color: C.head }}>Grupo:</strong> {grupo.nombre}</span>
            <span><strong style={{ color: C.head }}>Período:</strong> {periodo}</span>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 18 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                  {["Indicador de desempeño", "Valoración"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 14, fontWeight: 700, color: C.head }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {indicadores.map(ind => (
                  <tr key={ind.key} style={{ borderBottom: `1px solid ${C.divider}` }}>
                    <td style={{ padding: "10px 14px", fontSize: 14, color: C.body }}>{ind.label}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <select
                        value={evalu[ind.key]}
                        onChange={(e) => setEvalu({ ...evalu, [ind.key]: e.target.value })}
                        style={{
                          padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 4,
                          fontSize: 13, color: C.body, background: C.card,
                        }}
                      >
                        {valoraciones.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#eef5f0" }}>
                  <td style={{ padding: "12px 14px", fontSize: 14, color: C.head, fontWeight: 700 }}>Valoración general</td>
                  <td style={{ padding: "12px 14px" }}>
                    <select
                      value={evalu.valoracionGeneral}
                      onChange={(e) => setEvalu({ ...evalu, valoracionGeneral: e.target.value })}
                      style={{
                        padding: "6px 12px", border: `1.5px solid ${C.btn}`, borderRadius: 4,
                        fontSize: 14, color: C.head, fontWeight: 600, background: C.card,
                      }}
                    >
                      {valoraciones.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px" }}>
            <label style={{ fontSize: 14, color: C.body, display: "block", marginBottom: 10, fontWeight: 500 }}>
              Comentario general:
            </label>
            <textarea
              value={evalu.comentario}
              onChange={(e) => setEvalu({ ...evalu, comentario: e.target.value })}
              placeholder="Escribe aquí tus observaciones generales del estudiante..."
              style={{
                width: "100%", minHeight: 70, border: `1px solid ${C.border}`, borderRadius: 6,
                fontSize: 14, color: C.body, padding: "8px 12px",
                boxSizing: "border-box", resize: "vertical", outline: "none",
                fontFamily: "Segoe UI, sans-serif",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <button
              disabled={loading || !estudianteId}
              onClick={() => setConfirm(true)}
              style={{
                padding: "9px 24px", border: "none", borderRadius: 6,
                fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Guardando..." : "Guardar evaluación"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const selectStyle = {
  padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
  fontSize: 14, color: C.body, background: C.card,
};
