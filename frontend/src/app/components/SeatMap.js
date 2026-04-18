'use client';

import { useState } from 'react';
import styles from './SeatMap.module.css';

/**
 * Componente para mostrar el mapa de asientos del avión
 * @param {Object} props
 * @param {Array} props.asientos - Lista de asientos del vuelo
 * @param {Array} props.currentUserSeats - IDs de asientos actuales del usuario
 * @param {number} props.selectedSeatId - ID del asiento seleccionado
 * @param {Function} props.onSeatSelect - Callback cuando se selecciona un asiento
 * @param {string} props.tipoVuelo - 'NACIONAL' o 'INTERNACIONAL'
 * @param {string} props.claseReserva - 'PRIMERACLASE' o 'SEGUNDACLASE'
 * @param {boolean} props.isReadOnly - Si es vista de solo lectura (admin)
 */
export default function SeatMap({ 
  asientos = [], 
  currentUserSeats = [], 
  selectedSeatId, 
  onSeatSelect,
  tipoVuelo = 'NACIONAL',
  claseReserva = 'SEGUNDACLASE',
  isReadOnly = false
}) {
  // Agrupar asientos por fila
  const seatsByRow = asientos.reduce((acc, seat) => {
    if (!acc[seat.fila]) {
      acc[seat.fila] = [];
    }
    acc[seat.fila].push(seat);
    return acc;
  }, {});

  // Ordenar filas
  const sortedRows = Object.keys(seatsByRow).sort((a, b) => Number(a) - Number(b));

  // Determinar si una fila es primera clase
  const isFirstClass = (row) => {
    const seats = seatsByRow[row];
    return seats.some(s => s.clase === 'PRIMERACLASE');
  };

  // Obtener el estado visual de un asiento
  const getSeatStatus = (seat) => {
    // Para admin o vista de solo lectura - mostrar estado real siempre
    if (isReadOnly) {
      if (seat.estado === 'DISPONIBLE') return 'available';
      if (seat.estado === 'OCUPADO') return 'occupied';
      if (seat.estado === 'RESERVADO') return 'reserved';
      return 'available'; // Fallback
    }
    
    // Para usuarios normales
    if (currentUserSeats.includes(seat.id_asiento)) return 'current';
    if (selectedSeatId === seat.id_asiento) return 'selected';
    if (seat.estado === 'OCUPADO') return 'occupied';
    if (seat.estado === 'RESERVADO') return 'reserved';
    if (seat.estado === 'DISPONIBLE' && seat.clase === claseReserva) return 'available';
    return 'unavailable';
  };

  // Determinar si un asiento es clickeable
  const isSeatClickable = (seat) => {
    // Si es admin, no es clickeable
    if (isReadOnly) return false;
    
    const status = getSeatStatus(seat);
    return status === 'available' || status === 'current';
  };

  // Renderizar un asiento individual
  const renderSeat = (seat) => {
    const status = getSeatStatus(seat);
    const clickable = isSeatClickable(seat);

    return (
      <button
        key={seat.id_asiento}
        className={`${styles.seat} ${styles[status]} ${!clickable && !isReadOnly ? styles.disabled : ''}`}
        onClick={() => clickable && onSeatSelect && onSeatSelect(seat)}
        disabled={!clickable}
        title={`${seat.asiento} - ${getSeatStatusText(status)}`}
      >
        <span className={styles.seatLabel}>{seat.asiento}</span>
      </button>
    );
  };

  // Obtener texto descriptivo del estado
  const getSeatStatusText = (status) => {
    const texts = {
      available: 'Disponible',
      occupied: 'Ocupado',
      reserved: 'Reservado',
      current: 'Tu asiento actual',
      selected: 'Seleccionado',
      unavailable: isReadOnly ? 'Disponible' : 'No disponible para tu clase'
    };
    return texts[status] || '';
  };

  // Renderizar una fila de asientos
  const renderRow = (rowNumber) => {
    const seats = seatsByRow[rowNumber];
    const isFC = isFirstClass(rowNumber);
    
    // Crear un mapa de asientos por columna
    const seatMap = {};
    seats.forEach(seat => {
      seatMap[seat.columna] = seat;
    });

    // Renderizar asiento o espacio vacío
    const renderSeatOrSpace = (column) => {
      if (seatMap[column]) {
        return renderSeat(seatMap[column]);
      }
      // Espacio vacío para mantener alineación
      return <div key={`empty-${rowNumber}-${column}`} className={styles.emptySeat}></div>;
    };

    return (
      <div key={rowNumber} className={`${styles.row} ${isFC ? styles.firstClass : styles.secondClass}`}>
        <div className={styles.rowNumber}>{rowNumber}</div>
        
        <div className={styles.seatsContainer}>
          {/* Lado izquierdo */}
          <div className={styles.seatGroup}>
            {renderSeatOrSpace('A')}
            {renderSeatOrSpace('B')}
            {renderSeatOrSpace('C')}
          </div>

          {/* Pasillo */}
          <div className={styles.aisle}></div>

          {/* Lado derecho */}
          <div className={styles.seatGroup}>
            {renderSeatOrSpace('D')}
            {renderSeatOrSpace('E')}
            {renderSeatOrSpace('F')}
          </div>
        </div>

        <div className={styles.rowNumber}>{rowNumber}</div>
      </div>
    );
  };

  // Encontrar la fila que divide Primera y Segunda clase
  const dividerRow = sortedRows.find((row, idx) => {
    if (idx === 0) return false;
    const prevRow = sortedRows[idx - 1];
    return isFirstClass(prevRow) && !isFirstClass(row);
  });

  return (
    <div className={styles.seatMapContainer}>
      {/* Leyenda */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSeat} ${styles.available}`}></div>
          <span className="text-gray-700 font-medium">Disponible</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSeat} ${styles.occupied}`}></div>
          <span className="text-gray-700 font-medium">Ocupado</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendSeat} ${styles.reserved}`}></div>
          <span className="text-gray-700 font-medium">Reservado</span>
        </div>
        {currentUserSeats.length > 0 && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.current}`}></div>
            <span className="text-gray-700 font-medium">Tu asiento</span>
          </div>
        )}
        {selectedSeatId && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.selected}`}></div>
            <span className="text-gray-700 font-medium">Seleccionado</span>
          </div>
        )}
      </div>

      {/* Mapa de asientos */}
      <div className={styles.airplane}>
        {/* Cabecera del avión */}
        <div className={styles.planeNose}>
          <div className={styles.cockpit}></div>
        </div>

        {/* Etiquetas de columnas */}
        <div className={styles.columnLabels}>
          <div className={styles.rowNumber}></div>
          <div className={styles.seatsContainer}>
            <div className={styles.seatGroup}>
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>
            <div className={styles.aisle}></div>
            <div className={styles.seatGroup}>
              <span>D</span>
              <span>E</span>
              <span>F</span>
            </div>
          </div>
          <div className={styles.rowNumber}></div>
        </div>

        {/* Asientos */}
        <div className={styles.seatsSection}>
          {sortedRows.map((row) => {
            // Añadir divisor entre Primera y Segunda clase
            if (row === dividerRow) {
              return (
                <div key={`divider-${row}`}>
                  <div className={styles.classDivider}>
                    <span>Primera Clase</span>
                    <div className={styles.dividerLine}></div>
                    <span>Segunda Clase</span>
                  </div>
                  {renderRow(row)}
                </div>
              );
            }
            return renderRow(row);
          })}
        </div>

        {/* Cola del avión */}
        <div className={styles.planeTail}></div>
      </div>
    </div>
  );
}
