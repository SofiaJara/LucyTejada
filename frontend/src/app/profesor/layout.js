import Navbar from "@/app/components/lt/Navbar";
import TeacherSidebar from "@/app/components/lt/TeacherSidebar";
import ProtectedRoute from "@/app/components/lt/ProtectedRoute";

export default function ProfesorLayout({ children }) {
  return (
    <ProtectedRoute roles={["profesor"]}>
      <Navbar />
      <TeacherSidebar />
      <main style={{
        marginTop: 46, marginLeft: 180,
        padding: "28px 32px",
        minHeight: "calc(100vh - 46px)",
        background: "#f5f5f5",
      }}>
        {children}
      </main>
    </ProtectedRoute>
  );
}
