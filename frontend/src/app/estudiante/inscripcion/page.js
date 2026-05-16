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

  const yaInscritoGrupo = (grupoId) => misInscripciones.some(i => i.grupoId === grupoId);

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
              const ocupado = yaInscritoGrupo(g.id);
              const sinCupos = cupos <= 0;
              return (
                <div key={g.id} style={{
                  background: !sinCupos ? C.bgCard : C.bgCardOff,
                  border: `1.5px solid ${!sinCupos ? C.border : C.borderOff}`,
                  borderRadius: 8, padding: "18px 20px",
                  opacity: sinCupos ? 0.75 : 1,
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
                  <button
                    disabled={ocupado}
                    onClick={() => setSeleccion({ programa: p, grupo: g })}
                    style={{
                      padding: "7px 18px", border: "none", borderRadius: 6,
                      fontSize: 14, fontWeight: 600,
                      color: C.btnText,
                      background: ocupado ? C.btnOffBg : (sinCupos ? "#8a9e90" : C.btnBg),
                      cursor: ocupado ? "not-allowed" : "pointer",
                    }}
                  >
                    {ocupado ? "Ya inscrito" : (sinCupos ? "Lista de espera" : "Inscribirse")}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
