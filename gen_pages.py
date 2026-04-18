import os

BASE = r'c:\Repositorios\LucyTejada\frontend\src\app'

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Wrote: {path}')

# ─── LOGIN ───────────────────────────────────────────────────────────────────
write('login/page.js', r'''"use client";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f5f5f5",
      fontFamily: "Segoe UI, sans-serif",
    }}>
      <p style={{ position: "absolute", top: 16, left: 0, right: 0, textAlign: "center",
        fontSize: 12, color: "#888", margin: 0 }}>
        Ilustración 1. Mockup inicio de sesión.
      </p>

      <div style={{
        width: 600, background: "#fff", borderRadius: 18, border: "2px solid #222",
        display: "flex", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}>
        {/* Panel izquierdo — Marca */}
        <div style={{
          width: 220, minHeight: 340, borderRight: "1.5px solid #222",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 24,
        }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#222" }}>Lucy Tejada</span>
          <span style={{ fontSize: 11, color: "#666" }}>Centro Cultural</span>
        </div>

        {/* Panel derecho — Formulario */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "32px", gap: 14,
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: "#222" }}>Bienvenido</h2>
          <input type="text" placeholder="usuario" readOnly style={{
            width: "100%", padding: "8px 12px", border: "1.5px solid #333",
            borderRadius: 6, fontSize: 13, color: "#888", background: "#fff",
            boxSizing: "border-box", outline: "none",
          }} />
          <input type="password" placeholder="contraseña" readOnly style={{
            width: "100%", padding: "8px 12px", border: "1.5px solid #333",
            borderRadius: 6, fontSize: 13, color: "#888", background: "#fff",
            boxSizing: "border-box", outline: "none",
          }} />
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <a href="/estudiante/informacion" style={{
              padding: "7px 18px", border: "1.5px solid #333", borderRadius: 6,
              fontSize: 13, color: "#222", background: "#fff", textDecoration: "none",
            }}>Estudiante</a>
            <a href="/profesor/dashboard" style={{
              padding: "7px 18px", border: "1.5px solid #333", borderRadius: 6,
              fontSize: 13, color: "#222", background: "#fff", textDecoration: "none",
            }}>Profesor</a>
          </div>
          <span style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            ¿no tienes cuenta?{" "}
            <span style={{ color: "#333", cursor: "pointer" }}>Regístrate</span>
          </span>
        </div>
      </div>

      <p style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center",
        fontSize: 12, color: "#666", margin: 0 }}>
        Fuente: Elaboración propia.
      </p>
    </div>
  );
}
''')

# ─── ESTUDIANTE / INFORMACION ────────────────────────────────────────────────
write('estudiante/informacion/page.js', r'''"use client";
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
''')

# ─── ESTUDIANTE / INSCRIPCION ────────────────────────────────────────────────
write('estudiante/inscripcion/page.js', r'''"use client";

const programs = [
  { name: "Guitarra básica", cat: "Música · Grupo C", teacher: "Prof. Sandra Gil",
    schedule: "Mar y jue · 10:00 am", spots: 5, active: true },
  { name: "Danza contemporánea", cat: "Artes escénicas · Grupo A", teacher: "Prof. Lina Torres",
    schedule: "Lun y vie · 2:00 pm", spots: 0, active: false },
  { name: "Teatro básico", cat: "Artes escénicas · Grupo B", teacher: "Prof. Camilo Arias",
    schedule: "Mié y vie · 3:00 pm", spots: 12, active: true },
  { name: "Artes plásticas", cat: "Artes visuales · Grupo D", teacher: "Prof. Rosa Mejía",
    schedule: "Sáb · 9:00 am", spots: 3, active: true },
];

export default function InscripcionPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 9. Mockup inscripción a programa (estudiante).
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 16px" }}>
        Programas disponibles
      </h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input placeholder="Buscar programa..." readOnly style={{
          flex: 1, padding: "7px 12px", border: "1px solid #ccc",
          borderRadius: 6, fontSize: 13, color: "#bbb", outline: "none",
        }} />
        <select disabled style={{
          padding: "7px 12px", border: "1px solid #aaa", borderRadius: 6,
          fontSize: 13, color: "#777", background: "#fff", cursor: "not-allowed",
        }}>
          <option>Categoría ▾</option>
        </select>
        <select disabled style={{
          padding: "7px 12px", border: "1px solid #aaa", borderRadius: 6,
          fontSize: 13, color: "#777", background: "#fff", cursor: "not-allowed",
        }}>
          <option>Horario ▾</option>
        </select>
      </div>

      {/* Grid de programas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {programs.map((p) => (
          <div key={p.name} style={{
            background: "#fff",
            border: `1px solid ${p.active ? "#555" : "#bbb"}`,
            borderRadius: 6, padding: "14px 16px",
            opacity: p.active ? 1 : 0.7,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#222", marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 8 }}>{p.cat}</div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>
              <span style={{ color: "#888" }}>Docente: </span>{p.teacher}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>
              <span style={{ color: "#888" }}>Horario: </span>{p.schedule}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 12 }}>
              <span style={{ color: "#888" }}>Cupos: </span>
              {p.spots > 0 ? `${p.spots} disponibles` : "Sin cupos disponibles"}
            </div>
            <button disabled style={{
              padding: "5px 14px",
              border: `1.5px solid ${p.active ? "#333" : "#ccc"}`,
              borderRadius: 6, fontSize: 12,
              color: p.active ? "#222" : "#bbb",
              background: "#fff", cursor: p.active ? "pointer" : "not-allowed",
            }}>
              {p.spots > 0 ? "Inscribirse" : "Lista espera"}
            </button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        {["‹", "1", "2", "3", "›"].map(p => (
          <button key={p} disabled style={{
            padding: "4px 10px", border: "1px solid #ccc",
            borderRadius: 4, fontSize: 13, color: "#777", background: "#fff",
            cursor: "not-allowed",
          }}>{p}</button>
        ))}
      </div>
    </div>
  );
}
''')

