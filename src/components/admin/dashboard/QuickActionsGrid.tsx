
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, FileText, Building2, Users, BarChart3, MessageSquare, PenTool } from 'lucide-react';

const QuickActionsGrid = () => {
  const quickActions = [
    {
      title: 'Nuevo Caso de Éxito',
      description: 'Documenta un nuevo caso de éxito',
      link: '/admin/case-studies',
      icon: FileText,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Nueva Operación',
      description: 'Registra una nueva operación M&A',
      link: '/admin/operations',
      icon: Building2,
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      title: 'IA Content Studio',
      description: 'Genera contenido con IA avanzada',
      link: '/admin/blog-v2',
      icon: PenTool,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600',
      badge: 'NUEVO'
    },
    {
      title: 'Nuevo Testimonio',
      description: 'Añade testimonio de cliente',
      link: '/admin/testimonials',
      icon: MessageSquare,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Miembro del Equipo',
      description: 'Añade nuevo miembro al equipo',
      link: '/admin/team',
      icon: Users,
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Ver Estadísticas',
      description: 'Revisa métricas y KPIs',
      link: '/admin/statistics',
      icon: BarChart3,
      color: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
      iconColor: 'text-teal-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
        <span className="text-sm text-gray-500">Shortcuts para tareas comunes</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.link} className="group">
            <Card className={`${action.color} border hover:shadow-md transition-all duration-200 hover:-translate-y-1`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      {action.badge && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
