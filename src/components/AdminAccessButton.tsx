import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

/**
 * Botón de acceso rápido al admin para emergencias
 * Solo visible en desarrollo o con parámetro especial
 */
const AdminAccessButton: React.FC = () => {
  // Solo mostrar en desarrollo o con query param especial
  const isDev = import.meta.env.DEV;
  const hasAdminParam = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).has('admin');
  
  if (!isDev && !hasAdminParam) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link 
        to="/admin/login"
        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors text-sm"
        title="Acceso de administrador"
      >
        <Shield className="h-4 w-4" />
        Admin
      </Link>
    </div>
  );
};

export default AdminAccessButton;