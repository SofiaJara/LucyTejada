import RootProtectedRoute from '../components/RootProtectedRoute';

export const metadata = {
  title: "Panel de Administración Root - Sistema Aerolínea",
  description: "Panel exclusivo para usuario root",
};

export default function RootLayout({ children }) {
  return (
    <RootProtectedRoute>
      {children}
    </RootProtectedRoute>
  );
}