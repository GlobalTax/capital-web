
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ModernRecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'success',
      title: 'Sistema inicializado correctamente',
      description: 'Panel de administración configurado y listo para usar',
      time: 'Hace 2 minutos'
    },
    {
      id: 2,
      type: 'info',
      title: 'AI Content Studio Pro activado',
      description: 'Nueva funcionalidad de generación de contenido disponible',
      time: 'Hace 5 minutos'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Dashboard rediseñado',
      description: 'Interfaz moderna implementada con éxito',
      time: 'Hace 1 hora'
    }
  ];

  const stats = [
    { label: 'Contenido generado hoy', value: '12' },
    { label: 'Usuarios activos', value: '3' },
    { label: 'Tiempo de respuesta', value: '0.8s' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Actividad Reciente */}
      <Card className="lg:col-span-2 border border-gray-100 bg-white">
        <CardHeader className="pb-4">
          <CardTitle>
            <div>
              <h3 className="text-lg font-semibold text-black">Actividad Reciente</h3>
              <p className="text-sm text-gray-600 font-normal">Últimas acciones en el sistema</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 border border-gray-50 hover:bg-gray-25 transition-colors">
              <div className="space-y-2">
                <h4 className="font-medium text-black">
                  {activity.title}
                </h4>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-gray-100">
            <Button variant="ghost" className="w-full justify-center text-gray-600 hover:text-black hover:bg-gray-50">
              Ver toda la actividad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas en Tiempo Real */}
      <Card className="border border-gray-100 bg-white">
        <CardHeader className="pb-4">
          <CardTitle>
            <div>
              <h3 className="text-lg font-semibold text-black">Estadísticas</h3>
              <p className="text-sm text-gray-600 font-normal">En tiempo real</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-50">
              <span className="text-sm font-medium text-gray-700">{stat.label}</span>
              <span className="text-lg font-bold text-black">{stat.value}</span>
            </div>
          ))}
          
          <div className="pt-4 border-t border-gray-100">
            <Button variant="outline" className="w-full text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-black">
              Ver Métricas Completas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernRecentActivity;
