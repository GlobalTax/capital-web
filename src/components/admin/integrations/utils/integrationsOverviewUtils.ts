
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { IntegrationConfig } from '@/types/integrations';

export const getIntegrationStatus = (integrationConfigs: IntegrationConfig[], name: string) => {
  const config = integrationConfigs.find(c => c.integration_name === name);
  return config?.is_active ? 'active' : 'inactive';
};

export const getStatusIcon = (status: string) => {
  return status === 'active' ? 
    React.createElement(CheckCircle, { className: "h-4 w-4 text-green-500" }) : 
    React.createElement(AlertCircle, { className: "h-4 w-4 text-red-500" });
};

export const getStatusBadge = (status: string) => {
  return status === 'active' ? 
    React.createElement(Badge, { variant: "default", className: "bg-green-100 text-green-800" }, 'Activo') : 
    React.createElement(Badge, { variant: "destructive" }, 'Inactivo');
};
