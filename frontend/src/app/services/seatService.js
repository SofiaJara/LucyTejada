const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const seatService = {
  /**
   * Obtiene todos los asientos de un vuelo específico
   * @param {number} vueloId - ID del vuelo
   * @returns {Promise<Array>} Lista de asientos con su estado
   */
  async getAsientosByVueloId(vueloId) {
    try {
      const response = await fetch(`${API_URL}/api/v1/asientos/${vueloId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener asientos');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching seats:', error);
      throw error;
    }
  },

  /**
   * Obtiene los segmentos de viaje de una reserva
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<Object>} Datos de la reserva con segmentos de viaje
   */
  async getSegmentosByReservaId(reservaId) {
    try {
      const response = await fetch(`${API_URL}/api/v1/reservas/${reservaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener reserva');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reservation segments:', error);
      throw error;
    }
  },

  /**
   * Cambia el asiento de un segmento de viaje
   * @param {number} segmentoId - ID del segmento de viaje
   * @param {number} nuevoAsientoId - ID del nuevo asiento
   * @returns {Promise<Object>} Segmento actualizado
   */
  async cambiarAsiento(segmentoId, nuevoAsientoId) {
    try {
      const response = await fetch(`${API_URL}/api/v1/segmentos-viaje/${segmentoId}/cambiar-asiento`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ nuevo_asiento_id: nuevoAsientoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar asiento');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error changing seat:', error);
      throw error;
    }
  },

  /**
   * Verifica si un segmento puede cambiar de asiento
   * @param {number} segmentoId - ID del segmento de viaje
   * @returns {Promise<Object>} {permitido: boolean, razon: string}
   */
  async puedeCambiarAsiento(segmentoId) {
    try {
      const response = await fetch(`${API_URL}/api/v1/segmentos-viaje/${segmentoId}/verificar-cambio`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar cambio de asiento');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking seat change permission:', error);
      throw error;
    }
  },
};
