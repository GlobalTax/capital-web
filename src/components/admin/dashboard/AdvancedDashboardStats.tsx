
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Eye, 
  Zap, 
  Activity,
  RefreshCw,
  Calendar
} from 'lucide-react';
import type { AdvancedDashboardStats } from '@/types/dashboard';

interface AdvancedDashboardStatsProps {
  stats: AdvancedDashboardStats;
  onRefresh: () => void;
  onGenerateSample: () => void;
  isLoading?: boolean;
}

const AdvancedDashboardStatsComponent = ({ 
  stats, 
  onRefresh, 
  onGenerateSample, 
  isLoading = false 
}: AdvancedDashboardStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(Math.round(value));
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Dashboard Avanzado</h2>
          <p className="text-gray-600 font-light">Métricas de negocio, contenido y sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateSample}
            disabled={isLoading}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Generar Datos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas de Negocio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className={`flex items-center text-sm ${getTrendColor(stats.monthlyGrowth)}`}>
              {getTrendIcon(stats.monthlyGrowth)}
              <span className="ml-1">{formatPercentage(stats.monthlyGrowth)} este mes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tamaño Promedio Deal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.avgDealSize)}
            </div>
            <div className="text-sm text-gray-500">
              Por operación cerrada
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Tasa de Conversión
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(stats.conversionRate)}
            </div>
            <div className="text-sm text-gray-500">
              {formatNumber(stats.totalLeads)} leads totales
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Vistas del Blog
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.blogViewsThisMonth)}
            </div>
            <div className="text-sm text-gray-500">
              Engagement: {formatPercentage(stats.contentEngagement)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Rendimiento API
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-gray-900">
              {Math.round(stats.apiResponseTime)}ms
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={stats.errorRate < 1 ? "default" : "destructive"} className="text-xs">
                {formatPercentage(stats.errorRate)} errores
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Uptime del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-gray-900">
              {formatPercentage(stats.uptime)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={stats.uptime > 99 ? "default" : "secondary"} className="text-xs">
                {formatNumber(stats.activeUsers)} usuarios activos
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Carga del Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-gray-900">
              {formatPercentage(stats.serverLoad)}
            </div>
            <div className="text-sm text-gray-500">
              Utilización de recursos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      {stats.topPerformingPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">
              Posts con Mejor Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topPerformingPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">/{post.slug}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatNumber(post.views || 0)} vistas</div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(post.engagement_score || 0)} engagement
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedDashboardStatsComponent;
