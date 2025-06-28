
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  PenTool, 
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const ModernQuickActions = () => {
  const quickActions = [
    {
      title: 'Nuevo Caso de Éxito',
      description: 'Documenta un nuevo caso de éxito',
      icon: FileText,
      link: '/admin/case-studies'
    },
    {
      title: 'Nueva Operación',
      description: 'Registra una nueva operación M&A',
      icon: Building2,
      link: '/admin/operations'
    },
    {
      title: 'IA Content Studio',
      description: 'Genera contenido con IA avanzada',
      icon: Sparkles,
      link: '/admin/blog-v2',
      badge: 'NUEVO'
    },
    {
      title: 'Nuevo Testimonio',
      description: 'Añade un testimonio de cliente',
      icon: MessageSquare,
      link: '/admin/testimonials'
    }
  ];

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Acciones Rápidas</CardTitle>
        <p className="text-sm text-gray-600">Comienza rápidamente con las tareas más comunes</p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.link} className="group block">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <action.icon className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    {action.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default ModernQuickActions;
