import Navbar from "@/app/components/lt/Navbar";
import StudentSidebar from "@/app/components/lt/StudentSidebar";
import ProtectedRoute from "@/app/components/lt/ProtectedRoute";

export default function EstudianteLayout({ children }) {
  return (
    <ProtectedRoute roles={["estudiante"]}>
      <Navbar />
      <StudentSidebar />
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
