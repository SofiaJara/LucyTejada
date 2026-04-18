// Service for MercadoPago integration
// Configuración para sandbox - Reemplazar credenciales cuando estén disponibles

import API_URL_BASE from '../../utils/api';

const API_URL = `${API_URL_BASE}/api/v1`;

class MercadoPagoService {
  /**
   * Inicializar pago con MercadoPago
   * @param {Object} paymentData - Datos del pago
   * @param {number} paymentData.reservaId - ID de la reserva
   * @param {number} paymentData.monto - Monto total a pagar
   * @param {string} paymentData.descripcion - Descripción del pago
   * @param {Object} paymentData.payer - Información del pagador
   * @returns {Promise<Object>} - Respuesta con preference_id y init_point
   */
  async crearPreferencia(paymentData) {
    try {
      const response = await fetch(`${API_URL}/pagos/mercadopago/crear-preferencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear preferencia de pago');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en crearPreferencia:', error);
      throw error;
    }
  }

  /**
   * Verificar estado de pago
   * @param {string} paymentId - ID del pago de MercadoPago
   * @returns {Promise<Object>} - Estado del pago
   */
  async verificarPago(paymentId) {
    try {
      const response = await fetch(`${API_URL}/pagos/mercadopago/verificar/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar pago');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en verificarPago:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de una preferencia
   * @param {string} preferenceId - ID de la preferencia
   * @returns {Promise<Object>} - Detalles de la preferencia
   */
  async obtenerPreferencia(preferenceId) {
    try {
      const response = await fetch(`${API_URL}/pagos/mercadopago/preferencia/${preferenceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener preferencia');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en obtenerPreferencia:', error);
      throw error;
    }
  }

  /**
   * Redirigir al checkout de MercadoPago
   * @param {string} initPoint - URL del checkout de MercadoPago
   */
  redirigirACheckout(initPoint) {
    window.location.href = initPoint;
  }

  /**
   * Procesar callback de pago (success/failure/pending)
   * @param {Object} params - Parámetros de la URL de retorno
   * @returns {Object} - Información procesada del pago
   */
  procesarCallback(params) {
    const {
      collection_id,
      collection_status,
      payment_id,
      status,
      external_reference,
      payment_type,
      merchant_order_id,
      preference_id,
    } = params;

    return {
      paymentId: payment_id || collection_id,
      status: status || collection_status,
      reservaId: external_reference,
      preferenceId: preference_id,
      merchantOrderId: merchant_order_id,
      paymentType: payment_type,
    };
  }
}

export const mercadoPagoService = new MercadoPagoService();
