"use client";

const colors = {
  bgPage:       "#fdfdfd",
  bgCard:       "#fff",
  bgCardOff:    "#f5f5f5",
  border:       "#8BAF70",
  borderOff:    "#b8cdc0",
  btnBg:        "#3A6048",
  btnText:      "#fff",
  btnOffBg:     "#8a9e90",
  btnOffText:   "#fff",
  headingText:  "#1E2D26",
  labelText:    "#3A6048",
  bodyText:     "#2c3a32",
  mutedText:    "#4a5a52",
  inputBorder:  "#b8cdc0",
  paginationBg: "#3A6048",
};

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
    <div style={{ fontFamily: "Segoe UI, sans-serif", background: colors.bgPage, minHeight: "100%", padding: 4 }}>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.headingText, margin: "0 0 20px" }}>
        Programas disponibles
      </h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input placeholder="Buscar programa..." readOnly style={{
          flex: 1, padding: "9px 14px", border: `1px solid ${colors.inputBorder}`,
          borderRadius: 6, fontSize: 15, color: colors.mutedText,
          background: colors.bgCard, outline: "none",
        }} />
        <select disabled style={{
          padding: "9px 14px", border: `1px solid ${colors.inputBorder}`, borderRadius: 6,
          fontSize: 15, color: colors.mutedText, background: colors.bgCard, cursor: "not-allowed",
        }}>
          <option>Categoría ▾</option>
        </select>
        <select disabled style={{
          padding: "9px 14px", border: `1px solid ${colors.inputBorder}`, borderRadius: 6,
          fontSize: 15, color: colors.mutedText, background: colors.bgCard, cursor: "not-allowed",
        }}>
          <option>Horario ▾</option>
        </select>
      </div>

      {/* Grid de programas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {programs.map((p) => (
          <div key={p.name} style={{
            background: p.active ? colors.bgCard : colors.bgCardOff,
            border: `1.5px solid ${p.active ? colors.border : colors.borderOff}`,
            borderRadius: 8, padding: "18px 20px",
            opacity: p.active ? 1 : 0.75,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.headingText, marginBottom: 5 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: colors.labelText, marginBottom: 10, fontWeight: 600 }}>{p.cat}</div>
            <div style={{ fontSize: 14, color: colors.bodyText, marginBottom: 4 }}>
              <span style={{ color: colors.mutedText }}>Docente: </span>{p.teacher}
            </div>
            <div style={{ fontSize: 14, color: colors.bodyText, marginBottom: 4 }}>
              <span style={{ color: colors.mutedText }}>Horario: </span>{p.schedule}
            </div>
            <div style={{ fontSize: 14, color: colors.bodyText, marginBottom: 14 }}>
              <span style={{ color: colors.mutedText }}>Cupos: </span>
              {p.spots > 0 ? `${p.spots} disponibles` : "Sin cupos disponibles"}
            </div>
            <button disabled style={{
              padding: "7px 18px",
              border: "none",
              borderRadius: 6, fontSize: 14, fontWeight: 600,
              color: p.active ? colors.btnText : colors.btnOffText,
              background: p.active ? colors.btnBg : colors.btnOffBg,
              cursor: p.active ? "pointer" : "not-allowed",
            }}>
              {p.spots > 0 ? "Inscribirse" : "Lista espera"}
            </button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
        {["‹", "1", "2", "3", "›"].map(p => (
          <button key={p} disabled style={{
            padding: "6px 13px", border: `1px solid ${colors.inputBorder}`,
            borderRadius: 5, fontSize: 15, color: colors.bodyText,
            background: colors.bgCard, cursor: "not-allowed",
          }}>{p}</button>
        ))}
      </div>
    </div>
  );
}
