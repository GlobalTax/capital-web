
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FileText, Building2, TrendingUp, Users, MessageSquare, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardActivity = () => {
  const quickActions = [
    {
      title: 'Nueva Valoración',
      description: 'Procesar valoración de empresa',
      icon: Calculator,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      href: '/admin/valuation-leads'
    },
    {
      title: 'Caso de Éxito',
      description: 'Documentar transacción exitosa',
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      href: '/admin/case-studies'
    },
    {
      title: 'Nueva Operación',
      description: 'Registrar deal flow',
      icon: Building2,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      href: '/admin/operations'
    },
    {
      title: 'Contenido IA',
      description: 'Generar blog post con IA',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      href: '/admin/blog-v2'
    }
  ];

  const recentActivities = [
    {
      title: 'Valoración completada',
      description: 'TechStartup SA - Sector Tecnología - €2.5M',
      time: 'Hace 5 min',
      status: 'success',
      icon: Calculator
    },
    {
      title: 'Caso de éxito publicado',
      description: 'Venta empresa retail - Deal cerrado exitosamente',
      time: 'Hace 15 min',
      status: 'info',
      icon: FileText
    },
    {
      title: 'Nuevo lead cualificado',
      description: 'Empresa manufacturing busca asesoramiento M&A',
      time: 'Hace 32 min',
      status: 'warning',
      icon: Users
    },
    {
      title: 'Report sectorial generado',
      description: 'Análisis Q2 2024 - Sector Industrial completado',
      time: 'Hace 1 hora',
      status: 'info',
      icon: TrendingUp
    },
    {
      title: 'Testimonio agregado',
      description: 'Cliente satisfecho - 5 estrellas',
      time: 'Hace 2 horas',
      status: 'success',
      icon: MessageSquare
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-slate-500 to-gray-500 rounded-full"></div>
            Acciones Rápidas
          </CardTitle>
          <p className="text-sm text-slate-600">Gestiona tu contenido estratégico</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => (
            <div
              key={action.title}
              className={`bg-gradient-to-r ${action.bgGradient} rounded-xl p-4 border border-white/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-white/80 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`h-5 w-5 bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{action.title}</h3>
                    <p className="text-xs text-slate-600">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            Actividad Reciente
          </CardTitle>
          <p className="text-sm text-slate-600">Últimas acciones en tu plataforma</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)} border`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{activity.title}</h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{activity.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{activity.description}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Ver toda la actividad
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardActivity;
