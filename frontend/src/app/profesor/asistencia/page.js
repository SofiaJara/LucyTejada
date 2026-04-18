"use client";

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
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 3. Mockup registro de asistencia.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 16px" }}>
        Registro de asistencia
      </h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["Grupo ▾", "Piano básico · A", "13/04/2026"].map((v, i) => (
          <select key={i} disabled style={{
            padding: "6px 12px", border: "1px solid #555", borderRadius: 6,
            fontSize: 12, color: "#555", background: "#fff", cursor: "not-allowed",
          }}>
            <option>{v}</option>
          </select>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #aaa" }}>
              {["#", "Nombre del estudiante", "Asistió", "Observación"].map(h => (
                <th key={h} style={{
                  padding: "9px 12px", textAlign: "left", fontSize: 12,
                  fontWeight: 600, color: "#222", background: "#fff",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.num} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px", fontSize: 12, color: "#777" }}>{s.num}</td>
                <td style={{ padding: "8px 12px", fontSize: 12, color: "#333" }}>{s.name}</td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{
                    width: 16, height: 16, border: "1.5px solid #555",
                    borderRadius: 3, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 10, color: "#333",
                  }}>
                    {s.attended ? "✓" : ""}
                  </div>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{
                    width: 120, height: 18, border: "1px solid #ccc",
                    borderRadius: 3, padding: "2px 6px",
                    fontSize: 11, color: "#777",
                  }}>{s.obs}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#555" }}>Asistencia: 3 / 5 estudiantes</span>
        <button disabled style={{
          padding: "8px 22px", border: "1.5px solid #333", borderRadius: 6,
          fontSize: 13, color: "#222", background: "#fff", cursor: "not-allowed",
        }}>Guardar registro</button>
      </div>
    </div>
  );
}
