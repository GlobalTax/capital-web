
import React from 'react';
import { Zap } from 'lucide-react';

interface IntegrationsHeaderProps {
  isLoading: boolean;
}

const IntegrationsHeader = ({ isLoading }: IntegrationsHeaderProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Integraciones Estratégicas</h1>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-gray-600">Cargando integraciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          Integraciones Estratégicas
        </h1>
        <p className="text-gray-600 mt-1">
          Apollo, Google Ads, LinkedIn y más - Todo conectado en tiempo real
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </span>
      </div>
    </div>
  );
};

export default IntegrationsHeader;
