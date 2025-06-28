
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ArrowRight,
  Activity
} from 'lucide-react';

const ModernRecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle2,
      title: 'Sistema inicializado correctamente',
      description: 'Panel de administración configurado y listo para usar',
      time: 'Hace 2 minutos'
    },
    {
      id: 2,
      type: 'info',
      icon: FileText,
      title: 'AI Content Studio Pro activado',
      description: 'Nueva funcionalidad de generación de contenido disponible',
      time: 'Hace 5 minutos'
    },
    {
      id: 3,
      type: 'warning',
      icon: AlertCircle,
      title: 'Dashboard rediseñado',
      description: 'Interfaz moderna implementada con éxito',
      time: 'Hace 1 hora'
    }
  ];

  const stats = [
    { label: 'Contenido generado hoy', value: '12', icon: FileText },
    { label: 'Usuarios activos', value: '3', icon: Users },
    { label: 'Tiempo de respuesta', value: '0.8s', icon: Clock }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Actividad Reciente */}
      <Card className="lg:col-span-2 border border-gray-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              <p className="text-sm text-gray-600 font-normal">Últimas acciones en el sistema</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="p-1">
                <activity.icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">
                  {activity.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
          
          <div className="pt-4 border-t border-gray-100">
            <Button variant="ghost" className="w-full justify-center text-gray-600 hover:text-gray-900">
              Ver toda la actividad
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas en Tiempo Real */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
              <p className="text-sm text-gray-600 font-normal">En tiempo real</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <stat.icon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stat.value}</span>
            </div>
          ))}
          
          <div className="pt-4 border-t border-gray-100">
            <Button variant="outline" className="w-full text-gray-600 border-gray-200 hover:bg-gray-50">
              Ver Métricas Completas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernRecentActivity;
