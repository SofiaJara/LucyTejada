import API_URL_BASE from '../../utils/api';

const API_URL = `${API_URL_BASE}/api/v1`;

export const reservationService = {
  // Crear una nueva reserva
  async createReservation(reservaData) {
    try {
      console.log('Creating reservation with data:', reservaData);
      const response = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de autenticación
        body: JSON.stringify(reservaData),
      });

      const data = await response.json();
      console.log('Reservation response:', data);

      if (!response.ok) {
        // Manejar diferentes tipos de errores
        if (data.error) {
          if (Array.isArray(data.error)) {
            throw new Error(JSON.stringify(data.error));
          } else if (typeof data.error === 'object') {
            throw new Error(JSON.stringify(data.error));
          } else {
            throw new Error(data.error);
          }
        }
        throw new Error('Error al crear la reserva');
      }

      return data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  // Crear una nueva compra
  async createPurchase(compraData) {
    try {
      const response = await fetch(`${API_URL}/compras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de autenticación
        body: JSON.stringify(compraData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error del backend al crear compra:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          message: data.message,
          fullResponse: data
        });
        throw new Error(data.error || data.message || 'Error al crear la compra');
      }

      return data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  // Crear un viajero
  async createTraveler(viajeroData) {
    try {
      console.log('Creating traveler with data:', viajeroData);
      const response = await fetch(`${API_URL}/viajeros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de autenticación
        body: JSON.stringify(viajeroData),
      });

      const data = await response.json();
      console.log('Traveler response:', data);

      if (!response.ok) {
        // Manejar error de validación estructurado del backend
        if (data.code === 'VALIDATION_ERROR' && data.fields) {
          const fieldErrors = data.fields.map(field => {
            if (field.field === 'fecha_nacimiento') {
              return `Fecha de nacimiento inválida: ${field.message || 'La fecha no puede ser en el futuro'}`;
            }
            return `${field.field}: ${field.message}`;
          }).join(', ');
          throw new Error(`Error de validación: ${fieldErrors}`);
        }

        // Manejar diferentes tipos de errores
        if (data.details) {
          // Verificar si es un error de DNI duplicado
          const detailsStr = typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
          console.error('Error details:', detailsStr);
          if (detailsStr.includes('ya está asociado') || detailsStr.includes('duplicate') || detailsStr.includes('unique')) {
            throw new Error(`El DNI ${viajeroData.dni_viajero} ya está registrado en este vuelo. Por favor use un documento diferente o cancele la reserva anterior.`);
          }
          throw new Error(`Error al crear viajero: ${detailsStr}`);
        }
        if (data.error) {
          const errorStr = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
          console.error('Error message:', errorStr);
          if (errorStr.includes('ya está asociado') || errorStr.includes('duplicate') || errorStr.includes('unique')) {
            throw new Error(`El DNI ${viajeroData.dni_viajero} ya está registrado en este vuelo. Por favor use un documento diferente o cancele la reserva anterior.`);
          }
          if (Array.isArray(data.error)) {
            throw new Error(`Error de validación: ${JSON.stringify(data.error)}`);
          } else if (typeof data.error === 'object') {
            throw new Error(`Error al crear viajero: ${JSON.stringify(data.error)}`);
          } else {
            throw new Error(data.error);
          }
        }
        console.error('Response status:', response.status, 'Full response:', data);
        throw new Error(`Error al crear el viajero (código ${response.status}). Por favor verifica que todos los campos estén completos y correctos.`);
      }

      return data;
    } catch (error) {
      console.error('Error creating traveler:', error);
      throw error;
    }
  },

  // Obtener reservas del usuario
  async getUserReservations(usuarioId) {
    try {
      const response = await fetch(`${API_URL}/reservas/usuario/${usuarioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de autenticación
      });

      const data = await response.json();

      // Si el backend devuelve 404, significa que no hay reservas, retornar array vacío
      if (response.status === 404) {
        console.log('No hay reservas para este usuario');
        return [];
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener las reservas');
      }

      return data;
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      throw error;
    }
  },

  // Obtener una reserva por ID
  async getReservationById(reservaId) {
    try {
      const response = await fetch(`${API_URL}/reservas/${reservaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de autenticación
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener la reserva');
      }

      return data;
    } catch (error) {
      console.error('Error fetching reservation:', error);
      throw error;
    }
  },

  // Cancelar una reserva
  async cancelReservation(reservaId) {
    try {
      const response = await fetch(`${API_URL}/reservas/cancel/${reservaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de autenticación
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cancelar la reserva');
      }

      return data;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  },

  // Enviar correo de confirmación de reserva
  async sendConfirmationEmail(toEmail, reservaId) {
    try {
      const response = await fetch(`${API_URL}/reservas/send-confirmation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies de autenticación
        body: JSON.stringify({ toEmail, reservaId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el correo');
      }

      return data;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  },

  // Obtener géneros disponibles (útil para el formulario de viajeros)
  async getGeneros() {
    try {
      const response = await fetch(`${API_URL}/users/generos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener los géneros');
      }

      return data;
    } catch (error) {
      console.error('Error fetching generos:', error);
      throw error;
    }
  },

  // Obtener vuelo por ID
  async getFlightById(flightId) {
    try {
      const response = await fetch(`${API_URL}/flights/${flightId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener el vuelo');
      }

      return data;
    } catch (error) {
      console.error('Error fetching flight:', error);
      throw error;
    }
  },

  // Obtener duración del vuelo
  async getFlightDuration(origen, destino) {
    try {
      const response = await fetch(
        `${API_URL}/flight-durations/duration?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener la duración del vuelo');
      }

      return data;
    } catch (error) {
      console.error('Error fetching flight duration:', error);
      throw error;
    }
  },

  // Procesar pago de una compra (marca reserva como PAGADA y envía correos)
  async procesarPago(reservaId) {
    try {
      console.log(`💳 Procesando pago de reserva ${reservaId}...`);
      
      const response = await fetch(`${API_URL}/reservas/procesar-pago/${reservaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      console.log('✅ Pago procesado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },
};
