"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { reservationService } from "../../services/reservationService";
import { segmentoService } from "../../services/segmentoService";
import LoadingScreen from "../../components/LoadingScreen";

export default function HistoryPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PAGADA, CANCELADA
  const [segmentosPorReserva, setSegmentosPorReserva] = useState({});
  const [vuelosPorReserva, setVuelosPorReserva] = useState({});

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) {
          router.push("/login?from=history");
          return;
        }

        const userData = JSON.parse(userDataStr);
        setUser(userData);

        // Obtener todas las reservas del usuario
        const reservas = await reservationService.getUserReservations(userData.id_usuario);
        // Ordenar por fecha de reserva descendente (más recientes primero)
        const reservasOrdenadas = reservas.sort((a, b) => {
          return new Date(b.fecha_reserva) - new Date(a.fecha_reserva);
        });
        setReservations(reservasOrdenadas);

        // Obtener segmentos y vuelos para cada reserva
        const segmentosMap = {};
        const vuelosMap = {};
        for (const reserva of reservasOrdenadas) {
          // Obtener segmentos (retorna [] si no existen - reserva cancelada temprano)
          const segmentos = await segmentoService.getSegmentosByReservaId(reserva.id_reserva);
          segmentosMap[reserva.id_reserva] = segmentos;
          
          // Obtener información completa del vuelo de ida desde el backend
            if (reserva.vuelo_ida_id) {
              try {
                const vueloResponse = await reservationService.getFlightById(reserva.vuelo_ida_id);
                // Verificar si la respuesta tiene la estructura esperada
                if (vueloResponse && vueloResponse.success && vueloResponse.data) {
                  vuelosMap[reserva.id_reserva] = vueloResponse.data;
                } else if (vueloResponse && !vueloResponse.success) {
                  console.error(`Vuelo ${reserva.vuelo_ida_id} no encontrado:`, vueloResponse);
                  // Fallback: usar vuelo del segmento si está disponible
                  if (segmentos.length > 0 && segmentos[0].Vuelo) {
                    vuelosMap[reserva.id_reserva] = segmentos[0].Vuelo;
                  }
                } else {
                  vuelosMap[reserva.id_reserva] = vueloResponse;
                }
              } catch (vueloError) {
                console.error(`Error obteniendo vuelo ${reserva.vuelo_ida_id}:`, vueloError);
                // Fallback: usar vuelo del segmento si está disponible
                if (segmentos.length > 0 && segmentos[0].Vuelo) {
                  vuelosMap[reserva.id_reserva] = segmentos[0].Vuelo;
                }
              }
            }
        }
        setSegmentosPorReserva(segmentosMap);
        setVuelosPorReserva(vuelosMap);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [router]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAGADA":
        return "bg-green-100 text-green-800";
      case "CANCELADA":
        return "bg-red-100 text-red-800";
      case "ACTIVA":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PAGADA":
        return "✅ Pagada";
      case "CANCELADA":
        return "❌ Cancelada";
      case "ACTIVA":
        return "⏳ Pendiente";
      default:
        return status;
    }
  };

  // Determinar si una reserva fue cancelada por tiempo o manualmente
  const getCancelReason = (reserva) => {
    if (reserva.estado_reserva !== "CANCELADA") return null;
    
    const fechaExpiracion = new Date(reserva.fecha_expiracion);
    const ahora = new Date();
    
    // Si la fecha de expiración ya pasó, fue cancelada automáticamente por tiempo
    if (fechaExpiracion < ahora) {
      return "tiempo";
    }
    
    // Si aún no ha expirado pero está cancelada, fue cancelación manual
    return "manual";
  };

  const filteredReservations = reservations.filter((reserva) => {
    if (filterStatus === "ALL") {
      return true; // Mostrar todas las reservas
    }
    return reserva.estado_reserva === filterStatus;
  });

  if (loading) {
    return <LoadingScreen message="Cargando historial..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            📜 Historial de Reservas y Compras
          </h2>
          <p className="text-gray-600">
            Revisa todas tus transacciones anteriores
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterStatus("PAGADA")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === "PAGADA"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Pagadas
          </button>
          <button
            onClick={() => setFilterStatus("ACTIVA")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === "ACTIVA"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilterStatus("CANCELADA")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === "CANCELADA"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Canceladas
          </button>
        </div>

        {/* Lista de Reservas */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay registros
            </h3>
            <p className="text-gray-500">
              Realiza tu primera reserva
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reserva) => (
              <div
                key={reserva.id_reserva}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Reserva #{reserva.codigo_reserva || reserva.id_reserva}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Fecha: {formatDate(reserva.fecha_reserva)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                          reserva.estado_reserva
                        )}`}
                      >
                        {getStatusLabel(reserva.estado_reserva)}
                      </span>
                      {reserva.estado_reserva === "CANCELADA" && (
                        <div className="mt-2">
                          {getCancelReason(reserva) === "tiempo" ? (
                            <p className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block">
                              ⏱️ Cancelada por expiración de 24 horas
                            </p>
                          ) : (
                            <p className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full inline-block">
                              👤 Cancelada manualmente
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Vuelo</p>
                      <p className="font-semibold text-gray-900">#{reserva.vuelo_ida_id}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Pasajeros</p>
                      <p className="font-semibold text-gray-900">
                        {reserva.cantidad_viajeros} {reserva.cantidad_viajeros === 1 ? "persona" : "personas"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Clase</p>
                      <p className="font-semibold text-gray-900">
                        {reserva.clase_reserva === "PRIMERACLASE"
                          ? "Primera Clase"
                          : "Segunda Clase"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Silla(s)</p>
                      <p className="font-semibold text-gray-900">
                        {segmentosPorReserva[reserva.id_reserva] && segmentosPorReserva[reserva.id_reserva].length > 0
                          ? segmentosPorReserva[reserva.id_reserva]
                              .map(seg =>
                                (seg.asiento && seg.asiento.asiento)
                                  ? `${seg.asiento.asiento} (${seg.trayecto})`
                                  : `Sin información (${seg.trayecto})`
                              )
                              .join(", ")
                          : reserva.estado_reserva === "CANCELADA" 
                            ? "Reserva cancelada antes de asignar asientos"
                            : "Sin información"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Ciudades</p>
                      <p className="font-semibold text-gray-900">
                        {(() => {
                          const vuelo = vuelosPorReserva[reserva.id_reserva];
                          const segmentos = segmentosPorReserva[reserva.id_reserva];
                          
                          // Intentar obtener ciudades del vuelo
                          if (vuelo && vuelo.ruta && vuelo.ruta.origen && vuelo.ruta.destino) {
                            return `${vuelo.ruta.origen.nombre_ciudad} → ${vuelo.ruta.destino.nombre_ciudad}`;
                          }
                          
                          // Fallback: obtener del primer segmento
                          if (segmentos && segmentos.length > 0 && segmentos[0].Vuelo && segmentos[0].Vuelo.Ruta) {
                            const ruta = segmentos[0].Vuelo.Ruta;
                            if (ruta.origen && ruta.destino) {
                              return `${ruta.origen.nombre_ciudad} → ${ruta.destino.nombre_ciudad}`;
                            }
                          }
                          
                          // Si es cancelada
                          if (reserva.estado_reserva === "CANCELADA") {
                            return "Reserva cancelada antes de completar";
                          }
                          
                          return "Sin información";
                        })()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${reserva.precio_total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
