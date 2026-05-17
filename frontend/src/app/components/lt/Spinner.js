"use client";

export default function Spinner({ label = "Cargando...", inline = false, size = 18, color = "#3A6048" }) {
  const Wrapper = inline ? "span" : "div";
  return (
    <Wrapper
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        color: "#4a5a52", fontSize: 14,
        padding: inline ? 0 : "8px 0",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: size, height: size, borderRadius: "50%",
          border: `2px solid ${color}22`,
          borderTopColor: color,
          display: "inline-block",
          animation: "lt-spin 0.8s linear infinite",
        }}
      />
      <span>{label}</span>
      <style>{`@keyframes lt-spin { to { transform: rotate(360deg); } }`}</style>
    </Wrapper>
  );
}
