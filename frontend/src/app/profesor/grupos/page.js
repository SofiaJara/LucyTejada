"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/app/lib/api";
import Spinner from "@/app/components/lt/Spinner";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", divider: "#d8e8df", progress: "#3A6048",
};

export default function GruposPageWrapper() {
  return (
    <Suspense fallback={<p style={{ color: C.muted }}>Cargando...</p>}>
      <GruposPage />
    </Suspense>
  );
}

function GruposPage() {
  const search = useSearchParams();
  const [grupos, setGrupos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/grupos").then(gs => {
      setGrupos(gs);
      if (gs.length > 0) {
        const preferred = Number(search.get("grupo"));
        const found = preferred && gs.find(g => g.id === preferred);
        setSelected(found ? preferred : gs[0].id);
      }
    }).finally(() => setLoading(false));
  }, [search]);

  const grupo = grupos.find(g => g.id === selected);

  if (loading) return <Spinner label="Cargando grupos..." />;

  if (grupos.length === 0) {
    return (
      <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 16px" }}>Mis grupos</h2>
        <div style={{ padding: 30, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, textAlign: "center" }}>
          Aún no tienes grupos asignados. Contacta al administrador.
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 18px" }}>Mis grupos</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        {grupos.map(g => (
          <button key={g.id} onClick={() => setSelected(g.id)} style={{
            padding: "8px 16px", borderRadius: 6,
            border: `1.5px solid ${selected === g.id ? C.btn : C.border}`,
            background: selected === g.id ? C.btn : C.card,
            color: selected === g.id ? "#fff" : C.body,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {g.programa.nombre} · {g.nombre}
          </button>
        ))}
      </div>

      {grupo && (
        <>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "18px 22px", marginBottom: 22,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.head, marginBottom: 6 }}>
              {grupo.programa.nombre} · {grupo.nombre}
            </div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 4 }}>
              <strong>Horario:</strong> {grupo.horario} &nbsp;·&nbsp; <strong>Salón:</strong> {grupo.salon}
            </div>
            <div style={{ fontSize: 14, color: C.muted }}>
              <strong>Estudiantes:</strong> {grupo.inscripciones?.length || 0} / {grupo.cupoMaximo}
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: "0 0 12px" }}>
            Estudiantes inscritos
          </h3>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            {grupo.inscripciones?.length === 0 ? (
              <p style={{ padding: 18, margin: 0, color: C.muted, fontSize: 14 }}>
                Aún no hay estudiantes inscritos.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${C.border}` }}>
                    {["Documento", "Nombre", "Ciudad", "Barrio", "Género", "Acciones"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 700, color: C.head }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grupo.inscripciones.map(ins => {
                    const e = ins.estudiante;
                    return (
                      <tr key={ins.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                        <td style={{ padding: "9px 14px", fontSize: 13, color: C.muted }}>{e.documento}</td>
                        <td style={{ padding: "9px 14px", fontSize: 13, color: C.body, fontWeight: 500 }}>
                          {e.nombre} {e.apellido}
                        </td>
                        <td style={{ padding: "9px 14px", fontSize: 13, color: C.body }}>{e.ciudad || "—"}</td>
                        <td style={{ padding: "9px 14px", fontSize: 13, color: C.body }}>{e.barrio || "—"}</td>
                        <td style={{ padding: "9px 14px", fontSize: 13, color: C.body }}>{e.genero || "—"}</td>
                        <td style={{ padding: "9px 14px" }}>
                          <Link href={`/profesor/evaluaciones?grupoId=${grupo.id}&estudianteId=${e.id}`} style={{
                            padding: "5px 12px", border: "none", borderRadius: 5,
                            fontSize: 12, fontWeight: 600, color: "#fff", background: C.btn, textDecoration: "none",
                          }}>Evaluar</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
