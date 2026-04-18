"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import SeatMap from "../../../../components/SeatMap";
import { seatService } from "../../../../services/seatService";
import CustomPopup from "../../../../components/CustomPopup";
import usePopup from "../../../../hooks/usePopup";
import LoadingScreen from "../../../../components/LoadingScreen";
import API_URL from '@/utils/api';

export default function AdminFlightSeatsPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.flightId;

  const [asientos, setAsientos] = useState([]);
  const [vuelo, setVuelo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    ocupados: 0,
    reservados: 0,
    primeraClase: 0,
    segundaClase: 0,
  });

  const { showSuccess, showError, popupState, closePopup } = usePopup();

  useEffect(() => {
    loadFlightSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightId]);

  const loadFlightSeats = async () => {
    try {
      setLoading(true);

      // Obtener información del vuelo
      const vueloResponse = await fetch(`${API_URL}/api/v1/flights/${flightId}`, {
        credentials: 'include',
      });

      if (!vueloResponse.ok) {
        throw new Error('No se pudo cargar la información del vuelo');
      }

      const vueloData = await vueloResponse.json();
      const vueloInfo = vueloData.success ? vueloData.data : vueloData;
      setVuelo(vueloInfo);

      // Obtener asientos del vuelo
      const asientosData = await seatService.getAsientosByVueloId(flightId);
      setAsientos(asientosData);

      // Calcular estadísticas
      const estadisticas = {
        total: asientosData.length,
        disponibles: asientosData.filter(a => a.estado === 'DISPONIBLE').length,
        ocupados: asientosData.filter(a => a.estado === 'OCUPADO').length,
        reservados: asientosData.filter(a => a.estado === 'RESERVADO').length,
        primeraClase: asientosData.filter(a => a.clase === 'PRIMERACLASE').length,
        segundaClase: asientosData.filter(a => a.clase === 'SEGUNDACLASE').length,
      };
      setStats(estadisticas);

    } catch (error) {
      console.error('Error loading flight seats:', error);
      showError(error.message || 'Error al cargar los asientos del vuelo');
    } finally {
      setLoading(false);
    }
  };

  const tipoVuelo = vuelo?.ruta?.es_nacional ? 'Nacional' : 'Internacional';
  const ocupacionPorcentaje = ((stats.ocupados + stats.reservados) / stats.total * 100).toFixed(1);

  if (loading) {
    return <LoadingScreen message="Cargando información de asientos..." />;
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
            💺 Gestión de Asientos - Vuelo #{vuelo.ccv}
          </h1>
          <p className="text-gray-600">
            {vuelo.ruta?.origen?.nombre_ciudad} → {vuelo.ruta?.destino?.nombre_ciudad} | {tipoVuelo}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Fecha: {new Date(vuelo.fecha_vuelo).toLocaleDateString('es-ES')} | 
            Salida: {new Date(vuelo.hora_salida_vuelo).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Asientos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <span className="text-3xl">💺</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disponibles</p>
                <p className="text-3xl font-bold text-green-600">{stats.disponibles}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ocupados</p>
                <p className="text-3xl font-bold text-red-600">{stats.ocupados}</p>
              </div>
              <span className="text-3xl">❌</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reservados</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.reservados}</p>
              </div>
              <span className="text-3xl">⏳</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ocupación</p>
                <p className="text-3xl font-bold text-purple-600">{ocupacionPorcentaje}%</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
          </div>
        </div>

        {/* Mapa de Asientos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Mapa de Asientos del Vuelo
          </h3>
          
          <SeatMap
            asientos={asientos}
            currentUserSeats={[]}
            selectedSeatId={null}
            onSeatSelect={null}
            tipoVuelo={tipoVuelo}
            claseReserva="SEGUNDACLASE"
            isReadOnly={true}
          />
        </div>
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
