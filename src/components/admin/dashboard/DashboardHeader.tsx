
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
    <div className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-gray-900 mb-2">Panel Capittal</h1>
          <p className="text-gray-500">
            Bienvenido de vuelta. Aquí tienes el resumen de hoy.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Métricas Minimalistas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Valoraciones Totales</p>
                <p className="text-2xl font-light text-gray-900">{totalValuations}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Leads Hoy</p>
                <p className="text-2xl font-light text-gray-900">{todayLeads}</p>
              </div>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Usuarios Activos</p>
                <p className="text-2xl font-light text-gray-900">{activeUsers}</p>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHeader;
