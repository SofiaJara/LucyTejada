'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import API_URL from '@/utils/api';

export default function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.id_rol === 2) { // Solo administradores
          setUser(parsedUser);
        } else {
          // Si no es administrador, redirigir
          router.push('/login');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout para limpiar cookies del servidor
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar localStorage y redirigir
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold">
              ✈️ Aero Penguin
            </div>
            <span className="bg-white/20 px-2 py-1 rounded text-sm font-medium">
              Panel Administrador
            </span>
          </div>

          {/* Navigation para desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/admin" 
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/flights" 
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Vuelos
            </Link>
            <Link 
              href="/admin/routes" 
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Rutas
            </Link>
            <Link 
              href="/admin/profile" 
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Mi Perfil
            </Link>
          </nav>

          {/* User info y logout para desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {user.descripcion_usuario}
                  </p>
                  <p className="text-xs text-blue-200">
                    Administrador
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border-2 border-white/30">
                  <img 
                    src={`${API_URL}/api/v1/uploads/images/profile/${user.id_usuario}.jpeg`}
                    alt="Imagen de perfil" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Si la imagen no existe, mostrar la inicial
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span 
                    className="w-full h-full flex items-center justify-center text-sm font-bold"
                    style={{ display: 'none' }}
                  >
                    {user.descripcion_usuario?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none focus:text-blue-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700/50 rounded-lg mt-2">
              {user && (
                <div className="px-3 py-2 border-b border-white/20 mb-2 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border-2 border-white/30 flex-shrink-0">
                    <img 
                      src={`${API_URL}/api/v1/uploads/images/profile/${user.id_usuario}.jpeg`}
                      alt="Imagen de perfil" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si la imagen no existe, mostrar la inicial
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span 
                      className="w-full h-full flex items-center justify-center text-sm font-bold"
                      style={{ display: 'none' }}
                    >
                      {user.descripcion_usuario?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.descripcion_usuario}</p>
                    <p className="text-xs text-blue-200">Administrador</p>
                  </div>
                </div>
              )}
              
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/20 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/flights"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/20 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Vuelos
              </Link>
              <Link
                href="/admin/routes"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/20 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Rutas
              </Link>
              <Link
                href="/admin/profile"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/20 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mi Perfil
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-white/20 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}