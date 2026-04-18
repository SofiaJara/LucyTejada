'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import { mensajeService } from '@/utils/mensajeService';

export default function MyMessagesPage() {
  const router = useRouter();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMensaje, setSelectedMensaje] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    loadMensajes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMensajes = async () => {
    try {
      const data = await mensajeService.getMyMessages();
      setMensajes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: '⏳' },
      LEIDO: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: '👀' },
      RESPONDIDO: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: '✅' }
    };
    return badges[estado] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: '📝' };
  };

  const mensajesFiltrados = filtro === 'TODOS' 
    ? mensajes 
    : mensajes.filter(m => m.estado === filtro);

  const estadisticas = {
    total: mensajes.length,
    pendientes: mensajes.filter(m => m.estado === 'PENDIENTE').length,
    respondidos: mensajes.filter(m => m.estado === 'RESPONDIDO').length
  };

  if (loading) {
    return <LoadingScreen message="Cargando mensajes..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📬 Mis Mensajes</h1>
              <p className="text-gray-600 mt-2">Historial de consultas y respuestas</p>
            </div>
            <Link
              href="/support"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
            >
              ➕ Nuevo Mensaje
            </Link>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900">{estadisticas.total}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700 font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-900">{estadisticas.pendientes}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Respondidos</p>
              <p className="text-3xl font-bold text-green-900">{estadisticas.respondidos}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['TODOS', 'PENDIENTE', 'LEIDO', 'RESPONDIDO'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtro === f 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f === 'TODOS' ? '📋' : f === 'PENDIENTE' ? '⏳' : f === 'LEIDO' ? '👀' : '✅'} {f}
              </button>
            ))}
          </div>

          {/* Lista de mensajes */}
          <div className="space-y-4">
            {mensajesFiltrados.map((mensaje) => {
              const badge = getEstadoBadge(mensaje.estado);
              return (
                <div 
                  key={mensaje.id_mensaje} 
                  className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow hover:border-blue-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{mensaje.asunto}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(mensaje.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text} border ${badge.border}`}>
                      {badge.icon} {mensaje.estado}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-3 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700 font-medium mb-1">Tu mensaje:</p>
                    <p className="text-gray-800">
                      {mensaje.contenido.length > 200 
                        ? `${mensaje.contenido.substring(0, 200)}...` 
                        : mensaje.contenido}
                    </p>
                  </div>

                  {mensaje.respuesta && (
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500 mb-3">
                      <p className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        Respuesta de nuestro equipo:
                      </p>
                      <p className="text-gray-900 leading-relaxed">{mensaje.respuesta}</p>
                      <p className="text-xs text-green-700 mt-2">
                        Respondido el {new Date(mensaje.fecha_respuesta).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedMensaje(selectedMensaje?.id_mensaje === mensaje.id_mensaje ? null : mensaje)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      {selectedMensaje?.id_mensaje === mensaje.id_mensaje ? '▲ Ver menos' : '▼ Ver más detalles'}
                    </button>
                  </div>

                  {selectedMensaje?.id_mensaje === mensaje.id_mensaje && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Contenido completo:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{mensaje.contenido}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {mensajesFiltrados.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {filtro === 'TODOS' ? 'No tienes mensajes' : `No hay mensajes ${filtro.toLowerCase()}`}
              </h3>
              <p className="text-gray-500 mb-6">
                {filtro === 'TODOS' 
                  ? '¿Necesitas ayuda? Envía tu primer mensaje al equipo de soporte'
                  : 'Intenta cambiar el filtro para ver otros mensajes'}
              </p>
              {filtro === 'TODOS' && (
                <Link
                  href="/support"
                  className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  ➕ Enviar Mensaje
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Volver */}
        <div className="mt-6 text-center">
          <Link
            href="/account"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a Mi Cuenta
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