# ─── ESTUDIANTE / NOTIFICACIONES ─────────────────────────────────────────────
write('estudiante/notificaciones/page.js', r'''"use client";

const notifs = [
  { unread: true, title: "Cambio de horario · Piano básico",
    body: "Tu clase del miércoles 15 de abril se traslada al salón 2.",
    meta: "Hoy · 8:14 am · Horarios" },
  { unread: true, title: "Recordatorio de clase · mañana",
    body: "Recuerda tu clase de Piano básico el martes a las 8:00 am.",
    meta: "Hoy · 7:00 am · Recordatorio" },
  { unread: false, title: "Evaluación disponible · Período 2026-1",
    body: "Tu evaluación cualitativa del período ya está disponible.",
    meta: "Ayer · 5:00 pm · Académico" },
  { unread: false, title: "Actualización académica · Grupo A",
    body: "Se ajustaron los indicadores de evaluación del período 2026-1.",
    meta: "Hace 2 días · Académico" },
  { unread: false, title: "Nuevo evento · Concierto fin de semestre",
    body: "El centro organiza un concierto el 28 de junio. ¡Participa!",
    meta: "Hace 3 días · Eventos" },
];

const tabs = ["Todas", "No leídas", "Horarios", "Académico"];

export default function NotificacionesEstudiantePage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 8. Mockup notificaciones (estudiante).
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Notificaciones</h2>
        <span style={{ fontSize: 11, color: "#888", cursor: "pointer" }}>Marcar todas como leídas</span>
      </div>

      {/* Filtros tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {tabs.map((t, i) => (
          <button key={t} disabled style={{
            padding: "4px 12px", borderRadius: 5,
            border: `1px solid ${i === 0 ? "#333" : "#ccc"}`,
            fontSize: 12, color: i === 0 ? "#222" : "#777",
            background: "#fff", cursor: "not-allowed",
          }}>{t}</button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifs.map((n, i) => (
          <div key={i} style={{
            background: "#fff",
            border: `1px solid ${n.unread ? "#aaa" : "#ddd"}`,
            borderRadius: 4, padding: "12px 14px",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4,
              background: n.unread ? "#333" : "#fff",
              border: n.unread ? "none" : "1px solid #bbb",
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, color: "#222", marginBottom: 3 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{n.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
''')

# ─── PROFESOR / DASHBOARD ────────────────────────────────────────────────────
write('profesor/dashboard/page.js', r'''"use client";

const metrics = [
  { label: "Grupos activos", value: 4 },
  { label: "Clases hoy",     value: 2 },
  { label: "Eval. pendientes", value: 7 },
  { label: "Notif.",         value: 3 },
];

const classes = [
  "Piano básico · Grupo A · Salón 3 · 8:00 am",
  "Guitarra · Grupo B · Salón 1 · 10:00 am",
];

const activity = [
  "Asistencia registrada · Grupo C · ayer",
  "Evaluación enviada · Grupo A · hace 2 días",
  "Horario actualizado · Grupo B · hace 3 días",
];

export default function DashboardProfesorPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 2. Mockup dashboard principal del profesor.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 20px", textAlign: "center" }}>
        Resumen del día
      </h2>

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: "#fff", border: "1px solid #333", borderRadius: 6,
            padding: "18px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#222", marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Próximas clases */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "16px 18px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#333" }}>Próximas clases</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {classes.map((c, i) => (
              <div key={i} style={{
                padding: "8px 12px", border: "1px solid #aaa", borderRadius: 4,
                fontSize: 12, color: "#555",
              }}>{c}</div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "16px 18px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#333" }}>Actividad reciente</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {activity.map((a, i) => (
              <div key={i} style={{
                padding: "8px 0",
                borderBottom: i < activity.length - 1 ? "1px solid #eee" : "none",
                fontSize: 12, color: "#777",
              }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
''')

