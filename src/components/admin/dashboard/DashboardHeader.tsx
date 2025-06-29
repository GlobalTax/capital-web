
import React from 'react';
import { Clock, Calendar, TrendingUp } from 'lucide-react';

const DashboardHeader = () => {
  const currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200/50 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            {currentDate}
          </div>
          <h1 className="text-3xl lg:text-4xl font-light text-slate-900 tracking-tight">
            Panel de Control Capittal
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Gestiona tu contenido estratégico y monitorea el rendimiento de tu plataforma de M&A
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-200/50 shadow-sm">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Hora actual</p>
              <p className="text-sm font-semibold text-slate-900">{currentTime}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-200/50 shadow-sm">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Estado</p>
              <p className="text-sm font-semibold text-green-600">Activo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
