'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import EditProfile from '../../components/EditProfile';
import LoadingScreen from '../../components/LoadingScreen';
import API_URL from '@/utils/api';

export default function AdminProfile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      // Verificar autenticación
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        
        // Solo permitir acceso a administradores (id_rol === 2)
        if (parsedUser.id_rol !== 2) {
          router.push('/login');
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
          console.log('Profile data received:', result);
          setUserProfile(result.data);
          
          // Si no tiene perfil pero es admin, mostrar mensaje informativo
          if (!result.data.usuarioPerfil) {
            console.log('Perfil creado automáticamente para administrador');
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Error al obtener perfil:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
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
      
      console.log('Enviando datos del perfil:', profileData); // Debug
      
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

      console.log('Respuesta del servidor:', response.status, response.statusText); // Debug

      if (response.ok) {
        const result = await response.json();
        console.log('Resultado exitoso:', result); // Debug
        // Actualizar el estado local con los nuevos datos
        setUserProfile(result.data || userProfile);
        setIsEditing(false);
        
        // Opcional: mostrar mensaje de éxito
        setTimeout(() => {
          // Recargar datos del perfil
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.log('Error response completa:', errorData); // Debug
        
        // Manejar errores de validación específicos del backend
        // La estructura del backend es: { error: { fields: [...] } }
        if (errorData.error && typeof errorData.error === 'object' && errorData.error.fields && Array.isArray(errorData.error.fields)) {
          const validationErrors = {};
          
          errorData.error.fields.forEach(err => {
            if (err.code === 'DNI_EXISTS') {
              validationErrors.dni_usuario = err.message || 'El DNI ya está registrado por otro usuario';
            }
            // Agregar más validaciones si es necesario
          });
          
          // Si hay errores de validación específicos, crear un error especial
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
      console.error('Error en handleSaveProfile:', error); // Debug
      throw error; // Re-lanzar para que EditProfile maneje el error
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading) {
    return <LoadingScreen message="Cargando perfil..." />;
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil de Administrador</h1>
              <p className="text-gray-600 mt-2">
                {isEditing ? 'Edita tu información personal' : 'Información de tu perfil personal'}
              </p>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ✏️ Editar Perfil
              </button>
            )}
          </div>

          {isEditing ? (
            <EditProfile
              userProfile={userProfile}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
              showMessage={true}
            />
          ) : (
            <div className="space-y-6">
              {/* Imagen de Perfil */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-blue-500 shadow-lg">
                  {userProfile?.usuario?.id_usuario ? (
                    <img 
                      src={`${API_URL}/api/v1/uploads/images/profile/${userProfile.usuario.id_usuario}.jpeg`}
                      alt="Imagen de perfil" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si la imagen no existe, mostrar el icono por defecto
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <svg 
                    className="w-16 h-16 text-gray-400" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    style={{ display: userProfile?.usuario?.id_usuario ? 'none' : 'block' }}
                  >
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de Usuario */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Usuario
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuario?.descripcion_usuario || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuario?.correo_electronico || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <p className="text-gray-900 font-medium">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                      Administrador
                    </span>
                  </p>
                </div>

                {/* Información de Perfil */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.dni_usuario || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primer Nombre
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.primer_nombre || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segundo Nombre
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.segundo_nombre || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primer Apellido
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.primer_apellido || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segundo Apellido
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.segundo_apellido || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.fecha_nacimiento ? 
                      userProfile.usuarioPerfil.fecha_nacimiento.split('T')[0].split('-').reverse().join('/') : 
                      'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País de Nacimiento
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.pais_nacimiento || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado/Provincia
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.estado_nacimiento || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.ciudad_nacimiento || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Facturación
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.direccion_facturacion || 'No especificado'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile?.usuarioPerfil?.id_genero_usuario === 1 ? 'Masculino' :
                     userProfile?.usuarioPerfil?.id_genero_usuario === 2 ? 'Femenino' :
                     userProfile?.usuarioPerfil?.id_genero_usuario === 3 ? 'Otro' :
                     'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}