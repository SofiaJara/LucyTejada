"use client";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df", progress: "#3A6048",
};

export default function GruposPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>
        Mis grupos › Piano básico · Grupo A ›{" "}
        <span style={{ color: C.body, fontWeight: 500 }}>Andrés López</span>
      </div>

      {/* Cabecera */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: "18px 22px", marginBottom: 22,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          border: `2px solid ${C.btn}`, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, color: C.btn, background: "#eef5f0",
        }}>AL</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.head }}>Andrés López</div>
          <div style={{ fontSize: 14, color: C.muted }}>Piano básico · Grupo A</div>
          <div style={{ fontSize: 13, color: C.muted }}>Matrícula: 2026-0041 · Pereira</div>
        </div>
      </div>

      {/* Dos columnas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Datos personales */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head,
            borderBottom: `1px solid ${C.divider}`, paddingBottom: 8 }}>Datos personales</h3>
          {[
            ["Documento",            "CC 1.234.567.890"],
            ["Género",               "Masculino"],
            ["Correo electrónico",   "andres.lopez@correo.com"],
            ["Barrio / Ciudad",      "El Jardín · Pereira"],
            ["Horario",              "Lun y mié · 8:00 am · Salón 3"],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.muted, width: 160, flexShrink: 0 }}>{l}</span>
              <span style={{ fontSize: 14, color: C.body, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button disabled style={{
              padding: "8px 16px", border: `1px solid ${C.border}`, borderRadius: 6,
              fontSize: 13, color: C.muted, background: C.card, cursor: "not-allowed",
            }}>Ver asistencia completa</button>
            <a href="/profesor/evaluaciones" style={{
              padding: "8px 18px", border: "none", borderRadius: 6,
              fontSize: 13, fontWeight: 600, color: C.btnT, background: C.btn, textDecoration: "none",
            }}>Evaluar</a>
          </div>
        </div>

        {/* Resumen académico */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.head,
            borderBottom: `1px solid ${C.divider}`, paddingBottom: 8 }}>Resumen académico</h3>
          <div style={{ marginBottom: 14 }}>
            <div style={{ height: 12, borderRadius: 6, background: "#e0ece6", overflow: "hidden", marginBottom: 6 }}>
              <div style={{ width: "74%", height: "100%", background: C.progress, borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: C.body }}>14 / 19 clases</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.head }}>74%</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: C.body, marginBottom: 6 }}>
            <strong style={{ color: C.head }}>Última evaluación:</strong> Período 2026-1 · Bueno
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            Muestra avance en técnica, mejorar expresión creativa.
          </div>
          <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: C.head }}>
            Historial de evaluaciones
          </h4>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {[["2025-2", "Regular"], ["2025-1", "Bueno"], ["2024-2", "Excelente"]].map(([p, v]) => (
                <tr key={p} style={{ borderBottom: `1px solid ${C.divider}` }}>
                  <td style={{ padding: "7px 10px", color: C.muted }}>{p}</td>
                  <td style={{ padding: "7px 10px", color: C.body, fontWeight: 500 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
