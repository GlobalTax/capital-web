
import React from 'react';
import { Clock } from 'lucide-react';

const DashboardHeader = () => {
  const currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="page-title mb-1">Panel Capittal</h1>
        <p className="page-subtitle">Bienvenido de vuelta. Aquí tienes el resumen de hoy.</p>
      </div>
      <div className="flex items-center justify-start sm:justify-end bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
        <Clock className="h-4 w-4 text-slate-500" />
        <span className="text-slate-700 ml-2 font-medium text-sm">{currentTime}</span>
      </div>
    </div>
  );
};

export default DashboardHeader;
