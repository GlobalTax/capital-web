
import React from 'react';
import { BarChart3 } from 'lucide-react';

const MarketingHubHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Marketing Hub
        </h1>
        <p className="text-gray-600 mt-1">
          Dashboard completo de métricas de marketing y análisis de ROI
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

export default MarketingHubHeader;
