'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Country, State, City } from 'country-state-city';

export default function Register() {
  const router = useRouter(); // Inicializar router para redirección
  const [registerData, setRegisterData] = useState({
    usuario: {
      descripcion_usuario: '',
      correo_electronico: '',
      contrasena: '',
      id_rol: 3 // Valor fijo
    },
    usuarioPerfil: {
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
      id_genero_usuario: 1
    },
    confirmPassword: '',
    acceptTerms: false,
    receivePromotions: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [emailValid, setEmailValid] = useState(true); // Agregar estado para validación de email
  // Agregar estados para mejor manejo de UI
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info' | 'success' | 'error'

  // Agregar useEffect para cargar países al montar el componente
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  const handleCountryChange = (e) => {
    const countryCode = e.target.options[e.target.selectedIndex].getAttribute('data-code');
    const countryName = e.target.value;
    
    // Actualizar el país seleccionado
    handleInputChange({
      target: {
        name: 'pais_nacimiento',
        value: countryName
      }
    });

    // Cargar estados del país seleccionado
    const countryStates = State.getStatesOfCountry(countryCode);
    setStates(countryStates);
    setCities([]);

    // Si no hay estados disponibles, establecer "NA" automáticamente
    if (countryStates.length === 0) {
      handleInputChange({
        target: {
          name: 'estado_nacimiento',
          value: 'NA'
        }
      });
      handleInputChange({
        target: {
          name: 'ciudad_nacimiento',
          value: 'NA'
        }
      });
    } else {
      // Limpiar estado y ciudad seleccionados si hay estados disponibles
      handleInputChange({
        target: {
          name: 'estado_nacimiento',
          value: ''
        }
      });
      handleInputChange({
        target: {
          name: 'ciudad_nacimiento',
          value: ''
        }
      });
    }
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.options[e.target.selectedIndex].getAttribute('data-code');
    const countryCode = e.target.options[e.target.selectedIndex].getAttribute('data-country');
    const stateName = e.target.value;

    // Actualizar el estado seleccionado
    handleInputChange({
      target: {
        name: 'estado_nacimiento',
        value: stateName
      }
    });

    // Cargar ciudades del estado seleccionado
    const stateCities = City.getCitiesOfState(countryCode, stateCode);
    setCities(stateCities);

    // Si no hay ciudades disponibles, establecer "NA" automáticamente
    if (stateCities.length === 0) {
      handleInputChange({
        target: {
          name: 'ciudad_nacimiento',
          value: 'NA'
        }
      });
    } else {
      // Limpiar ciudad seleccionada si hay ciudades disponibles
      handleInputChange({
        target: {
          name: 'ciudad_nacimiento',
          value: ''
        }
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Map input names to the correct nested structure
    if ([
      'descripcion_usuario',
      'correo_electronico',
      'contrasena'
    ].includes(name)) {
      setRegisterData(prev => ({
        ...prev,
        usuario: {
          ...prev.usuario,
          [name]: newValue
        }
      }));
    } else if ([
      'dni_usuario',
      'primer_nombre',
      'segundo_nombre',
      'primer_apellido',
      'segundo_apellido',
      'fecha_nacimiento',
      'pais_nacimiento',
      'estado_nacimiento',
      'ciudad_nacimiento',
      'direccion_facturacion',
      'id_genero_usuario'
    ].includes(name)) {
      setRegisterData(prev => ({
        ...prev,
        usuarioPerfil: {
          ...prev.usuarioPerfil,
          [name]: name === 'id_genero_usuario' ? Number(newValue) : newValue
        }
      }));
    } else {
      setRegisterData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }

    // Validar email cuando cambie
    if (name === 'correo_electronico') {
      setEmailValid(validateEmail(newValue) || newValue === '');
    }

    // Check password match when either password field changes
    if (name === 'contrasena' || name === 'confirmPassword') {
      if (name === 'contrasena') {
        setPasswordMatch(newValue === registerData.confirmPassword || registerData.confirmPassword === '');
      } else {
        setPasswordMatch(newValue === registerData.usuario.contrasena);
      }
    }
  };

  // Función para limpiar todos los errores
  const clearErrors = () => {
    setErrors({});
  };

  // Función para mostrar errores específicos
  const setFieldError = (field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  // Función para limpiar formulario
  const resetForm = () => {
    setRegisterData({
      usuario: {
        descripcion_usuario: '',
        correo_electronico: '',
        contrasena: '',
        id_rol: 3
      },
      usuarioPerfil: {
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
        id_genero_usuario: 1
      },
      confirmPassword: '',
      acceptTerms: false,
      receivePromotions: true
    });
    
    // Resetear estados relacionados
    setStates([]);
    setCities([]);
    setPasswordMatch(true);
    setEmailValid(true);
    setErrors({});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();
    
    try {
      // Validaciones del frontend
      const validationErrors = {};

      // Validar campos obligatorios
      if (!registerData.usuario.descripcion_usuario.trim()) {
        validationErrors.descripcion_usuario = 'La descripción de usuario es obligatoria';
      }

      if (!registerData.usuario.correo_electronico.trim()) {
        validationErrors.correo_electronico = 'El correo electrónico es obligatorio';
      } else if (!validateEmail(registerData.usuario.correo_electronico)) {
        validationErrors.correo_electronico = 'El formato del correo electrónico no es válido';
      }

      // Validación mejorada de contraseña - SIN ESPACIOS EN ABSOLUTO
      if (!registerData.usuario.contrasena || registerData.usuario.contrasena.trim() === '') {
        validationErrors.contrasena = 'La contraseña es obligatoria';
      } else if (registerData.usuario.contrasena.includes(' ')) {
        validationErrors.contrasena = 'La contraseña no puede contener espacios';
      } else if (registerData.usuario.contrasena.length < 8) {
        validationErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (registerData.usuario.contrasena !== registerData.confirmPassword) {
        validationErrors.confirmPassword = 'Las contraseñas no coinciden';
        setPasswordMatch(false);
      }

      if (!registerData.usuarioPerfil.dni_usuario.trim()) {
        validationErrors.dni_usuario = 'El DNI es obligatorio';
      }

      if (!registerData.usuarioPerfil.primer_nombre.trim()) {
        validationErrors.primer_nombre = 'El primer nombre es obligatorio';
      }

      if (!registerData.usuarioPerfil.primer_apellido.trim()) {
        validationErrors.primer_apellido = 'El primer apellido es obligatorio';
      }

      if (!registerData.usuarioPerfil.fecha_nacimiento) {
        validationErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
      } else {
        // Validar edad
        const today = new Date();
        const birthDate = new Date(registerData.usuarioPerfil.fecha_nacimiento);
        if (birthDate >= today) {
          validationErrors.fecha_nacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
        } else {
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 18) {
            validationErrors.fecha_nacimiento = 'Debes ser mayor de 18 años para registrarte';
          }
        }
      }

      if (!registerData.usuarioPerfil.pais_nacimiento.trim()) {
        validationErrors.pais_nacimiento = 'El país de nacimiento es obligatorio';
      }

      // Modificar validación de estado - permitir "NA"
      if (!registerData.usuarioPerfil.estado_nacimiento.trim()) {
        validationErrors.estado_nacimiento = 'El estado/provincia es obligatorio';
      }

      // Modificar validación de ciudad - permitir "NA"
      if (!registerData.usuarioPerfil.ciudad_nacimiento.trim()) {
        validationErrors.ciudad_nacimiento = 'La ciudad es obligatoria';
      }

      if (!registerData.usuarioPerfil.direccion_facturacion.trim()) {
        validationErrors.direccion_facturacion = 'La dirección de facturación es obligatoria';
      }

     /*if (!registerData.acceptTerms) {
        validationErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
      }*/

      // Si hay errores de validación, mostrarlos
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        
        // Mostrar el primer error encontrado en modal
        const firstError = Object.values(validationErrors)[0];
        setModalTitle('Error de validación');
        setModalMessage(firstError);
        setModalType('error');
        setModalOpen(true);
        return;
      }

      // Preparar payload con fecha normalizada
      let normalizedFechaNacimiento = registerData.usuarioPerfil.fecha_nacimiento;
      if (normalizedFechaNacimiento) {
        // Convertir la fecha a formato ISO con zona horaria local para evitar conversión UTC
        const [year, month, day] = normalizedFechaNacimiento.split('-');
        normalizedFechaNacimiento = `${year}-${month}-${day}T12:00:00.000Z`;
      }

      const payload = {
        usuario: {
          descripcion_usuario: registerData.usuario.descripcion_usuario.trim(),
          correo_electronico: registerData.usuario.correo_electronico.trim().toLowerCase(),
          contrasena: registerData.usuario.contrasena,
          id_rol: registerData.usuario.id_rol
        },
        usuarioPerfil: {
          dni_usuario: registerData.usuarioPerfil.dni_usuario.trim(),
          primer_nombre: registerData.usuarioPerfil.primer_nombre.trim(),
          segundo_nombre: registerData.usuarioPerfil.segundo_nombre?.trim() || '',
          primer_apellido: registerData.usuarioPerfil.primer_apellido.trim(),
          segundo_apellido: registerData.usuarioPerfil.segundo_apellido?.trim() || '',
          fecha_nacimiento: normalizedFechaNacimiento,
          pais_nacimiento: registerData.usuarioPerfil.pais_nacimiento.trim(),
          estado_nacimiento: registerData.usuarioPerfil.estado_nacimiento.trim(),
          ciudad_nacimiento: registerData.usuarioPerfil.ciudad_nacimiento.trim(),
          direccion_facturacion: registerData.usuarioPerfil.direccion_facturacion.trim(),
          id_genero_usuario: registerData.usuarioPerfil.id_genero_usuario
        }
      };

      console.log('Enviando registro:', payload);

      // Get the backend URL dynamically
      const getBackendUrl = () => {
        if (typeof window !== 'undefined') {
          // If we're on a mobile device accessing via IP, use the same IP for backend
          const currentHost = window.location.hostname;
          if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            return `http://${currentHost}:3001`;
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      };

      const backendUrl = getBackendUrl();

      const response = await fetch(`${backendUrl}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error del servidor:', data);
        
        // Manejar errores específicos del backend
        if (data.error && Array.isArray(data.error)) {
          const backendErrors = {};

          // Mapeo de campos a etiquetas legibles
          const fieldLabels = {
            'usuario.descripcion_usuario': 'Descripción de usuario',
            'usuario.correo_electronico': 'Correo electrónico',
            'usuario.contrasena': 'Contraseña',
            'usuarioPerfil.dni_usuario': 'DNI',
            'usuarioPerfil.primer_nombre': 'Primer nombre',
            'usuarioPerfil.segundo_nombre': 'Segundo nombre',
            'usuarioPerfil.primer_apellido': 'Primer apellido',
            'usuarioPerfil.segundo_apellido': 'Segundo apellido',
            'usuarioPerfil.fecha_nacimiento': 'Fecha de nacimiento',
            'usuarioPerfil.pais_nacimiento': 'País de nacimiento',
            'usuarioPerfil.estado_nacimiento': 'Estado/Provincia',
            'usuarioPerfil.ciudad_nacimiento': 'Ciudad',
            'usuarioPerfil.direccion_facturacion': 'Dirección de facturación',
            'usuarioPerfil.id_genero_usuario': 'Género'
          };

          const humanize = (err) => {
            const raw = (err.message || '').toString();
            // Detectar reglas de longitud mínima tipo ">=8"
            const minMatch = raw.match(/>=\s*(\d+)/) || raw.match(/at least\s*(\d+)/i) || raw.match(/minimum length is\s*(\d+)/i);
            if (minMatch) return `Debe tener al menos ${minMatch[1]} caracteres`;
            if (/too small/i.test(raw) && /string/i.test(raw)) {
              // fallback si coincide "Too small"
              const num = raw.match(/(\d+)/);
              return num ? `Debe tener al menos ${num[0]} caracteres` : 'Valor demasiado corto';
            }
            if (/email/i.test(raw) && /valid/i.test(raw)) return 'Formato de correo electrónico inválido';
            if (/required/i.test(raw) || /is required/i.test(raw)) return 'Campo obligatorio';
            if (/must be a number/i.test(raw)) return 'Debe ser un número válido';
            // Mensaje por defecto: limpiar prefijos técnicos
            return raw.replace(/^Validation error: /i, '').trim();
          };

          const prettyMessages = data.error.map(err => {
            const fieldPath = err.path && err.path.length ? err.path.join('.') : null;
            const label = fieldPath ? (fieldLabels[fieldPath] || fieldPath) : null;
            const pretty = humanize(err);
            if (fieldPath) backendErrors[fieldPath] = pretty;
            return label ? `${label}: ${pretty}` : pretty;
          });

          setErrors(backendErrors);

          setModalTitle('Errores de validación');
          setModalMessage(prettyMessages.join('\n'));
          setModalType('error');
          setModalOpen(true);
        } else if (data.message) {
          if (data.message.includes('correo') || data.message.includes('email')) {
            setFieldError('correo_electronico', data.message);
          } else if (data.message.includes('DNI')) {
            setFieldError('dni_usuario', data.message);
          }
          setModalTitle('Error');
          // Intentar humanizar un mensaje único del backend
          const rawMsg = data.message.toString();
          const simpleMsg = rawMsg.replace(/^Validation error: /i, '').trim();
          setModalMessage(simpleMsg);
          setModalType('error');
          setModalOpen(true);
        } else {
          setModalTitle('Error');
          setModalMessage('Error en el registro. Por favor, inténtalo de nuevo.');
          setModalType('error');
          setModalOpen(true);
        }
        return;
      }

      // Registro exitoso
      console.log('Registro exitoso:', data);
      
  // Mostrar mensaje de éxito
  setModalTitle('Registro exitoso');
  setModalMessage('¡Tu cuenta ha sido creada correctamente! Serás redirigido al inicio de sesión.');
  setModalType('success');
  setModalOpen(true);
      
      // Limpiar formulario
      resetForm();
      
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (error) {
      console.error('Error en el registro:', error);
      setModalTitle('Error de conexión');
      setModalMessage(`${error.message}. Por favor, verifica tu conexión e inténtalo de nuevo.`);
      setModalType('error');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Header />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4">
            <div className={`px-6 py-4 border-b ${modalType === 'error' ? 'border-red-100' : modalType === 'success' ? 'border-green-100' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-semibold ${modalType === 'error' ? 'text-red-600' : modalType === 'success' ? 'text-green-600' : 'text-gray-900'}`}>{modalTitle}</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 whitespace-pre-line">{modalMessage}</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-800 bg-gray-200 rounded hover:bg-gray-300">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Register Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Únete a Aero Penguin
            </h1>
            <p className="text-lg md:text-xl">
              Crea tu cuenta y descubre un mundo de posibilidades de viaje
            </p>
          </div>
        </div>
        {/* Decorative airplane */}
        <div className="absolute right-10 top-10 text-white text-4xl opacity-20 hidden lg:block">
          ✈️
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10 pb-16">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Crear Cuenta
            </h2>
            <p className="text-gray-600">
              Completa los datos para crear tu cuenta de Aero Penguin
            </p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Ejemplo de campo con manejo de errores mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="descripcion_usuario" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción Usuario *
                </label>
                <input
                  type="text"
                  id="descripcion_usuario"
                  name="descripcion_usuario"
                  value={registerData.usuario.descripcion_usuario}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez"
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black ${
                    errors.descripcion_usuario ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.descripcion_usuario && (
                  <p className="mt-1 text-sm text-red-600">{errors.descripcion_usuario}</p>
                )}
              </div>

              <div>
                <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="correo_electronico"
                  name="correo_electronico"
                  value={registerData.usuario.correo_electronico}
                  onChange={handleInputChange}
                  placeholder="ejemplo@email.com"
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black ${
                    errors.correo_electronico || !emailValid ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {(errors.correo_electronico || !emailValid) && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.correo_electronico || 'Por favor ingresa un correo electrónico válido'}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="contrasena"
                    name="contrasena"
                    value={registerData.usuario.contrasena}
                    onChange={handleInputChange}
                    placeholder="Ej: MiClaveSegura123"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 pr-10 text-gray-700 placeholder:text-gray-500 focus:text-black"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repite la contraseña"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 pr-10 text-gray-700 placeholder:text-gray-500 focus:text-black ${!passwordMatch ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {!passwordMatch && (<p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>)}
              </div>
            </div>
            {/* El rol es fijo y no editable por el usuario */}
            {/* Datos de Perfil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label htmlFor="dni_usuario" className="block text-sm font-medium text-gray-700 mb-2">DNI *</label>
                <input
                  type="text"
                  id="dni_usuario"
                  name="dni_usuario"
                  value={registerData.usuarioPerfil.dni_usuario}
                  onChange={handleInputChange}
                  placeholder="Ej: 87654321"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
                />
                {errors.dni_usuario && (
                  <p className="mt-1 text-sm text-red-600">{errors.dni_usuario}</p>
                )}
              </div>
              <div>
                <label htmlFor="primer_nombre" className="block text-sm font-medium text-gray-700 mb-2">Primer Nombre *</label>
                <input
                  type="text"
                  id="primer_nombre"
                  name="primer_nombre"
                  value={registerData.usuarioPerfil.primer_nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
                />
                {errors.primer_nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.primer_nombre}</p>
                )}
              </div>
              <div>
                <label htmlFor="segundo_nombre" className="block text-sm font-medium text-gray-700 mb-2">Segundo Nombre</label>
                <input
                  type="text"
                  id="segundo_nombre"
                  name="segundo_nombre"
                  value={registerData.usuarioPerfil.segundo_nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Carlos"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
                />
              </div>
              <div>
                <label htmlFor="primer_apellido" className="block text-sm font-medium text-gray-700 mb-2">Primer Apellido *</label>
                <input
                  type="text"
                  id="primer_apellido"
                  name="primer_apellido"
                  value={registerData.usuarioPerfil.primer_apellido}
                  onChange={handleInputChange}
                  placeholder="Ej: García"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
                />
                {errors.primer_apellido && (
                  <p className="mt-1 text-sm text-red-600">{errors.primer_apellido}</p>
                )}
              </div>
              <div>
                <label htmlFor="segundo_apellido" className="block text-sm font-medium text-gray-700 mb-2">Segundo Apellido</label>
                <input
                  type="text"
                  id="segundo_apellido"
                  name="segundo_apellido"
                  value={registerData.usuarioPerfil.segundo_apellido}
                  onChange={handleInputChange}
                  placeholder="Ej: López"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
                />
              </div>
              <div>
                <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={registerData.usuarioPerfil.fecha_nacimiento}
                  onChange={handleInputChange}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
                />
                <p className="mt-1 text-xs text-gray-500">Debes ser mayor de 18 años</p>
                {errors.fecha_nacimiento && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>
                )}
              </div>
               <div>
              <label htmlFor="pais_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">País de Nacimiento *</label>
              <select
                id="pais_nacimiento"
                name="pais_nacimiento"
                value={registerData.usuarioPerfil.pais_nacimiento}
                onChange={handleCountryChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
              >
                <option value="">Seleccione un país</option>
                {Country.getAllCountries().map((country) => (
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
            <label htmlFor="estado_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">Estado/Provincia *</label>
            <select
              id="estado_nacimiento"
              name="estado_nacimiento"
              value={registerData.usuarioPerfil.estado_nacimiento}
              onChange={handleStateChange}
              required
              disabled={!registerData.usuarioPerfil.pais_nacimiento}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
            >
              <option value="">Seleccione un estado</option>
              {states.length === 0 && registerData.usuarioPerfil.pais_nacimiento ? (
                <option value="NA">No aplica</option>
              ) : (
                states.map((state) => (
                  <option 
                    key={state.isoCode} 
                    value={state.name}
                    data-code={state.isoCode}
                    data-country={state.countryCode}
                  >
                    {state.name}
                  </option>
                ))
              )}
            </select>
            {registerData.usuarioPerfil.estado_nacimiento === 'NA' && (
              <p className="mt-1 text-xs text-blue-600">
                Este país no tiene divisiones estatales disponibles
              </p>
            )}
            {errors.estado_nacimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.estado_nacimiento}</p>
              )}
          </div>

          <div>
            <label htmlFor="ciudad_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
            <select
              id="ciudad_nacimiento"
              name="ciudad_nacimiento"
              value={registerData.usuarioPerfil.ciudad_nacimiento}
              onChange={handleInputChange}
              required
              disabled={!registerData.usuarioPerfil.estado_nacimiento}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder:text-gray-500 focus:text-black"
            >
              <option value="">Seleccione una ciudad</option>
              {cities.length === 0 && registerData.usuarioPerfil.estado_nacimiento && registerData.usuarioPerfil.estado_nacimiento !== '' ? (
                <option value="NA">No aplica</option>
              ) : (
                cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))
              )}
            </select>
            {registerData.usuarioPerfil.ciudad_nacimiento === 'NA' && (
              <p className="mt-1 text-xs text-blue-600">
                Este estado/provincia no tiene ciudades disponibles
              </p>
            )}
            {errors.ciudad_nacimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.ciudad_nacimiento}</p>
              )}
          </div>

              <div>
                <label htmlFor="direccion_facturacion" className="block text-sm font-medium text-gray-700 mb-2">Dirección de Facturación *</label>
                <input
                  type="text"
                  id="direccion_facturacion"
                  name="direccion_facturacion"
                  value={registerData.usuarioPerfil.direccion_facturacion}
                  onChange={handleInputChange}
                  placeholder="Ej: Av. Siempre Viva 742"
                  required
                  className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.direccion_facturacion && (
                  <p className="mt-1 text-sm text-red-600">{errors.direccion_facturacion}</p>
                )}
              </div>
              <div>
                <label htmlFor="id_genero_usuario" className="block text-sm font-medium text-gray-700 mb-2">Género *</label>
                <select
                  id="id_genero_usuario"
                  name="id_genero_usuario"
                  value={registerData.usuarioPerfil.id_genero_usuario}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 focus:text-black"
                >
                  <option value={1}>Masculino</option>
                  <option value={2}>Femenino</option>
                  <option value={3}>Otro</option>
                </select>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Requisitos de contraseña:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-center">
                  <span className={`mr-2 ${registerData.usuario.contrasena && registerData.usuario.contrasena.trim() !== '' ? 'text-green-600' : 'text-gray-400'}`}>
                    {registerData.usuario.contrasena && registerData.usuario.contrasena.trim() !== '' ? '✓' : '○'}
                  </span>
                  No puede estar vacía
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${registerData.usuario.contrasena && !registerData.usuario.contrasena.includes(' ') ? 'text-green-600' : 'text-gray-400'}`}>
                    {registerData.usuario.contrasena && !registerData.usuario.contrasena.includes(' ') ? '✓' : '○'}
                  </span>
                  No puede contener espacios
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${registerData.usuario.contrasena && registerData.usuario.contrasena.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    {registerData.usuario.contrasena && registerData.usuario.contrasena.length >= 8 ? '✓' : '○'}
                  </span>
                  Mínimo 8 caracteres ({registerData.usuario.contrasena ? registerData.usuario.contrasena.length : 0}/8)
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${passwordMatch && registerData.confirmPassword !== '' ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordMatch && registerData.confirmPassword !== '' ? '✓' : '○'}
                  </span>
                  Las contraseñas coinciden
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${emailValid && registerData.usuario.correo_electronico !== '' ? 'text-green-600' : 'text-gray-400'}`}>
                    {emailValid && registerData.usuario.correo_electronico !== '' ? '✓' : '○'}
                  </span>
                  Email válido
                </li>
              </ul>
            </div>

            
            {/* Botón de registro mejorado */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-xl ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </div>
              ) : (
                'Crear Cuenta'
              )}
            </button>


          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Beneficios de ser miembro de Aero Penguin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Check-in Rápido</h3>
              <p className="text-gray-600 text-sm">
                Check-in online hasta 24 horas antes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ofertas Exclusivas</h3>
              <p className="text-gray-600 text-sm">
                Descuentos especiales solo para miembros
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Programa de Puntos</h3>
              <p className="text-gray-600 text-sm">
                Acumula puntos y canjéalos por vuelos
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">App Móvil</h3>
              <p className="text-gray-600 text-sm">
                Gestiona todo desde tu teléfono
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
