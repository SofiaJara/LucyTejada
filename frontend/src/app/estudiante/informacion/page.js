"use client";
import Link from "next/link";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#333",
      borderBottom: "1px solid #ddd", paddingBottom: 6 }}>{title}</h3>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
    <span style={{ fontSize: 12, color: "#888", width: 160, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 12, color: "#333" }}>{value}</span>
  </div>
);

export default function InformacionEstudiantePage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 7. Mockup mi información académica (estudiante).
      </p>

      {/* Cabecera perfil */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
        paddingBottom: 16, borderBottom: "1px solid #ccc",
        background: "#fff", padding: "16px 20px", borderRadius: 8, border: "1px solid #ddd",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          border: "1.5px solid #555", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 600, color: "#333", background: "#fff",
        }}>AL</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#222" }}>Andrés López</div>
          <div style={{ fontSize: 12, color: "#777" }}>Estudiante · Piano básico</div>
          <div style={{ fontSize: 11, color: "#999" }}>Matrícula: 2026-0041</div>
        </div>
      </div>

      {/* Dos columnas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Columna izquierda */}
        <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #ddd", padding: "18px 20px" }}>
          <Section title="Datos de matrícula">
            <Row label="Programa" value="Piano básico" />
            <Row label="Grupo" value="Grupo A" />
            <Row label="Docente asignado" value="Prof. Hernán Vargas" />
            <Row label="Salón" value="Salón 3 · Bloque B" />
            <Row label="Horario" value="Lunes y miércoles · 8:00 am" />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "#888", width: 160 }}>Estado</span>
              <span style={{
                fontSize: 11, color: "#333", border: "1px solid #555",
                borderRadius: 4, padding: "2px 10px",
              }}>Activo</span>
            </div>
          </Section>
        </div>

        {/* Columna derecha */}
        <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #ddd", padding: "18px 20px" }}>
          <Section title="Progreso académico">
            <div style={{ marginBottom: 10 }}>
              <div style={{
                height: 12, borderRadius: 4, border: "1px solid #bbb",
                background: "#f5f5f5", overflow: "hidden", marginBottom: 4,
              }}>
                <div style={{ width: "74%", height: "100%", background: "#555", borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#333" }}>14 de 19 clases</span>
                <span style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>74%</span>
              </div>
            </div>
          </Section>

          <Section title="Mis evaluaciones">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Período", "Valoración", "Obs."].map(h => (
                    <th key={h} style={{
                      padding: "6px 8px", textAlign: "left", fontWeight: 600,
                      color: "#222", borderBottom: "1px solid #aaa", fontSize: 12,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["2026-1", "Bueno", "ver"],
                  ["2025-2", "Regular", "ver"],
                  ["2025-1", "Excelente", "ver"],
                ].map(([p, v, o]) => (
                  <tr key={p} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "6px 8px", color: "#555" }}>{p}</td>
                    <td style={{ padding: "6px 8px", color: "#555" }}>{v}</td>
                    <td style={{ padding: "6px 8px", color: "#888" }}>{o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 11, color: "#555", marginTop: 10 }}>
              Muestra avance en técnica, mejorar expresión creativa.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
