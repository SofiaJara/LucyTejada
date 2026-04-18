'use client';
import { useState, useEffect } from 'react';

export default function AdminForm({ admin, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState({
    usuario: '',
    correo_electronico: '',
    contrasena: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when admin prop changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (admin) {
        // Editing existing admin
        setFormData({
          usuario: admin.descripcion_usuario || '',
          correo_electronico: admin.correo_electronico || '',
          contrasena: '' // Don't pre-fill password for security
        });
      } else {
        // Creating new admin
        setFormData({
          usuario: '',
          correo_electronico: '',
          contrasena: ''
        });
      }
      setErrors({});
    }
  }, [admin, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El usuario es requerido';
    }

    if (!formData.correo_electronico.trim()) {
      newErrors.correo_electronico = 'El correo electrónico es requerido';
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo_electronico)) {
        newErrors.correo_electronico = 'Formato de correo electrónico inválido';
      }
    }

    if (!admin && !formData.contrasena.trim()) {
      newErrors.contrasena = 'La contraseña es requerida para nuevos usuarios';
    }

    if (formData.contrasena && formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving admin:', error);
      
      // Manejar errores de validación específicos del backend
      if (error.validationErrors) {
        setErrors(prev => ({
          ...prev,
          ...error.validationErrors
        }));
      } else {
        setErrors({ submit: error.message || 'Error al guardar el administrador' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {admin ? 'Editar Administrador' : 'Crear Nuevo Administrador'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Cuenta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    id="usuario"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.usuario ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de usuario"
                  />
                  {errors.usuario && <p className="mt-1 text-sm text-red-600">{errors.usuario}</p>}
                </div>

                <div>
                  <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="correo_electronico"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.correo_electronico ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.correo_electronico && <p className="mt-1 text-sm text-red-600">{errors.correo_electronico}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {!admin && '*'}
                </label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contrasena ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={admin ? "Dejar vacío para mantener la actual" : "Contraseña"}
                />
                {errors.contrasena && <p className="mt-1 text-sm text-red-600">{errors.contrasena}</p>}
              </div>
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : (admin ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}