"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/AuthContext";

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

  useEffect(() => {
    if (!user) return;
    api("/api/users/me/perfil").then(setPerfil).catch(console.error);
    api("/api/evaluaciones/mias").then(setEvals).catch(console.error);
    api(`/api/asistencia/estudiante/${user.id}/resumen`).then(setResumen).catch(console.error);
  }, [user]);

  if (!perfil) {
    return <p style={{ color: C.muted }}>Cargando información...</p>;
  }

  const inscripcion = perfil.inscripciones?.[0];
  const grupo = inscripcion?.grupo;
  const programa = grupo?.programa;
  const profesor = grupo?.profesor;
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
            Estudiante {programa ? `· ${programa.nombre}` : ""}
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

          <Section title="Datos de matrícula">
            {inscripcion ? (
              <>
                <Row label="Programa" value={programa?.nombre} />
                <Row label="Grupo" value={grupo?.nombre} />
                <Row label="Docente asignado" value={profesor ? `Prof. ${profesor.nombre} ${profesor.apellido}` : "Sin asignar"} />
                <Row label="Salón" value={grupo?.salon} />
                <Row label="Horario" value={grupo?.horario} />
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 13, color: C.label, width: 160 }}>Estado</span>
                  <span style={{
                    fontSize: 13, color: C.btn, border: `1.5px solid ${C.btn}`,
                    borderRadius: 4, padding: "2px 12px", fontWeight: 600,
                    textTransform: "capitalize",
                  }}>{inscripcion.estado}</span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
                Aún no estás inscrito en ningún programa. Ve a Inscripción para elegir uno.
              </p>
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
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
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
                      <td style={{ padding: "8px 10px", color: C.body, fontWeight: 600 }}>{e.valoracionGeneral}</td>
                      <td style={{ padding: "8px 10px", color: C.muted }}>{e.grupo?.programa?.nombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
