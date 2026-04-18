'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from './AdminHeader';
import Footer from './Footer';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        router.push('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        
        // Solo permitir acceso a administradores (id_rol === 2)
        if (parsedUser.id_rol === 2) {
          setIsAuthorized(true);
        } else {
          // Si no es administrador, redirigir al login
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // El useEffect ya redirigirá
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}