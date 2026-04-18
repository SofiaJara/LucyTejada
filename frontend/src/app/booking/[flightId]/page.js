"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TravelerForm from "../../components/TravelerForm";
import { reservationService } from "../../services/reservationService";
import CustomPopup from "../../components/CustomPopup";
import usePopup from "../../hooks/usePopup";
import LoadingScreen from "../../components/LoadingScreen";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.flightId;

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPassengers, setNumPassengers] = useState(1);
  const [travelers, setTravelers] = useState([]);
  const [generos, setGeneros] = useState([
    { id_genero: 1, descripcion_genero: "Masculino" },
    { id_genero: 2, descripcion_genero: "Femenino" },
    { id_genero: 3, descripcion_genero: "Otro" }
  ]);
  const [claseReserva, setClaseReserva] = useState("SEGUNDACLASE");
  const [actionType, setActionType] = useState("RESERVAR"); // RESERVAR o COMPRAR
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);

  const { showSuccess, showError, popupState, closePopup } = usePopup();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const userDataStr = localStorage.getItem("user");
    if (!userDataStr) {
      showError("Debe iniciar sesión para realizar una reserva");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }

    const userData = JSON.parse(userDataStr);
    setUser(userData);

    // Cargar vuelo
    const loadFlight = async () => {
      try {
        setLoading(true);
        const result = await reservationService.getFlightById(flightId);
        if (result.success && result.data) {
          setFlight(result.data);
        } else {
          showError("No se pudo cargar el vuelo");
        }
      } catch (error) {
        console.error("Error loading flight:", error);
        showError("Error al cargar el vuelo");
      } finally {
        setLoading(false);
      }
    };

    loadFlight();
  }, [flightId, router, showError]);

  useEffect(() => {
    // Inicializar viajeros cuando cambia la cantidad
    setTravelers((prevTravelers) => {
      const newTravelers = Array.from({ length: numPassengers }, (_, i) => ({
        index: i,
        data: prevTravelers[i]?.data || {},
        errors: prevTravelers[i]?.errors || {},
      }));
      return newTravelers;
    });
  }, [numPassengers]);

  const handleTravelerUpdate = useCallback((index, data, errors) => {
    setTravelers((prev) => {
      const updated = [...prev];
      updated[index] = { index, data, errors };
      return updated;
    });
  }, []);

  const calculateTotalPrice = () => {
    if (!flight || !flight.ruta) return 0;

    let precioBase = 0;
    if (claseReserva === "PRIMERACLASE") {
      precioBase = flight.ruta.precio_primer_clase || 0;
    } else {
      precioBase = flight.ruta.precio_segunda_clase || 0;
    }

    // Aplicar descuento si existe
    if (flight.porcentaje_promocion && flight.porcentaje_promocion > 0) {
      precioBase = precioBase * (1 - flight.porcentaje_promocion / 100);
    }

    return precioBase * numPassengers;
  };

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Versión silenciosa de validación (sin mostrar errores) para usar en disabled
  const isFormValid = () => {
    // Verificar que todos los viajeros tengan campos completos
    for (const traveler of travelers) {
      if (
        !traveler.data.dni_viajero ||
        !traveler.data.primer_nombre ||
        !traveler.data.primer_apellido ||
        !traveler.data.fecha_nacimiento ||
        !traveler.data.id_genero ||
        !traveler.data.nombre_contacto ||
        !traveler.data.telefono_contacto
      ) {
        return false;
      }

      // Verificar que no haya errores
      if (Object.keys(traveler.errors).length > 0) {
        return false;
      }

      // Validar que la fecha no sea en el futuro
      const edad = calcularEdad(traveler.data.fecha_nacimiento);
      if (edad < 0) {
        return false;
      }
    }

    // Validar que haya al menos un adulto
    const edades = travelers.map(t => calcularEdad(t.data.fecha_nacimiento));
    const hayAdultos = edades.some(edad => edad >= 18);

    if (!hayAdultos) {
      return false;
    }

    return true;
  };

  // Verificar si todos los viajeros son menores de edad
  const soloHayMenores = () => {
    // Verificar que todos los campos estén completos primero
    const todosCompletos = travelers.every(traveler => 
      traveler.data.fecha_nacimiento && 
      Object.keys(traveler.errors).length === 0
    );

    if (!todosCompletos) return false;

    // Verificar si todos son menores de 18
    const edades = travelers.map(t => calcularEdad(t.data.fecha_nacimiento));
    const hayAdultos = edades.some(edad => edad >= 18);
    
    return !hayAdultos && edades.length > 0;
  };

  // Validación con mensajes de error (solo se llama al hacer submit)
  const validateAllTravelers = () => {
    for (const traveler of travelers) {
      // Verificar campos obligatorios
      if (
        !traveler.data.dni_viajero ||
        !traveler.data.primer_nombre ||
        !traveler.data.primer_apellido ||
        !traveler.data.fecha_nacimiento ||
        !traveler.data.id_genero ||
        !traveler.data.nombre_contacto ||
        !traveler.data.telefono_contacto
      ) {
        return false;
      }

      // Verificar que no haya errores
      if (Object.keys(traveler.errors).length > 0) {
        return false;
      }
    }

    // Validar que SIEMPRE debe haber al menos un adulto (mayor de 18 años)
    const edades = travelers.map(t => calcularEdad(t.data.fecha_nacimiento));
    const hayAdultos = edades.some(edad => edad >= 18);

    if (!hayAdultos) {
      showError("Debe haber al menos un adulto (mayor de 18 años) en la reserva");
      return false;
    }

    return true;
  };

  const handleSubmit = async (submitActionType) => {
    if (!validateAllTravelers()) {
      showError("Por favor complete todos los formularios de pasajeros correctamente");
      return;
    }

    if (!user) {
      showError("Debe iniciar sesión para continuar");
      router.push("/login");
      return;
    }

    setProcessing(true);
    setActionType(submitActionType); // Actualizar el estado para la UI

    let reservaCreada = null;
    let viajerosCreados = [];

    try {
      // PASO 0: Validar todos los datos ANTES de crear la reserva
      console.log('🔍 Validando datos de viajeros antes de crear la reserva...');
      
      // Validar que todos los viajeros tienen datos completos
      for (let i = 0; i < travelers.length; i++) {
        const traveler = travelers[i];
        const viajeroData = {
          dni_viajero: traveler.data.dni_viajero,
          primer_nombre: traveler.data.primer_nombre,
          primer_apellido: traveler.data.primer_apellido,
          fecha_nacimiento: traveler.data.fecha_nacimiento,
          id_genero: parseInt(traveler.data.id_genero),
          nombre_contacto: traveler.data.nombre_contacto,
          telefono_contacto: traveler.data.telefono_contacto,
        };

        // Validar campos requeridos
        if (!viajeroData.dni_viajero || !viajeroData.primer_nombre || 
            !viajeroData.primer_apellido || !viajeroData.fecha_nacimiento ||
            !viajeroData.id_genero || !viajeroData.nombre_contacto || 
            !viajeroData.telefono_contacto) {
          throw new Error(`El viajero ${i + 1} tiene campos requeridos vacíos. Por favor complete todos los campos obligatorios.`);
        }

        // Validar formato de email si se proporciona
        if (traveler.data.correo_electronico) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(traveler.data.correo_electronico)) {
            throw new Error(`El correo electrónico del viajero ${i + 1} no es válido.`);
          }
        }

        // Validar edad (debe ser mayor de 0 años)
        const edad = calcularEdad(traveler.data.fecha_nacimiento);
        if (edad < 0) {
          throw new Error(`La fecha de nacimiento del viajero ${i + 1} no puede ser en el futuro.`);
        }
      }

      console.log('✅ Validación de datos completada exitosamente');

      // Paso 1: Crear la reserva
      const reservaData = {
        usuario_id: user.id_usuario,
        clase_reserva: claseReserva,
        fecha_reserva: new Date().toISOString(),
        estado_reserva: "ACTIVA",
        cantidad_viajeros: numPassengers,
        precio_total: Math.round(calculateTotalPrice()),
        vuelo_ida_id: parseInt(flightId),
        vuelo_vuelta_id: null, // Por ahora solo ida
        trayectoria: "SOLOIDA",
      };

      console.log('Sending reservation data:', reservaData);
      const reservaResult = await reservationService.createReservation(reservaData);

      if (!reservaResult || !reservaResult.id_reserva) {
        throw new Error("No se pudo crear la reserva");
      }

      reservaCreada = reservaResult;
      const reservaId = reservaResult.id_reserva;

      // Paso 2: Crear los viajeros
      for (const traveler of travelers) {
        const viajeroData = {
          dni_viajero: traveler.data.dni_viajero,
          primer_nombre: traveler.data.primer_nombre,
          primer_apellido: traveler.data.primer_apellido,
          fecha_nacimiento: traveler.data.fecha_nacimiento,
          id_genero: parseInt(traveler.data.id_genero),
          nombre_contacto: traveler.data.nombre_contacto,
          telefono_contacto: traveler.data.telefono_contacto,
          usuario_asociado: user.id_usuario,
          reserva_id: reservaId,
        };

        // Solo agregar campos opcionales si tienen valor
        if (traveler.data.segundo_nombre) {
          viajeroData.segundo_nombre = traveler.data.segundo_nombre;
        }
        if (traveler.data.segundo_apellido) {
          viajeroData.segundo_apellido = traveler.data.segundo_apellido;
        }
        if (traveler.data.telefono) {
          viajeroData.telefono = traveler.data.telefono;
        }
        if (traveler.data.correo_electronico) {
          viajeroData.correo_electronico = traveler.data.correo_electronico;
        }

        console.log('Creando viajero con datos:', viajeroData);
        const viajeroCreado = await reservationService.createTraveler(viajeroData);
        viajerosCreados.push(viajeroCreado);
      }

      // Paso 3: Si es COMPRA, redirigir a Stripe Checkout
      if (submitActionType === "COMPRAR") {
        console.log('💳 Redirigiendo a Stripe Checkout para procesar pago...');
        
        // Crear sesión de checkout de Stripe
        const stripeResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reservaId: reservaId,
            amount: parseFloat(calculateTotalPrice()),
            currency: 'usd',
            reservaInfo: {
              codigo_reserva: reservaCreada.codigo_reserva,
              cantidad_viajeros: numPassengers,
              description: `Vuelo ${claseReserva === 'PRIMERACLASE' ? 'Primera Clase' : 'Segunda Clase'} - ${flight.ruta.origen.nombre_ciudad} → ${flight.ruta.destino.nombre_ciudad}`,
            },
          }),
        });

        const stripeData = await stripeResponse.json();

        if (!stripeResponse.ok) {
          throw new Error(stripeData.error || 'Error al crear la sesión de pago');
        }

        // Mostrar mensaje y redirigir a Stripe
        showSuccess("¡Reserva creada! Redirigiendo a la pasarela de pago...");
        
        // Redirigir a Stripe Checkout
        setTimeout(() => {
          window.location.href = stripeData.url;
        }, 1500);
        
        return; // Importante: salir aquí para no continuar con el flujo normal
      }

      // Éxito para RESERVAR (sin compra)
      const mensaje = "¡Reserva realizada exitosamente! Revisa tu correo y completa el pago en 24 horas.";
      showSuccess(mensaje);

      // Redirigir después de un momento
      setTimeout(() => {
        router.push("/account/reservations");
      }, 3000);
    } catch (error) {
      console.error("Error procesando:", error);
      
      // Si hubo error y se creó la reserva, intentar cancelarla
      if (reservaCreada && reservaCreada.id_reserva) {
        try {
          console.log('⚠️ Cancelando reserva debido a error:', reservaCreada.id_reserva);
          await reservationService.cancelReservation(reservaCreada.id_reserva);
          console.log('✅ Reserva cancelada exitosamente');
        } catch (cancelError) {
          console.error('❌ Error al cancelar reserva:', cancelError);
        }
      }
      
      // Mejorar el mensaje de error
      let errorMessage = error.message || "Error al procesar la solicitud";
      
      // Si el error ocurrió en la validación previa (no se creó reserva)
      if (!reservaCreada) {
        // Error de validación - no se llegó a crear la reserva ni enviar correo
        showError(errorMessage);
      } else {
        // Error después de crear la reserva - se canceló automáticamente
        if (errorMessage.includes("Cannot read properties of null") || errorMessage.includes("id_asiento")) {
          errorMessage = "No hay asientos disponibles para la clase seleccionada. Por favor intente con otra clase o vuelo. La reserva ha sido cancelada automáticamente.";
        } else if (errorMessage.includes("ya está asociado") || errorMessage.includes("ya está registrado")) {
          // El mensaje ya viene formateado desde el servicio, agregar nota de cancelación
          errorMessage = `${errorMessage}\n\nLa reserva ha sido cancelada automáticamente.`;
        } else if (errorMessage.includes("duplicate") || errorMessage.includes("unique")) {
          errorMessage = "Uno de los pasajeros ya tiene una reserva en este vuelo. Por favor verifique los documentos de identidad. La reserva ha sido cancelada automáticamente.";
        } else {
          errorMessage = `${errorMessage}\n\nLa reserva ha sido cancelada automáticamente.`;
        }
        
        showError(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando información del vuelo..." />;
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600">No se pudo cargar el vuelo</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          ✈️ Reservar / Comprar Vuelo
        </h2>

        {/* Información del Vuelo */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Detalles del Vuelo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Vuelo:</span> #{flight.ccv}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Origen:</span>{" "}
                {flight.ruta?.origen?.nombre_ciudad}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Destino:</span>{" "}
                {flight.ruta?.destino?.nombre_ciudad}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Fecha:</span>{" "}
                {new Date(flight.fecha_vuelo).toLocaleDateString("es-ES")}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Hora de Salida:</span>{" "}
                {new Date(flight.hora_salida_vuelo).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {flight.porcentaje_promocion > 0 && (
                <p className="text-green-600 font-semibold">
                  🎉 Descuento: {flight.porcentaje_promocion}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Selección de Cantidad de Pasajeros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Cantidad de Pasajeros</h3>
          <div className="flex items-center space-x-4">
            <label className="text-gray-700 font-medium">Número de pasajeros (máx. 5):</label>
            <select
              value={numPassengers}
              onChange={(e) => setNumPassengers(parseInt(e.target.value))}
              className="px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selección de Clase */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Clase de Vuelo</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => setClaseReserva("SEGUNDACLASE")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                claseReserva === "SEGUNDACLASE"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Segunda Clase - ${flight.ruta?.precio_segunda_clase}
            </button>
            <button
              onClick={() => setClaseReserva("PRIMERACLASE")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                claseReserva === "PRIMERACLASE"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Primera Clase - ${flight.ruta?.precio_primer_clase}
            </button>
          </div>
        </div>

        {/* Formularios de Viajeros */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Información de Pasajeros</h3>
          <div className="space-y-6">
            {travelers.map((traveler, index) => (
              <TravelerForm
                key={index}
                index={index}
                travelerData={traveler.data}
                onUpdate={handleTravelerUpdate}
                generos={generos}
              />
            ))}
          </div>
        </div>

        {/* Resumen de Precio */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen de Precio</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Precio por pasajero:</span>
              <span className="font-semibold text-gray-800">
                ${(calculateTotalPrice() / numPassengers).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Número de pasajeros:</span>
              <span className="font-semibold text-gray-800">{numPassengers}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${calculateTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Finalizar</h3>
          
          {/* Mensaje de advertencia si solo hay menores */}
          {soloHayMenores() && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-red-800">
                    ⚠️ No se puede completar la reserva
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Todos los pasajeros son menores de 18 años. Se requiere al menos un adulto (mayor de 18 años) para realizar la reserva o compra.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mb-6">
            <strong>Reservar:</strong> Reserva tu vuelo por 24 horas. Deberás completar el pago
            dentro de este período.
            <br />
            <strong>Comprar:</strong> Realiza el pago inmediatamente y confirma tu vuelo.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                handleSubmit("RESERVAR");
              }}
              disabled={processing || !isFormValid()}
              className={`flex-1 px-6 py-4 rounded-lg font-bold text-white transition-colors ${
                processing || !isFormValid()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {processing && actionType === "RESERVAR" ? "Procesando..." : "Reservar"}
            </button>
            <button
              onClick={() => {
                handleSubmit("COMPRAR");
              }}
              disabled={processing || !isFormValid()}
              className={`flex-1 px-6 py-4 rounded-lg font-bold text-white transition-colors ${
                processing || !isFormValid()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {processing && actionType === "COMPRAR" ? "Procesando..." : "Comprar Ahora"}
            </button>
          </div>
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
      />
    </div>
  );
}
