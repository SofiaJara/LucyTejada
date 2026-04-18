"use client";
import { useState, useEffect } from "react";

export default function TravelerForm({ index, travelerData, onUpdate, generos = [] }) {
  const [formData, setFormData] = useState({
    dni_viajero: travelerData?.dni_viajero || "",
    primer_nombre: travelerData?.primer_nombre || "",
    segundo_nombre: travelerData?.segundo_nombre || "",
    primer_apellido: travelerData?.primer_apellido || "",
    segundo_apellido: travelerData?.segundo_apellido || "",
    fecha_nacimiento: travelerData?.fecha_nacimiento || "",
    id_genero: travelerData?.id_genero || "",
    telefono: travelerData?.telefono || "",
    correo_electronico: travelerData?.correo_electronico || "",
    nombre_contacto: travelerData?.nombre_contacto || "",
    telefono_contacto: travelerData?.telefono_contacto || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Notificar al padre cuando cambie la data
    onUpdate(index, formData, errors);
  }, [formData, errors, index, onUpdate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validación básica
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "dni_viajero":
        if (!value.trim()) {
          newErrors.dni_viajero = "El DNI es obligatorio";
        } else if (!/^[0-9]+[a-zA-Z0-9]?$/.test(value)) {
          newErrors.dni_viajero = "El DNI solo puede contener números";
        } else {
          delete newErrors.dni_viajero;
        }
        break;
        case "telefono":
        if (value.trim() && !/^[0-9]+$/.test(value)) {
          newErrors.telefono = "El teléfono solo puede contener números";
        } else if (value.length > 20) {
          newErrors.telefono = "El teléfono no puede tener más de 20 dígitos";
        } else {
          delete newErrors.telefono;
        }
        break;
      case "primer_nombre":
        if (!value.trim()) {
          newErrors.primer_nombre = "El primer nombre es obligatorio";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors.primer_nombre = "El nombre solo puede contener letras";
        } else {
          delete newErrors.primer_nombre;
        }
        break;
      case "segundo_nombre":
        if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors.segundo_nombre = "El nombre solo puede contener letras";
        } else {
          delete newErrors.segundo_nombre;
        }
        break;
      case "primer_apellido":
        if (!value.trim()) {
          newErrors.primer_apellido = "El primer apellido es obligatorio";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors.primer_apellido = "El apellido solo puede contener letras";
        } else {
          delete newErrors.primer_apellido;
        }
        break;
      case "segundo_apellido":
        if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors.segundo_apellido = "El apellido solo puede contener letras";
        } else {
          delete newErrors.segundo_apellido;
        }
        break;
      case "fecha_nacimiento":
        if (!value) {
          newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
        } else {
          const fechaNacimiento = new Date(value);
          const fechaActual = new Date();
          const fechaMinima = new Date();
          fechaMinima.setMonth(fechaMinima.getMonth() - 1);
          const fechaMinima1915 = new Date("1915-01-01");
          
          if (fechaNacimiento > fechaActual) {
            newErrors.fecha_nacimiento = "La fecha de nacimiento no puede ser futura";
          } else if (fechaNacimiento > fechaMinima) {
            newErrors.fecha_nacimiento = "La fecha de nacimiento debe ser al menos 1 mes anterior";
          } else if (fechaNacimiento < fechaMinima1915) {
            newErrors.fecha_nacimiento = "La fecha de nacimiento no puede ser anterior a 1915";
          } else {
            delete newErrors.fecha_nacimiento;
          }
        }
        break;
      case "id_genero":
        if (!value) {
          newErrors.id_genero = "El género es obligatorio";
        } else {
          delete newErrors.id_genero;
        }
        break;
      case "correo_electronico":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.correo_electronico = "El correo electrónico no es válido";
        } else {
          delete newErrors.correo_electronico;
        }
        break;
      case "nombre_contacto":
        if (!value.trim()) {
          newErrors.nombre_contacto = "El nombre de contacto es obligatorio";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors.nombre_contacto = "El nombre de contacto solo puede contener letras";
        } else {
          delete newErrors.nombre_contacto;
        }
        break;
      case "telefono_contacto":
        if (!value.trim()) {
          newErrors.telefono_contacto = "El teléfono de contacto es obligatorio";
        } else if (!/^\d+$/.test(value)) {
          newErrors.telefono_contacto = "El teléfono solo puede contener números";
        } else if (value.length > 20) {
          newErrors.telefono_contacto = "El teléfono no puede tener más de 20 dígitos";
        } else {
          delete newErrors.telefono_contacto;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    return (
      formData.dni_viajero &&
      formData.primer_nombre &&
      formData.primer_apellido &&
      formData.fecha_nacimiento &&
      formData.id_genero &&
      formData.nombre_contacto &&
      formData.telefono_contacto &&
      Object.keys(errors).length === 0
    );
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        👤 Pasajero {index + 1}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DNI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI / Pasaporte <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="dni_viajero"
            value={formData.dni_viajero}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.dni_viajero ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: 12345678"
          />
          {errors.dni_viajero && (
            <p className="text-red-500 text-xs mt-1">{errors.dni_viajero}</p>
          )}
        </div>

        {/* Primer Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primer Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="primer_nombre"
            value={formData.primer_nombre}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.primer_nombre ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: Juan"
          />
          {errors.primer_nombre && (
            <p className="text-red-500 text-xs mt-1">{errors.primer_nombre}</p>
          )}
        </div>

        {/* Segundo Nombre (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Segundo Nombre
          </label>
          <input
            type="text"
            name="segundo_nombre"
            value={formData.segundo_nombre}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.segundo_nombre ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: Carlos"
          />
          {errors.segundo_nombre && (
            <p className="text-red-500 text-xs mt-1">{errors.segundo_nombre}</p>
          )}
        </div>

        {/* Primer Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primer Apellido <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="primer_apellido"
            value={formData.primer_apellido}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.primer_apellido ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: Pérez"
          />
          {errors.primer_apellido && (
            <p className="text-red-500 text-xs mt-1">{errors.primer_apellido}</p>
          )}
        </div>

        {/* Segundo Apellido (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Segundo Apellido
          </label>
          <input
            type="text"
            name="segundo_apellido"
            value={formData.segundo_apellido}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.segundo_apellido ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: García"
          />
          {errors.segundo_apellido && (
            <p className="text-red-500 text-xs mt-1">{errors.segundo_apellido}</p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.fecha_nacimiento ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fecha_nacimiento && (
            <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento}</p>
          )}
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género <span className="text-red-500">*</span>
          </label>
          <select
            name="id_genero"
            value={formData.id_genero}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.id_genero ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Seleccione género</option>
            {generos.map((genero) => (
              <option key={genero.id_genero} value={genero.id_genero}>
                {genero.descripcion_genero}
              </option>
            ))}
          </select>
          {errors.id_genero && (
            <p className="text-red-500 text-xs mt-1">{errors.id_genero}</p>
          )}
        </div>

        {/* Teléfono (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.telefono ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: 3001234567"
          />
          {errors.telefono && (
            <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
          )}
        </div>

        {/* Correo Electrónico (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="correo_electronico"
            value={formData.correo_electronico}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.correo_electronico ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: correo@ejemplo.com"
          />
          {errors.correo_electronico && (
            <p className="text-red-500 text-xs mt-1">{errors.correo_electronico}</p>
          )}
        </div>

        {/* Nombre de Contacto de Emergencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Contacto de Emergencia <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre_contacto"
            value={formData.nombre_contacto}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.nombre_contacto ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: María López"
          />
          {errors.nombre_contacto && (
            <p className="text-red-500 text-xs mt-1">{errors.nombre_contacto}</p>
          )}
        </div>

        {/* Teléfono de Contacto de Emergencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono de Contacto de Emergencia <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="telefono_contacto"
            value={formData.telefono_contacto}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.telefono_contacto ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: 3007654321"
          />
          {errors.telefono_contacto && (
            <p className="text-red-500 text-xs mt-1">{errors.telefono_contacto}</p>
          )}
        </div>
      </div>

      {/* Indicador de validación */}
      <div className="mt-4">
        {isFormValid() ? (
          <p className="text-green-600 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Formulario completo
          </p>
        ) : (
          <p className="text-orange-600 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Complete los campos obligatorios
          </p>
        )}
      </div>
    </div>
  );
}
