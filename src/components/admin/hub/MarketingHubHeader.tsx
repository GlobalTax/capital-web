
import React from 'react';
import { BarChart3 } from 'lucide-react';

const MarketingHubHeader = () => {
  return (
    <div className="openai-container">
      <div className="flex items-center justify-between py-12">
        <div>
          <h1 className="openai-h2 flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-foreground" />
            Marketing Hub
          </h1>
          <p className="openai-body-secondary mt-4">
            Dashboard completo de métricas de marketing y análisis de ROI
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg text-muted-foreground">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketingHubHeader;
