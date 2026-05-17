"use client";
import { useState } from "react";

const C = {
  body: "#2c3a32", border: "#b8cdc0", card: "#fff", muted: "#4a5a52",
};

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  autoComplete = "current-password",
  ariaLabel,
  style,
}) {
  const [shown, setShown] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        id={id}
        name={name}
        type={shown ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        style={{
          width: "100%", padding: "10px 44px 10px 14px",
          border: `1.5px solid ${C.border}`, borderRadius: 6,
          fontSize: 15, color: C.body, background: C.card,
          boxSizing: "border-box", outline: "none",
          ...style,
        }}
      />
      <button
        type="button"
        onClick={() => setShown(s => !s)}
        disabled={disabled}
        aria-label={shown ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={shown ? "Ocultar contraseña" : "Mostrar contraseña"}
        style={{
          position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)",
          background: "transparent", border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          color: C.muted, fontSize: 12, fontWeight: 600,
          padding: "4px 8px", borderRadius: 4,
        }}
      >
        {shown ? "Ocultar" : "Ver"}
      </button>
    </div>
  );
}
