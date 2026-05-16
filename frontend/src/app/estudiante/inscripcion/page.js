"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  bgPage:       "#fdfdfd",
  bgCard:       "#fff",
  bgCardOff:    "#f5f5f5",
  border:       "#8BAF70",
  borderOff:    "#b8cdc0",
  btnBg:        "#3A6048",
  btnText:      "#fff",
  btnOffBg:     "#8a9e90",
  headingText:  "#1E2D26",
  labelText:    "#3A6048",
  bodyText:     "#2c3a32",
  mutedText:    "#4a5a52",
  inputBorder:  "#b8cdc0",
};

export default function InscripcionPage() {
  const [programas, setProgramas] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(true);
  const [seleccion, setSeleccion] = useState(null); // {programa, grupo}
  const [cancelar, setCancelar] = useState(null); // {programa, grupo, inscripcionId}
  const [modal, setModal] = useState({ open: false, title: "", message: "", type: "info" });

  const cargar = () => {
    setLoading(true);
    Promise.all([
      api("/api/programas", { auth: false }),
      api("/api/inscripciones/mias"),
    ]).then(([progs, ins]) => {
      setProgramas(progs);
      setMisInscripciones(ins);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const categorias = Array.from(new Set(programas.map(p => p.categoria)));

  const filtrados = programas.filter(p => {
    if (categoria && p.categoria !== categoria) return false;
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const inscripcionDeGrupo = (grupoId) => misInscripciones.find(i => i.grupoId === grupoId);

  const confirmarCancelar = async () => {
    if (!cancelar) return;
    try {
      await api(`/api/inscripciones/${cancelar.inscripcionId}`, { method: "DELETE" });
      setCancelar(null);
      setModal({
        open: true,
        title: "Inscripción cancelada",
        message: `Tu inscripción en ${cancelar.programa.nombre} · ${cancelar.grupo.nombre} fue cancelada.`,
        type: "success",
      });
      cargar();
    } catch (err) {
      setCancelar(null);
      setModal({ open: true, title: "No se pudo cancelar", message: err.message, type: "error" });
    }
  };

  const confirmar = async () => {
    if (!seleccion) return;
    try {
      await api("/api/inscripciones", { method: "POST", body: { grupoId: seleccion.grupo.id } });
      setSeleccion(null);
      setModal({
        open: true,
        title: "¡Inscripción confirmada!",
        message: `Has sido inscrito en ${seleccion.programa.nombre} · ${seleccion.grupo.nombre}.`,
        type: "success",
      });
      cargar();
    } catch (err) {
      setSeleccion(null);
      setModal({ open: true, title: "No se pudo inscribir", message: err.message, type: "error" });
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", background: C.bgPage, minHeight: "100%", padding: 4 }}>
      <ConfirmModal
        open={!!seleccion}
        title="Confirmar inscripción"
        message={seleccion
          ? `¿Deseas inscribirte en "${seleccion.programa.nombre}" en el ${seleccion.grupo.nombre}?\nHorario: ${seleccion.grupo.horario}\nSalón: ${seleccion.grupo.salon}`
          : ""}
        type="confirm"
        confirmText="Sí, inscribirme"
        cancelText="Cancelar"
        onConfirm={confirmar}
        onCancel={() => setSeleccion(null)}
      />
      <ConfirmModal
        open={!!cancelar}
        title="Cancelar inscripción"
        message={cancelar
          ? `¿Cancelar tu inscripción en "${cancelar.programa.nombre}" · ${cancelar.grupo.nombre}? Podrás volver a inscribirte si hay cupos.`
          : ""}
        type="warning"
        confirmText="Sí, cancelar"
        cancelText="Volver"
        onConfirm={confirmarCancelar}
        onCancel={() => setCancelar(null)}
      />
      <ConfirmModal
        {...modal}
        hideCancel
        confirmText="Entendido"
        onConfirm={() => setModal({ ...modal, open: false })}
        onCancel={() => setModal({ ...modal, open: false })}
      />

      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.headingText, margin: "0 0 20px" }}>
        Programas disponibles
      </h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          placeholder="Buscar programa..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1, padding: "9px 14px", border: `1px solid ${C.inputBorder}`,
            borderRadius: 6, fontSize: 15, color: C.bodyText,
            background: C.bgCard, outline: "none",
          }}
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={{
            padding: "9px 14px", border: `1px solid ${C.inputBorder}`, borderRadius: 6,
            fontSize: 15, color: C.bodyText, background: C.bgCard, cursor: "pointer",
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: C.mutedText }}>Cargando programas...</p>
      ) : filtrados.length === 0 ? (
        <p style={{ color: C.mutedText }}>No se encontraron programas con esos filtros.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {filtrados.map(p =>
            p.grupos.length === 0 ? (
              <div key={p.id} style={{
                background: C.bgCardOff,
                border: `1.5px solid ${C.borderOff}`,
                borderRadius: 8, padding: "18px 20px", opacity: 0.75,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.headingText, marginBottom: 5 }}>{p.nombre}</div>
                <div style={{ fontSize: 13, color: C.labelText, marginBottom: 10, fontWeight: 600 }}>{p.categoria}</div>
                <div style={{ fontSize: 13, color: C.mutedText }}>Sin grupos disponibles actualmente</div>
              </div>
            ) : p.grupos.map(g => {
              const cupos = g.cupoMaximo - g._count.inscripciones;
              const inscripcion = inscripcionDeGrupo(g.id);
              const ocupado = !!inscripcion;
              const sinCupos = cupos <= 0;
              return (
                <div key={g.id} style={{
                  background: (!sinCupos || ocupado) ? C.bgCard : C.bgCardOff,
                  border: `1.5px solid ${ocupado ? C.btnBg : (!sinCupos ? C.border : C.borderOff)}`,
                  borderRadius: 8, padding: "18px 20px",
                  opacity: (sinCupos && !ocupado) ? 0.75 : 1,
                }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.headingText, marginBottom: 5 }}>{p.nombre}</div>
                  <div style={{ fontSize: 13, color: C.labelText, marginBottom: 10, fontWeight: 600 }}>
                    {p.categoria} · {g.nombre}
                  </div>
                  <div style={{ fontSize: 14, color: C.bodyText, marginBottom: 4 }}>
                    <span style={{ color: C.mutedText }}>Docente: </span>
                    {g.profesor ? `${g.profesor.nombre} ${g.profesor.apellido}` : "Por asignar"}
                  </div>
                  <div style={{ fontSize: 14, color: C.bodyText, marginBottom: 4 }}>
                    <span style={{ color: C.mutedText }}>Horario: </span>{g.horario}
                  </div>
                  <div style={{ fontSize: 14, color: C.bodyText, marginBottom: 4 }}>
                    <span style={{ color: C.mutedText }}>Salón: </span>{g.salon}
                  </div>
                  <div style={{ fontSize: 14, color: C.bodyText, marginBottom: 14 }}>
                    <span style={{ color: C.mutedText }}>Cupos: </span>
                    {cupos > 0 ? `${cupos} disponibles` : "Sin cupos disponibles"}
                  </div>
                  {ocupado ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, padding: "5px 12px", borderRadius: 4, fontWeight: 700,
                        color: C.btnBg, background: "#eef5f0", textTransform: "uppercase",
                      }}>
                        {inscripcion.estado === "lista_espera" ? "En lista de espera" : "Inscrito"}
                      </span>
                      <button
                        onClick={() => setCancelar({ programa: p, grupo: g, inscripcionId: inscripcion.id })}
                        style={{
                          padding: "6px 14px", border: `1.5px solid #a8442e`, borderRadius: 6,
                          fontSize: 13, fontWeight: 600, color: "#a8442e", background: "#fff",
                          cursor: "pointer",
                        }}
                      >Cancelar inscripción</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSeleccion({ programa: p, grupo: g })}
                      style={{
                        padding: "7px 18px", border: "none", borderRadius: 6,
                        fontSize: 14, fontWeight: 600,
                        color: C.btnText,
                        background: sinCupos ? "#8a9e90" : C.btnBg,
                        cursor: "pointer",
                      }}
                    >
                      {sinCupos ? "Lista de espera" : "Inscribirse"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
