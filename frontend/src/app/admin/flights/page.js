'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { getCityTimezone } from '../../../utils/timezones';
import CustomPopup from '../../components/CustomPopup';
import usePopup from '../../hooks/usePopup';
import LoadingScreen from '../../components/LoadingScreen';
import API_URL from '@/utils/api';

export default function AdminFlights() {
  const router = useRouter();
  const [flights, setFlights] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingCcv, setPublishingCcv] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { popupState, showWarning, showSuccess, showError, showConfirm, closePopup } = usePopup();

  useEffect(() => {
    // Cargar vuelos y rutas del backend
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener vuelos
        const flightsResponse = await fetch(`${API_URL}/api/v1/flights`);
        if (flightsResponse.ok) {
          const flightsResult = await flightsResponse.json();
          console.log('Vuelos obtenidos:', flightsResult);
          
          let flightsData = [];
          if (flightsResult.success && flightsResult.data) {
            flightsData = flightsResult.data;
          } else if (Array.isArray(flightsResult)) {
            flightsData = flightsResult;
          }
          
          setFlights(flightsData);
          console.log('Vuelos cargados:', flightsData.length);
        } else {
          console.error('Error al obtener vuelos:', flightsResponse.status);
        }
        
        // Obtener rutas
        const resRoutes = await fetch(`${API_URL}/api/v1/routes`, { 
          credentials: 'include' 
        });
        
        if (!resRoutes.ok) {
          console.error('Error al obtener rutas:', resRoutes.status, resRoutes.statusText);
          setRoutes([]);
          return;
        }
        
        const dataRoutes = await resRoutes.json();
        console.log('Rutas obtenidas:', dataRoutes);
        
        if (Array.isArray(dataRoutes)) {
          setRoutes(dataRoutes);
          console.log('Rutas cargadas:', dataRoutes.length);
        } else if (dataRoutes.data && Array.isArray(dataRoutes.data)) {
          setRoutes(dataRoutes.data);
          console.log('Rutas cargadas:', dataRoutes.data.length);
        } else {
          console.warn('Formato de respuesta inesperado:', dataRoutes);
          setRoutes([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showError('Error al cargar los datos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función para obtener la duración del vuelo desde el grafo
  const getFlightDuration = async (origen, destino) => {
    try {
      if (!origen || !destino) return null;
      
      const response = await fetch(
        `${API_URL}/api/v1/flight-durations/duration?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`
      );

      if (response.ok) {
        const result = await response.json();
        return {
          minutos: result.data.duracion_minutos,
          formateada: result.data.duracion_formateada
        };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo duración:', error);
      return null;
    }
  };

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = 
      flight.ccv?.toString().includes(searchTerm.toLowerCase()) ||
      flight.ruta?.codigo_ruta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.ruta?.origen?.nombre_ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.ruta?.destino?.nombre_ciudad?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Mapear estado numérico a string para el filtro
    let flightStatus = 'active';
    if (flight.estado === 0) flightStatus = 'ended';
    
    const matchesFilter = filterStatus === 'all' || flightStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (flight) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' },
      sold_out: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Agotado' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
      ended: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Finalizado' },
      delayed: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Retrasado' }
    };
    
    // Determinar el estado basado en los datos del vuelo
    let status = 'active';
    if (flight.estado === 0) status = 'ended';
    //else if (flight.available_seats === 0) status = 'sold_out';
    
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Función para formatear hora con información de timezone
  const formatTimeWithTimezone = (dateString, ciudad) => {
    if (!dateString || !ciudad) return null;
    
    const date = new Date(dateString);
    const offset = getCityTimezone(ciudad);
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
    
    // Ajustar la hora según el offset de la ciudad
    // La fecha viene en UTC, la ajustamos al timezone local de la ciudad
    const localDate = new Date(date.getTime() + offset * 60 * 60 * 1000);
    
    // Hora local ajustada al timezone de la ciudad
    const horaLocal = localDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC' // Usamos UTC porque ya ajustamos manualmente
    });
    
    // Hora UTC (sin ajuste)
    const horaUTC = date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC'
    });
    
    return {
      local: horaLocal,
      utc: horaUTC,
      offset: offsetStr,
      fecha: localDate.toLocaleDateString('es-ES', { timeZone: 'UTC' })
    };
  };

  const handleEdit = (flight) => {
    setEditingFlight(flight);
    setShowModal(true);
  };

  const handleDelete = async (flightId) => {
    showConfirm(
      '¿Estás seguro de que quieres cancelar este vuelo? Esta acción no se puede deshacer.',
      async () => {
        try {
          const response = await fetch(`${API_URL}/api/v1/flights/${flightId}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (response.ok) {
            const result = await response.json();
            showSuccess(result.message || 'Vuelo eliminado exitosamente');
            
            setFlights(flights.filter(f => f.ccv !== flightId));
          } else {
            const error = await response.json();
            console.error('Error canceling flight:', error);

            let errorMessage = 'Error al cancelar el vuelo';
            if (error.details) {
              errorMessage = error.details;
            } else if (error.error) {
              errorMessage = error.error;
            }
            
            showError(errorMessage);
          }
        } catch (error) {
          console.error('Network error:', error);
          showError('Error de conexión al intentar cancelar el vuelo: ' + error.message);
        }
      },
      '¿Cancelar vuelo?',
      'Sí, cancelar',
      'No'
    );
  };

  const handlePublish = async (flight) => {
    showConfirm(
      `¿Enviar promoción por correo para el vuelo #${flight.ccv}?`,
      async () => {
        try {
          setPublishingCcv(flight.ccv);
          const response = await fetch(`${API_URL}/api/v1/flights/publish-promotion/${flight.ccv}`, {
            method: 'POST',
            credentials: 'include'
          });

          if (response.ok) {
            const result = await response.json().catch(() => ({}));
            showSuccess(result.message || 'Promoción publicada correctamente');
          } else {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            const message = errorData.error || errorData.message || `Error ${response.status}`;
            showError('Error al publicar promoción: ' + message);
          }
        } catch (err) {
          console.error('Network error publishing promotion:', err);
          showError('Error de conexión al publicar la promoción: ' + (err.message || err));
        } finally {
          setPublishingCcv(null);
        }
      },
      'Publicar Promoción',
      'Sí, enviar',
      'Cancelar'
    );
  };

  const FlightModal = () => {
    // Obtener fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Obtener fecha y hora actual en formato para datetime-local
    const now = new Date();
    const currentDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    const [formData, setFormData] = useState(editingFlight || {
      ruta_relacionada: '',
      fecha_vuelo: '',
      hora_salida_vuelo: '',
      porcentaje_promocion: 0,
      estado: 1
    });

    const [horaLlegadaCalculada, setHoraLlegadaCalculada] = useState(null);
    const [duracionVuelo, setDuracionVuelo] = useState(null);

    // Función para calcular la hora de llegada usando el grafo
    const calcularHoraLlegada = async (rutaId, horaSalida) => {
      if (!rutaId || !horaSalida) {
        setHoraLlegadaCalculada(null);
        setDuracionVuelo(null);
        return;
      }

      try {
        const ruta = routes.find(r => r.id_ruta === parseInt(rutaId));
        if (!ruta) return;

        const origen = ruta.origen?.nombre_ciudad;
        const destino = ruta.destino?.nombre_ciudad;

        if (!origen || !destino) return;

        // Llamar al backend para obtener la duración
        const response = await fetch(
          `${API_URL}/api/v1/flight-durations/duration?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`
        );

        if (response.ok) {
          const result = await response.json();
          const duracionMinutos = result.data.duracion_minutos;
          
          // Calcular hora de llegada
          const salida = new Date(horaSalida);
          const llegada = new Date(salida.getTime() + duracionMinutos * 60000);
          
          setHoraLlegadaCalculada(llegada);
          setDuracionVuelo(result.data.duracion_formateada);
        } else {
          console.error('Error al obtener duración del vuelo');
          setHoraLlegadaCalculada(null);
          setDuracionVuelo(null);
        }
      } catch (error) {
        console.error('Error calculando hora de llegada:', error);
        setHoraLlegadaCalculada(null);
        setDuracionVuelo(null);
      }
    };

    // Efecto para calcular hora de llegada cuando cambien ruta o hora de salida
    useEffect(() => {
      if (formData.ruta_relacionada && formData.hora_salida_vuelo) {
        calcularHoraLlegada(formData.ruta_relacionada, formData.hora_salida_vuelo);
      }
    }, [formData.ruta_relacionada, formData.hora_salida_vuelo]);

    // Función para manejar el cambio de fecha de vuelo
    const handleFechaVueloChange = (newDate) => {
      setFormData({
        ...formData,
        fecha_vuelo: newDate,
        // Limpiar las horas si se cambia la fecha para forzar nueva selección con restricciones actualizadas
        hora_salida_vuelo: ''
      });
    };

    // Función para obtener el mínimo datetime para hora de salida basado en la fecha de vuelo
    const getMinSalidaDateTime = () => {
      if (!formData.fecha_vuelo || !formData.ruta_relacionada) return currentDateTime;
      
      // Buscar la ruta seleccionada para verificar si es nacional o internacional
      const rutaSeleccionada = routes.find(r => r.id_ruta === parseInt(formData.ruta_relacionada));
      
      // Si la fecha de vuelo es hoy, aplicar restricciones de tiempo según el tipo de ruta
      if (formData.fecha_vuelo === today) {
        const ahora = new Date();
        let horasMinimas = 1; // Por defecto 1 hora para nacional
        
        if (rutaSeleccionada) {
          // Si es internacional, mínimo 3 horas de anticipación
          // Si es nacional, mínimo 1 hora de anticipación
          horasMinimas = rutaSeleccionada.es_nacional ? 1 : 3;
        }
        
        // Calcular la hora mínima agregando las horas necesarias
        const horaMinima = new Date(ahora.getTime() + horasMinimas * 60 * 60 * 1000);
        
        // Formatear al formato requerido por datetime-local
        const year = horaMinima.getFullYear();
        const month = String(horaMinima.getMonth() + 1).padStart(2, '0');
        const day = String(horaMinima.getDate()).padStart(2, '0');
        const hours = String(horaMinima.getHours()).padStart(2, '0');
        const minutes = String(horaMinima.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      
      // Si es una fecha futura, permitir desde las 00:00 de ese día
      return `${formData.fecha_vuelo}T00:00`;
    };

    // Función para obtener el máximo datetime para hora de salida (final del día de vuelo)
    const getMaxSalidaDateTime = () => {
      if (!formData.fecha_vuelo) return undefined;
      return `${formData.fecha_vuelo}T23:59`;
    };

    // Función para obtener el mínimo datetime para hora de llegada
    const getMinLlegadaDateTime = () => {
      if (!formData.hora_salida_vuelo) return undefined;
      return formData.hora_salida_vuelo;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validación adicional para crear vuelo
      if (!editingFlight) {
        // Validar que se haya calculado la hora de llegada
        if (!horaLlegadaCalculada) {
          showWarning('No se pudo calcular la hora de llegada. Verifica que la ruta y hora de salida sean correctas.', '⚠️ Error');
          return;
        }

        // Validar la anticipación mínima según el tipo de ruta
        const rutaSeleccionada = routes.find(r => r.id_ruta === parseInt(formData.ruta_relacionada));
        const ahora = new Date();
        const horaSalida = new Date(formData.hora_salida_vuelo);
        const diferenciaHoras = (horaSalida - ahora) / (1000 * 60 * 60);

        if (rutaSeleccionada) {
          const horasMinimas = rutaSeleccionada.es_nacional ? 1 : 3;
          const tipoRuta = rutaSeleccionada.es_nacional ? 'nacional' : 'internacional';
          
          if (diferenciaHoras < horasMinimas) {
            showWarning(`Para vuelos ${tipoRuta}es, la hora de salida debe ser al menos ${horasMinimas} hora${horasMinimas > 1 ? 's' : ''} mayor a la hora actual.\n\nHora actual: ${ahora.toLocaleString('es-ES')}\nAnticipación requerida: ${horasMinimas} hora${horasMinimas > 1 ? 's' : ''}`, '⚠️ Error de Anticipación');
            return;
          }
        }
      }
      
      try {
        if (editingFlight) {
          // Actualizar solo el porcentaje de promoción
          const updateData = {
            porcentaje_promocion: parseFloat(formData.porcentaje_promocion) || 0
          };

          console.log('Actualizando vuelo:', editingFlight.ccv, updateData);

          const response = await fetch(`${API_URL}/api/v1/flights/${editingFlight.ccv}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updateData)
          });

          if (response.ok) {
            const result = await response.json();
            showSuccess('Descuento aplicado exitosamente');
            
            // Recargar vuelos
            const flightsResponse = await fetch(`${API_URL}/api/v1/flights`);
            if (flightsResponse.ok) {
              const flightsResult = await flightsResponse.json();
              if (flightsResult.success && flightsResult.data) {
                setFlights(flightsResult.data);
              } else if (Array.isArray(flightsResult)) {
                setFlights(flightsResult);
              }
            }
            
            setShowModal(false);
            setEditingFlight(null);
          } else {
            const error = await response.json();
            console.error('Error updating flight:', error);
            
            let errorMessage = 'Error al actualizar el vuelo';
            if (error.details && Array.isArray(error.details)) {
              const detailedErrors = error.details.map(d => `- ${d.path?.join('.')}: ${d.message}`).join('\n');
              errorMessage = `Error de validación:\n${detailedErrors}`;
            } else if (error.error) {
              errorMessage = error.error;
            }
            
            showError(errorMessage);
          }
        } else {
          // Crear nuevo vuelo
          // Convertir formatos de fecha/hora al formato esperado por el backend
          const formatDateTime = (dateTimeStr) => {
            // Convierte "2024-10-28T14:30" a "2024-10-28 14:30:00"
            const date = new Date(dateTimeStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = '00';
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          };

          const flightData = {
            ruta_relacionada: parseInt(formData.ruta_relacionada),
            fecha_vuelo: formData.fecha_vuelo, // Ya está en formato YYYY-MM-DD
            hora_salida_vuelo: formatDateTime(formData.hora_salida_vuelo),
            hora_llegada_vuelo: formatDateTime(horaLlegadaCalculada.toISOString().slice(0, 16)), // Hora calculada desde el grafo
            estado: parseInt(formData.estado),
            porcentaje_promocion: parseFloat(formData.porcentaje_promocion) || 0
          };

          console.log('Datos a enviar:', flightData);

          const response = await fetch(`${API_URL}/api/v1/flights`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Para enviar cookies de autenticación
            body: JSON.stringify(flightData)
          });

          if (response.ok) {
            const result = await response.json();
            showSuccess('Vuelo creado exitosamente');
            
            // Recargar vuelos
            const flightsResponse = await fetch(`${API_URL}/api/v1/flights/admin`);
            if (flightsResponse.ok) {
              const flightsResult = await flightsResponse.json();
              if (flightsResult.success && flightsResult.data) {
                setFlights(flightsResult.data);
              } else if (Array.isArray(flightsResult)) {
                setFlights(flightsResult);
              }
            }
            
            setShowModal(false);
            setEditingFlight(null);
          } else {
            const error = await response.json();
            console.error('Error creating flight:', error);
            
            // Mostrar detalles del error si están disponibles
            let errorMessage = 'Error al crear el vuelo';
            if (error.details && Array.isArray(error.details)) {
              const detailedErrors = error.details.map(d => `- ${d.path?.join('.')}: ${d.message}`).join('\n');
              errorMessage = `Error de validación:\n${detailedErrors}`;
            } else if (error.error) {
              errorMessage = error.error;
            }
            
            showError(errorMessage);
          }
        }
      } catch (error) {
        console.error('Network error:', error);
        showError('Error de conexión al crear el vuelo: ' + error.message);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingFlight ? 'Aplicar Descuento al Vuelo' : 'Nuevo Vuelo'}
            </h3>
            
            {editingFlight && (
              <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Vuelo #{editingFlight.ccv}</strong><br/>
                      Ruta: {editingFlight.ruta?.codigo_ruta} - {editingFlight.ruta?.origen?.nombre_ciudad} → {editingFlight.ruta?.destino?.nombre_ciudad}<br/>
                      Descuento actual: <strong>{editingFlight.porcentaje_promocion}%</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!editingFlight && routes.length === 0 && (
              <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>No hay rutas disponibles.</strong> Debes crear al menos una ruta antes de crear un vuelo.
                      Ve a la sección de <strong>Rutas</strong> primero.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {editingFlight ? (
                // Modo edición: solo mostrar campo de descuento
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Porcentaje de Descuento (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.porcentaje_promocion}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Limitar el valor entre 0 y 100
                      if (value === "") value = "";
                      else {
                        value = Math.max(0, Math.min(100, Number(value)));
                      }
                      setFormData({...formData, porcentaje_promocion: value});
                    }}
                    onKeyDown={e => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Ejemplo: 15 (para 15% de descuento)"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    💡 Ingresa 0 para eliminar el descuento. Máximo 100%.
                  </p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Vista previa de precios con descuento:</strong>
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-700">
                        Primera clase: 
                        <span className="line-through text-gray-500 ml-2">
                          ${editingFlight.ruta?.precio_primer_clase}
                        </span>
                        <span className="text-blue-600 font-medium ml-2">
                          ${((editingFlight.ruta?.precio_primer_clase || 0) * (1 - (formData.porcentaje_promocion || 0) / 100)).toFixed(2)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-700">
                        Segunda clase: 
                        <span className="line-through text-gray-500 ml-2">
                          ${editingFlight.ruta?.precio_segunda_clase}
                        </span>
                        <span className="text-green-600 font-medium ml-2">
                          ${((editingFlight.ruta?.precio_segunda_clase || 0) * (1 - (formData.porcentaje_promocion || 0) / 100)).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Modo creación: mostrar todos los campos
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Ruta *
                  </label>
                  <select
                    value={formData.ruta_relacionada}
                    onChange={(e) => {
                      // Al cambiar la ruta, limpiar las horas para que se apliquen las nuevas restricciones
                      setFormData({
                        ...formData, 
                        ruta_relacionada: e.target.value,
                        hora_salida_vuelo: ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                    disabled={routes.length === 0}
                  >
                    <option value="">
                      {routes.length === 0 ? 'No hay rutas disponibles' : 'Selecciona una ruta'}
                    </option>
                    {routes.map((route) => (
                      <option key={route.id_ruta} value={route.id_ruta}>
                        {route.codigo_ruta} - {route.origen?.nombre_ciudad || route.origen?.id_ciudad || 'N/A'} → {route.destino?.nombre_ciudad || route.destino?.id_ciudad || 'N/A'}
                        {' '}({route.es_nacional ? 'Nacional' : 'Internacional'})
                      </option>
                    ))}
                  </select>
                  {routes.length === 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      ⚠️ Debes crear al menos una ruta antes de crear un vuelo
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Fecha de Vuelo *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_vuelo}
                    min={today}
                    onChange={(e) => handleFechaVueloChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Selecciona primero la fecha del vuelo para configurar las horas
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Estado *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="1">Activo</option>
                    <option value="0">Finalizado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Hora de Salida *
                    {formData.ruta_relacionada && routes.find(r => r.id_ruta === parseInt(formData.ruta_relacionada))?.origen?.nombre_ciudad && (
                      <span className="ml-2 text-xs text-blue-600">
                        🌍 {routes.find(r => r.id_ruta === parseInt(formData.ruta_relacionada))?.origen?.nombre_ciudad}
                      </span>
                    )}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.hora_salida_vuelo}
                    min={getMinSalidaDateTime()}
                    max={getMaxSalidaDateTime()}
                    onChange={(e) => {
                      const newSalida = e.target.value;
                      setFormData({...formData, hora_salida_vuelo: newSalida});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                    disabled={!formData.fecha_vuelo || !formData.ruta_relacionada}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {!formData.fecha_vuelo 
                      ? '⚠️ Primero selecciona la fecha de vuelo' 
                      : !formData.ruta_relacionada
                      ? '⚠️ Primero selecciona una ruta'
                      : (() => {
                          const rutaSeleccionada = routes.find(r => r.id_ruta === parseInt(formData.ruta_relacionada));
                          if (rutaSeleccionada && formData.fecha_vuelo === today) {
                            const horasMinimas = rutaSeleccionada.es_nacional ? 1 : 3;
                            return `📅 ${rutaSeleccionada.es_nacional ? 'Vuelo nacional' : 'Vuelo internacional'}: mínimo ${horasMinimas} hora${horasMinimas > 1 ? 's' : ''} de anticipación`;
                          }
                          return 'Debe estar dentro del día seleccionado';
                        })()
                    }
                  </p>
                </div>
                
                {/* Campo informativo de hora de llegada calculada */}
                {horaLlegadaCalculada && duracionVuelo && (
                  <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-blue-800">
                          ✈️ Hora de Llegada Calculada Automáticamente
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p className="font-semibold">
                            🕐 Llegada estimada: {horaLlegadaCalculada.toLocaleString('es-ES', { 
                              dateStyle: 'short', 
                              timeStyle: 'short' 
                            })}
                          </p>
                          <p className="mt-1">
                            ⏱️ Duración del vuelo: <span className="font-medium">{duracionVuelo}</span>
                          </p>
                          {formData.ruta_relacionada && routes.find(r => r.id_ruta === parseInt(formData.ruta_relacionada))?.destino?.nombre_ciudad && (
                            <p className="mt-1">
                              📍 Destino: <span className="font-medium">
                                {routes.find(r => r.id_ruta === parseInt(formData.ruta_relacionada))?.destino?.nombre_ciudad}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Campo informativo de cantidad de asientos */}
                {formData.ruta_relacionada && (
                  <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-green-800">
                          💺 Capacidad de Asientos
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p className="font-semibold">
                            {(() => {
                              const rutaSeleccionada = routes.find(r => r.id_ruta === parseInt(formData.ruta_relacionada));
                              const cantidadAsientos = rutaSeleccionada?.es_nacional ? 150 : 250;
                              const tipoVuelo = rutaSeleccionada?.es_nacional ? 'Nacional' : 'Internacional';
                              return `Total de asientos: ${cantidadAsientos} (Vuelo ${tipoVuelo})`;
                            })()}
                          </p>
                          <p className="mt-1 text-xs text-green-600">
                            ℹ️ La cantidad de asientos se asigna automáticamente según el tipo de ruta
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Porcentaje de Promoción (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.porcentaje_promocion}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Limitar el valor entre 0 y 100
                      if (value === "") value = "";
                      else {
                        value = Math.max(0, Math.min(100, Number(value)));
                      }
                      setFormData({...formData, porcentaje_promocion: value});
                    }}
                    onKeyDown={e => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="0 = Sin promoción"
                  />
                </div>
              </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFlight(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!editingFlight && routes.length === 0}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    (!editingFlight && routes.length === 0)
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {editingFlight ? 'Aplicar Descuento' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingScreen message="Cargando vuelos..." />;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Vuelos</h1>
          <p className="text-gray-600 mt-2">Administra todos los vuelos de Aero Penguin</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-1">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por código de vuelo, ruta, origen o destino..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 mr-4 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="sold_out">Agotados</option>
                <option value="cancelled">Cancelados</option>
                <option value="delayed">Retrasados</option>
                <option value="ended">Finalizados</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Nuevo Vuelo
            </button>
          </div>
        </div>

        {/* Tabla de vuelos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vuelo
                  </th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="w-44 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salida
                  </th>
                  <th className="w-44 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Llegada
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asientos
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="w-64 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFlights.map((flight) => {
                  const departure = formatDateTime(flight.hora_salida_vuelo);
                  
                  // Calcular hora de llegada y duración usando el grafo
                  let llegadaCalculada = null;
                  let duracionMinutos = null;
                  let duracionFormateada = 'N/A';
                  
                  if (flight.hora_salida_vuelo && flight.ruta?.origen?.nombre_ciudad && flight.ruta?.destino?.nombre_ciudad) {
                    // Obtener duración desde el grafo de forma síncrona (ya cargado)
                    fetch(`${API_URL}/api/v1/flight-durations/duration?origen=${encodeURIComponent(flight.ruta.origen.nombre_ciudad)}&destino=${encodeURIComponent(flight.ruta.destino.nombre_ciudad)}`)
                      .then(res => res.json())
                      .then(result => {
                        if (result.success && result.data) {
                          const minutos = result.data.duracion_minutos;
                          const salidaDate = new Date(flight.hora_salida_vuelo);
                          const llegadaDate = new Date(salidaDate.getTime() + minutos * 60000);
                          
                          // Actualizar el DOM directamente para este vuelo
                          const arriboCells = document.querySelectorAll(`[data-flight-arrival="${flight.ccv}"]`);
                          const duracionCells = document.querySelectorAll(`[data-flight-duration="${flight.ccv}"]`);
                          
                          arriboCells.forEach(cell => {
                            const arrivalFormatted = formatDateTime(llegadaDate.toISOString());
                            const llegadaTimezone = formatTimeWithTimezone(llegadaDate.toISOString(), flight.ruta.destino.nombre_ciudad);
                            
                            cell.innerHTML = `
                              <div class="text-sm text-gray-900">${arrivalFormatted.date}</div>
                              <div class="text-sm font-medium text-gray-900">${arrivalFormatted.time}</div>
                              <div class="mt-1 pt-1 border-t border-gray-200">
                                <div class="text-xs font-semibold text-purple-700">
                                  🛬 ${flight.ruta.destino.nombre_ciudad}
                                </div>
                                <div class="text-xs text-purple-600">
                                  Local: ${llegadaTimezone.local} (UTC${llegadaTimezone.offset})
                                </div>
                              </div>
                            `;
                          });
                          
                          duracionCells.forEach(cell => {
                            const horas = Math.floor(minutos / 60);
                            const mins = minutos % 60;
                            let duracionTexto = '';
                            if (horas === 0) duracionTexto = `${mins}min`;
                            else if (mins === 0) duracionTexto = `${horas}h`;
                            else duracionTexto = `${horas}h ${mins}min`;
                            
                            cell.innerHTML = `
                              <div class="text-sm font-medium text-gray-900">
                                ⏱️ ${duracionTexto}
                              </div>
                              <div class="text-xs text-gray-500 mt-1">
                                ${minutos} minutos
                              </div>
                            `;
                          });
                        }
                      })
                      .catch(err => console.error('Error calculando duración:', err));
                  }
                  
                  // Obtener información de timezone para salida
                  const salidaTimezone = formatTimeWithTimezone(
                    flight.hora_salida_vuelo, 
                    flight.ruta?.origen?.nombre_ciudad
                  );

                  const formatDuracion = (minutos) => {
                    if (!minutos) return 'N/A';
                    const horas = Math.floor(minutos / 60);
                    const mins = minutos % 60;
                    if (horas === 0) return `${mins}min`;
                    if (mins === 0) return `${horas}h`;
                    return `${horas}h ${mins}min`;
                  };
                  
                  // Calcular precios con descuento si hay promoción
                  const precioClase1 = flight.porcentaje_promocion 
                    ? (flight.ruta?.precio_primer_clase * (1 - flight.porcentaje_promocion / 100)).toFixed(2)
                    : flight.ruta?.precio_primer_clase;
                  
                  const precioClase2 = flight.porcentaje_promocion 
                    ? (flight.ruta?.precio_segunda_clase * (1 - flight.porcentaje_promocion / 100)).toFixed(2)
                    : flight.ruta?.precio_segunda_clase;
                  
                  return (
                    <tr key={flight.ccv} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{flight.ccv}</div>
                        {flight.porcentaje_promocion > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            -{flight.porcentaje_promocion}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate">{flight.ruta?.codigo_ruta || 'N/A'}</div>
                        <div className="text-xs text-gray-900 truncate">
                          {flight.ruta?.origen?.nombre_ciudad || 'N/A'} → {flight.ruta?.destino?.nombre_ciudad || 'N/A'}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          flight.ruta?.es_nacional ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {flight.ruta?.es_nacional ? 'Nacional' : 'Internacional'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{departure.date}</div>
                        <div className="text-sm font-medium text-gray-900">{departure.time}</div>
                        {salidaTimezone && (
                          <div className="mt-1 pt-1 border-t border-gray-200">
                            <div className="text-xs font-semibold text-blue-700 truncate">
                              🛫 {flight.ruta?.origen?.nombre_ciudad || 'N/A'}
                            </div>
                            <div className="text-xs text-blue-600">
                              {salidaTimezone.local} (UTC{salidaTimezone.offset})
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4" data-flight-arrival={flight.ccv}>
                        <div className="text-sm text-gray-500">Calculando...</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" data-flight-duration={flight.ccv}>
                        <div className="text-sm text-gray-500">Calculando...</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">1ª: ${precioClase1}</div>
                        <div className="text-sm font-medium text-green-600">2ª: ${precioClase2}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          💺 {flight.asientos || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {flight.ruta?.es_nacional ? 'Nacional' : 'Internacional'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(flight)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => router.push(`/admin/flights/${flight.ccv}/seats`)}
                            className="text-purple-600 hover:text-purple-900 text-left"
                          >
                            💺 Ver Asientos
                          </button>
                          <button
                            onClick={() => router.push(`/admin/flights/${flight.ccv}/reservations`)}
                            className="text-indigo-600 hover:text-indigo-900 text-left"
                          >
                            📋 Ver Reservas
                          </button>
                          <button
                            onClick={() => handleEdit(flight)}
                            className="text-blue-600 hover:text-blue-900 text-left"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handlePublish(flight)}
                            disabled={publishingCcv === flight.ccv}
                            className={`text-left ${publishingCcv === flight.ccv ? 'text-gray-400' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {publishingCcv === flight.ccv ? 'Enviando...' : '📣 Publicar'}
                          </button>
                          <button
                            onClick={() => handleDelete(flight.ccv)}
                            className="text-red-600 hover:text-red-900 text-left"
                          >
                            🗑️ Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredFlights.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron vuelos con los filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && <FlightModal />}
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