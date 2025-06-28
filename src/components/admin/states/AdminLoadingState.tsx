
import React from 'react';

interface AdminLoadingStateProps {
  debugInfo: string;
}

const AdminLoadingState = ({ debugInfo }: AdminLoadingStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-0.5 border-black mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-black mb-2">Configurando permisos...</h2>
        <p className="text-sm text-gray-600 mb-4">{debugInfo}</p>
        <div className="bg-gray-100 border-0.5 border-black rounded-lg p-3">
          <p className="text-xs text-gray-500">Verificando acceso de administrador</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoadingState;
