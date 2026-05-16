"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

export default function AsistenciaPage() {
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState("");
  const [grupo, setGrupo] = useState(null);
  const [clases, setClases] = useState([]);
  const [claseId, setClaseId] = useState("");
  const [tema, setTema] = useState("");
  const [registros, setRegistros] = useState({}); // {estudianteId: {asistio, observacion}}
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState({ open: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/grupos").then(gs => {
      setGrupos(gs);
      if (gs.length > 0) setGrupoId(gs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!grupoId) return;
    setClaseId("");
    api(`/api/grupos/${grupoId}`).then(g => {
      setGrupo(g);
      // inicializar registros
      const init = {};
      g.inscripciones.forEach(ins => {
        init[ins.estudiante.id] = { asistio: false, observacion: "" };
      });
      setRegistros(init);
    });
    api(`/api/asistencia/grupos/${grupoId}/clases`).then(setClases);
  }, [grupoId]);

  const cargarClase = async (id) => {
    setClaseId(id);
    if (!id) {
      const init = {};
      grupo?.inscripciones.forEach(ins => {
        init[ins.estudiante.id] = { asistio: false, observacion: "" };
      });
      setRegistros(init);
      return;
    }
    const clase = await api(`/api/asistencia/clases/${id}`);
    setTema(clase.tema || "");
    const map = {};
    grupo?.inscripciones.forEach(ins => {
      const existing = clase.asistencias.find(a => a.estudianteId === ins.estudiante.id);
      map[ins.estudiante.id] = {
        asistio: existing?.asistio || false,
        observacion: existing?.observacion || "",
      };
    });
    setRegistros(map);
  };

  const toggleAsistio = (estudianteId) => {
    setRegistros({
      ...registros,
      [estudianteId]: { ...registros[estudianteId], asistio: !registros[estudianteId].asistio },
    });
  };
  const marcarTodos = (valor) => {
    const next = {};
    Object.entries(registros).forEach(([id, r]) => {
      next[id] = { ...r, asistio: valor };
    });
    setRegistros(next);
  };
  const setObs = (estudianteId, observacion) => {
    setRegistros({
      ...registros,
      [estudianteId]: { ...registros[estudianteId], observacion },
    });
  };

  const guardar = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      let cid = claseId;
      if (!cid) {
        const nueva = await api("/api/asistencia/clases", {
          method: "POST",
          body: { grupoId: Number(grupoId), tema, fecha: new Date().toISOString() },
        });
        cid = nueva.id;
      }
      const asistencias = Object.entries(registros).map(([estudianteId, r]) => ({
        estudianteId: Number(estudianteId),
        asistio: r.asistio,
        observacion: r.observacion,
      }));
      await api(`/api/asistencia/clases/${cid}/registrar`, {
        method: "POST",
        body: { asistencias },
      });
      setModal({ open: true, title: "Asistencia registrada", message: `Se registraron ${asistencias.length} estudiantes.`, type: "success" });
      // refresh clases
      api(`/api/asistencia/grupos/${grupoId}/clases`).then(setClases);
    } catch (err) {
      setModal({ open: true, title: "Error", message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const presentes = Object.values(registros).filter(r => r.asistio).length;
  const total = Object.keys(registros).length;

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <ConfirmModal
        open={confirm}
        title="Confirmar registro de asistencia"
        message={`Vas a guardar la asistencia de ${total} estudiantes para esta clase (${presentes} presentes). ¿Continuar?`}
        type="confirm"
        confirmText="Sí, guardar"
        onConfirm={guardar}
        onCancel={() => setConfirm(false)}
      />
      <ConfirmModal {...modal} hideCancel confirmText="Entendido" onConfirm={() => setModal({ ...modal, open: false })} onCancel={() => setModal({ ...modal, open: false })} />

      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 20px" }}>
        Registro de asistencia
      </h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={grupoId} onChange={(e) => setGrupoId(Number(e.target.value))} style={{
          padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
          fontSize: 14, color: C.body, background: C.card,
        }}>
          {grupos.map(g => (
            <option key={g.id} value={g.id}>{g.programa.nombre} · {g.nombre}</option>
          ))}
        </select>
        <select value={claseId} onChange={(e) => cargarClase(e.target.value ? Number(e.target.value) : "")} style={{
          padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
          fontSize: 14, color: C.body, background: C.card, minWidth: 220,
        }}>
          <option value="">— Nueva clase ({new Date().toLocaleDateString("es-CO")}) —</option>
          {clases.map(c => (
            <option key={c.id} value={c.id}>
              {new Date(c.fecha).toLocaleDateString("es-CO")} {c.tema ? `· ${c.tema}` : ""}
            </option>
          ))}
        </select>
        <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Tema (opcional)" style={{
          padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
          fontSize: 14, color: C.body, background: C.card, flex: 1, minWidth: 180,
        }} />
      </div>

      {grupo && (
        <>
          {total > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: C.muted }}>Acciones rápidas:</span>
              <button type="button" onClick={() => marcarTodos(true)} style={{
                padding: "5px 12px", border: `1px solid ${C.btn}`, borderRadius: 5,
                background: "#fff", color: C.btn, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>Marcar todos presentes</button>
              <button type="button" onClick={() => marcarTodos(false)} style={{
                padding: "5px 12px", border: `1px solid ${C.border}`, borderRadius: 5,
                background: "#fff", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>Limpiar</button>
            </div>
          )}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                  {["#", "Nombre del estudiante", "Asistió", "Observación"].map(h => (
                    <th key={h} style={{
                      padding: "11px 14px", textAlign: "left", fontSize: 14,
                      fontWeight: 700, color: C.head, background: C.card,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grupo.inscripciones.map((ins, i) => {
                  const e = ins.estudiante;
                  const r = registros[e.id] || { asistio: false, observacion: "" };
                  return (
                    <tr key={ins.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                      <td style={{ padding: "10px 14px", fontSize: 14, color: C.muted }}>{i + 1}</td>
                      <td style={{ padding: "10px 14px", fontSize: 14, color: C.body, fontWeight: 500 }}>
                        {e.nombre} {e.apellido}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <button onClick={() => toggleAsistio(e.id)} style={{
                          width: 22, height: 22, border: `2px solid ${r.asistio ? C.btn : C.border}`,
                          borderRadius: 4, padding: 0, cursor: "pointer",
                          fontSize: 13, color: C.btn, fontWeight: 700,
                          background: r.asistio ? "#eef5f0" : C.card,
                        }}>
                          {r.asistio ? "✓" : ""}
                        </button>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <input
                          value={r.observacion}
                          onChange={(ev) => setObs(e.id, ev.target.value)}
                          placeholder="Observación"
                          style={{
                            width: "100%", maxWidth: 280, padding: "5px 10px",
                            border: `1px solid ${C.border}`, borderRadius: 4,
                            fontSize: 13, color: C.body, outline: "none",
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: C.body }}>Asistencia: {presentes} / {total} estudiantes</span>
            <button
              disabled={loading || total === 0}
              onClick={() => setConfirm(true)}
              style={{
                padding: "9px 24px", border: "none", borderRadius: 6,
                fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Guardando..." : "Guardar registro"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
