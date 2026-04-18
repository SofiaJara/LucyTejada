import Navbar from '@/app/components/lt/Navbar';
import TeacherSidebar from '@/app/components/lt/TeacherSidebar';
import { shell } from '@/app/lt-styles';

export default function ProfesorLayout({ children }) {
  return (
    <>
      <Navbar userName="Hernán" userRole="profesor" />
      <TeacherSidebar />
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
