
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, FileText, Building2, Calculator, Users, Clock } from 'lucide-react';

const EnhancedQuickActions = () => {
  const currentHour = new Date().getHours();
  const isWorkingHours = currentHour >= 9 && currentHour <= 18;

  const quickActions = [
    {
      title: 'Nueva Valoración',
      description: 'Procesa una valoración',
      link: '/admin/valuation-leads',
      icon: Calculator,
    },
    {
      title: 'Caso de Éxito',
      description: 'Documenta un nuevo logro',
      link: '/admin/case-studies',
      icon: FileText,
    },
    {
      title: 'Nueva Operación',
      description: 'Registra transacción M&A',
      link: '/admin/operations',
      icon: Building2,
    },
    {
      title: 'Contenido Blog',
      description: 'Crear nuevo artículo',
      link: '/admin/blog-v2',
      icon: Plus,
    }
  ];

  const contextualActions = isWorkingHours ? [
    {
      title: 'Revisar Leads',
      description: 'Leads pendientes de hoy',
      link: '/admin/contact-leads',
      icon: Users,
    },
    {
      title: 'Testimonios',
      description: 'Recopilar feedback',
      link: '/admin/testimonials',
      icon: Users,
    }
  ] : [
    {
      title: 'Reporte Diario',
      description: 'Resumen del día',
      link: '/admin/statistics',
      icon: Clock,
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      {/* Acciones Principales */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-light text-gray-900">
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.link} className="block">
                <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-light text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Acciones Contextuales */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-light text-gray-900">
            {isWorkingHours ? 'Tareas Pendientes' : 'Revisión de Fin de Día'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contextualActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.link} className="block">
                <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-light text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedQuickActions;
