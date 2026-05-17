"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, redirectByRol } from "@/app/lib/AuthContext";
import ConfirmModal from "@/app/components/lt/ConfirmModal";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff", bg: "#f5f5f5", label: "#4a5a52",
};

const inputStyle = {
  width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`,
  borderRadius: 6, fontSize: 14, color: C.body, background: C.card,
  boxSizing: "border-box", outline: "none",
};

const labelStyle = { fontSize: 13, color: C.label, marginBottom: 4, display: "block", fontWeight: 500 };

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, register } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace(redirectByRol(user.rol));
  }, [authLoading, user, router]);
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "", type: "info" });
  const [data, setData] = useState({
    documento: "", nombre: "", apellido: "", correo: "", contrasena: "", contrasena2: "",
    telefono: "", direccion: "", ciudad: "Pereira", barrio: "", genero: "Masculino",
    fechaNacimiento: "",
  });

  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const validar = () => {
    if (!data.documento || !data.nombre || !data.apellido || !data.correo || !data.contrasena) {
      return "Por favor completa todos los campos obligatorios.";
    }
    if (data.contrasena.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (data.contrasena !== data.contrasena2) return "Las contraseñas no coinciden.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) return "El correo no es válido.";
    return null;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const err = validar();
    if (err) {
      setModal({ open: true, title: "Datos inválidos", message: err, type: "warning" });
      return;
    }
    setConfirm(true);
  };

  const confirmar = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      const { contrasena2, ...payload } = data;
      const user = await register({ ...payload, rol: "estudiante" });
      setModal({
        open: true, title: "¡Cuenta creada!",
        message: `Bienvenido, ${user.nombre}. Tu cuenta de estudiante ha sido creada exitosamente.`,
        type: "success",
      });
      setTimeout(() => router.push(redirectByRol(user.rol)), 1200);
    } catch (err) {
      setModal({ open: true, title: "Error en el registro", message: err.message || "No se pudo crear la cuenta.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, fontFamily: "Segoe UI, sans-serif",
      padding: "30px 20px", display: "flex", justifyContent: "center", alignItems: "flex-start",
    }}>
      <ConfirmModal
        open={confirm}
        title="Confirmar registro"
        message={`Vas a crear una cuenta como estudiante con el correo ${data.correo}. ¿Deseas continuar?`}
        type="confirm"
        confirmText="Sí, crear cuenta"
        cancelText="Revisar datos"
        onConfirm={confirmar}
        onCancel={() => setConfirm(false)}
      />
      <ConfirmModal
        {...modal}
        hideCancel
        confirmText="Entendido"
        onCancel={() => setModal({ ...modal, open: false })}
        onConfirm={() => setModal({ ...modal, open: false })}
      />

      <form onSubmit={onSubmit} style={{
        width: "100%", maxWidth: 720, background: C.card, borderRadius: 14,
        border: `2px solid ${C.border}`, padding: 32,
        boxShadow: "0 4px 20px rgba(58,96,72,0.10)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 24, color: C.head, fontWeight: 700 }}>
            Lucy Tejada
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Centro Cultural</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.head }}>Crear cuenta de estudiante</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label htmlFor="reg-documento" style={labelStyle}>Documento *</label>
            <input id="reg-documento" name="documento" value={data.documento} onChange={onChange} style={inputStyle} placeholder="CC 1234567890" required autoComplete="off" />
          </div>
          <div>
            <label htmlFor="reg-fechaNacimiento" style={labelStyle}>Fecha de nacimiento</label>
            <input id="reg-fechaNacimiento" name="fechaNacimiento" type="date" value={data.fechaNacimiento} onChange={onChange} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="reg-nombre" style={labelStyle}>Nombre *</label>
            <input id="reg-nombre" name="nombre" value={data.nombre} onChange={onChange} style={inputStyle} required autoComplete="given-name" />
          </div>
          <div>
            <label htmlFor="reg-apellido" style={labelStyle}>Apellido *</label>
            <input id="reg-apellido" name="apellido" value={data.apellido} onChange={onChange} style={inputStyle} required autoComplete="family-name" />
          </div>
          <div style={{ gridColumn: "1 / 3" }}>
            <label htmlFor="reg-correo" style={labelStyle}>Correo electrónico *</label>
            <input id="reg-correo" name="correo" type="email" value={data.correo} onChange={onChange} style={inputStyle} required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="reg-contrasena" style={labelStyle}>Contraseña *</label>
            <input id="reg-contrasena" name="contrasena" type="password" value={data.contrasena} onChange={onChange} style={inputStyle} required autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="reg-contrasena2" style={labelStyle}>Confirmar contraseña *</label>
            <input id="reg-contrasena2" name="contrasena2" type="password" value={data.contrasena2} onChange={onChange} style={inputStyle} required autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="reg-telefono" style={labelStyle}>Teléfono</label>
            <input id="reg-telefono" name="telefono" value={data.telefono} onChange={onChange} style={inputStyle} autoComplete="tel" />
          </div>
          <div>
            <label htmlFor="reg-genero" style={labelStyle}>Género</label>
            <select id="reg-genero" name="genero" value={data.genero} onChange={onChange} style={inputStyle}>
              <option>Masculino</option>
              <option>Femenino</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="reg-ciudad" style={labelStyle}>Ciudad</label>
            <input id="reg-ciudad" name="ciudad" value={data.ciudad} onChange={onChange} style={inputStyle} autoComplete="address-level2" />
          </div>
          <div>
            <label htmlFor="reg-barrio" style={labelStyle}>Barrio</label>
            <input id="reg-barrio" name="barrio" value={data.barrio} onChange={onChange} style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1 / 3" }}>
            <label htmlFor="reg-direccion" style={labelStyle}>Dirección</label>
            <input id="reg-direccion" name="direccion" value={data.direccion} onChange={onChange} style={inputStyle} autoComplete="street-address" />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "11px 24px", border: "none", borderRadius: 6,
          fontSize: 15, fontWeight: 600, color: C.btnT, background: C.btn,
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 6,
        }}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: C.muted, marginTop: 16, marginBottom: 0 }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: C.btn, fontWeight: 600, textDecoration: "none" }}>
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
