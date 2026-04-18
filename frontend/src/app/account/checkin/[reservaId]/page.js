'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SeatMap from '../../../components/SeatMap';
import { seatService } from '../../../services/seatService';
import { reservationService } from '../../../services/reservationService';
import usePopup from '../../../hooks/usePopup';
import CustomPopup from '../../../components/CustomPopup';
import styles from './page.module.css';
import API_URL from '@/utils/api';

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const { popupState, showSuccess, showError, showConfirm, closePopup } = usePopup();
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
  const [checkInCompleto, setCheckInCompleto] = useState(false);

  useEffect(() => {
    loadReservationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservaId]);

  const loadReservationData = async () => {
    try {
      setLoading(true);

      // Obtener datos de la reserva
      const reservaData = await reservationService.getReservationById(reservaId);
      
      if (!reservaData) {
        showError('Reserva no encontrada');
        router.push('/account/history');
        return;
      }

      // Verificar que la reserva esté pagada
      if (reservaData.estado_reserva !== 'PAGADA') {
        showError('Solo puedes hacer check-in de reservas pagadas');
        router.push('/account/history');
        return;
      }

      setReserva(reservaData);

      // Obtener segmentos de viaje de la reserva
      const segmentosResponse = await fetch(`${API_URL}/api/v1/segmentos-viaje/reserva/${reservaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!segmentosResponse.ok) {
        throw new Error('Error al obtener segmentos de viaje');
      }

      const segmentosData = await segmentosResponse.json();
      const segmentos = segmentosData.data || segmentosData;

      // Extraer información de vuelos y viajeros de los segmentos
      const viajerosMap = new Map();
      let vueloIda = null;
      let vueloVuelta = null;
      let todosConCheckIn = true;

      segmentos.forEach(seg => {
        // Agrupar viajeros únicos
        if (!viajerosMap.has(seg.viajero_id)) {
          const nombreCompleto = [
            seg.viajero?.primer_nombre,
            seg.viajero?.segundo_nombre,
            seg.viajero?.primer_apellido,
            seg.viajero?.segundo_apellido
          ].filter(Boolean).join(' ').trim();

          viajerosMap.set(seg.viajero_id, {
            id: seg.viajero_id,
            nombre: nombreCompleto || `Viajero ${seg.viajero_id}`,
            checkInRealizado: false,
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
          vuelo_id: seg.vuelo_id,
          checkIn: false // TODO: obtener de tiquete cuando esté implementado en backend
        };

        // Verificar si todos tienen check-in (simulado por ahora)
        if (!viajero.checkInRealizado) {
          todosConCheckIn = false;
        }

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
      setCheckInCompleto(todosConCheckIn);

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
      router.push('/account/history');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seat) => {
    if (checkInCompleto) {
      showError('No puedes cambiar asientos después de realizar el check-in');
      return;
    }
    setSelectedSeat(seat);
  };

  const handleConfirmChange = async () => {
    if (checkInCompleto) {
      showError('No puedes cambiar asientos después de realizar el check-in');
      return;
    }

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

  const handleCheckIn = () => {
    showConfirm(
      '¿Estás seguro de realizar el check-in? Una vez confirmado, no podrás cambiar tus asientos.',
      async () => {
        try {
          setSaving(true);
          
          // TODO: Cuando el backend tenga el endpoint de check-in, llamarlo aquí
          // await checkInService.realizarCheckIn(reservaId);
          
          // Por ahora, solo simular el check-in
          setCheckInCompleto(true);
          showSuccess('✅ Check-in realizado exitosamente. Se ha enviado un correo de confirmación.');
          
          // Nota: El correo se enviará cuando se implemente el endpoint en el backend
          
        } catch (error) {
          console.error('Error en check-in:', error);
          showError(error.message || 'Error al realizar el check-in');
        } finally {
          setSaving(false);
        }
      },
      'Confirmar Check-in'
    );
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
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!reserva) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.push('/account/history')} className={styles.backButton}>
          ← Volver al Historial
        </button>
        <h1>✈️ Check-in y Selección de Asientos</h1>
        <p className={styles.reservaCode}>Reserva #{reserva.codigo_reserva}</p>
        
        {checkInCompleto && (
          <div className={styles.checkInStatus}>
            ✅ Check-in completado - Los asientos ya no se pueden cambiar
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Información y botón de Check-in */}
        {!checkInCompleto && (
          <div className={styles.checkInSection}>
            <div className={styles.checkInInfo}>
              <h3>📋 Instrucciones</h3>
              <p>1. Revisa y ajusta los asientos de todos los pasajeros si lo deseas</p>
              <p>2. Una vez estés conforme, realiza el check-in</p>
              <p className={styles.warning}>⚠️ Después del check-in no podrás cambiar los asientos</p>
            </div>
            <button 
              className={styles.checkInButton}
              onClick={handleCheckIn}
              disabled={saving}
            >
              {saving ? 'Procesando...' : '✈️ Realizar Check-in'}
            </button>
          </div>
        )}

        {/* Selector de Viajero */}
        <div className={styles.viajeroSelector}>
          <h3>Pasajeros</h3>
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
            <h3>Selecciona el Vuelo</h3>
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
            <h3>{checkInCompleto ? 'Vista de Asientos' : 'Selecciona tu Asiento'}</h3>
            {selectedSeat && !checkInCompleto && (
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
              readOnly={checkInCompleto}
            />

            {!checkInCompleto && (
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
            )}
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
