
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity, Eye, Filter, Clock, FileText, Building2, Calculator, Users } from 'lucide-react';

const ActivityTimeline = () => {
  const activities = [
    {
      id: 1,
      type: 'valuation',
      title: 'Nueva valoración completada',
      description: 'Empresa TechStartup SA - Sector Tecnología',
      user: 'Admin',
      time: 'Hace 5 min',
      icon: Calculator,
      color: 'bg-blue-100 text-blue-600',
      urgent: false,
      link: '/admin/valuation-leads'
    },
    {
      id: 2,
      type: 'case_study',
      title: 'Caso de éxito publicado',
      description: 'Venta de empresa del sector retail por 2.5M€',
      user: 'Content Team',
      time: 'Hace 15 min',
      icon: FileText,
      color: 'bg-green-100 text-green-600',
      urgent: false,
      link: '/admin/case-studies'
    },
    {
      id: 3,
      type: 'lead',
      title: 'Nuevo lead de contacto',
      description: 'Empresa busca asesoramiento para M&A',
      user: 'Sistema',
      time: 'Hace 32 min',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      urgent: true,
      link: '/admin/contact-leads'
    },
    {
      id: 4,
      type: 'operation',
      title: 'Operación actualizada',
      description: 'Deal flow Q2 - Sector Industrial',
      user: 'Operations',
      time: 'Hace 1 hora',
      icon: Building2,
      color: 'bg-purple-100 text-purple-600',
      urgent: false,
      link: '/admin/operations'
    },
    {
      id: 5,
      type: 'system',
      title: 'Reporte mensual generado',
      description: 'Estadísticas y KPIs de mayo',
      user: 'Sistema',
      time: 'Hace 2 horas',
      icon: Activity,
      color: 'bg-gray-100 text-gray-600',
      urgent: false,
      link: '/admin/statistics'
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Actividad Reciente
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Todo
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="relative group">
                {/* Timeline line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                )}
                
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${activity.color} relative`}>
                    <Icon className="h-4 w-4" />
                    {activity.urgent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {activity.title}
                      </h4>
                      {activity.urgent && (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-gray-200">
                            {getInitials(activity.user)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.user}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action button - shown on hover */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <Button variant="outline" className="w-full">
            Ver Toda la Actividad
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
