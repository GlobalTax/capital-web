
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingMetrics } from '@/types/marketingHub';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Download, 
  Star, 
  Mail, 
  Building2, 
  BarChart3 
} from 'lucide-react';

interface MarketingHubKPIsProps {
  metrics?: MarketingMetrics;
}

const MarketingHubKPIs = ({ metrics }: MarketingHubKPIsProps) => {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg border p-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Visitantes Totales',
      value: metrics.totalVisitors.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12.5%'
    },
    {
      title: 'Empresas Identificadas',
      value: metrics.identifiedCompanies.toLocaleString(),
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8.3%'
    },
    {
      title: 'Total Leads',
      value: metrics.totalLeads.toLocaleString(),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15.2%'
    },
    {
      title: 'Leads Calificados',
      value: metrics.qualifiedLeads.toLocaleString(),
      icon: Star,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+22.1%'
    },
    {
      title: 'Tasa de Conversión',
      value: `${metrics.leadConversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+3.4%'
    },
    {
      title: 'Descargas Contenido',
      value: metrics.downloadCount.toLocaleString(),
      icon: Download,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '+18.7%'
    },
    {
      title: 'Email Open Rate',
      value: `${metrics.emailOpenRate}%`,
      icon: Mail,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      change: '+2.1%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-green-600 font-medium">
                    {kpi.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MarketingHubKPIs;
