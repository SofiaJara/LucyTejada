'use client';
import { useEffect, useState } from 'react';
import CustomPopup from './CustomPopup';
import usePopup from '../hooks/usePopup';

export default function RootProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { popupState, showError, closePopup } = usePopup();

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = () => {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        // No user data, redirect to login
        window.location.href = '/login';
        return;
      }

      const user = JSON.parse(userData);
      
      // Check if user is root (id_rol = 1)
      if (user.id_rol !== 1) {
        // Not a root user, redirect to home
        showError('Solo el usuario root puede acceder a esta sección.', 'Acceso denegado');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      // User is authorized
      setIsAuthorized(true);
    } catch (error) {
      console.error('Error checking authorization:', error);
      // Redirect to login on error
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta sección.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Logout floating button - responsive design */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors flex items-center
                     px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base"
          title="Cerrar Sesión"
        >
          <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline sm:ml-2">Cerrar Sesión</span>
        </button>
      </div>
      {children}
      <CustomPopup
        isOpen={popupState.isOpen}
        onClose={closePopup}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        onConfirm={popupState.onConfirm}
        confirmText={popupState.confirmText}
        cancelText={popupState.cancelText}
      />
    </div>
  );
}