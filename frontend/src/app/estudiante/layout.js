import Navbar from '@/app/components/lt/Navbar';
import StudentSidebar from '@/app/components/lt/StudentSidebar';
import { shell } from '@/app/lt-styles';

export default function EstudianteLayout({ children }) {
  return (
    <>
      <Navbar userName="Andrés" userRole="estudiante" />
      <StudentSidebar />
      <main style={{
        marginTop: shell.navbarHeight,
        marginLeft: shell.sidebarWidth,
        padding: '28px 32px',
        minHeight: `calc(100vh - ${shell.navbarHeight}px)`,
        background: '#f5f5f5',
      }}>
        {children}
      </main>
    </>
  );
}
