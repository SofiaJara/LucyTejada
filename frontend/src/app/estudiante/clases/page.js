"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/AuthContext";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df",
};

export default function ClasesPage() {
  const { user } = useAuth();
  const [inscripciones, setInscripciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api("/api/inscripciones/mias")
      .then(async (data) => {
        setInscripciones(data);
        if (data.length > 0) {
          // traer clases por cada grupo
          const allClases = [];
          for (const ins of data) {
            const cs = await api(`/api/asistencia/grupos/${ins.grupoId}/clases`);
            cs.forEach(c => allClases.push({ ...c, grupo: ins.grupo }));
          }
          setClases(allClases.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p style={{ color: C.muted }}>Cargando...</p>;

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 20px" }}>Mis clases</h2>

      {inscripciones.length === 0 ? (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: 36, textAlign: "center",
        }}>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 16 }}>
            Aún no estás inscrito en ningún programa.
          </p>
          <Link href="/estudiante/inscripcion" style={{
            padding: "9px 20px", border: "none", borderRadius: 6,
            fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn, textDecoration: "none",
          }}>Ver programas disponibles</Link>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
            {inscripciones.map(ins => (
              <div key={ins.id} style={{
                background: C.card, border: `1.5px solid ${C.btn}`, borderRadius: 8, padding: "16px 20px",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.head, marginBottom: 4 }}>
                  {ins.grupo.programa.nombre}
                </div>
                <div style={{ fontSize: 13, color: C.btn, fontWeight: 600, marginBottom: 8 }}>
                  {ins.grupo.programa.categoria} · {ins.grupo.nombre}
                </div>
                <div style={{ fontSize: 13, color: C.body, marginBottom: 3 }}>
                  <strong>Docente:</strong> {ins.grupo.profesor ? `${ins.grupo.profesor.nombre} ${ins.grupo.profesor.apellido}` : "Sin asignar"}
                </div>
                <div style={{ fontSize: 13, color: C.body, marginBottom: 3 }}>
                  <strong>Horario:</strong> {ins.grupo.horario}
                </div>
                <div style={{ fontSize: 13, color: C.body }}>
                  <strong>Salón:</strong> {ins.grupo.salon}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: "0 0 12px" }}>Sesiones registradas</h3>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            {clases.length === 0 ? (
              <p style={{ padding: "18px 22px", margin: 0, color: C.muted, fontSize: 14 }}>
                Aún no hay sesiones registradas para tus grupos.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                    {["Fecha", "Programa · Grupo", "Tema"].map(h => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: "left", fontSize: 13,
                        fontWeight: 700, color: C.head,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clases.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                      <td style={{ padding: "9px 14px", fontSize: 13, color: C.body }}>
                        {new Date(c.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "9px 14px", fontSize: 13, color: C.body }}>
                        {c.grupo.programa.nombre} · {c.grupo.nombre}
                      </td>
                      <td style={{ padding: "9px 14px", fontSize: 13, color: C.muted }}>
                        {c.tema || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
