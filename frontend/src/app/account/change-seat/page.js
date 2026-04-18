"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingScreen from "../../components/LoadingScreen";
import { reservationService } from "../../services/reservationService";
import { segmentoService } from "../../services/segmentoService";

export default function ChangeSeatPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [reservationDetails, setReservationDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadPaidReservations = async () => {
      try {
        setLoading(true);
        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) {
          router.push("/login?from=change-seat");
          return;
        }
        const userData = JSON.parse(userDataStr);
        setUser(userData);
        
        // Obtener solo reservas activas o pagadas
        const reservas = await reservationService.getUserReservations(userData.id_usuario);
        console.log('Reservas obtenidas:', reservas);
        
        const activasOPagadas = reservas.filter(r => 
          r.estado_reserva === "ACTIVA" || r.estado_reserva === "PAGADA"
        );
        console.log('Reservas ACTIVAS o PAGADAS:', activasOPagadas);
        
        // Filtrar solo las que tienen vuelos que aún no han pasado
        const now = new Date();
        const validReservations = [];
        
        for (const reserva of activasOPagadas) {
          let isValid = false;
          
          // Primero intentar verificar por el vuelo directo
          if (reserva.vuelo_ida_id) {
            try {
              const vueloResponse = await reservationService.getFlightById(reserva.vuelo_ida_id);
              const vuelo = vueloResponse?.success ? vueloResponse.data : vueloResponse;
              
              if (vuelo && vuelo.fecha_vuelo) {
                const flightDate = new Date(vuelo.fecha_vuelo);
                console.log(`Reserva ${reserva.id_reserva}: Fecha vuelo ${flightDate} > Ahora ${now}? ${flightDate > now}`);
                
                if (flightDate > now) {
                  isValid = true;
                }
              }
            } catch (error) {
              console.error(`Error obteniendo vuelo ${reserva.vuelo_ida_id}:`, error);
            }
          }
          
          // Si no se pudo verificar por vuelo, intentar por segmentos
          if (!isValid) {
            try {
              const segmentos = await segmentoService.getSegmentosByReservaId(reserva.id_reserva);
              console.log(`Segmentos de reserva ${reserva.id_reserva}:`, segmentos);
              
              if (segmentos && segmentos.length > 0) {
                // Verificar si al menos un vuelo no ha pasado
                const hasValidFlight = segmentos.some(seg => {
                  if (seg.Vuelo && seg.Vuelo.fecha_vuelo) {
                    const flightDate = new Date(seg.Vuelo.fecha_vuelo);
                    return flightDate > now;
                  }
                  return false;
                });
                
                if (hasValidFlight) {
                  isValid = true;
                }
              }
            } catch (error) {
              console.error(`Error loading segments for reservation ${reserva.id_reserva}:`, error);
            }
          }
          
          if (isValid) {
            validReservations.push(reserva);
          }
        }
        
        console.log('Reservas válidas para cambio de silla:', validReservations);
        setReservations(validReservations);
        
        // Obtener detalles de cada reserva (ciudades, asientos, fecha)
        const details = {};
        for (const reserva of validReservations) {
          try {
            // Obtener vuelo
            let vuelo = null;
            if (reserva.vuelo_ida_id) {
              const vueloResponse = await reservationService.getFlightById(reserva.vuelo_ida_id);
              vuelo = vueloResponse?.success ? vueloResponse.data : vueloResponse;
            }
            
            // Obtener segmentos para sillas
            const segmentos = await segmentoService.getSegmentosByReservaId(reserva.id_reserva);
            console.log(`📋 Segmentos completos de reserva ${reserva.id_reserva}:`, JSON.stringify(segmentos, null, 2));
            
            // Extraer asientos de los segmentos - probar diferentes propiedades
            const asientos = segmentos.map(seg => {
              console.log(`🔍 Analizando segmento ${seg.id_segmento}:`, {
                asiento_id: seg.asiento_id,
                'seg.Asiento': seg.Asiento,
                'seg.asiento': seg.asiento,
                'Todas las keys': Object.keys(seg)
              });
              
              // Intentar diferentes formas de acceder al asiento
              if (seg.Asiento && seg.Asiento.asiento) {
                return seg.Asiento.asiento;
              } else if (seg.asiento && seg.asiento.asiento) {
                return seg.asiento.asiento;
              } else if (seg.Asiento && seg.Asiento.numero_asiento) {
                return seg.Asiento.numero_asiento;
              }
              return 'Sin asignar';
            });
            
            console.log(`✅ Asientos extraídos de reserva ${reserva.id_reserva}:`, asientos);
            
            details[reserva.id_reserva] = {
              vuelo: vuelo,
              segmentos: segmentos,
              ciudadOrigen: vuelo?.ruta?.origen?.nombre_ciudad || segmentos[0]?.Vuelo?.Ruta?.origen?.nombre_ciudad || segmentos[0]?.vuelo?.ruta?.origen?.nombre_ciudad || 'N/A',
              ciudadDestino: vuelo?.ruta?.destino?.nombre_ciudad || segmentos[0]?.Vuelo?.Ruta?.destino?.nombre_ciudad || segmentos[0]?.vuelo?.ruta?.destino?.nombre_ciudad || 'N/A',
              fechaVuelo: vuelo?.fecha_vuelo || segmentos[0]?.Vuelo?.fecha_vuelo || segmentos[0]?.vuelo?.fecha_vuelo || null,
              asientos: asientos.join(', ')
            };
          } catch (error) {
            console.error(`Error obteniendo detalles de reserva ${reserva.id_reserva}:`, error);
            details[reserva.id_reserva] = {
              ciudadOrigen: 'N/A',
              ciudadDestino: 'N/A',
              fechaVuelo: null,
              asientos: 'N/A'
            };
          }
        }
        setReservationDetails(details);
      } catch (error) {
        console.error("Error loading paid reservations:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPaidReservations();
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

  if (loading) {
    return <LoadingScreen message="Cargando reservas válidas..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            💺 Cambio de Silla
          </h2>
          <p className="text-gray-600">
            Selecciona una reserva activa o pagada para cambiar tus asientos
          </p>
        </div>
        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No tienes reservas válidas para cambio de silla
            </h3>
            <p className="text-gray-500">
              Solo puedes cambiar asientos en reservas activas o pagadas cuyos vuelos aún no han pasado
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reserva) => {
              const details = reservationDetails[reserva.id_reserva] || {};
              return (
                <div
                  key={reserva.id_reserva}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="mb-4 md:mb-0 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Reserva #{reserva.codigo_reserva || reserva.id_reserva}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>
                            <span className="font-semibold">📅 Fecha de vuelo:</span>{" "}
                            {details.fechaVuelo 
                              ? new Date(details.fechaVuelo).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "N/A"}
                          </p>
                          <p>
                            <span className="font-semibold">🌍 Ruta:</span>{" "}
                            {details.ciudadOrigen} → {details.ciudadDestino}
                          </p>
                          <p>
                            <span className="font-semibold">💺 Asiento(s) actual(es):</span>{" "}
                            {details.asientos || "Sin asignar"}
                          </p>
                          <p>
                            <span className="font-semibold">👥 Pasajeros:</span>{" "}
                            {reserva.cantidad_viajeros}
                          </p>
                          <p>
                            <span className="font-semibold">Estado:</span>{" "}
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              reserva.estado_reserva === 'PAGADA' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reserva.estado_reserva === 'PAGADA' ? '✅ Pagada' : '⏳ Pendiente'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="md:ml-6">
                        {reserva.estado_reserva === 'PAGADA' ? (
                          <button
                            onClick={() => router.push(`/account/seats/${reserva.id_reserva}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full md:w-auto"
                          >
                            Cambiar Silla
                          </button>
                        ) : (
                          <div className="flex flex-col items-center md:items-end gap-3">
                            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-center md:text-right">
                              <p className="text-yellow-800 font-semibold text-sm mb-2">
                                ⚠️ Paga esta reserva para cambiar la silla
                              </p>
                              <button
                                onClick={() => router.push('/account/reservations')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                              >
                                Ir a Reservas Activas
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
