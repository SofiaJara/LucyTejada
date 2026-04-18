import "./globals.css";

export const metadata = {
  title: "Centro Cultural Lucy Tejada",
  description: "Prototipo visual — Centro Cultural Lucy Tejada",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
