
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Workflow, Mail, UserPlus, Users, AlertCircle, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const LeadsWorkflowsDashboard = () => {
  const leadTools = [
    {
      title: 'Lead Scoring',
      description: 'Priorización de leads y alertas',
      icon: TrendingUp,
      route: 'lead-scoring',
      stats: '45 leads calientes',
      priority: 'high'
    },
    {
      title: 'Marketing Automation',
      description: 'Secuencias, A/B testing y workflows',
      icon: Workflow,
      route: 'marketing-automation',
      stats: '12 secuencias activas',
      priority: 'medium'
    },
    {
      title: 'Leads de Contacto',
      description: 'Gestión de leads de contacto',
      icon: Mail,
      route: 'contact-leads',
      stats: '128 leads nuevos',
      priority: 'high'
    },
    {
      title: 'Solicitudes Colaboradores',
      description: 'Gestión de solicitudes de colaboradores',
      icon: UserPlus,
      route: 'collaborator-applications',
      stats: '8 solicitudes',
      priority: 'medium'
    },
    {
      title: 'CRM',
      description: 'Gestión de clientes y contactos',
      icon: Users,
      route: 'crm',
      stats: '234 contactos',
      priority: 'low'
    },
    {
      title: 'Alertas',
      description: 'Notificaciones y eventos críticos',
      icon: AlertCircle,
      route: 'alerts',
      stats: '3 alertas activas',
      priority: 'high'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🎯 Dashboard Leads & Workflows
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión completa del proceso de leads hasta la reunión
          </p>
        </div>
      </div>

      {/* Pipeline de Leads */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Pipeline de Conversión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">128</div>
              <div className="text-sm text-gray-600">Leads Nuevos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">45</div>
              <div className="text-sm text-gray-600">Leads Calientes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">23</div>
              <div className="text-sm text-gray-600">En Seguimiento</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Reuniones Agendadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Acción Inmediata */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            🚨 Acción Inmediata Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>3 leads calientes sin contactar en 24h</span>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <NavLink to="/admin/lead-scoring" className="text-white">
                  Revisar Ahora
                </NavLink>
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>8 solicitudes de colaboradores pendientes</span>
              <Button size="sm" variant="outline">
                <NavLink to="/admin/collaborator-applications">
                  Ver Solicitudes
                </NavLink>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Herramientas de Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leadTools.map((tool) => (
          <Card key={tool.route} className={`hover:shadow-lg transition-shadow ${getPriorityColor(tool.priority)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <tool.icon className="h-8 w-8 text-blue-500" />
                {tool.priority === 'high' && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    URGENTE
                  </span>
                )}
              </div>
              <CardTitle className="text-lg">{tool.title}</CardTitle>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{tool.stats}</span>
                <Button asChild size="sm" className={tool.priority === 'high' ? 'bg-red-600 hover:bg-red-700' : ''}>
                  <NavLink to={`/admin/${tool.route}`}>
                    {tool.priority === 'high' ? 'Actuar' : 'Gestionar'}
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

export default LeadsWorkflowsDashboard;
