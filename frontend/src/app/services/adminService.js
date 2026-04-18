// API service for admin management
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    // If we're on a mobile device accessing via IP, use the same IP for backend
    const currentHost = window.location.hostname;
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      return `http://${currentHost}:3001`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = `${getBackendUrl()}/api/v1`;

class AdminService {
  // Función auxiliar para validar contraseña
  validatePassword(password) {
    if (!password || password.trim() === '') {
      return 'La contraseña es obligatoria';
    }
    
    if (password.includes(' ')) {
      return 'La contraseña no puede contener espacios';
    }
    
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    
    return null; // Sin errores
  }

  // Get all admins (users with id_rol = 2)
  async getAdmins() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 👈 se envían cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let users = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data.users && Array.isArray(data.users)) {
        users = data.users;
      } else if (data.usuario && Array.isArray(data.usuario)) {
        users = data.usuario;
      } else {
        console.log('Unexpected response format:', data);
        return [];
      }
      
      const admins = users.filter(user => user.id_rol === 2);
      
      console.log('All users:', users);
      console.log('Filtered admins:', admins);
      
      return admins;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw new Error('Error al obtener la lista de administradores');
    }
  }

  // Create a new admin
  async createAdmin(adminData) {
    try {
      // Validación de contraseña en el frontend
      const passwordError = this.validatePassword(adminData.contrasena);
      if (passwordError) {
        const error = new Error('Errores de validación');
        error.validationErrors = {
          contrasena: passwordError
        };
        throw error;
      }

      const userData = {
        descripcion_usuario: adminData.usuario,
        correo_electronico: adminData.correo_electronico,
        contrasena: adminData.contrasena,
        id_rol: 2,
      };

      // Enviar la estructura que espera el backend
      const payload = { usuario: userData }

      const response = await fetch(`${API_BASE_URL}/users/crear-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.log('Backend response:', JSON.stringify(errorData, null, 2));
        
        const validationErrors = {};
        
        // Manejar errores de validación específicos del backend
        // La estructura que envía el backend es: { code: 'VALIDATION_ERROR', fields: [...] }
        if (errorData.fields && Array.isArray(errorData.fields)) {
          errorData.fields.forEach(err => {
            if (err.code === 'USERNAME_EXISTS') {
              validationErrors.usuario = err.message || 'El nombre de usuario ya está en uso';
            } else if (err.code === 'EMAIL_EXISTS') {
              validationErrors.correo_electronico = err.message || 'El correo electrónico ya está registrado';
            } else if (err.code === 'PASSWORD_INVALID') {
              validationErrors.contrasena = err.message || 'La contraseña no cumple con los requisitos';
            }
          });
        }
        
        // Si hay errores de validación específicos, crear un error especial
        if (Object.keys(validationErrors).length > 0) {
          const error = new Error('Errores de validación');
          error.validationErrors = validationErrors;
          throw error;
        }
        
        // Si no hay errores de validación específicos, pero hay un error general
        throw new Error('Error al crear el administrador');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  // Update an existing admin
  async updateAdmin(adminId, adminData) {
    try {
      const userData = {
        descripcion_usuario: adminData.usuario,
        correo_electronico: adminData.correo_electronico,
        id_rol: 2,
      };

      // Validar contraseña solo si se está proporcionando una nueva
      if (adminData.contrasena && adminData.contrasena.trim()) {
        const passwordError = this.validatePassword(adminData.contrasena);
        if (passwordError) {
          const error = new Error('Errores de validación');
          error.validationErrors = {
            contrasena: passwordError
          };
          throw error;
        }
        userData.contrasena = adminData.contrasena;
      }

      const response = await fetch(`${API_BASE_URL}/users/${adminId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // 👈
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response from server:', errorData);
        
        const validationErrors = {};
        
        // Manejar errores de validación del backend
        if (errorData.fields && Array.isArray(errorData.fields)) {
          errorData.fields.forEach(err => {
            if (err.code === 'USERNAME_EXISTS') {
              validationErrors.usuario = err.message || 'El nombre de usuario ya está en uso';
            } else if (err.code === 'EMAIL_EXISTS') {
              validationErrors.correo_electronico = err.message || 'El correo electrónico ya está registrado';
            } else if (err.code === 'PASSWORD_INVALID') {
              validationErrors.contrasena = err.message || 'La contraseña no cumple con los requisitos';
            }
          });
        }
        
        // Si hay errores de validación específicos, crear un error especial
        if (Object.keys(validationErrors).length > 0) {
          const error = new Error('Errores de validación');
          error.validationErrors = validationErrors;
          throw error;
        }
        
        let errorMessage = 'Error al actualizar el administrador';
        
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (Array.isArray(errorData.error)) {
            errorMessage = errorData.error.map(err => {
              if (typeof err === 'object' && err.message) {
                return err.message;
              }
              return String(err);
            }).join(', ');
          } else if (typeof errorData.error === 'object') {
            errorMessage = JSON.stringify(errorData.error);
          }
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(err => err.message || String(err)).join(', ');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  }

  // Delete an admin
  async deleteAdmin(adminId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 👈
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response from server:', errorData);
        
        let errorMessage = 'Error al eliminar el administrador';
        
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (Array.isArray(errorData.error)) {
            errorMessage = errorData.error.map(err => {
              if (typeof err === 'object' && err.message) {
                return err.message;
              }
              return String(err);
            }).join(', ');
          }
        }
        
        throw new Error(errorMessage);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  }

  // Get a specific admin by ID
  async getAdminById(adminId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${adminId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 👈
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching admin:', error);
      throw new Error('Error al obtener los datos del administrador');
    }
  }
}

const adminService = new AdminService();
export default adminService;
export { AdminService };
