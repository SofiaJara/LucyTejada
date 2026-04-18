'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EditProfile from '../../components/EditProfile';
import API_URL from '@/utils/api';

export default function EditAccount() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true); // Siempre en modo edición para esta página

  useEffect(() => {
    const loadUserProfile = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        
        // Solo permitir acceso a usuarios normales (id_rol === 3)
        if (parsedUser.id_rol !== 3) {
          // Redirigir según el rol del usuario
          if (parsedUser.id_rol === 1) {
            router.push('/root/dashboard');
          } else if (parsedUser.id_rol === 2) {
            router.push('/admin');
          } else {
            router.push('/');
          }
          return;
        }

        // Obtener perfil completo del backend
        const response = await fetch(`${API_URL}/api/v1/users/profile/${parsedUser.id_usuario}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          setUserProfile(result.data);
        } else {
          console.error('Error al obtener perfil');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  const handleSaveProfile = async (profileData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`${API_URL}/api/v1/users/profile/${userData.id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          usuarioPerfilData: profileData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Redirigir a la página de cuenta después de guardar exitosamente
        setTimeout(() => {
          router.push('/account');
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.log('Error response:', errorData);
        
        // Manejar errores de validación específicos del backend
        if (errorData.error && typeof errorData.error === 'object' && errorData.error.fields && Array.isArray(errorData.error.fields)) {
          const validationErrors = {};
          
          errorData.error.fields.forEach(err => {
            if (err.code === 'DNI_EXISTS') {
              validationErrors.dni_usuario = err.message || 'El DNI ya está registrado por otro usuario';
            }
          });
          
          if (Object.keys(validationErrors).length > 0) {
            const error = new Error('Errores de validación');
            error.validationErrors = validationErrors;
            throw error;
          }
        }
        
        // Manejar diferentes formatos de error
        let errorMessage = 'Error al actualizar el perfil';
        
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.details) {
          errorMessage = errorData.details;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error; // Re-lanzar para que EditProfile maneje el error
    }
  };

  const handleCancelEdit = () => {
    router.push('/account');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Editar Mi Información</h1>
            <p className="text-gray-600 mt-2">Actualiza tu información personal</p>
          </div>

          {/* Información NO EDITABLE */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información No Editable</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción Usuario
                </label>
                <p className="text-gray-600">
                  {userProfile?.usuario?.descripcion_usuario || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <p className="text-gray-600">
                  {userProfile?.usuario?.correo_electronico || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          {/* Usar el componente reutilizable EditProfile */}
          <EditProfile
            userProfile={userProfile}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
            showMessage={true}
          />
        </div>
      </div>

      <Footer />        
    </div>
  );
}