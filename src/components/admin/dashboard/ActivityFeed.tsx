
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, Building2 } from 'lucide-react';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: 'case_study',
      icon: FileText,
      title: 'Nuevo caso de éxito añadido',
      description: 'Adquisición en el sector tecnológico',
      user: 'Admin',
      time: 'Hace 2 horas',
      status: 'success'
    },
    {
      id: 2,
      type: 'operation',
      icon: Building2,
      title: 'Operación actualizada',
      description: 'Valoración completada para cliente premium',
      user: 'Sistema',
      time: 'Hace 4 horas',
      status: 'info'
    },
    {
      id: 3,
      type: 'blog',
      icon: FileText,
      title: 'Post del blog publicado',
      description: 'Tendencias M&A 2024 - Análisis completo',
      user: 'Editor',
      time: 'Hace 6 horas',
      status: 'success'
    },
    {
      id: 4,
      type: 'user',
      icon: User,
      title: 'Nuevo miembro del equipo',
      description: 'Director de Operaciones añadido al equipo',
      user: 'RRHH',
      time: 'Hace 1 día',
      status: 'info'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border border-gray-100 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className="text-lg font-semibold text-gray-900">Actividad Reciente</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {activity.user}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        <div className="pt-4 border-t border-gray-100">
          <button className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium">
            Ver toda la actividad →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
