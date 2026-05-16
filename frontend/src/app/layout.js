import "./globals.css";
import { AuthProvider } from "./lib/AuthContext";

export const metadata = {
  title: "Centro Cultural Lucy Tejada",
  description: "Sistema de gestión — Centro Cultural Lucy Tejada",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
