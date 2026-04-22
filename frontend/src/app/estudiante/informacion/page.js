"use client";
import Link from "next/link";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52", label: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df", progress: "#3A6048",
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 22 }}>
    <h3 style={{
      margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: C.head,
      borderBottom: `1px solid ${C.divider}`, paddingBottom: 8,
    }}>{title}</h3>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
    <span style={{ fontSize: 13, color: C.label, width: 160, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 14, color: C.body, fontWeight: 500 }}>{value}</span>
  </div>
);

export default function InformacionEstudiantePage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Cabecera perfil */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, marginBottom: 22,
        background: C.card, padding: "18px 22px", borderRadius: 8, border: `1px solid ${C.border}`,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          border: `2px solid ${C.btn}`, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 17, fontWeight: 700, color: C.btn, background: "#eef5f0",
        }}>AL</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.head }}>Andrés López</div>
          <div style={{ fontSize: 14, color: C.muted }}>Estudiante · Piano básico</div>
          <div style={{ fontSize: 13, color: C.label }}>Matrícula: 2026-0041</div>
        </div>
      </div>

      {/* Dos columnas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Columna izquierda */}
        <div style={{ background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, padding: "20px 22px" }}>
          <Section title="Datos de matrícula">
            <Row label="Programa" value="Piano básico" />
            <Row label="Grupo" value="Grupo A" />
            <Row label="Docente asignado" value="Prof. Hernán Vargas" />
            <Row label="Salón" value="Salón 3 · Bloque B" />
            <Row label="Horario" value="Lunes y miércoles · 8:00 am" />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 13, color: C.label, width: 160 }}>Estado</span>
              <span style={{
                fontSize: 13, color: C.btn, border: `1.5px solid ${C.btn}`,
                borderRadius: 4, padding: "2px 12px", fontWeight: 600,
              }}>Activo</span>
            </div>
          </Section>
        </div>

        {/* Columna derecha */}
        <div style={{ background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, padding: "20px 22px" }}>
          <Section title="Progreso académico">
            <div style={{ marginBottom: 12 }}>
              <div style={{
                height: 12, borderRadius: 6, background: "#e0ece6", overflow: "hidden", marginBottom: 6,
              }}>
                <div style={{ width: "74%", height: "100%", background: C.progress, borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: C.body }}>14 de 19 clases</span>
                <span style={{ fontSize: 14, color: C.head, fontWeight: 700 }}>74%</span>
              </div>
            </div>
          </Section>

          <Section title="Mis evaluaciones">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Período", "Valoración", "Obs."].map(h => (
                    <th key={h} style={{
                      padding: "8px 10px", textAlign: "left", fontWeight: 700,
                      color: C.head, borderBottom: `1.5px solid ${C.divider}`, fontSize: 13,
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
                  <tr key={p} style={{ borderBottom: `1px solid ${C.divider}` }}>
                    <td style={{ padding: "8px 10px", color: C.body }}>{p}</td>
                    <td style={{ padding: "8px 10px", color: C.body }}>{v}</td>
                    <td style={{ padding: "8px 10px", color: C.muted }}>{o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 12 }}>
              Muestra avance en técnica, mejorar expresión creativa.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}


