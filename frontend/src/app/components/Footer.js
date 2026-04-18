export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">✈️ Aero Penguin</h3>
            <p className="text-gray-300 mb-4">
              Tu aerolínea de confianza para volar a cualquier destino del mundo.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">📘 Facebook</a>
              <a href="#" className="text-gray-300 hover:text-white">🐦 Twitter</a>
              <a href="#" className="text-gray-300 hover:text-white">📷 Instagram</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Buscar Vuelos</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Check-in Online</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Estado de Vuelo</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Equipaje</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Atención al Cliente</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Contacto</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Política de Cancelación</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Términos y Condiciones</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-2 text-gray-300">
              <p>📞 +1 (555) 123-4567</p>
              <p>✉️ info@aeropenguin.com</p>
              <p>📍 123 Airport Ave, Sky City</p>
              <p>🕒 24/7 Atención al Cliente</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Aero Penguin. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
