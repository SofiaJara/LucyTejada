'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { reservationService } from '../services/reservationService';
import { segmentoService } from '../services/segmentoService';
import API_URL from '@/utils/api';

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showChangeSeat, setShowChangeSeat] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Check if user has valid reservations for seat change
        if (parsedUser.id_rol === 3) {
          checkValidReservations(parsedUser.id_usuario);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user'); // Remove invalid data
      }
    }
  }, []);

  const checkValidReservations = async (userId) => {
    try {
      const reservas = await reservationService.getUserReservations(userId);
      console.log('Verificando reservas para cambio de silla:', reservas);
      
      // Check if there are any ACTIVA or PAGADA reservations with flights that haven't passed
      const now = new Date();
      
      for (const reserva of reservas) {
        if (reserva.estado_reserva === 'ACTIVA' || reserva.estado_reserva === 'PAGADA') {
          console.log(`Reserva ${reserva.id_reserva} es ${reserva.estado_reserva}`);
          
          // Para reservas ACTIVAS o PAGADAS, verificar si el vuelo aún no ha pasado
          if (reserva.vuelo_ida_id) {
            try {
              const vueloResponse = await reservationService.getFlightById(reserva.vuelo_ida_id);
              const vuelo = vueloResponse?.success ? vueloResponse.data : vueloResponse;
              
              if (vuelo && vuelo.fecha_vuelo) {
                const flightDate = new Date(vuelo.fecha_vuelo);
                console.log(`Fecha vuelo: ${flightDate}, Ahora: ${now}, Válido: ${flightDate > now}`);
                
                if (flightDate > now) {
                  console.log('✅ Hay vuelos válidos, mostrando cambio de silla');
                  setShowChangeSeat(true);
                  return;
                }
              }
            } catch (error) {
              console.error(`Error obteniendo vuelo ${reserva.vuelo_ida_id}:`, error);
            }
          }
          
          // Alternativa: verificar por segmentos si no se pudo con el vuelo
          const segmentos = await segmentoService.getSegmentosByReservaId(reserva.id_reserva);
          console.log(`Segmentos de reserva ${reserva.id_reserva}:`, segmentos);
          
          if (segmentos && segmentos.length > 0) {
            const hasValidFlight = segmentos.some(seg => {
              if (seg.Vuelo && seg.Vuelo.fecha_vuelo) {
                const flightDate = new Date(seg.Vuelo.fecha_vuelo);
                console.log(`Fecha vuelo (segmento): ${flightDate}, Ahora: ${now}, Válido: ${flightDate > now}`);
                return flightDate > now;
              }
              return false;
            });
            
            if (hasValidFlight) {
              console.log('✅ Hay vuelos válidos (por segmentos), mostrando cambio de silla');
              setShowChangeSeat(true);
              return;
            }
          }
        }
      }
      
      console.log('❌ No hay reservas válidas para cambio de silla');
      setShowChangeSeat(false);
    } catch (error) {
      console.error('Error checking valid reservations:', error);
      setShowChangeSeat(false);
    }
  };

  // Don't render header for root users and administrators (they have their own dashboard headers)
  if (isMounted && user && (user.id_rol === 1 || user.id_rol === 2)) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="Aero Penguin Logo"
                width={120}
                height={120}
                className="rounded-lg"
              />
              <div className="text-2xl font-bold text-blue-600">
                Aero Penguin
              </div>
            </Link>
          </div>
          
          {/* Navigation Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/flights" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Vuelos
              </Link>
              {user && user.id_rol === 3 ? (
                <>
                  <Link href="/account/reservations" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Reservas Activas
                  </Link>
                  <Link href="/account/change-seat" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Cambio de Silla
                  </Link>
                  <Link href="/account/history" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Historial
                  </Link>
                  <Link href="/account" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Mi Cuenta
                  </Link>
                </>
              ) : (
                <Link href="/login?from=account" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Mi Cuenta
                </Link>
              )}
              
              {/* Authentication section */}
              {isMounted ? (
                user ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-blue-500">
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
                        className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-600"
                        style={{ display: 'none' }}
                      >
                        {user.descripcion_usuario?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700 text-sm">
                      Hola, {user.descripcion_usuario}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Iniciar Sesión
                  </Link>
                )
              ) : (
                <Link href="/login" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-900 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMounted && isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/flights" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                Vuelos
              </Link>
              {user && user.id_rol === 3 ? (
                <>
                  <Link href="/account/reservations" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Reservas Activas
                  </Link>
                  <Link href="/account/change-seat" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Cambio de Silla
                  </Link>
                  <Link href="/account/history" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Historial
                  </Link>
                  <Link href="/account" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    Mi Cuenta
                  </Link>
                </>
              ) : (
                <Link href="/login?from=account" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  Mi Cuenta
                </Link>
              )}
              
              {/* Authentication section for mobile */}
              <div className="border-t border-gray-200 pt-4">
                {user ? (
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-blue-500">
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
                          className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-600"
                          style={{ display: 'none' }}
                        >
                          {user.descripcion_usuario?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-700 text-sm">
                        Hola, {user.descripcion_usuario}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <Link 
                      href="/login" 
                      className="block w-full text-center bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
