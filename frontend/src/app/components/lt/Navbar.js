'use client';
import Link from 'next/link';
import { colors, fonts } from '@/app/lt-styles';

export default function Navbar({ userName, userRole }) {
  const logoutHref = '/login';

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 46,
      background: '#fff',
      borderBottom: `1px solid ${colors.borderDark}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
    }}>
      <span style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.primary, fontWeight: 400 }}>
        Lucy Tejada
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.text }}>
          Hola, {userName} ▾
        </span>
      </div>
    </nav>
  );
}