# ─── PROFESOR / ASISTENCIA ───────────────────────────────────────────────────
write('profesor/asistencia/page.js', r'''"use client";

const students = [
  { num: 1, name: "Andrés López",     attended: true,  obs: "" },
  { num: 2, name: "María Gómez",      attended: false, obs: "" },
  { num: 3, name: "Carlos Ríos",      attended: true,  obs: "" },
  { num: 4, name: "Luisa Fernández",  attended: false, obs: "excusa médica" },
  { num: 5, name: "Juan Pérez",       attended: true,  obs: "" },
];

export default function AsistenciaPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 3. Mockup registro de asistencia.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 16px" }}>
        Registro de asistencia
      </h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["Grupo ▾", "Piano básico · A", "13/04/2026"].map((v, i) => (
          <select key={i} disabled style={{
            padding: "6px 12px", border: "1px solid #555", borderRadius: 6,
            fontSize: 12, color: "#555", background: "#fff", cursor: "not-allowed",
          }}>
            <option>{v}</option>
          </select>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #aaa" }}>
              {["#", "Nombre del estudiante", "Asistió", "Observación"].map(h => (
                <th key={h} style={{
                  padding: "9px 12px", textAlign: "left", fontSize: 12,
                  fontWeight: 600, color: "#222", background: "#fff",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.num} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px", fontSize: 12, color: "#777" }}>{s.num}</td>
                <td style={{ padding: "8px 12px", fontSize: 12, color: "#333" }}>{s.name}</td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{
                    width: 16, height: 16, border: "1.5px solid #555",
                    borderRadius: 3, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 10, color: "#333",
                  }}>
                    {s.attended ? "✓" : ""}
                  </div>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{
                    width: 120, height: 18, border: "1px solid #ccc",
                    borderRadius: 3, padding: "2px 6px",
                    fontSize: 11, color: "#777",
                  }}>{s.obs}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#555" }}>Asistencia: 3 / 5 estudiantes</span>
        <button disabled style={{
          padding: "8px 22px", border: "1.5px solid #333", borderRadius: 6,
          fontSize: 13, color: "#222", background: "#fff", cursor: "not-allowed",
        }}>Guardar registro</button>
      </div>
    </div>
  );
}
''')

# ─── PROFESOR / EVALUACIONES ─────────────────────────────────────────────────
write('profesor/evaluaciones/page.js', r'''"use client";

const criteria = [
  { indicator: "Participación en clase", score: "Excelente ▾" },
  { indicator: "Práctica y ensayo",       score: "Bueno ▾" },
  { indicator: "Actitud y compromiso",    score: "Excelente ▾" },
  { indicator: "Progreso técnico",        score: "Regular ▾" },
];

export default function EvaluacionesPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 4. Mockup registro de evaluaciones cualitativas.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 16px" }}>
        Evaluación cualitativa
      </h2>

      {/* Selectores */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {["Grupo ▾", "Estudiante ▾", "Período ▾"].map((v, i) => (
          <select key={i} disabled style={{
            padding: "6px 12px", border: "1px solid #555", borderRadius: 6,
            fontSize: 12, color: "#555", background: "#fff", cursor: "not-allowed",
          }}>
            <option>{v}</option>
          </select>
        ))}
      </div>

      {/* Banda info estudiante */}
      <div style={{
        background: "#fff", border: "1px solid #bbb", borderRadius: 6,
        padding: "10px 16px", marginBottom: 16,
        display: "flex", gap: 24, fontSize: 12, color: "#555",
      }}>
        <span><strong style={{ color: "#333" }}>Estudiante:</strong> Andrés López</span>
        <span><strong style={{ color: "#333" }}>Programa:</strong> Piano básico</span>
        <span><strong style={{ color: "#333" }}>Grupo:</strong> A</span>
        <span><strong style={{ color: "#333" }}>Período:</strong> 2026-1</span>
      </div>

      {/* Tabla criterios */}
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #aaa" }}>
              {["Indicador de desempeño", "Valoración", "Obs."].map(h => (
                <th key={h} style={{
                  padding: "9px 12px", textAlign: "left", fontSize: 12,
                  fontWeight: 600, color: "#222",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px", fontSize: 12, color: "#333" }}>{c.indicator}</td>
                <td style={{ padding: "8px 12px" }}>
                  <select disabled style={{
                    padding: "3px 8px", border: "1px solid #aaa", borderRadius: 3,
                    fontSize: 11, color: "#888", background: "#fff", cursor: "not-allowed",
                  }}>
                    <option>{c.score}</option>
                  </select>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ width: 60, height: 18, border: "1px solid #ccc", borderRadius: 3 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comentario */}
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "14px 16px" }}>
        <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 8 }}>
          Comentario general:
        </label>
        <textarea readOnly placeholder="Escribe aquí tus observaciones generales del estudiante..."
          style={{
            width: "100%", height: 55, border: "1px solid #aaa", borderRadius: 5,
            fontSize: 11, color: "#bbb", padding: "6px 10px",
            boxSizing: "border-box", resize: "none", outline: "none",
          }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button disabled style={{
          padding: "7px 22px", border: "1.5px solid #333", borderRadius: 6,
          fontSize: 13, color: "#222", background: "#fff", cursor: "not-allowed",
        }}>Guardar evaluación</button>
        <button disabled style={{
          padding: "7px 16px", border: "1px solid #ccc", borderRadius: 6,
          fontSize: 13, color: "#777", background: "#fff", cursor: "not-allowed",
        }}>Cancelar</button>
      </div>
    </div>
  );
}
''')

