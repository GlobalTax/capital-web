
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  PenTool, 
  MessageSquare 
} from 'lucide-react';

const QuickActions = () => {
  const quickActions = [
    {
      title: 'Nuevo Caso de Éxito',
      description: 'Agregar un nuevo caso de éxito',
      icon: FileText,
      link: '/admin/case-studies',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Nueva Operación',
      description: 'Registrar una nueva operación',
      icon: Building2,
      link: '/admin/operations',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Nuevo Post del Blog',
      description: 'Crear un nuevo artículo',
      icon: PenTool,
      link: '/admin/blog',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Nuevo Testimonio',
      description: 'Añadir un testimonio de cliente',
      icon: MessageSquare,
      link: '/admin/testimonials',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-white mb-4 ${action.color} transition-colors`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
