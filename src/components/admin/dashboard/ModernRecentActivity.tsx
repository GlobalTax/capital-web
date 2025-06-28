
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ArrowRight
} from 'lucide-react';

const ModernRecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle2,
      title: 'Sistema inicializado correctamente',
      description: 'Panel de administración configurado y listo para usar',
      time: 'Hace 2 minutos',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 2,
      type: 'info',
      icon: FileText,
      title: 'AI Content Studio Pro activado',
      description: 'Nueva funcionalidad de generación de contenido disponible',
      time: 'Hace 5 minutos',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 3,
      type: 'warning',
      icon: AlertCircle,
      title: 'Dashboard rediseñado',
      description: 'Interfaz moderna implementada con éxito',
      time: 'Hace 1 hora',
      gradient: 'from-amber-500 to-amber-600'
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
      <Card className="lg:col-span-2 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Actividad Reciente</h3>
              <p className="text-sm text-gray-500 font-normal">Últimas acciones en el sistema</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.gradient} shadow-md`}>
                <activity.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
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
          
          <div className="pt-4 border-t">
            <Button variant="ghost" className="w-full justify-center">
              Ver toda la actividad
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas en Tiempo Real */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Estadísticas</h3>
              <p className="text-sm text-gray-500 font-normal">En tiempo real</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <stat.icon className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stat.value}</span>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              Ver Métricas Completas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernRecentActivity;
