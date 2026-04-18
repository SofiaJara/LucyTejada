'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../../components/AdminLayout';
import CustomPopup from '../../../../components/CustomPopup';
import usePopup from '../../../../hooks/usePopup';
import LoadingScreen from '../../../../components/LoadingScreen';
import API_URL from '@/utils/api';

export default function FlightReservations() {
  const router = useRouter();
  const params = useParams();
  const flightId = params.flightId;
  
  const [loading, setLoading] = useState(true);
  const [vuelo, setVuelo] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { popupState, showSuccess, showError, closePopup } = usePopup();

  useEffect(() => {
    loadFlightReservations();
  }, [flightId]);

  const loadFlightReservations = async () => {
    try {
      setLoading(true);

      // Cargar información del vuelo
      const flightResponse = await fetch(`${API_URL}/api/v1/flights/${flightId}`, {
        credentials: 'include'
      });
      if (!flightResponse.ok) throw new Error('Error al cargar vuelo');
      
      const flightResult = await flightResponse.json();
      const flightData = flightResult.success ? flightResult.data : flightResult;
      setVuelo(flightData);

      // Cargar reservas del vuelo
      const reservasResponse = await fetch(`${API_URL}/api/v1/reservas/vuelo/${flightId}`, {
        credentials: 'include'
      });
      if (!reservasResponse.ok) throw new Error('Error al cargar reservas');
      
      const reservasResult = await reservasResponse.json();
      const reservasData = reservasResult.success ? reservasResult.data : reservasResult;
      
      // Obtener todos los usuarios primero (una sola llamada)
      const usersResponse = await fetch(`${API_URL}/api/v1/users`, {
        credentials: 'include'
      });
      const allUsers = usersResponse.ok ? await usersResponse.json() : [];
      
      // Obtener todos los asientos del vuelo (una sola llamada)
      const asientosResponse = await fetch(`${API_URL}/api/v1/asientos/${flightId}`, {
        credentials: 'include'
      });
      const allAsientos = asientosResponse.ok ? await asientosResponse.json() : [];
      console.log('Asientos del vuelo:', allAsientos);
      
      // Enriquecer cada reserva con datos del usuario y segmentos/viajeros
      const reservasEnriquecidas = await Promise.all(
        (reservasData || []).map(async (reserva) => {
          try {
            console.log('Procesando reserva:', reserva.id_reserva);
            
            // Buscar usuario en la lista
            const usuario = allUsers.find(u => u.id_usuario === reserva.usuario_id);
            console.log('Usuario encontrado:', usuario);
            
            // Obtener segmentos de viaje de la reserva (incluye viajeros y asientos)
            const segmentosResponse = await fetch(`${API_URL}/api/v1/segmentos-viaje/reserva/${reserva.id_reserva}`, {
              credentials: 'include'
            });
            const segmentosResult = segmentosResponse.ok ? await segmentosResponse.json() : {};
            const segmentos = segmentosResult.success ? segmentosResult.data : (Array.isArray(segmentosResult) ? segmentosResult : []);
            console.log(`Reserva ${reserva.id_reserva} - Segmentos completos:`, segmentos);
            console.log(`Reserva ${reserva.id_reserva} - IDs de vuelos en segmentos:`, segmentos.map(s => s.vuelo_id));
            console.log(`Reserva ${reserva.id_reserva} - Buscando vuelo_id: ${flightId} (tipo: ${typeof flightId})`);
            
            // Filtrar solo los segmentos de este vuelo y extraer viajeros con sus asientos
            const segmentosVuelo = segmentos.filter(s => {
              console.log(`Comparando ${s.vuelo_id} (${typeof s.vuelo_id}) === ${parseInt(flightId)} (${typeof parseInt(flightId)})`);
              return s.vuelo_id === parseInt(flightId);
            });
            console.log(`Reserva ${reserva.id_reserva} - Segmentos del vuelo ${flightId}:`, segmentosVuelo);
            
            const viajeros = segmentosVuelo.map(segmento => ({
              ...segmento.viajero,
              asiento: segmento.asiento?.asiento || null
            }));
            
            console.log(`Reserva ${reserva.id_reserva} - Viajeros con asientos:`, viajeros);
            console.log(`Reserva ${reserva.id_reserva} - Asientos:`, viajeros.map(v => v.asiento).filter(Boolean));
            
            return {
              ...reserva,
              usuario: usuario,
              viajeros: viajeros
            };
          } catch (err) {
            console.error('Error enriqueciendo reserva:', err);
            return reserva;
          }
        })
      );
      
      setReservas(reservasEnriquecidas);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'No se pudieron cargar las reservas del vuelo');
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'ACTIVA': 'bg-green-100 text-green-800 border-green-200',
      'CANCELADA': 'bg-red-100 text-red-800 border-red-200',
      'PAGADA': 'bg-blue-100 text-blue-800 border-blue-200',
      'COMPLETADA': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Filtrar reservas por término de búsqueda
  const filteredReservas = reservas.filter(reserva => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      reserva.id_reserva?.toString().includes(term) ||
      reserva.usuario?.nombre?.toLowerCase().includes(term) ||
      reserva.usuario?.apellido?.toLowerCase().includes(term) ||
      reserva.estado_reserva?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <LoadingScreen message="Cargando reservas..." />;
  }

  if (!vuelo) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600">No se pudo cargar la información del vuelo</p>
          <button
            onClick={() => router.push('/admin/flights')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver a Vuelos
          </button>
        </div>
      </AdminLayout>
    );
  }

  const tipoVuelo = vuelo.ruta?.es_nacional ? 'Nacional' : 'Internacional';
  const totalReservas = reservas.length;
  const reservasActivas = reservas.filter(r => r.estado_reserva === 'ACTIVA').length;
  const reservasCanceladas = reservas.filter(r => r.estado_reserva === 'CANCELADA').length;
  const reservasPagadas = reservas.filter(r => r.estado_reserva === 'PAGADA').length;
  
  // Calcular total de viajeros (solo de reservas no canceladas)
  const totalViajeros = reservas
    .filter(r => r.estado_reserva !== 'CANCELADA')
    .reduce((sum, r) => {
      return sum + (r.cantidad_viajeros || 0);
    }, 0);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/flights')}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 flex items-center"
          >
            ← Volver a Vuelos
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Reservas del Vuelo #{vuelo.ccv}
          </h1>
          <p className="text-gray-600">
            {vuelo.ruta?.origen?.nombre_ciudad} → {vuelo.ruta?.destino?.nombre_ciudad} | {tipoVuelo}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Fecha: {formatDate(vuelo.fecha_vuelo)} | 
            Salida: {new Date(vuelo.hora_salida_vuelo).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reservas</p>
                <p className="text-3xl font-bold text-gray-900">{totalReservas}</p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Activas</p>
                <p className="text-3xl font-bold text-green-600">{reservasActivas}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pagadas</p>
                <p className="text-3xl font-bold text-blue-600">{reservasPagadas}</p>
              </div>
              <span className="text-3xl">💳</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Canceladas</p>
                <p className="text-3xl font-bold text-red-600">{reservasCanceladas}</p>
              </div>
              <span className="text-3xl">❌</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Viajeros</p>
                <p className="text-3xl font-bold text-purple-600">{totalViajeros}</p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar por ID, nombre de usuario o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tabla de Reservas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Reserva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Viajeros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Reserva
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No se encontraron reservas con ese criterio' : 'No hay reservas para este vuelo'}
                    </td>
                  </tr>
                ) : (
                  filteredReservas.map((reserva) => {
                    return (
                      <tr key={reserva.id_reserva} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">#{reserva.id_reserva}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reserva.usuario?.nombre} {reserva.usuario?.apellido}
                          </div>
                          <div className="text-sm text-gray-500">{reserva.usuario?.correo_electronico}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reserva.clase_reserva === 'PRIMERACLASE' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {reserva.clase_reserva === 'PRIMERACLASE' ? '⭐ Primera' : '🪑 Segunda'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">
                            👥 {reserva.cantidad_viajeros} {reserva.cantidad_viajeros === 1 ? 'viajero' : 'viajeros'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(reserva.precio_total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getEstadoBadge(reserva.estado_reserva)}`}>
                            {reserva.estado_reserva}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(reserva.fecha_reserva)}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de viajeros */}
        {filteredReservas.length > 0 && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-700">
              <strong>Resumen:</strong> {filteredReservas.length} reserva(s) encontrada(s) con un total de {
                filteredReservas.reduce((sum, r) => sum + (r.cantidad_viajeros || 0), 0)
              } viajero(s)
            </p>
          </div>
        )}
      </div>

      {/* Popup */}
      <CustomPopup
        isOpen={popupState.isOpen}
        type={popupState.type}
        title={popupState.title}
        message={popupState.message}
        onClose={closePopup}
      />
    </AdminLayout>
  );
}
