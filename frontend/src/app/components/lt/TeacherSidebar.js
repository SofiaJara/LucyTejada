"use client";
import { usePathname } from "next/navigation";
import SidebarItem from "./SidebarItem";
import useUnreadCount from "./useUnreadCount";

const C = { btn: "#3A6048", border: "#b8cdc0", muted: "#4a5a52" };

const navItems = [
  { label: "Dashboard",       href: "/profesor/dashboard" },
  { label: "Mis grupos",      href: "/profesor/grupos" },
  { label: "Asistencia",      href: "/profesor/asistencia" },
  { label: "Evaluaciones",    href: "/profesor/evaluaciones" },
  { label: "Notificaciones",  href: "/profesor/notificaciones", showBadge: true },
  { label: "Mi perfil",       href: "/profesor/perfil" },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const unread = useUnreadCount();

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
            <SidebarItem
              key={item.label}
              href={item.href}
              label={item.label}
              active={active}
              badge={item.showBadge ? unread : 0}
            />
          );
        })}
      </nav>
      <button onClick={() => window.dispatchEvent(new Event("lt:request-logout"))} style={{
        margin: "0 14px", padding: "8px 12px", background: "transparent",
        border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12,
        color: C.muted, cursor: "pointer", fontFamily: "Segoe UI, sans-serif",
      }}>
        Cerrar sesión
      </button>
    </aside>
  );
}
