"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import CustomPopup from "../../components/CustomPopup";
import usePopup from "../../hooks/usePopup";
import API_URL from '@/utils/api';

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const { popupState, showConfirm, showSuccess, showError, closePopup } = usePopup();
  const [formData, setFormData] = useState({
    ciudad_origen: "",
    ciudad_destino: "",
    precio_primer_clase: "",
    precio_segunda_clase: ""
  });
  const [error, setError] = useState("");

  // Cargar ciudades y rutas desde la base de datos
  useEffect(() => {
    async function fetchData() {
      try {
        const resCiudades = await fetch(`${API_URL}/api/v1/ciudades`);
        const dataCiudades = await resCiudades.json();
        setCiudades(dataCiudades.data || []);

        const resRoutes = await fetch(`${API_URL}/api/v1/routes`, { credentials: "include" });
        const dataRoutes = await resRoutes.json();
        setRoutes(dataRoutes || []);
      } catch (err) {
        setError("Error al cargar datos");
      }
    }
    fetchData();
  }, []);

  // Validaciones de negocio
  function esRutaValida(origenId, destinoId) {
    const origen = ciudades.find(c => c.id_ciudad === parseInt(origenId));
    const destino = ciudades.find(c => c.id_ciudad === parseInt(destinoId));
    if (!origen || !destino) return false;
    // Nacional: ambos es_nacional === 1
    // Internacional: origen es_nacional === 1 y destino es_nacional === 0
    if (origen.es_nacional === 1 && destino.es_nacional === 1) return true;
    if (origen.es_nacional === 1 && destino.es_nacional === 0) return true;
    return false;
  }

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!formData.ciudad_origen || !formData.ciudad_destino) {
      setError("Debes seleccionar origen y destino");
      return;
    }
    if (!formData.precio_primer_clase || !formData.precio_segunda_clase) {
      setError("Debes ingresar ambos precios");
      return;
    }
    if (formData.ciudad_origen === formData.ciudad_destino) {
      setError("El origen y destino no pueden ser iguales");
      return;
    }
    if (!esRutaValida(formData.ciudad_origen, formData.ciudad_destino)) {
      setError("Solo se permiten rutas nacionales entre capitales o internacionales entre ciudades principales y destinos internacionales");
      return;
    }
    // Determinar tipo de ruta
    const origen = ciudades.find(c => c.id_ciudad === parseInt(formData.ciudad_origen));
    const destino = ciudades.find(c => c.id_ciudad === parseInt(formData.ciudad_destino));
    const es_nacional = (origen.es_nacional === 1 && destino.es_nacional === 1) ? 1 : 0;
    // Crear ruta en la base de datos
    try {
      const res = await fetch(`${API_URL}/api/v1/routes/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ciudad_origen: parseInt(formData.ciudad_origen),
          ciudad_destino: parseInt(formData.ciudad_destino),
          precio_primer_clase: parseFloat(formData.precio_primer_clase),
          precio_segunda_clase: parseFloat(formData.precio_segunda_clase),
          es_nacional
        })
      });
      if (res.ok) {
        // Recargar todas las rutas después de crear
        const resRoutes = await fetch(`${API_URL}/api/v1/routes`, { credentials: "include" });
        if (resRoutes.ok) {
          const dataRoutes = await resRoutes.json();
          if (Array.isArray(dataRoutes)) {
            setRoutes(dataRoutes);
          } else if (dataRoutes.data && Array.isArray(dataRoutes.data)) {
            setRoutes(dataRoutes.data);
          }
        }
        showSuccess('Ruta creada exitosamente');
        setShowModal(false);
        setFormData({
          ciudad_origen: "",
          ciudad_destino: "",
          precio_primer_clase: "",
          precio_segunda_clase: ""
        });
      } else {
        const errorData = await res.json();
        // Si el backend envía error de validación con fields, muestra el mensaje específico
        if (errorData?.fields && Array.isArray(errorData.fields) && errorData.fields.length > 0) {
          setError(errorData.fields[0].message || "Error al crear ruta");
        } else if (errorData?.error?.fields && Array.isArray(errorData.error.fields) && errorData.error.fields.length > 0) {
          setError(errorData.error.fields[0].message || "Error al crear ruta");
        } else {
          setError(errorData.error || "Error al crear ruta");
        }
      }
    } catch (err) {
      setError("Error de red al crear ruta");
    }
  };

  const handleDeleteRoute = async id_ruta => {
    showConfirm(
      '¿Estás seguro de que deseas eliminar esta ruta?',
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/v1/routes/${id_ruta}`, {
            method: "DELETE",
            credentials: "include"
          });
          if (res.ok) {
            setRoutes(prev => prev.filter(r => r.id_ruta !== id_ruta));
            showSuccess('Ruta eliminada exitosamente');
          } else {
            showError("No se pudo eliminar la ruta");
          }
        } catch (err) {
          showError("Error de red al eliminar ruta");
        }
      },
      'Eliminar Ruta',
      'Sí, eliminar',
      'Cancelar'
    );
  };

  const handleEditRoute = route => {
    setEditingRoute(route);
    setFormData({
      ciudad_origen: route.origen.id_ciudad,
      ciudad_destino: route.destino.id_ciudad,
      precio_primer_clase: route.precio_primer_clase,
      precio_segunda_clase: route.precio_segunda_clase
    });
    setShowModal(true);
  };

  const handleUpdateRoute = async e => {
    e.preventDefault();
    setError("");
    if (!formData.precio_primer_clase || !formData.precio_segunda_clase) {
      setError("Debes ingresar ambos precios");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/routes/${editingRoute.id_ruta}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          precio_primer_clase: parseFloat(formData.precio_primer_clase),
          precio_segunda_clase: parseFloat(formData.precio_segunda_clase)
        })
      });
      if (res.ok) {
        // Recargar todas las rutas después de actualizar
        const resRoutes = await fetch(`${API_URL}/api/v1/routes`, { credentials: "include" });
        if (resRoutes.ok) {
          const dataRoutes = await resRoutes.json();
          if (Array.isArray(dataRoutes)) {
            setRoutes(dataRoutes);
          } else if (dataRoutes.data && Array.isArray(dataRoutes.data)) {
            setRoutes(dataRoutes.data);
          }
        }
        showSuccess('Ruta actualizada exitosamente');
        setShowModal(false);
        setEditingRoute(null);
        setFormData({
          ciudad_origen: "",
          ciudad_destino: "",
          precio_primer_clase: "",
          precio_segunda_clase: ""
        });
      } else {
        setError("No se pudo actualizar la ruta");
      }
    } catch (err) {
      setError("Error de red al actualizar ruta");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Rutas</h1>
            <p className="text-gray-600 mt-2">
              Administra las rutas nacionales e internacionales disponibles para programar vuelos.
            </p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingRoute(null); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Nueva Ruta
          </button>
        </div>

        {/* Tabla de rutas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio 1ª Clase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio 2ª Clase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-800">
                      No hay rutas registradas.
                    </td>
                  </tr>
                ) : (
                  routes.map(route => (
                    <tr key={route.id_ruta} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{route.codigo_ruta}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{route.origen?.nombre_ciudad}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{route.destino?.nombre_ciudad}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${route.es_nacional ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                          {route.es_nacional ? "Nacional" : "Internacional"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">${route.precio_primer_clase}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">${route.precio_segunda_clase}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditRoute(route)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 text-xs font-medium mr-2"
                          title="Editar precios"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route.id_ruta)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 text-xs font-medium"
                          title="Eliminar ruta"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal para crear/editar ruta */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingRoute ? "Editar Precios de Ruta" : "Crear Nueva Ruta"}</h2>
              <form onSubmit={editingRoute ? handleUpdateRoute : handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Origen *</label>
                  <select
                    name="ciudad_origen"
                    value={formData.ciudad_origen}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!!editingRoute}
                    style={editingRoute ? { backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' } : {}}
                  >
                    <option value="">Selecciona ciudad origen</option>
                    {ciudades.filter(c => c.es_nacional === 1).map(city => (
                      <option key={city.id_ciudad} value={city.id_ciudad}>{city.nombre_ciudad}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destino *</label>
                  <select
                    name="ciudad_destino"
                    value={formData.ciudad_destino}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!!editingRoute}
                    style={editingRoute ? { backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' } : {}}
                  >
                    <option value="">Selecciona ciudad destino</option>
                    {ciudades.map(city => (
                      <option key={city.id_ciudad} value={city.id_ciudad}>{city.nombre_ciudad}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio 1ª Clase *</label>
                    <input
                      type="number"
                      name="precio_primer_clase"
                      value={formData.precio_primer_clase}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      onKeyDown={e => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio 2ª Clase *</label>
                    <input
                      type="number"
                      name="precio_segunda_clase"
                      value={formData.precio_segunda_clase}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      onKeyDown={e => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingRoute(null); setError(""); }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingRoute ? "Guardar Cambios" : "Crear Ruta"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
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
    </AdminLayout>
  );
}
