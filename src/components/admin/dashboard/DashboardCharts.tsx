
import React, { Suspense } from 'react';
import {
  LazyResponsiveContainer,
  LazyLineChart,
  LazyLine,
  LazyAreaChart,
  LazyArea,
  LazyPieChart,
  LazyPie,
  LazyBarChart,
  LazyBar,
  LazyXAxis,
  LazyYAxis,
  LazyCartesianGrid,
  LazyTooltip,
  LazyLegend,
  LazyCell
} from '@/components/shared/LazyChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Eye, BarChart3 } from 'lucide-react';
import type { AdvancedDashboardStats } from '@/types/dashboard';
import {
  transformRevenueDataForChart,
  transformContentDataForChart,
  generateLeadSourceData,
  generateSectorPerformanceData,
  type ChartDataPoint,
  type LeadSourceData,
  type SectorPerformanceData
} from '@/utils/chartDataTransformers';
import { formatCurrency, formatNumber, formatPercentage } from '@/shared/utils/format';

interface DashboardChartsProps {
  stats: AdvancedDashboardStats;
  revenueData?: any[];
  contentData?: any[];
}

const DashboardCharts = ({ stats, revenueData = [], contentData = [] }: DashboardChartsProps) => {
  // Transformar datos para gráficos
  const chartData: ChartDataPoint[] = transformContentDataForChart(
    contentData,
    transformRevenueDataForChart(revenueData)
  );
  
  const leadsData: LeadSourceData[] = generateLeadSourceData();
  const sectorData: SectorPerformanceData[] = generateSectorPerformanceData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Análisis Visual</h3>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Ingresos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-700 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              Tendencia de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LazyResponsiveContainer height={300}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando gráfico...</div>}>
                <LazyLineChart data={chartData}>
                  <LazyCartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <LazyXAxis 
                    dataKey="month" 
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                  />
                  <LazyYAxis 
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                    tickFormatter={(value) => `${value / 1000}k€`}
                  />
                  <LazyTooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                      name === 'revenue' ? 'Ingresos' : 'Operaciones'
                    ]}
                  />
                  <LazyLine 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <LazyLine 
                    type="monotone" 
                    dataKey="deals" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  />
                </LazyLineChart>
              </Suspense>
            </LazyResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuentes de Leads */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-700 flex items-center">
              <Users className="h-4 w-4 mr-2 text-green-500" />
              Fuentes de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LazyResponsiveContainer height={300}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando gráfico...</div>}>
                <LazyPieChart>
                  <LazyPie
                    data={leadsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadsData.map((entry, index) => (
                      <LazyCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </LazyPie>
                  <LazyTooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [formatPercentage(value), 'Porcentaje']}
                  />
                  <LazyLegend 
                    verticalAlign="bottom" 
                    height={36}
                    fontSize={12}
                  />
                </LazyPieChart>
              </Suspense>
            </LazyResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas de Contenido */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-700 flex items-center">
              <Eye className="h-4 w-4 mr-2 text-purple-500" />
              Métricas de Contenido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LazyResponsiveContainer height={300}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando gráfico...</div>}>
                <LazyAreaChart data={chartData}>
                  <LazyCartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <LazyXAxis 
                    dataKey="month" 
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                  />
                  <LazyYAxis 
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                  />
                  <LazyTooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string) => [
                      formatNumber(value),
                      name === 'views' ? 'Vistas' : 'Engagement'
                    ]}
                  />
                  <LazyArea
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <LazyArea
                    type="monotone"
                    dataKey="engagement"
                    stackId="2"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                </LazyAreaChart>
              </Suspense>
            </LazyResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rendimiento por Sector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-700 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-orange-500" />
              Rendimiento por Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LazyResponsiveContainer height={300}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando gráfico...</div>}>
                <LazyBarChart data={sectorData} layout="horizontal">
                  <LazyCartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <LazyXAxis 
                    type="number" 
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                    tickFormatter={(value) => `${value / 1000}k€`}
                  />
                  <LazyYAxis 
                    type="category" 
                    dataKey="sector" 
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                    width={80}
                  />
                  <LazyTooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : `${value} deals`,
                      name === 'revenue' ? 'Ingresos' : 'Operaciones'
                    ]}
                  />
                  <LazyBar 
                    dataKey="revenue" 
                    fill="#f59e0b" 
                    radius={[0, 4, 4, 0]}
                  />
                </LazyBarChart>
              </Suspense>
            </LazyResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
