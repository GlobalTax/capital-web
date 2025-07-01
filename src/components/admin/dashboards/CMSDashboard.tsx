
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Building2, FileText, Database, TrendingUp, BarChart3, Users, MessageSquare, TestTube, Image } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const CMSDashboard = () => {
  const cmsTools = [
    {
      title: 'Casos de Éxito',
      description: 'Gestión de casos de éxito',
      icon: Award,
      route: 'case-studies',
      stats: '12 casos activos'
    },
    {
      title: 'Operaciones',
      description: 'Gestión de operaciones',
      icon: Building2,
      route: 'operations',
      stats: '8 operaciones'
    },
    {
      title: 'AI Content Studio Pro',
      description: 'Generación de contenido con IA',
      icon: FileText,
      route: 'blog-v2',
      stats: '45 artículos',
      badge: 'AI'
    },
    {
      title: 'Reports Sectoriales IA',
      description: 'Generación de reportes sectoriales',
      icon: Database,
      route: 'sector-reports',
      stats: '23 reportes',
      badge: 'AI'
    },
    {
      title: 'Múltiplos',
      description: 'Gestión de múltiplos de valoración',
      icon: TrendingUp,
      route: 'multiples',
      stats: '156 múltiplos'
    },
    {
      title: 'Estadísticas',
      description: 'Métricas y estadísticas',
      icon: BarChart3,
      route: 'statistics',
      stats: '89% uptime'
    },
    {
      title: 'Equipo',
      description: 'Gestión del equipo',
      icon: Users,
      route: 'team',
      stats: '12 miembros'
    },
    {
      title: 'Testimonios',
      description: 'Gestión de testimonios',
      icon: MessageSquare,
      route: 'testimonials',
      stats: '34 testimonios'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🎨 Dashboard CMS
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión completa del contenido web y recursos visuales
          </p>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contenidos</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actualizados Hoy</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">8</p>
              </div>
              <TestTube className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Media Assets</p>
                <p className="text-2xl font-bold text-purple-600">156</p>
              </div>
              <Image className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Herramientas CMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cmsTools.map((tool) => (
          <Card key={tool.route} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <tool.icon className="h-8 w-8 text-blue-500" />
                {tool.badge && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {tool.badge}
                  </span>
                )}
              </div>
              <CardTitle className="text-lg">{tool.title}</CardTitle>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{tool.stats}</span>
                <Button asChild size="sm">
                  <NavLink to={`/admin/${tool.route}`}>
                    Gestionar
                  </NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CMSDashboard;
