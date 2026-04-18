'use client';
import { useState, useEffect } from 'react';
import AdminCard from '../../components/AdminCard';
import AdminForm from '../../components/AdminForm';
import adminService from '../../services/adminService';
import CustomPopup from '../../components/CustomPopup';
import usePopup from '../../hooks/usePopup';

export default function RootDashboard() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { popupState, showSuccess, showError, closePopup } = usePopup();

  // Load admins on component mount
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const adminsData = await adminService.getAdmins();
      setAdmins(adminsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdmins();
    setRefreshing(false);
  };

  const handleCreateAdmin = () => {
    setShowForm(true);
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      await adminService.deleteAdmin(adminId);
      setAdmins(prev => prev.filter(admin => admin.id_usuario !== adminId));
      showSuccess('Administrador eliminado exitosamente');
    } catch (err) {
      showError('Error al eliminar administrador: ' + err.message);
      console.error('Error deleting admin:', err);
    }
  };

  const handleSaveAdmin = async (formData) => {
    try {
      // Create new admin
      await adminService.createAdmin(formData);
      showSuccess('Administrador creado exitosamente');
      
      setShowForm(false);
      await loadAdmins(); // Refresh the list
    } catch (err) {
      throw err; // Re-throw to let AdminForm handle the error display
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    const matchesUsername = admin.descripcion_usuario?.toLowerCase().includes(searchLower);
    const matchesEmail = admin.correo_electronico?.toLowerCase().includes(searchLower);
    const matchesName = admin.usuarioPerfil?.nombre?.toLowerCase().includes(searchLower);
    const matchesLastName = admin.usuarioPerfil?.apellido?.toLowerCase().includes(searchLower);
    
    return matchesUsername || matchesEmail || matchesName || matchesLastName;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-1 min-w-0">
              <div className="bg-red-600 rounded-lg p-2 mr-3 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Panel de Administración Root</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Gestión de Administradores</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 ml-4 pr-16 sm:pr-10">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Usuario Root</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">R</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">Administradores del Sistema</h2>
              <p className="text-gray-600">Gestiona los usuarios administradores del sistema</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
              
              <button
                onClick={handleCreateAdmin}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Administrador
              </button>
            </div>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0 flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar administradores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-gray-700 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Mostrando {filteredAdmins.length} de {admins.length} administradores
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Admins List */}
        <div className="space-y-4">
          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron administradores' : 'No hay administradores registrados'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza creando tu primer administrador'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateAdmin}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear Primer Administrador
                </button>
              )}
            </div>
          ) : (
            filteredAdmins.map((admin) => (
              <AdminCard
                key={admin.id_usuario}
                admin={admin}
                onDelete={handleDeleteAdmin}
              />
            ))
          )}
        </div>
      </main>

      {/* Admin Form Modal */}
      <AdminForm
        onSave={handleSaveAdmin}
        onCancel={handleCancelForm}
        isOpen={showForm}
      />
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