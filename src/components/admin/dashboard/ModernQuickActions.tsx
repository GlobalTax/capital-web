
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  PenTool, 
  MessageSquare,
  Sparkles,
  Plus
} from 'lucide-react';

const ModernQuickActions = () => {
  const quickActions = [
    {
      title: 'Nuevo Caso de Éxito',
      description: 'Documenta un nuevo caso de éxito',
      icon: FileText,
      link: '/admin/case-studies',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Nueva Operación',
      description: 'Registra una nueva operación M&A',
      icon: Building2,
      link: '/admin/operations',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100'
    },
    {
      title: 'IA Content Studio',
      description: 'Genera contenido con IA avanzada',
      icon: Sparkles,
      link: '/admin/blog-v2',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      badge: 'NEW'
    },
    {
      title: 'Nuevo Testimonio',
      description: 'Añade un testimonio de cliente',
      icon: MessageSquare,
      link: '/admin/testimonials',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Acciones Rápidas</h2>
          <p className="text-gray-600 mt-1">Comienza rápidamente con las tareas más comunes</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.link} className="group">
            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} opacity-30`} />
              <CardContent className="relative p-6 text-center space-y-4">
                {action.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {action.badge}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-8 w-8 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Ahora
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ModernQuickActions;
