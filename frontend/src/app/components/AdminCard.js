'use client';
import CustomPopup from './CustomPopup';
import usePopup from '../hooks/usePopup';

export default function AdminCard({ admin, onDelete }) {
  const { popupState, showConfirm, closePopup } = usePopup();

  const handleDelete = () => {
    showConfirm(
      `¿Estás seguro de que deseas eliminar al administrador ${admin.descripcion_usuario}?`,
      () => onDelete(admin.id_usuario),
      'Eliminar Administrador',
      'Sí, eliminar',
      'Cancelar'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-lg">
                {admin.descripcion_usuario?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{admin.descripcion_usuario}</h3>
              <p className="text-sm text-gray-500">Administrador</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span>{admin.correo_electronico}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v4m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span>ID: {admin.id_usuario}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>
      <CustomPopup
        isOpen={popupState.isOpen}
        onClose={closePopup}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        onConfirm={popupState.onConfirm}
        confirmText={popupState.confirmText}
        cancelText={popupState.cancelText}
      />
    </div>
  );
}