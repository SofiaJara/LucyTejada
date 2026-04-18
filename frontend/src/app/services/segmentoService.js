import API_URL_BASE from '../../utils/api';

const API_URL = `${API_URL_BASE}/api/v1`;

export const segmentoService = {
  // Obtener segmentos de viaje por reserva
  async getSegmentosByReservaId(reservaId) {
    try {
      const response = await fetch(`${API_URL}/segmentos-viaje/reserva/${reservaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      // Si es 404, la reserva no tiene segmentos (fue cancelada antes de asignar asientos)
      if (response.status === 404) {
        return [];
      }
      
      const data = await response.json();
      if (!response.ok) {
        // Log solo para otros errores (500, 401, etc), no para 404
        console.warn(`Error ${response.status} al obtener segmentos de reserva ${reservaId}`);
        return [];
      }
      return data.data || data;
    } catch (error) {
      // Error de red o parsing - retornar array vacío sin hacer ruido
      console.warn(`No se pudieron obtener segmentos para reserva ${reservaId}:`, error.message);
      return [];
    }
  },
};
