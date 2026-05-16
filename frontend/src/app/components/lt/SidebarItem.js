"use client";
import Link from "next/link";

const C = { btn: "#3A6048", body: "#2c3a32", badgeBg: "#a8442e", badgeFg: "#fff" };

export default function SidebarItem({ href, label, active, badge }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 18px",
        fontFamily: "Segoe UI, sans-serif", fontSize: 13,
        color: active ? C.btn : C.body,
        fontWeight: active ? 600 : 500,
        textDecoration: "none",
        borderLeft: active ? `3px solid ${C.btn}` : "3px solid transparent",
        background: active ? "#eef5f0" : "transparent",
      }}
    >
      <span>{label}</span>
      {badge > 0 && (
        <span
          aria-label={`${badge} notificaciones sin leer`}
          style={{
            background: C.badgeBg, color: C.badgeFg,
            borderRadius: 10, fontSize: 11, fontWeight: 700,
            padding: "1px 7px", minWidth: 18, textAlign: "center", lineHeight: "16px",
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
