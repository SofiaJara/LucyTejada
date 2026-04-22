"use client";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

const criteria = [
  { indicator: "Participación en clase", score: "Excelente ▾" },
  { indicator: "Práctica y ensayo",       score: "Bueno ▾" },
  { indicator: "Actitud y compromiso",    score: "Excelente ▾" },
  { indicator: "Progreso técnico",        score: "Regular ▾" },
];

export default function EvaluacionesPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 20px" }}>
        Evaluación cualitativa
      </h2>

      {/* Selectores */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {["Grupo ▾", "Estudiante ▾", "Período ▾"].map((v, i) => (
          <select key={i} disabled style={{
            padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
            fontSize: 14, color: C.body, background: C.card, cursor: "not-allowed",
          }}>
            <option>{v}</option>
          </select>
        ))}
      </div>

      {/* Banda info estudiante */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 6,
        padding: "12px 18px", marginBottom: 18,
        display: "flex", gap: 24, fontSize: 14, color: C.body,
      }}>
        <span><strong style={{ color: C.head }}>Estudiante:</strong> Andrés López</span>
        <span><strong style={{ color: C.head }}>Programa:</strong> Piano básico</span>
        <span><strong style={{ color: C.head }}>Grupo:</strong> A</span>
        <span><strong style={{ color: C.head }}>Período:</strong> 2026-1</span>
      </div>

      {/* Tabla criterios */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
              {["Indicador de desempeño", "Valoración", "Obs."].map(h => (
                <th key={h} style={{
                  padding: "11px 14px", textAlign: "left", fontSize: 14,
                  fontWeight: 700, color: C.head,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
                <td style={{ padding: "10px 14px", fontSize: 14, color: C.body }}>{c.indicator}</td>
                <td style={{ padding: "10px 14px" }}>
                  <select disabled style={{
                    padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 4,
                    fontSize: 13, color: C.body, background: C.card, cursor: "not-allowed",
                  }}>
                    <option>{c.score}</option>
                  </select>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ width: 70, height: 22, border: `1px solid ${C.border}`, borderRadius: 4 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comentario */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px" }}>
        <label style={{ fontSize: 14, color: C.body, display: "block", marginBottom: 10, fontWeight: 500 }}>
          Comentario general:
        </label>
        <textarea readOnly placeholder="Escribe aquí tus observaciones generales del estudiante..."
          style={{
            width: "100%", height: 60, border: `1px solid ${C.border}`, borderRadius: 6,
            fontSize: 14, color: C.muted, padding: "8px 12px",
            boxSizing: "border-box", resize: "none", outline: "none",
          }} />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <button disabled style={{
          padding: "9px 24px", border: "none", borderRadius: 6,
          fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn,
          cursor: "not-allowed", opacity: 0.7,
        }}>Guardar evaluación</button>
        <button disabled style={{
          padding: "9px 18px", border: `1px solid ${C.border}`, borderRadius: 6,
          fontSize: 15, color: C.muted, background: C.card, cursor: "not-allowed",
        }}>Cancelar</button>
      </div>
    </div>
  );
}
