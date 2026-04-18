/**
 * Zonas horarias (UTC offset en horas) para las ciudades del sistema
 */

export const cityTimezones = {
  // Colombia (todas en UTC-5)
  'Pereira': -5,
  'Bogotá': -5,
  'Bogota': -5,
  'Cali': -5,
  'Medellín': -5,
  'Medellin': -5,
  'Cartagena': -5,
  
  // Europa
  'Madrid': 1,      // UTC+1 (CET) - Puede ser UTC+2 en verano (CEST)
  'Londres': 0,     // UTC+0 (GMT) - Puede ser UTC+1 en verano (BST)
  
  // Estados Unidos
  'New York': -5,   // UTC-5 (EST) - Puede ser UTC-4 en verano (EDT)
  'Miami': -5,      // UTC-5 (EST) - Puede ser UTC-4 en verano (EDT)
  
  // Sudamérica
  'Buenos Aires': -3 // UTC-3 (ART)
};

/**
 * Obtiene el offset UTC de una ciudad
 * @param {string} ciudad - Nombre de la ciudad
 * @returns {number} Offset en horas respecto a UTC
 */
export const getCityTimezone = (ciudad) => {
  return cityTimezones[ciudad] || 0;
};

/**
 * Convierte una hora local a UTC
 * @param {Date} fecha - Fecha en hora local
 * @param {string} ciudad - Ciudad de referencia
 * @returns {Date} Fecha en UTC
 */
export const toUTC = (fecha, ciudad) => {
  const offset = getCityTimezone(ciudad);
  const utcDate = new Date(fecha);
  utcDate.setHours(utcDate.getHours() - offset);
  return utcDate;
};

/**
 * Convierte una hora UTC a hora local de una ciudad
 * @param {Date} fechaUTC - Fecha en UTC
 * @param {string} ciudad - Ciudad de destino
 * @returns {Date} Fecha en hora local
 */
export const fromUTC = (fechaUTC, ciudad) => {
  const offset = getCityTimezone(ciudad);
  const localDate = new Date(fechaUTC);
  localDate.setHours(localDate.getHours() + offset);
  return localDate;
};

/**
 * Formatea una fecha mostrando hora local y UTC
 * @param {Date} fecha - Fecha a formatear
 * @param {string} ciudad - Ciudad de referencia
 * @returns {object} Objeto con hora local y UTC formateadas
 */
export const formatWithTimezone = (fecha, ciudad) => {
  const offset = getCityTimezone(ciudad);
  const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
  
  const horaLocal = fecha.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const fechaUTC = toUTC(fecha, ciudad);
  const horaUTC = fechaUTC.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC'
  });
  
  return {
    local: horaLocal,
    utc: horaUTC,
    offset: offsetStr,
    offsetHoras: offset
  };
};

export default cityTimezones;
