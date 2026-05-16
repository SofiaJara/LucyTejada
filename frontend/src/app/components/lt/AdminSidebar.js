"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";

const C = {
  btn: "#3A6048", border: "#b8cdc0", head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52",
};

const navItems = [
  { label: "Dashboard",     href: "/admin/dashboard" },
  { label: "Usuarios",      href: "/admin/usuarios" },
  { label: "Programas",     href: "/admin/programas" },
  { label: "Grupos",        href: "/admin/grupos" },
  { label: "Reportes",      href: "/admin/reportes" },
  { label: "Notificaciones", href: "/admin/notificaciones" },
  { label: "Bitácora",      href: "/admin/bitacora" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside style={{
      position: "fixed", top: 46, left: 0, bottom: 0, width: 180,
      background: "#fff", borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "20px 0 16px", zIndex: 90,
    }}>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.label} href={item.href} style={{
              display: "block", padding: "9px 18px",
              fontFamily: "Segoe UI, sans-serif", fontSize: 13,
              color: active ? C.btn : C.body,
              fontWeight: active ? 600 : 500,
              textDecoration: "none",
              borderLeft: active ? `3px solid ${C.btn}` : "3px solid transparent",
              background: active ? "#eef5f0" : "transparent",
            }}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} style={{
        margin: "0 14px", padding: "8px 12px", background: "transparent",
        border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12,
        color: C.muted, cursor: "pointer", fontFamily: "Segoe UI, sans-serif",
      }}>
        Cerrar sesión
      </button>
    </aside>
  );
}
