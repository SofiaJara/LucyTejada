"use client";

const programs = [
  { name: "Guitarra básica", cat: "Música · Grupo C", teacher: "Prof. Sandra Gil",
    schedule: "Mar y jue · 10:00 am", spots: 5, active: true },
  { name: "Danza contemporánea", cat: "Artes escénicas · Grupo A", teacher: "Prof. Lina Torres",
    schedule: "Lun y vie · 2:00 pm", spots: 0, active: false },
  { name: "Teatro básico", cat: "Artes escénicas · Grupo B", teacher: "Prof. Camilo Arias",
    schedule: "Mié y vie · 3:00 pm", spots: 12, active: true },
  { name: "Artes plásticas", cat: "Artes visuales · Grupo D", teacher: "Prof. Rosa Mejía",
    schedule: "Sáb · 9:00 am", spots: 3, active: true },
];

export default function InscripcionPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 9. Mockup inscripción a programa (estudiante).
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 16px" }}>
        Programas disponibles
      </h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input placeholder="Buscar programa..." readOnly style={{
          flex: 1, padding: "7px 12px", border: "1px solid #ccc",
          borderRadius: 6, fontSize: 13, color: "#bbb", outline: "none",
        }} />
        <select disabled style={{
          padding: "7px 12px", border: "1px solid #aaa", borderRadius: 6,
          fontSize: 13, color: "#777", background: "#fff", cursor: "not-allowed",
        }}>
          <option>Categoría ▾</option>
        </select>
        <select disabled style={{
          padding: "7px 12px", border: "1px solid #aaa", borderRadius: 6,
          fontSize: 13, color: "#777", background: "#fff", cursor: "not-allowed",
        }}>
          <option>Horario ▾</option>
        </select>
      </div>

      {/* Grid de programas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {programs.map((p) => (
          <div key={p.name} style={{
            background: "#fff",
            border: `1px solid ${p.active ? "#555" : "#bbb"}`,
            borderRadius: 6, padding: "14px 16px",
            opacity: p.active ? 1 : 0.7,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#222", marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 8 }}>{p.cat}</div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>
              <span style={{ color: "#888" }}>Docente: </span>{p.teacher}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>
              <span style={{ color: "#888" }}>Horario: </span>{p.schedule}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 12 }}>
              <span style={{ color: "#888" }}>Cupos: </span>
              {p.spots > 0 ? `${p.spots} disponibles` : "Sin cupos disponibles"}
            </div>
            <button disabled style={{
              padding: "5px 14px",
              border: `1.5px solid ${p.active ? "#333" : "#ccc"}`,
              borderRadius: 6, fontSize: 12,
              color: p.active ? "#222" : "#bbb",
              background: "#fff", cursor: p.active ? "pointer" : "not-allowed",
            }}>
              {p.spots > 0 ? "Inscribirse" : "Lista espera"}
            </button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        {["‹", "1", "2", "3", "›"].map(p => (
          <button key={p} disabled style={{
            padding: "4px 10px", border: "1px solid #ccc",
            borderRadius: 4, fontSize: 13, color: "#777", background: "#fff",
            cursor: "not-allowed",
          }}>{p}</button>
        ))}
      </div>
    </div>
  );
}
