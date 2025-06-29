
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp, Bell, Users } from 'lucide-react';

interface DashboardHeaderProps {
  totalValuations: number;
  todayLeads: number;
  activeUsers: number;
}

const DashboardHeader = ({ totalValuations, todayLeads, activeUsers }: DashboardHeaderProps) => {
  const currentTime = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-2">Panel Capittal</h1>
          <p className="text-gray-500 text-sm lg:text-base">
            Bienvenido de vuelta. Aquí tienes el resumen de hoy.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Métricas Minimalistas - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-6">
        <Card className="bg-white border-0.5 border-gray-200 shadow-sm col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-2">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500 mb-1">Valoraciones Totales</p>
                <p className="text-xl lg:text-2xl font-light text-gray-900">{totalValuations}</p>
              </div>
              <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0.5 border-gray-200 shadow-sm col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-2">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500 mb-1">Leads Hoy</p>
                <p className="text-xl lg:text-2xl font-light text-gray-900">{todayLeads}</p>
              </div>
              <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0.5 border-gray-200 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-2">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500 mb-1">Usuarios Activos</p>
                <p className="text-xl lg:text-2xl font-light text-gray-900">{activeUsers}</p>
              </div>
              <Users className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHeader;
