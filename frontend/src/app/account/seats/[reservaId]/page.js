'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SeatMap from '../../../components/SeatMap';
import { seatService } from '../../../services/seatService';
import { reservationService } from '../../../services/reservationService';
import usePopup from '../../../hooks/usePopup';
import CustomPopup from '../../../components/CustomPopup';
import LoadingScreen from '../../../components/LoadingScreen';
import styles from './page.module.css';
import API_URL from '@/utils/api';

export default function SeatSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const { popupState, showSuccess, showError, closePopup } = usePopup();
  const reservaId = params.reservaId;

  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState(null);
  const [vuelos, setVuelos] = useState({ ida: null, vuelta: null });
  const [asientosIda, setAsientosIda] = useState([]);
  const [asientosVuelta, setAsientosVuelta] = useState([]);
  const [viajeros, setViajeros] = useState([]);
  const [selectedViajero, setSelectedViajero] = useState(null);
  const [selectedTrayecto, setSelectedTrayecto] = useState('IDA');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReservationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservaId]);

  const loadReservationData = async () => {
    try {
      setLoading(true);
      console.log('Cargando datos de reserva:', reservaId);

      // Obtener datos de la reserva
      const reservaData = await reservationService.getReservationById(reservaId);
      console.log('Reserva obtenida:', reservaData);
      
      if (!reservaData) {
        showError('Reserva no encontrada');
        router.push('/account/change-seat');
        return;
      }

      // Verificar que la reserva esté ACTIVA o PAGADA
      if (reservaData.estado_reserva !== 'PAGADA' && reservaData.estado_reserva !== 'ACTIVA') {
        showError('Solo puedes cambiar asientos de reservas activas o pagadas');
        router.push('/account/change-seat');
        return;
      }

      setReserva(reservaData);

      // Obtener segmentos de viaje de la reserva
      console.log('Obteniendo segmentos de reserva...');
      const segmentosResponse = await fetch(`${API_URL}/api/v1/segmentos-viaje/reserva/${reservaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!segmentosResponse.ok) {
        const errorData = await segmentosResponse.json();
        console.error('Error al obtener segmentos:', errorData);
        throw new Error(errorData.message || 'Error al obtener segmentos de viaje');
      }

      const segmentosData = await segmentosResponse.json();
      const segmentos = segmentosData.data || segmentosData;
      console.log('Segmentos obtenidos:', segmentos);

      if (!segmentos || segmentos.length === 0) {
        showError('Esta reserva aún no tiene asientos asignados. Completa tu reserva primero.');
        router.push('/account/change-seat');
        return;
      }

      // Extraer información de vuelos y viajeros de los segmentos
      const viajerosMap = new Map();
      let vueloIda = null;
      let vueloVuelta = null;

      segmentos.forEach(seg => {
        // Agrupar viajeros únicos
        if (!viajerosMap.has(seg.viajero_id)) {
          // Construir nombre completo del viajero
          const nombreCompleto = [
            seg.viajero?.primer_nombre,
            seg.viajero?.segundo_nombre,
            seg.viajero?.primer_apellido,
            seg.viajero?.segundo_apellido
          ].filter(Boolean).join(' ').trim();

          viajerosMap.set(seg.viajero_id, {
            id: seg.viajero_id,
            nombre: nombreCompleto || `Viajero ${seg.viajero_id}`,
            segmentos: {
              IDA: null,
              VUELTA: null
            }
          });
        }

        const viajero = viajerosMap.get(seg.viajero_id);
        viajero.segmentos[seg.trayecto] = {
          id_segmento: seg.id_segmento,
          asiento_id: seg.asiento_id,
          asiento: seg.asiento?.asiento || '',
          vuelo_id: seg.vuelo_id
        };

        // Guardar información de vuelos
        if (seg.trayecto === 'IDA' && !vueloIda) {
          vueloIda = {
            id: seg.vuelo_id,
            vuelo: seg.vuelo,
            ruta: seg.vuelo?.ruta
          };
        } else if (seg.trayecto === 'VUELTA' && !vueloVuelta) {
          vueloVuelta = {
            id: seg.vuelo_id,
            vuelo: seg.vuelo,
            ruta: seg.vuelo?.ruta
          };
        }
      });

      setVuelos({ ida: vueloIda, vuelta: vueloVuelta });
      const viajerosArray = Array.from(viajerosMap.values());
      setViajeros(viajerosArray);

      // Seleccionar el primer viajero por defecto
      if (viajerosArray.length > 0) {
        setSelectedViajero(viajerosArray[0]);
      }

      // Cargar asientos de ambos vuelos
      if (vueloIda) {
        const asientosIdaData = await seatService.getAsientosByVueloId(vueloIda.id);
        setAsientosIda(asientosIdaData);
      }

      if (vueloVuelta) {
        const asientosVueltaData = await seatService.getAsientosByVueloId(vueloVuelta.id);
        setAsientosVuelta(asientosVueltaData);
      }

    } catch (error) {
      console.error('Error loading reservation:', error);
      showError(error.message || 'Error al cargar la reserva');
      setTimeout(() => {
        router.push('/account/change-seat');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
  };

  const handleConfirmChange = async () => {
    if (!selectedSeat || !selectedViajero) {
      showError('Por favor selecciona un asiento');
      return;
    }

    const segmento = selectedViajero.segmentos[selectedTrayecto];
    if (!segmento) {
      showError('No hay segmento de viaje para este trayecto');
      return;
    }

    // Verificar si el asiento seleccionado es diferente al actual
    if (segmento.asiento_id === selectedSeat.id_asiento) {
      showError('Este ya es tu asiento actual');
      return;
    }

    try {
      setSaving(true);

      // Cambiar el asiento
      await seatService.cambiarAsiento(segmento.id_segmento, selectedSeat.id_asiento);

      showSuccess('¡Asiento cambiado exitosamente!');

      // Recargar datos
      await loadReservationData();
      setSelectedSeat(null);

    } catch (error) {
      console.error('Error changing seat:', error);
      showError(error.message || 'Error al cambiar el asiento');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentUserSeats = () => {
    if (!selectedViajero) return [];
    
    const asientosIds = [];
    const segmentoIda = selectedViajero.segmentos.IDA;
    const segmentoVuelta = selectedViajero.segmentos.VUELTA;

    if (selectedTrayecto === 'IDA' && segmentoIda) {
      asientosIds.push(segmentoIda.asiento_id);
    } else if (selectedTrayecto === 'VUELTA' && segmentoVuelta) {
      asientosIds.push(segmentoVuelta.asiento_id);
    }

    return asientosIds;
  };

  const getCurrentAsientos = () => {
    return selectedTrayecto === 'IDA' ? asientosIda : asientosVuelta;
  };

  const getTipoVuelo = () => {
    const vuelo = selectedTrayecto === 'IDA' ? vuelos.ida : vuelos.vuelta;
    return vuelo?.ruta?.tipo_ruta || 'NACIONAL';
  };

  if (loading) {
    return <LoadingScreen message="Cargando información de asientos..." />;
  }

  if (!reserva) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.push('/account/change-seat')} className={styles.backButton}>
          ← Volver a Cambio de Silla
        </button>
        <h1>Cambiar Asientos</h1>
        <p className={styles.reservaCode}>Reserva #{reserva.codigo_reserva}</p>
      </div>

      <div className={styles.content}>
        {/* Selector de Viajero */}
        <div className={styles.viajeroSelector}>
          <h3>Selecciona el Viajero</h3>
          <div className={styles.viajerosList}>
            {viajeros.map((viajero) => (
              <button
                key={viajero.id}
                className={`${styles.viajeroCard} ${selectedViajero?.id === viajero.id ? styles.active : ''}`}
                onClick={() => {
                  setSelectedViajero(viajero);
                  setSelectedSeat(null);
                }}
              >
                <div className={styles.viajeroName}>
                  {viajero.nombre || `Viajero ${viajero.id}`}
                </div>
                <div className={styles.viajeroSeats}>
                  {viajero.segmentos.IDA && (
                    <span className={styles.seatBadge}>
                      IDA: {viajero.segmentos.IDA.asiento}
                    </span>
                  )}
                  {viajero.segmentos.VUELTA && (
                    <span className={styles.seatBadge}>
                      VUELTA: {viajero.segmentos.VUELTA.asiento}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Trayecto */}
        {selectedViajero && (
          <div className={styles.trayectoSelector}>
            <h3>Selecciona el Trayecto</h3>
            <div className={styles.trayectoButtons}>
              {vuelos.ida && (
                <button
                  className={`${styles.trayectoButton} ${selectedTrayecto === 'IDA' ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedTrayecto('IDA');
                    setSelectedSeat(null);
                  }}
                >
                  <div className={styles.trayectoLabel}>Vuelo de Ida</div>
                  <div className={styles.trayectoRoute}>
                    {vuelos.ida.ruta?.origen?.nombre_ciudad} → {vuelos.ida.ruta?.destino?.nombre_ciudad}
                  </div>
                  <div className={styles.currentSeat}>
                    Asiento actual: <strong>{selectedViajero.segmentos.IDA?.asiento || 'N/A'}</strong>
                  </div>
                </button>
              )}
              {vuelos.vuelta && (
                <button
                  className={`${styles.trayectoButton} ${selectedTrayecto === 'VUELTA' ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedTrayecto('VUELTA');
                    setSelectedSeat(null);
                  }}
                >
                  <div className={styles.trayectoLabel}>Vuelo de Vuelta</div>
                  <div className={styles.trayectoRoute}>
                    {vuelos.vuelta.ruta?.destino?.nombre_ciudad} → {vuelos.vuelta.ruta?.origen?.nombre_ciudad}
                  </div>
                  <div className={styles.currentSeat}>
                    Asiento actual: <strong>{selectedViajero.segmentos.VUELTA?.asiento || 'N/A'}</strong>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mapa de Asientos */}
        {selectedViajero && (
          <div className={styles.seatMapSection}>
            <h3>Selecciona tu Nuevo Asiento</h3>
            {selectedSeat && (
              <div className={styles.selectedInfo}>
                <p>Has seleccionado el asiento: <strong>{selectedSeat.asiento}</strong></p>
                <p className={styles.seatClass}>
                  Clase: {selectedSeat.clase === 'PRIMERACLASE' ? 'Primera Clase' : 'Segunda Clase'}
                </p>
              </div>
            )}
            
            <SeatMap
              asientos={getCurrentAsientos()}
              currentUserSeats={getCurrentUserSeats()}
              selectedSeatId={selectedSeat?.id_asiento}
              onSeatSelect={handleSeatSelect}
              tipoVuelo={getTipoVuelo()}
              claseReserva={reserva.clase_reserva}
            />

            <div className={styles.actionButtons}>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmChange}
                disabled={!selectedSeat || saving}
              >
                {saving ? 'Cambiando...' : 'Confirmar Cambio de Asiento'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setSelectedSeat(null)}
                disabled={!selectedSeat || saving}
              >
                Cancelar Selección
              </button>
            </div>
          </div>
        )}
      </div>

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
