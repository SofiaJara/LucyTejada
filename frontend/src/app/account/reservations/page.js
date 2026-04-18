"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { reservationService } from "../../services/reservationService";
import CustomPopup from "../../components/CustomPopup";
import usePopup from "../../hooks/usePopup";
import LoadingScreen from "../../components/LoadingScreen";

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [processingCancel, setProcessingCancel] = useState(null);

  const { showSuccess, showError, showConfirm, popupState, closePopup } = usePopup();

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const userDataStr = localStorage.getItem("user");
      if (!userDataStr) {
        router.push("/login?from=reservations");
        return;
      }

      const userData = JSON.parse(userDataStr);
      setUser(userData);

      // Obtener reservas del usuario
      const reservas = await reservationService.getUserReservations(userData.id_usuario);
      
      // Filtrar solo reservas ACTIVAS
      const reservasActivas = reservas.filter(
        (reserva) => reserva.estado_reserva === "ACTIVA"
      );
      
      setReservations(reservasActivas);
    } catch (error) {
      console.error("Error loading reservations:", error);
      showError("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservaId) => {
    showConfirm(
      "¿Está seguro que desea cancelar esta reserva? Esta acción no se puede deshacer.",
      async () => {
        try {
          setProcessingCancel(reservaId);
          await reservationService.cancelReservation(reservaId);
          showSuccess("Reserva cancelada exitosamente");
          // Recargar reservas
          await loadReservations();
        } catch (error) {
          console.error("Error cancelling reservation:", error);
          showError("Error al cancelar la reserva");
        } finally {
          setProcessingCancel(null);
        }
      },
      "Confirmar Cancelación"
    );
  };

  const handleContinuePayment = async (reserva) => {
    try {
      setProcessingCancel(reserva.id_reserva);
      
      // Crear sesión de checkout de Stripe
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservaId: reserva.id_reserva,
          amount: parseFloat(reserva.precio_total),
          currency: 'usd',
          reservaInfo: {
            codigo_reserva: reserva.codigo_reserva,
            cantidad_viajeros: reserva.cantidad_viajeros,
            description: `Vuelo ${reserva.clase_reserva === 'PRIMERACLASE' ? 'Primera Clase' : 'Segunda Clase'} para ${reserva.cantidad_viajeros} pasajero(s)`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la sesión de pago');
      }

      // Redirigir a Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error("Error initiating payment:", error);
      showError(error.message || "Error al iniciar el pago");
      setProcessingCancel(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTimeRemaining = (fechaReserva) => {
    const reservaDate = new Date(fechaReserva);
    const expirationDate = new Date(reservaDate.getTime() + 24 * 60 * 60 * 1000); // +24 horas
    const now = new Date();
    const diff = expirationDate - now;

    if (diff <= 0) return "Expirada";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m restantes`;
  };

  if (loading) {
    return <LoadingScreen message="Cargando reservas..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📋 Mis Reservas Activas</h2>
          <p className="text-gray-600">
            Completa el pago de tus reservas en las próximas 24 horas
          </p>
        </div>

        {reservations.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No tienes reservas activas
            </h3>
            <p className="text-gray-500 mb-6">
              Explora nuestros vuelos disponibles y realiza tu primera reserva
            </p>
            <button
              onClick={() => router.push("/flights")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Ver Vuelos Disponibles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reserva) => (
              <div
                key={reserva.id_reserva}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border border-gray-200"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">
                      Reserva #{reserva.codigo_reserva || reserva.id_reserva}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900">
                      PENDIENTE PAGO
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-700">
                      <span className="font-semibold mr-2">✈️ Vuelo:</span>
                      <span>#{reserva.vuelo_ida_id}</span>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <span className="font-semibold mr-2">👥 Pasajeros:</span>
                      <span>{reserva.cantidad_viajeros}</span>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <span className="font-semibold mr-2">💺 Clase:</span>
                      <span>
                        {reserva.clase_reserva === "PRIMERACLASE"
                          ? "Primera Clase"
                          : "Segunda Clase"}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <span className="font-semibold mr-2">📅 Reservado:</span>
                      <span>{formatDate(reserva.fecha_reserva)}</span>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                      <div className="flex items-center text-red-700 text-sm font-semibold">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        ⏰ {calculateTimeRemaining(reserva.fecha_reserva)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Total a pagar:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${reserva.precio_total.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleContinuePayment(reserva)}
                        disabled={processingCancel === reserva.id_reserva}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {processingCancel === reserva.id_reserva ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Redirigiendo a Stripe...
                          </>
                        ) : (
                          <>
                            💳 Pagar con Stripe
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCancelReservation(reserva.id_reserva)}
                        disabled={processingCancel === reserva.id_reserva}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
                      >
                        {processingCancel === reserva.id_reserva
                          ? "Cancelando..."
                          : "❌ Cancelar Reserva"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón para ver historial */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/account/history")}
            className="text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            Ver Historial Completo →
          </button>
        </div>
      </section>
      <Footer />

      {/* Popup */}
      <CustomPopup
        isOpen={popupState.isOpen}
        type={popupState.type}
        title={popupState.title}
        message={popupState.message}
        onClose={closePopup}
        onConfirm={popupState.onConfirm}
        confirmText={popupState.confirmText}
        cancelText={popupState.cancelText}
      />
    </div>
  );
}
