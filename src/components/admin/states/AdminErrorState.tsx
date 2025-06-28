
import React from 'react';

interface AdminErrorStateProps {
  debugInfo: string;
  onRetry: () => void;
  onLogout: () => void;
}

const AdminErrorState = ({ debugInfo, onRetry, onLogout }: AdminErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-black mb-4">Error de Permisos</h2>
        <p className="text-gray-600 mb-4">
          No se pudieron configurar los permisos de administrador.
        </p>
        <div className="bg-gray-100 border-0.5 border-black rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-700 font-mono mb-2">{debugInfo}</p>
          <p className="text-xs text-gray-500">
            Revisa la consola del navegador (F12) para más información técnica.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={onRetry} 
            className="px-4 py-2 bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            Reintentar
          </button>
          <button 
            onClick={onLogout} 
            className="px-4 py-2 border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminErrorState;
