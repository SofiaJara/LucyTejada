'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors, fonts, shell } from '@/app/lt-styles';

const navItems = [
  { label: 'Inicio',          href: '/estudiante/informacion' },
  { label: 'Mi información',  href: '/estudiante/informacion' },
  { label: 'Mis clases',      href: '/estudiante/clases' },
  { label: 'Notificaciones',  href: '/estudiante/notificaciones' },
  { label: 'Inscripción',     href: '/estudiante/inscripcion' },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position: 'fixed',
      top: shell.navbarHeight,
      left: 0,
      bottom: 0,
      width: shell.sidebarWidth,
      background: '#fff',
      borderRight: `1px solid ${colors.borderDark}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 0 16px',
      zIndex: 90,
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/estudiante/informacion' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: 'block',
                padding: '8px 18px',
                fontFamily: fonts.sans,
                fontSize: 13,
                color: active ? colors.primary : colors.text,
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                borderLeft: active ? `3px solid ${colors.primary}` : '3px solid transparent',
              }}
            >
              {active ? '■ ' : '□ '}{item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/login"
        style={{
          padding: '8px 18px',
          fontFamily: fonts.sans,
          fontSize: 12,
          color: colors.faint,
          textDecoration: 'none',
          display: 'block',
        }}
      >
        Cerrar sesión
      </Link>
    </aside>
  );
}
