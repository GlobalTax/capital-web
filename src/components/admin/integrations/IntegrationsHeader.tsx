import React from 'react';

interface IntegrationsHeaderProps {
  isLoading?: boolean;
}

const IntegrationsHeader = ({ isLoading }: IntegrationsHeaderProps) => {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-foreground">
        Configuración de Integraciones
      </h1>
      <p className="text-muted-foreground">
        Gestiona las integraciones y conexiones externas del sistema
      </p>
    </div>
  );
};

export default IntegrationsHeader;