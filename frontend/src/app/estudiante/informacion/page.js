"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/AuthContext";
import BarChart from "@/app/components/lt/BarChart";

const VALORACION_SCORE = { Excelente: 4, Bueno: 3, Regular: 2, Deficiente: 1 };
const VALORACION_COLOR = {
  Excelente: "#3A6048",
  Bueno: "#5a8a6e",
  Regular: "#a06b1f",
  Deficiente: "#a8442e",
};

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
    <span style={{ fontSize: 14, color: C.body, fontWeight: 500 }}>{value || "—"}</span>
  </div>
);

export default function InformacionEstudiantePage() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [evals, setEvals] = useState([]);
  const [resumen, setResumen] = useState({ presentes: 0, total: 0, porcentaje: 0 });
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return;
    const onErr = (e) => { console.error(e); setLoadError(prev => prev || (e?.message || "No se pudo cargar la información.")); };
    api("/api/users/me/perfil").then(setPerfil).catch(onErr);
    api("/api/evaluaciones/mias").then(setEvals).catch(onErr);
    api(`/api/asistencia/estudiante/${user.id}/resumen`).then(setResumen).catch(onErr);
  }, [user]);

  if (!perfil) {
    if (loadError) {
      return (
        <div role="alert" style={{
          background: "#fdf1ec", border: "1px solid #f0b6a5", color: "#a8442e",
          padding: "16px 18px", borderRadius: 8, fontSize: 14, maxWidth: 540,
        }}>
          <strong style={{ display: "block", marginBottom: 4 }}>No se pudo cargar tu información</strong>
          {loadError}
          <button onClick={() => window.location.reload()} style={{
            marginTop: 10, padding: "6px 14px", borderRadius: 6, border: "1px solid #a8442e",
            background: "#fff", color: "#a8442e", fontWeight: 600, cursor: "pointer", fontSize: 13,
          }}>Reintentar</button>
        </div>
      );
    }
    return <p style={{ color: C.muted }}>Cargando información...</p>;
  }

  const inscripciones = perfil.inscripciones || [];
  const primera = inscripciones[0];
  const programaPrincipal = primera?.grupo?.programa;
  const iniciales = `${perfil.nombre?.[0] || ""}${perfil.apellido?.[0] || ""}`;

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 16, marginBottom: 22,
        background: C.card, padding: "18px 22px", borderRadius: 8, border: `1px solid ${C.border}`,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          border: `2px solid ${C.btn}`, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 17, fontWeight: 700, color: C.btn, background: "#eef5f0",
        }}>{iniciales.toUpperCase()}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.head }}>
            {perfil.nombre} {perfil.apellido}
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>
            Estudiante{programaPrincipal ? ` · ${programaPrincipal.nombre}` : ""}
            {inscripciones.length > 1 && (
              <span style={{ marginLeft: 6, color: C.btn, fontWeight: 600 }}>
                (+{inscripciones.length - 1} programa{inscripciones.length - 1 > 1 ? "s" : ""})
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: C.label }}>Documento: {perfil.documento}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div style={{ background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, padding: "20px 22px" }}>
          <Section title="Datos personales">
            <Row label="Correo" value={perfil.correo} />
            <Row label="Teléfono" value={perfil.telefono} />
            <Row label="Documento" value={perfil.documento} />
            <Row label="Género" value={perfil.genero} />
            <Row label="Ciudad / Barrio" value={[perfil.ciudad, perfil.barrio].filter(Boolean).join(" · ")} />
          </Section>

          <Section title={inscripciones.length > 1 ? `Matrículas activas (${inscripciones.length})` : "Datos de matrícula"}>
            {inscripciones.length === 0 ? (
              <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
                Aún no estás inscrito en ningún programa. Ve a Inscripción para elegir uno.
              </p>
            ) : (
              inscripciones.map((ins, idx) => {
                const g = ins.grupo;
                const p = g?.programa;
                const prof = g?.profesor;
                return (
                  <div key={ins.id} style={{
                    marginBottom: idx < inscripciones.length - 1 ? 14 : 0,
                    paddingBottom: idx < inscripciones.length - 1 ? 12 : 0,
                    borderBottom: idx < inscripciones.length - 1 ? `1px dashed ${C.divider}` : "none",
                  }}>
                    <Row label="Programa" value={p?.nombre} />
                    <Row label="Grupo" value={g?.nombre} />
                    <Row label="Docente asignado" value={prof ? `Prof. ${prof.nombre} ${prof.apellido}` : "Sin asignar"} />
                    <Row label="Salón" value={g?.salon} />
                    <Row label="Horario" value={g?.horario} />
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 13, color: C.label, width: 160 }}>Estado</span>
                      <span style={{
                        fontSize: 13,
                        color: ins.estado === "lista_espera" ? "#a06b1f" : C.btn,
                        border: `1.5px solid ${ins.estado === "lista_espera" ? "#a06b1f" : C.btn}`,
                        borderRadius: 4, padding: "2px 12px", fontWeight: 600,
                        textTransform: "capitalize",
                      }}>{ins.estado === "lista_espera" ? "Lista de espera" : ins.estado}</span>
                    </div>
                  </div>
                );
              })
            )}
          </Section>
        </div>

        <div style={{ background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, padding: "20px 22px" }}>
          <Section title="Progreso académico">
            <div style={{ marginBottom: 12 }}>
              <div style={{
                height: 12, borderRadius: 6, background: "#e0ece6", overflow: "hidden", marginBottom: 6,
              }}>
                <div style={{ width: `${resumen.porcentaje}%`, height: "100%", background: C.progress, borderRadius: 6 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: C.body }}>{resumen.presentes} de {resumen.total} clases</span>
                <span style={{ fontSize: 14, color: C.head, fontWeight: 700 }}>{resumen.porcentaje}%</span>
              </div>
            </div>
          </Section>

          <Section title="Mis evaluaciones">
            {evals.length === 0 ? (
              <p style={{ fontSize: 13, color: C.muted }}>Aún no tienes evaluaciones registradas.</p>
            ) : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 14 }}>
                  <thead>
                    <tr>
                      {["Período", "Valoración", "Programa"].map(h => (
                        <th key={h} style={{
                          padding: "8px 10px", textAlign: "left", fontWeight: 700,
                          color: C.head, borderBottom: `1.5px solid ${C.divider}`, fontSize: 13,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evals.map(e => (
                      <tr key={e.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                        <td style={{ padding: "8px 10px", color: C.body }}>{e.periodo}</td>
                        <td style={{ padding: "8px 10px", fontWeight: 600 }}>
                          <span style={{
                            display: "inline-block", padding: "2px 10px", borderRadius: 4,
                            fontSize: 12, fontWeight: 700, color: "#fff",
                            background: VALORACION_COLOR[e.valoracionGeneral] || C.muted,
                          }}>{e.valoracionGeneral}</span>
                        </td>
                        <td style={{ padding: "8px 10px", color: C.muted }}>{e.grupo?.programa?.nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {evals.length >= 2 && (
                  <div style={{ marginTop: 14, padding: "12px 14px", border: `1px dashed ${C.divider}`, borderRadius: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.head, marginBottom: 8 }}>
                      Tendencia por período
                    </div>
                    <BarChart
                      data={[...evals].reverse().map(e => ({
                        label: `${e.periodo} · ${e.grupo?.programa?.nombre || ""}`.trim(),
                        valor: VALORACION_SCORE[e.valoracionGeneral] || 0,
                      }))}
                      labelKey="label"
                      valueKey="valor"
                      max={4}
                      color={C.progress}
                      height={20}
                    />
                    <p style={{ margin: "8px 0 0", fontSize: 11, color: C.muted }}>
                      Escala: 1 = Deficiente · 2 = Regular · 3 = Bueno · 4 = Excelente
                    </p>
                  </div>
                )}
              </>
            )}
            {evals[0]?.comentario && (
              <p style={{ fontSize: 13, color: C.muted, marginTop: 12, lineHeight: 1.5 }}>
                <strong style={{ color: C.head }}>Último comentario:</strong> {evals[0].comentario}
              </p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
