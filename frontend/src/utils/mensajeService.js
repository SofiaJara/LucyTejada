import API_URL_BASE from './api';

const API_URL = `${API_URL_BASE}/api/v1`;

export const mensajeService = {
  // Crear mensaje (Cliente)
  async create(asunto, contenido) {
    const response = await fetch(`${API_URL}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ asunto, contenido })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear mensaje');
    }

    return await response.json();
  },

  // Ver mis mensajes (Cliente)
  async getMyMessages() {
    const response = await fetch(`${API_URL}/mensajes/mis-mensajes`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Error al obtener mensajes');
    return await response.json();
  },

  // Ver mensaje específico
  async getById(id) {
    const response = await fetch(`${API_URL}/mensajes/${id}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Error al obtener mensaje');
    return await response.json();
  },

  // ADMIN: Ver todos los mensajes
  async getAll() {
    const response = await fetch(`${API_URL}/mensajes`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Error al obtener mensajes');
    return await response.json();
  },

  // ADMIN: Filtrar por estado
  async getByEstado(estado) {
    const response = await fetch(`${API_URL}/mensajes/estado/${estado}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Error al filtrar mensajes');
    return await response.json();
  },

  // ADMIN: Marcar como leído
  async markAsRead(id) {
    const response = await fetch(`${API_URL}/mensajes/${id}/marcar-leido`, {
      method: 'PUT',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Error al marcar como leído');
    return await response.json();
  },

  // ADMIN: Responder mensaje
  async responder(id, respuesta) {
    const response = await fetch(`${API_URL}/mensajes/${id}/responder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ respuesta })
    });

    if (!response.ok) throw new Error('Error al responder mensaje');
    return await response.json();
  },

  // ADMIN: Eliminar mensaje
  async delete(id) {
    const response = await fetch(`${API_URL}/mensajes/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Error al eliminar mensaje');
    return await response.json();
  },

  // ADMIN: Estadísticas
  async getEstadisticas() {
    const response = await fetch(`${API_URL}/mensajes/estadisticas/resumen`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Error al obtener estadísticas');
    return await response.json();
  }
};
