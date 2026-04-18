"use client";

const criteria = [
  { indicator: "Participación en clase", score: "Excelente ▾" },
  { indicator: "Práctica y ensayo",       score: "Bueno ▾" },
  { indicator: "Actitud y compromiso",    score: "Excelente ▾" },
  { indicator: "Progreso técnico",        score: "Regular ▾" },
];

export default function EvaluacionesPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 4. Mockup registro de evaluaciones cualitativas.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 16px" }}>
        Evaluación cualitativa
      </h2>

      {/* Selectores */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {["Grupo ▾", "Estudiante ▾", "Período ▾"].map((v, i) => (
          <select key={i} disabled style={{
            padding: "6px 12px", border: "1px solid #555", borderRadius: 6,
            fontSize: 12, color: "#555", background: "#fff", cursor: "not-allowed",
          }}>
            <option>{v}</option>
          </select>
        ))}
      </div>

      {/* Banda info estudiante */}
      <div style={{
        background: "#fff", border: "1px solid #bbb", borderRadius: 6,
        padding: "10px 16px", marginBottom: 16,
        display: "flex", gap: 24, fontSize: 12, color: "#555",
      }}>
        <span><strong style={{ color: "#333" }}>Estudiante:</strong> Andrés López</span>
        <span><strong style={{ color: "#333" }}>Programa:</strong> Piano básico</span>
        <span><strong style={{ color: "#333" }}>Grupo:</strong> A</span>
        <span><strong style={{ color: "#333" }}>Período:</strong> 2026-1</span>
      </div>

      {/* Tabla criterios */}
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #aaa" }}>
              {["Indicador de desempeño", "Valoración", "Obs."].map(h => (
                <th key={h} style={{
                  padding: "9px 12px", textAlign: "left", fontSize: 12,
                  fontWeight: 600, color: "#222",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px", fontSize: 12, color: "#333" }}>{c.indicator}</td>
                <td style={{ padding: "8px 12px" }}>
                  <select disabled style={{
                    padding: "3px 8px", border: "1px solid #aaa", borderRadius: 3,
                    fontSize: 11, color: "#888", background: "#fff", cursor: "not-allowed",
                  }}>
                    <option>{c.score}</option>
                  </select>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ width: 60, height: 18, border: "1px solid #ccc", borderRadius: 3 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comentario */}
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "14px 16px" }}>
        <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 8 }}>
          Comentario general:
        </label>
        <textarea readOnly placeholder="Escribe aquí tus observaciones generales del estudiante..."
          style={{
            width: "100%", height: 55, border: "1px solid #aaa", borderRadius: 5,
            fontSize: 11, color: "#bbb", padding: "6px 10px",
            boxSizing: "border-box", resize: "none", outline: "none",
          }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button disabled style={{
          padding: "7px 22px", border: "1.5px solid #333", borderRadius: 6,
          fontSize: 13, color: "#222", background: "#fff", cursor: "not-allowed",
        }}>Guardar evaluación</button>
        <button disabled style={{
          padding: "7px 16px", border: "1px solid #ccc", borderRadius: 6,
          fontSize: 13, color: "#777", background: "#fff", cursor: "not-allowed",
        }}>Cancelar</button>
      </div>
    </div>
  );
}
