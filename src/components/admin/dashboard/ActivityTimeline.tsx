
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, FileText, Building2, Calculator, Users } from 'lucide-react';

const ActivityTimeline = () => {
  const activities = [
    {
      id: 1,
      title: 'Nueva valoración completada',
      description: 'Empresa TechStartup SA - Sector Tecnología',
      user: 'Admin',
      time: 'Hace 5 min',
      icon: Calculator,
    },
    {
      id: 2,
      title: 'Caso de éxito publicado',
      description: 'Venta de empresa del sector retail por 2.5M€',
      user: 'Content Team',
      time: 'Hace 15 min',
      icon: FileText,
    },
    {
      id: 3,
      title: 'Nuevo lead de contacto',
      description: 'Empresa busca asesoramiento para M&A',
      user: 'Sistema',
      time: 'Hace 32 min',
      icon: Users,
    },
    {
      id: 4,
      title: 'Operación actualizada',
      description: 'Deal flow Q2 - Sector Industrial',
      user: 'Operations',
      time: 'Hace 1 hora',
      icon: Building2,
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-full">
      <Card className="bg-white border-0.5 border-gray-200 shadow-sm h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-light text-gray-900">
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-6 bg-gray-200" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
                      <Icon className="h-4 w-4 text-gray-500" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-light text-gray-900 text-sm mb-1 truncate">
                        {activity.title}
                      </h4>
                      
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                              {getInitials(activity.user)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{activity.user}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityTimeline;
