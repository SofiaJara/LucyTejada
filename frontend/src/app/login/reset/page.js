'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CustomPopup from '../../components/CustomPopup';
import usePopup from '../../hooks/usePopup';
import API_URL from '@/utils/api';

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1: request PIN, 2: enter PIN and new password
  const [loading, setLoading] = useState(false);
  const { popupState, showWarning, showSuccess, showError, closePopup } = usePopup();
  const [formData, setFormData] = useState({
    identifier: '',
    pin: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Step 1: Request PIN
  const handleRequestPin = async (e) => {
    e.preventDefault();
    
    if (!formData.identifier.trim()) {
      showWarning('Por favor ingresa tu usuario o correo electrónico');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: formData.identifier
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al solicitar el PIN');
      }

      showSuccess('Revisa tu correo electrónico', 'PIN enviado exitosamente');
      setStep(2);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with PIN
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.pin.trim()) {
      showWarning('Por favor ingresa el PIN');
      return;
    }

    if (!formData.newPassword.trim()) {
      showWarning('Por favor ingresa la nueva contraseña');
      return;
    }

    if (formData.newPassword.length < 8) {
      showWarning('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showWarning('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          pin: formData.pin,
          nueva_contrasena: formData.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña');
      }

      showSuccess('¡Ahora puedes iniciar sesión con tu nueva contraseña!', '¡Contraseña restablecida!');
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      identifier: '',
      pin: '',
      newPassword: '',
      confirmPassword: ''
    });
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-purple-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Restablecer Contraseña
            </h1>
            <p className="text-lg md:text-xl">
              {step === 1 
                ? 'Ingresa tu usuario o correo para recibir un PIN de restablecimiento'
                : 'Ingresa el PIN recibido y tu nueva contraseña'
              }
            </p>
          </div>
        </div>
        {/* Decorative icon */}
        <div className="absolute right-10 top-10 text-white text-4xl opacity-20 hidden lg:block">
          🔐
        </div>
      </section>

      {/* Reset Form Section */}
      <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10 pb-16">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 1 ? 'Solicitar PIN' : 'Nueva Contraseña'}
            </h2>
            <p className="text-gray-600">
              {step === 1 
                ? 'Te enviaremos un PIN a tu correo registrado'
                : 'Completa los datos para restablecer tu contraseña'
              }
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Step 1: Request PIN */}
          {step === 1 && (
            <form onSubmit={handleRequestPin} className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    placeholder="Tu usuario o correo electrónico"
                    required
                    className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando PIN...
                  </div>
                ) : (
                  'Enviar PIN'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter PIN and new password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                  PIN de Verificación
                </label>
                <input
                  type="text"
                  id="pin"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  placeholder="Ingresa el PIN de 6 dígitos"
                  required
                  maxLength="6"
                  className="w-full px-4 py-3 text-gray-800  border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-wider"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength="6"
                  className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repite la nueva contraseña"
                  required
                  className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Restableciendo...
                    </div>
                  ) : (
                    'Restablecer Contraseña'
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Volver al Paso 1
                </button>
              </div>
            </form>
          )}

          {/* Back to login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Recordaste tu contraseña?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium transition-colors">
                Volver al Login
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Ayuda con el Restablecimiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Revisa tu Email</h3>
              <p className="text-gray-600 text-sm">
                El PIN se envía al correo registrado en tu cuenta
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">PIN Temporal</h3>
              <p className="text-gray-600 text-sm">
                El PIN tiene una validez de 15 minutos
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Seguro</h3>
              <p className="text-gray-600 text-sm">
                Tu nueva contraseña se guarda de forma segura
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
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