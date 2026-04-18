"use client";

export default function GruposPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 5. Mockup perfil del estudiante.
      </p>

      {/* Breadcrumb */}
      <div style={{ fontSize: 11, color: "#888", marginBottom: 16 }}>
        Mis grupos › Piano básico · Grupo A ›{" "}
        <span style={{ color: "#555" }}>Andrés López</span>
      </div>

      {/* Cabecera */}
      <div style={{
        background: "#fff", border: "1px solid #ddd", borderRadius: 8,
        padding: "16px 20px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          border: "1.5px solid #555", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 17, fontWeight: 600, color: "#333",
        }}>AL</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#222" }}>Andrés López</div>
          <div style={{ fontSize: 12, color: "#777" }}>Piano básico · Grupo A</div>
          <div style={{ fontSize: 11, color: "#999" }}>Matrícula: 2026-0041 · Pereira</div>
        </div>
      </div>

      {/* Dos columnas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Datos personales */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "#333",
            borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Datos personales</h3>
          {[
            ["Documento",            "CC 1.234.567.890"],
            ["Género",               "Masculino"],
            ["Correo electrónico",   "andres.lopez@correo.com"],
            ["Barrio / Ciudad",      "El Jardín · Pereira"],
            ["Horario",              "Lun y mié · 8:00 am · Salón 3"],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#888", width: 160, flexShrink: 0 }}>{l}</span>
              <span style={{ fontSize: 12, color: "#555" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button disabled style={{
              padding: "6px 14px", border: "1px solid #aaa", borderRadius: 6,
              fontSize: 12, color: "#777", background: "#fff", cursor: "not-allowed",
            }}>Ver asistencia completa</button>
            <a href="/profesor/evaluaciones" style={{
              padding: "6px 14px", border: "1.5px solid #333", borderRadius: 6,
              fontSize: 12, color: "#222", background: "#fff", textDecoration: "none",
            }}>Evaluar</a>
          </div>
        </div>

        {/* Resumen académico */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "#333",
            borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Resumen académico</h3>
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 12, borderRadius: 4, border: "1px solid #bbb",
              background: "#f5f5f5", overflow: "hidden", marginBottom: 4 }}>
              <div style={{ width: "74%", height: "100%", background: "#555", borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#333" }}>14 / 19 clases</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>74%</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
            <strong style={{ color: "#333" }}>Última evaluación:</strong> Período 2026-1 · Bueno
          </div>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 14 }}>
            Muestra avance en técnica, mejorar expresión creativa.
          </div>
          <h4 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#333" }}>
            Historial de evaluaciones
          </h4>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              {[["2025-2", "Regular"], ["2025-1", "Bueno"], ["2024-2", "Excelente"]].map(([p, v]) => (
                <tr key={p} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "5px 8px", color: "#777" }}>{p}</td>
                  <td style={{ padding: "5px 8px", color: "#555" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
