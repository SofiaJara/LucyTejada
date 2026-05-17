"use client";
import { useEffect, useId, useRef } from "react";

const C = {
  btn: "#3A6048", btnT: "#fff",
  head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
  border: "#b8cdc0", card: "#fff",
  danger: "#a8442e", dangerBg: "#fdf1ec",
  success: "#3A6048", successBg: "#eef5f0",
  warning: "#a06b1f", warningBg: "#fdf5e8",
};

const typeStyles = {
  confirm: { color: C.head, bg: "#eef5f0", btn: C.btn },
  success: { color: C.success, bg: C.successBg, btn: C.btn },
  error:   { color: C.danger, bg: C.dangerBg, btn: C.danger },
  warning: { color: C.warning, bg: C.warningBg, btn: C.warning },
  info:    { color: C.head, bg: "#eef5f0", btn: C.btn },
};

export default function ConfirmModal({
  open, title, message, type = "confirm",
  confirmText = "Aceptar", cancelText = "Cancelar",
  onConfirm, onCancel, hideCancel,
}) {
  const titleId = useId();
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && onCancel) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (open && confirmRef.current) confirmRef.current.focus();
  }, [open]);

  if (!open) return null;
  const ts = typeStyles[type] || typeStyles.confirm;

  return (
    <div
      className="popup-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(28, 38, 32, 0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget && onCancel) onCancel(); }}
    >
      <div
        className="popup-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          background: C.card, borderRadius: 12, border: `1.5px solid ${C.border}`,
          width: "100%", maxWidth: 440, boxShadow: "0 12px 40px rgba(28,38,32,0.18)",
          fontFamily: "Segoe UI, sans-serif", overflow: "hidden",
        }}
      >
        <div style={{
          padding: "18px 22px", background: ts.bg,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <h3 id={titleId} style={{ margin: 0, fontSize: 17, fontWeight: 700, color: ts.color }}>
            {title}
          </h3>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <p style={{ margin: 0, fontSize: 14, color: C.body, lineHeight: 1.5, whiteSpace: "pre-line" }}>
            {message}
          </p>
        </div>
        <div style={{
          padding: "12px 22px 18px", display: "flex",
          justifyContent: "flex-end", gap: 10,
        }}>
          {!hideCancel && (
            <button onClick={onCancel} style={{
              padding: "8px 18px", border: `1.5px solid ${C.border}`,
              borderRadius: 6, background: C.card, fontSize: 14,
              color: C.muted, cursor: "pointer", fontWeight: 500,
            }}>{cancelText}</button>
          )}
          <button ref={confirmRef} onClick={onConfirm || onCancel} style={{
            padding: "8px 22px", border: "none", borderRadius: 6,
            background: ts.btn, color: "#fff", fontSize: 14,
            cursor: "pointer", fontWeight: 600,
          }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
