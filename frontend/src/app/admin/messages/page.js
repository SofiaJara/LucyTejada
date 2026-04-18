'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import { mensajeService } from '@/utils/mensajeService';

export default function AdminMessagesPage() {
  const router = useRouter();
  const [mensajes, setMensajes] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [selectedMensaje, setSelectedMensaje] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Verificar que es admin
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.id_rol !== 2 && parsedUser.id_rol !== 1) {
        router.push('/');
        return;
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
      return;
    }

    loadData();
  }, [filtro]);

  const loadData = async () => {
    try {
      const stats = await mensajeService.getEstadisticas();
      setEstadisticas(stats);

      if (filtro === 'TODOS') {
        const data = await mensajeService.getAll();
        setMensajes(data);
      } else {
        const data = await mensajeService.getByEstado(filtro);
        setMensajes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (id) => {
    if (!respuesta.trim() || respuesta.length < 10) {
      alert('La respuesta debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await mensajeService.responder(id, respuesta);
      setRespuesta('');
      setSelectedMensaje(null);
      loadData();
      alert('✅ Respuesta enviada exitosamente. El cliente recibirá un email.');
    } catch (err) {
      alert('❌ Error al enviar respuesta: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await mensajeService.markAsRead(id);
      loadData();
    } catch (err) {
      alert('Error al marcar como leído');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return;

    try {
      await mensajeService.delete(id);
      loadData();
      alert('Mensaje eliminado exitosamente');
    } catch (err) {
      alert('Error al eliminar mensaje');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      LEIDO: 'bg-blue-100 text-blue-800 border-blue-300',
      RESPONDIDO: 'bg-green-100 text-green-800 border-green-300'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-xl">Cargando mensajes...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">💬 Gestión de Mensajes</h1>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900">{estadisticas.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 font-medium">Leídos</p>
              <p className="text-3xl font-bold text-blue-600">{estadisticas.leidos}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <p className="text-sm text-gray-600 font-medium">Respondidos</p>
              <p className="text-3xl font-bold text-green-600">{estadisticas.respondidos}</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['TODOS', 'PENDIENTE', 'LEIDO', 'RESPONDIDO'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filtro === f 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista de mensajes */}
        <div className="space-y-4">
          {mensajes.map((mensaje) => (
            <div key={mensaje.id_mensaje} className="bg-white border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{mensaje.asunto}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-800">
                    <p>
                      <span className="font-medium">De:</span> {mensaje.cliente?.correo_electronico}
                    </p>
                    <p>
                      <span className="font-medium">Enviado:</span> {new Date(mensaje.fecha_creacion).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getEstadoBadge(mensaje.estado)}`}>
                    {mensaje.estado}
                  </span>
                  <button
                    onClick={() => handleDelete(mensaje.id_mensaje)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                <p className="text-sm font-semibold text-gray-700 mb-2">Mensaje del cliente:</p>
                <p className="text-gray-900">{mensaje.contenido}</p>
              </div>

              {mensaje.respuesta && (
                <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-500">
                  <p className="text-sm font-semibold text-green-800 mb-2">Tu respuesta:</p>
                  <p className="text-gray-900">{mensaje.respuesta}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Respondido el {new Date(mensaje.fecha_respuesta).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {mensaje.estado === 'PENDIENTE' && (
                  <button
                    onClick={() => handleMarkAsRead(mensaje.id_mensaje)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow"
                  >
                    👀 Marcar como leído
                  </button>
                )}
                {mensaje.estado !== 'RESPONDIDO' && (
                  <button
                    onClick={() => setSelectedMensaje(mensaje)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium shadow"
                  >
                    ✉️ Responder
                  </button>
                )}
              </div>

              {/* Modal de respuesta */}
              {selectedMensaje?.id_mensaje === mensaje.id_mensaje && (
                <div className="mt-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h4 className="font-semibold text-lg mb-3 text-blue-900">Escribir Respuesta</h4>
                  <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    className="w-full p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                    placeholder="Escribe tu respuesta al cliente... (mínimo 10 caracteres)"
                    minLength={10}
                    maxLength={5000}
                  />
                  <p className="text-xs text-gray-600 mb-3 mt-1">{respuesta.length}/5000 caracteres</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleResponder(mensaje.id_mensaje)}
                      disabled={submitting || respuesta.length < 10}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                    >
                      {submitting ? '📤 Enviando...' : '📧 Enviar Respuesta'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMensaje(null);
                        setRespuesta('');
                      }}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    ℹ️ Al enviar, el cliente recibirá automáticamente un email con tu respuesta
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {mensajes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700">
              No hay mensajes {filtro !== 'TODOS' && filtro.toLowerCase()}
            </h3>
            <p className="text-gray-500 mt-2">
              {filtro === 'TODOS' 
                ? 'Aún no hay mensajes de clientes' 
                : 'Cambia el filtro para ver otros mensajes'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
