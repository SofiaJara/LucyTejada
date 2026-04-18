'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Country, State, City } from 'country-state-city';
import API_URL from '@/utils/api';

export default function EditProfile({ 
  userProfile, 
  onSave, 
  onCancel, 
  isLoading = false,
  showMessage = true 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dni_usuario: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha_nacimiento: '',
    pais_nacimiento: '',
    estado_nacimiento: '',
    ciudad_nacimiento: '',
    direccion_facturacion: '',
    id_genero_usuario: 1,
    en_noticias: false
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Cargar países al montar el componente
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  // Llenar formulario cuando cambie userProfile
  useEffect(() => {
    if (userProfile?.usuarioPerfil) {
      const perfil = userProfile.usuarioPerfil;
      setFormData({
        dni_usuario: perfil.dni_usuario || '',
        primer_nombre: perfil.primer_nombre || '',
        segundo_nombre: perfil.segundo_nombre || '',
        primer_apellido: perfil.primer_apellido || '',
        segundo_apellido: perfil.segundo_apellido || '',
        fecha_nacimiento: perfil.fecha_nacimiento ? perfil.fecha_nacimiento.split('T')[0] : '',
        pais_nacimiento: perfil.pais_nacimiento || '',
        estado_nacimiento: perfil.estado_nacimiento || '',
        ciudad_nacimiento: perfil.ciudad_nacimiento || '',
        direccion_facturacion: perfil.direccion_facturacion || '',
        id_genero_usuario: perfil.id_genero_usuario || 1,
        en_noticias: typeof perfil.en_noticias === 'boolean' ? perfil.en_noticias : false
      });

      // Cargar imagen de perfil si existe
      if (userProfile?.usuario?.id_usuario) {
        const imageUrl = `${API_URL}/api/v1/uploads/images/profile/${userProfile.usuario.id_usuario}.jpeg`;
        setImagePreview(imageUrl);
      }

      // Cargar estados y ciudades si ya existe información
      if (perfil.pais_nacimiento) {
        const country = Country.getAllCountries().find(c => c.name === perfil.pais_nacimiento);
        if (country) {
          const countryStates = State.getStatesOfCountry(country.isoCode);
          setStates(countryStates);
          
          if (perfil.estado_nacimiento) {
            const state = countryStates.find(s => s.name === perfil.estado_nacimiento);
            if (state) {
              const stateCities = City.getCitiesOfState(country.isoCode, state.isoCode);
              setCities(stateCities);
            }
          }
        }
      }
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.options[e.target.selectedIndex].getAttribute('data-code');
    const countryName = e.target.value;
    
    // Actualizar el país seleccionado
    setFormData(prev => ({
      ...prev,
      pais_nacimiento: countryName,
      estado_nacimiento: '',
      ciudad_nacimiento: ''
    }));

    // Cargar estados del país seleccionado
    const countryStates = State.getStatesOfCountry(countryCode);
    setStates(countryStates);
    setCities([]);
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.options[e.target.selectedIndex].getAttribute('data-code');
    const countryCode = e.target.options[e.target.selectedIndex].getAttribute('data-country');
    const stateName = e.target.value;

    // Actualizar el estado seleccionado
    setFormData(prev => ({
      ...prev,
      estado_nacimiento: stateName,
      ciudad_nacimiento: ''
    }));

    // Cargar ciudades del estado seleccionado
    const stateCities = City.getCitiesOfState(countryCode, stateCode);
    setCities(stateCities);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          imagen: 'Solo se permiten imágenes (JPEG, PNG, WebP)'
        }));
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imagen: 'La imagen no debe superar los 5MB'
        }));
        return;
      }

      // Limpiar error previo
      setErrors(prev => {
        const { imagen, ...rest } = prev;
        return rest;
      });

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Subir imagen automáticamente
      await handleUploadImage(file);
    }
  };

  const handleUploadImage = async (file) => {
    if (!file) {
      setMessage('Por favor selecciona una imagen');
      return;
    }

    setUploadingImage(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('imagen', file);

      console.log('=== SUBIENDO IMAGEN ===');
      console.log('Archivo:', file.name, file.size, file.type);

      const response = await fetch(`${API_URL}/api/v1/uploads/create`, {
        method: 'POST',
        credentials: 'include', // Importante: enviar cookies con la petición
        body: formData
      });

      console.log('Status de respuesta:', response.status, response.statusText);

      if (!response.ok) {
        // Intentar obtener el error en formato JSON, o usar el status text
        let errorMessage = 'Error al subir la imagen';
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            console.error('Error JSON del servidor:', errorData);
            
            // Construir mensaje de error detallado
            if (errorData.error) {
              errorMessage = errorData.error;
              if (errorData.details) {
                errorMessage += ` (${errorData.details})`;
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = `Error ${response.status}: ${response.statusText}`;
            }
          } catch (jsonError) {
            console.error('Error al parsear JSON de error:', jsonError);
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
        } else {
          // No es JSON, obtener como texto
          const errorText = await response.text();
          console.error('Error del servidor (texto):', errorText);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Respuesta exitosa:', data);
      
      if (showMessage) {
        setMessage('Imagen actualizada correctamente');
      }
      
      setSelectedImage(null);
      
      // Recargar la imagen del servidor
      if (userProfile?.usuario?.id_usuario) {
        const imageUrl = `${API_URL}/api/v1/uploads/images/profile/${userProfile.usuario.id_usuario}.jpeg?t=${Date.now()}`;
        setImagePreview(imageUrl);
      }
      
      console.log('=== IMAGEN SUBIDA EXITOSAMENTE ===');
    } catch (error) {
      console.error('=== ERROR AL SUBIR IMAGEN ===');
      console.error('Error completo:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    // Restaurar la imagen original del servidor
    if (userProfile?.usuario?.id_usuario) {
      const imageUrl = `${API_URL}/api/v1/uploads/images/profile/${userProfile.usuario.id_usuario}.jpeg?t=${Date.now()}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const validationErrors = {};

    // Validar campos obligatorios
    if (!formData.dni_usuario.trim()) {
          validationErrors.dni_usuario = 'El DNI es obligatorio';
    }

    if (!formData.primer_nombre.trim()) {
      validationErrors.primer_nombre = 'El primer nombre es obligatorio';
    }

    if (!formData.primer_apellido.trim()) {
      validationErrors.primer_apellido = 'El primer apellido es obligatorio';
    }

    if (!formData.fecha_nacimiento) {
      validationErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      // Validar edad - debe ser mayor de 18 años
      const today = new Date();
      const birthDate = new Date(formData.fecha_nacimiento);
      if (birthDate >= today) {
        validationErrors.fecha_nacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
            if (age < 18) {
              validationErrors.fecha_nacimiento = 'Debes ser mayor de 18 años';
            } else if (age > 100) {
              validationErrors.fecha_nacimiento = 'La edad no puede ser mayor a 100 años';
        }
      }
    }

    if (!formData.pais_nacimiento.trim()) {
      validationErrors.pais_nacimiento = 'El país de nacimiento es obligatorio';
    }

    if (!formData.estado_nacimiento.trim()) {
      validationErrors.estado_nacimiento = 'El estado/provincia es obligatorio';
    }

    if (!formData.ciudad_nacimiento.trim()) {
      validationErrors.ciudad_nacimiento = 'La ciudad es obligatoria';
    }

    if (!formData.direccion_facturacion.trim()) {
      validationErrors.direccion_facturacion = 'La dirección de facturación es obligatoria';
    }

    return validationErrors;
  };

  const handleSubmit  = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setErrors({});

    try {
      console.log('=== INICIO DEL SUBMIT ===');
      console.log('FormData inicial:', formData);
      
      // Validaciones del frontend
      const validationErrors = validateForm();
      console.log('Errores de validación:', validationErrors);

      // Si hay errores de validación, mostrarlos
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setMessage('Por favor, corrige los errores antes de continuar');
        setUpdating(false);
        return;
      }

      // Preparar datos con fecha normalizada para evitar problemas de zona horaria
      const normalizedFormData = { ...formData };
      if (normalizedFormData.fecha_nacimiento) {
        const [year, month, day] = normalizedFormData.fecha_nacimiento.split('-');
        normalizedFormData.fecha_nacimiento = `${year}-${month}-${day}T12:00:00.000Z`;
      }

      // Limpiar campos opcionales vacíos (enviarlos como undefined en lugar de strings vacíos)
      if (!normalizedFormData.segundo_nombre || normalizedFormData.segundo_nombre.trim() === '') {
        delete normalizedFormData.segundo_nombre;
      }
      if (!normalizedFormData.segundo_apellido || normalizedFormData.segundo_apellido.trim() === '') {
        delete normalizedFormData.segundo_apellido;
      }

      // Asegurar que el campo de suscripción esté presente
      if (typeof formData.en_noticias === 'boolean') {
        normalizedFormData.en_noticias = formData.en_noticias;
      }

      console.log('Datos normalizados a enviar:', normalizedFormData);

      // Llamar función onSave pasada como prop
      await onSave(normalizedFormData);
      
      if (showMessage) {
        setMessage('Información actualizada correctamente');
      }
      console.log('=== SUBMIT EXITOSO ===');
    } catch (error) {
      console.error('=== ERROR EN SUBMIT ===');
      console.error('Error completo:', error);

      // Si el error es por "sin cambios" o "no encontrado", mostrar éxito
      const errorMsg = (typeof error === 'string') ? error : error?.message;
      const msgLower = errorMsg ? errorMsg.toLowerCase() : '';
      if (msgLower.includes('sin cambios') || msgLower.includes('no encontrado') || msgLower.includes('actualizar el perfil')) {
        setMessage('Información actualizada correctamente');
      } else if (error.validationErrors) {
        console.log('Errores de validación del backend:', error.validationErrors);
        setErrors(prev => ({
          ...prev,
          ...error.validationErrors
        }));
        setMessage('Por favor, corrige los errores antes de continuar');
      } else {
        setMessage(errorMsg || 'Error de conexión');
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {showMessage && message && (
        <div className={`p-4 rounded-lg ${message.includes('correctamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Sección de Imagen de Perfil */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen de Perfil</h3>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Preview de la imagen */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-gray-300">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Imagen de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          {/* Controles de imagen */}
          <div className="flex-grow">
            <div className="space-y-3">
              <div>
                <label htmlFor="imagen_perfil" className="block text-sm font-medium text-gray-700 mb-2">
                  {uploadingImage ? 'Subiendo imagen...' : 'Seleccionar nueva imagen'}
                </label>
                <input
                  type="file"
                  id="imagen_perfil"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {errors.imagen && (
                  <p className="mt-1 text-sm text-red-600">{errors.imagen}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Formatos: JPEG, PNG, WebP. Máximo 5MB. La imagen se subirá automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información NO EDITABLE */}
      <div className="p-4 bg-gray-100 rounded-lg">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Editable</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dni_usuario" className="block text-sm font-medium text-gray-700 mb-2">
              DNI *
            </label>
            <input
              type="text"
              id="dni_usuario"
              name="dni_usuario"
              value={formData.dni_usuario}
              onChange={handleInputChange}
              placeholder="Ej: 87654321"
              className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dni_usuario ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.dni_usuario && (
              <p className="mt-1 text-sm text-red-600">{errors.dni_usuario}</p>
            )}
          </div>

          <div>
            <label htmlFor="primer_nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Primer Nombre *
            </label>
            <input
              type="text"
              id="primer_nombre"
              name="primer_nombre"
              value={formData.primer_nombre}
              onChange={handleInputChange}
              placeholder="Ej: Juan"
              className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.primer_nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.primer_nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.primer_nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="segundo_nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Segundo Nombre
            </label>
            <input
              type="text"
              id="segundo_nombre"
              name="segundo_nombre"
              value={formData.segundo_nombre}
              onChange={handleInputChange}
              placeholder="Ej: Carlos"
              className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="primer_apellido" className="block text-sm font-medium text-gray-700 mb-2">
              Primer Apellido *
            </label>
            <input
              type="text"
              id="primer_apellido"
              name="primer_apellido"
              value={formData.primer_apellido}
              onChange={handleInputChange}
              placeholder="Ej: García"
              className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.primer_apellido ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.primer_apellido && (
              <p className="mt-1 text-sm text-red-600">{errors.primer_apellido}</p>
            )}
          </div>

          <div>
            <label htmlFor="segundo_apellido" className="block text-sm font-medium text-gray-700 mb-2">
              Segundo Apellido
            </label>
            <input
              type="text"
              id="segundo_apellido"
              name="segundo_apellido"
              value={formData.segundo_apellido}
              onChange={handleInputChange}
              placeholder="Ej: López"
              className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.fecha_nacimiento ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            <p className="text-sm text-gray-500 mt-1">Debes ser mayor de 18 años</p>
            {errors.fecha_nacimiento && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>
            )}
          </div>

          <div>
            <label htmlFor="pais_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
              País de Nacimiento *
            </label>
            <select
              id="pais_nacimiento"
              name="pais_nacimiento"
              value={formData.pais_nacimiento}
              onChange={handleCountryChange}
              className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.pais_nacimiento ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un país</option>
              {countries.map((country) => (
                <option key={country.isoCode} value={country.name} data-code={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.pais_nacimiento && (
              <p className="mt-1 text-sm text-red-600">{errors.pais_nacimiento}</p>
            )}
          </div>

          <div>
            <label htmlFor="estado_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
              Estado/Provincia *
            </label>
            <select
              id="estado_nacimiento"
              name="estado_nacimiento"
              value={formData.estado_nacimiento}
              onChange={handleStateChange}
              disabled={!formData.pais_nacimiento}
              className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.estado_nacimiento ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } ${!formData.pais_nacimiento ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccione un estado</option>
              {states.map((state) => (
                <option 
                  key={state.isoCode} 
                  value={state.name}
                  data-code={state.isoCode}
                  data-country={state.countryCode}
                >
                  {state.name}
                </option>
              ))}
            </select>
            {errors.estado_nacimiento && (
              <p className="mt-1 text-sm text-red-600">{errors.estado_nacimiento}</p>
            )}
          </div>

          <div>
            <label htmlFor="ciudad_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad *
            </label>
            <select
              id="ciudad_nacimiento"
              name="ciudad_nacimiento"
              value={formData.ciudad_nacimiento}
              onChange={handleInputChange}
              disabled={!formData.estado_nacimiento}
              className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.ciudad_nacimiento ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } ${!formData.estado_nacimiento ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccione una ciudad</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.ciudad_nacimiento && (
              <p className="mt-1 text-sm text-red-600">{errors.ciudad_nacimiento}</p>
            )}
          </div>

          <div>
            <label htmlFor="direccion_facturacion" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de Facturación *
            </label>
            <input
              type="text"
              id="direccion_facturacion"
              name="direccion_facturacion"
              value={formData.direccion_facturacion}
              onChange={handleInputChange}
              placeholder="Ej: Av. Siempre Viva 742"
              className={`w-full px-4 py-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.direccion_facturacion ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.direccion_facturacion && (
              <p className="mt-1 text-sm text-red-600">{errors.direccion_facturacion}</p>
            )}
          </div>

          <div>
            <label htmlFor="id_genero_usuario" className="block text-sm font-medium text-gray-700 mb-2">
              Género *
            </label>
            <select
              id="id_genero_usuario"
              name="id_genero_usuario"
              value={formData.id_genero_usuario}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>Masculino</option>
              <option value={2}>Femenino</option>
              <option value={3}>Otro</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="en_noticias"
              checked={formData.en_noticias}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Recibir noticias y promociones por correo</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">Podrás darte de baja en cualquier momento desde tu perfil.</p>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={updating || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}