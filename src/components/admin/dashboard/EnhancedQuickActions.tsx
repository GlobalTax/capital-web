
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, FileText, Building2, Calculator, Users, Zap, Clock, Star } from 'lucide-react';

const EnhancedQuickActions = () => {
  const currentHour = new Date().getHours();
  const isWorkingHours = currentHour >= 9 && currentHour <= 18;

  const quickActions = [
    {
      title: 'Nueva Valoración',
      description: 'Procesa una valoración urgente',
      link: '/admin/valuation-leads',
      icon: Calculator,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      priority: 'high',
      shortcut: 'Ctrl+N'
    },
    {
      title: 'Caso de Éxito',
      description: 'Documenta un nuevo logro',
      link: '/admin/case-studies',
      icon: FileText,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      priority: 'medium',
      shortcut: 'Ctrl+C'
    },
    {
      title: 'Nueva Operación',
      description: 'Registra transacción M&A',
      link: '/admin/operations',
      icon: Building2,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      priority: 'medium',
      shortcut: 'Ctrl+O'
    },
    {
      title: 'IA Content Studio',
      description: 'Genera contenido con IA',
      link: '/admin/blog-v2',
      icon: Zap,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      priority: 'high',
      badge: 'HOT',
      shortcut: 'Ctrl+I'
    }
  ];

  const contextualActions = isWorkingHours ? [
    {
      title: 'Revisar Leads',
      description: 'Leads pendientes de hoy',
      link: '/admin/contact-leads',
      icon: Users,
      urgent: true
    },
    {
      title: 'Testimonios',
      description: 'Recopilar feedback',
      link: '/admin/testimonials',
      icon: Star,
      urgent: false
    }
  ] : [
    {
      title: 'Reporte Diario',
      description: 'Resumen del día',
      link: '/admin/statistics',
      icon: Clock,
      urgent: false
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Acciones Principales */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Acciones Rápidas
            <Badge variant="outline" className="ml-auto text-xs">
              {isWorkingHours ? 'Horario Laboral' : 'Fuera de Horario'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.link} className="block group">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 group-hover:shadow-md">
                  <div className={`p-3 rounded-xl ${action.color} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      {action.badge && (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          {action.badge}
                        </Badge>
                      )}
                      {action.priority === 'high' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  
                  <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.shortcut}
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Acciones Contextuales */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            {isWorkingHours ? 'Tareas Pendientes' : 'Revisión de Fin de Día'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contextualActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.link} className="block group">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200">
                  <div className={`p-3 rounded-xl ${
                    action.urgent 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-600'
                  } shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      {action.urgent && (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Usa los shortcuts de teclado para mayor velocidad
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedQuickActions;
