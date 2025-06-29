
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const ModernQuickActions = () => {
  const quickActions = [
    {
      title: 'Nuevo Caso de Éxito',
      description: 'Documenta un nuevo caso de éxito',
      link: '/admin/case-studies'
    },
    {
      title: 'Nueva Operación',
      description: 'Registra una nueva operación M&A',
      link: '/admin/operations'
    },
    {
      title: 'IA Content Studio',
      description: 'Genera contenido con IA avanzada',
      link: '/admin/blog-v2',
      badge: 'NUEVO'
    },
    {
      title: 'Nuevo Testimonio',
      description: 'Añade un testimonio de cliente',
      link: '/admin/testimonials'
    }
  ];

  return (
    <Card className="border border-gray-100 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-black">Acciones Rápidas</CardTitle>
        <p className="text-xs text-gray-600">Comienza rápidamente con las tareas más comunes</p>
      </CardHeader>
      
      <CardContent className="space-y-1">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.link} className="group block">
            <div className="flex items-center justify-between p-3 border border-gray-50 hover:border-gray-100 hover:bg-gray-25 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-black">{action.title}</h3>
                  {action.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default ModernQuickActions;
