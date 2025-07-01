
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BarChart3, Zap, Activity, TrendingUp, Users, Target, Eye } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AnalyticsDashboard = () => {
  const analyticsTools = [
    {
      title: 'Marketing Intelligence',
      description: 'Análisis predictivo y insights',
      icon: Brain,
      route: 'marketing-intelligence',
      stats: '89% accuracy rate',
      badge: 'AI'
    },
    {
      title: 'Marketing Hub',
      description: 'Dashboard completo de métricas',
      icon: BarChart3,
      route: 'marketing-hub',
      stats: '12 métricas clave'
    },
    {
      title: 'Integraciones',
      description: 'Apollo, Google Ads, LinkedIn y más',
      icon: Zap,
      route: 'integrations',
      stats: '6 integraciones activas',
      badge: 'NEW'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            📊 Dashboard Analytics & Intelligence
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis avanzado y inteligencia de marketing
          </p>
        </div>
      </div>

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visitas Totales</p>
                <p className="text-2xl font-bold">12,456</p>
                <p className="text-xs text-green-600">+15% vs mes anterior</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversión</p>
                <p className="text-2xl font-bold">3.4%</p>
                <p className="text-xs text-green-600">+0.8% vs mes anterior</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                <p className="text-2xl font-bold">67</p>
                <p className="text-xs text-orange-600">-2 pts vs mes anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Únicos</p>
                <p className="text-2xl font-bold">234</p>
                <p className="text-xs text-green-600">+28% vs mes anterior</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights IA */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            🧠 Insights de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700">Oportunidad Detectada</span>
              </div>
              <p className="text-sm text-gray-600">
                El sector tecnológico muestra un 45% más de engagement. Considera enfocar más contenido hacia este sector.
              </p>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700">Tendencia Identificada</span>
              </div>
              <p className="text-sm text-gray-600">
                Los leads que interactúan con contenido de valoración tienen 3x más probabilidad de convertir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Herramientas Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsTools.map((tool) => (
          <Card key={tool.route} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <tool.icon className="h-8 w-8 text-blue-500" />
                {tool.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${
                    tool.badge === 'AI' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}>
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
                    Analizar
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

export default AnalyticsDashboard;
