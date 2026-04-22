"use client";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

const students = [
  { num: 1, name: "Andrés López",     attended: true,  obs: "" },
  { num: 2, name: "María Gómez",      attended: false, obs: "" },
  { num: 3, name: "Carlos Ríos",      attended: true,  obs: "" },
  { num: 4, name: "Luisa Fernández",  attended: false, obs: "excusa médica" },
  { num: 5, name: "Juan Pérez",       attended: true,  obs: "" },
];

export default function AsistenciaPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 20px" }}>
        Registro de asistencia
      </h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {["Grupo ▾", "Piano básico · A", "13/04/2026"].map((v, i) => (
          <select key={i} disabled style={{
            padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
            fontSize: 14, color: C.body, background: C.card, cursor: "not-allowed",
          }}>
            <option>{v}</option>
          </select>
        ))}
      </div>

      {/* Tabla */}
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
            {students.map(s => (
              <tr key={s.num} style={{ borderBottom: `1px solid ${C.divider}` }}>
                <td style={{ padding: "10px 14px", fontSize: 14, color: C.muted }}>{s.num}</td>
                <td style={{ padding: "10px 14px", fontSize: 14, color: C.body, fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{
                    width: 18, height: 18, border: `2px solid ${s.attended ? C.btn : C.border}`,
                    borderRadius: 3, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 12, color: C.btn,
                    background: s.attended ? "#eef5f0" : C.card,
                  }}>
                    {s.attended ? "✓" : ""}
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{
                    width: 140, height: 22, border: `1px solid ${C.border}`,
                    borderRadius: 4, padding: "2px 8px",
                    fontSize: 13, color: C.muted,
                  }}>{s.obs}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, color: C.body }}>Asistencia: 3 / 5 estudiantes</span>
        <button disabled style={{
          padding: "9px 24px", border: "none", borderRadius: 6,
          fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn, cursor: "not-allowed",
          opacity: 0.7,
        }}>Guardar registro</button>
      </div>
    </div>
  );
}