# ─── PROFESOR / GRUPOS ───────────────────────────────────────────────────────
write('profesor/grupos/page.js', r'''"use client";

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
''')

# ─── PROFESOR / NOTIFICACIONES ───────────────────────────────────────────────
write('profesor/notificaciones/page.js', r'''"use client";

const notifs = [
  { unread: true,  title: "Cambio de horario · Grupo B",
    body: "La clase del miércoles 15 de abril se traslada al salón 2.",
    meta: "Hoy · 8:14 am · Administrativo" },
  { unread: true,  title: "Recordatorio · Entrega de evaluaciones",
    body: "Tienes 7 evaluaciones pendientes del período 2026-1.",
    meta: "Hoy · 7:00 am · Sistema" },
  { unread: false, title: "Nuevo evento · Concierto fin de semestre",
    body: "El centro cultural organiza concierto el 28 de junio.",
    meta: "Ayer · 3:45 pm · Eventos" },
  { unread: false, title: "Actualización académica · Grupo A",
    body: "Se ajustaron los indicadores de evaluación del período.",
    meta: "Hace 2 días · Administrativo" },
  { unread: false, title: "Recordatorio · Registro de asistencia",
    body: "No se registró asistencia del Grupo C el lunes 7 de abril.",
    meta: "Hace 3 días · Sistema" },
];

const tabs = ["Todas", "No leídas", "Horarios", "Eventos"];

export default function NotificacionesProfesorPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <p style={{ fontSize: 11, color: "#888", marginBottom: 18 }}>
        Ilustración 6. Mockup notificaciones.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Notificaciones</h2>
        <span style={{ fontSize: 11, color: "#888", cursor: "pointer" }}>Marcar todas como leídas</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {tabs.map((t, i) => (
          <button key={t} disabled style={{
            padding: "4px 12px", borderRadius: 5,
            border: `1px solid ${i === 0 ? "#333" : "#ccc"}`,
            fontSize: 12, color: i === 0 ? "#222" : "#777",
            background: "#fff", cursor: "not-allowed",
          }}>{t}</button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifs.map((n, i) => (
          <div key={i} style={{
            background: "#fff",
            border: `1px solid ${n.unread ? "#aaa" : "#ddd"}`,
            borderRadius: 4, padding: "12px 14px",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4,
              background: n.unread ? "#333" : "#fff",
              border: n.unread ? "none" : "1px solid #bbb",
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, color: "#222", marginBottom: 3 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{n.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
''')

# ─── ESTUDIANTE / CLASES (placeholder) ───────────────────────────────────────
write('estudiante/clases/page.js', r'''"use client";
import Link from "next/link";

export default function ClasesPage() {
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 16px" }}>Mis clases</h2>
      <div style={{
        background: "#fff", border: "1px solid #ddd", borderRadius: 8,
        padding: "32px", textAlign: "center",
      }}>
        <p style={{ color: "#888", fontSize: 13 }}>Vista en construcción — prototipo visual.</p>
        <Link href="/estudiante/informacion" style={{
          marginTop: 12, display: "inline-block",
          padding: "7px 18px", border: "1.5px solid #333", borderRadius: 6,
          fontSize: 13, color: "#222", background: "#fff", textDecoration: "none",
        }}>← Volver a mi información</Link>
      </div>
    </div>
  );
}
''')

print('Todos los archivos generados correctamente.')
