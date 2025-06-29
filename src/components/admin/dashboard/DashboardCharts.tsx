
import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(value);
  };

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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `${value / 1000}k€`}
                />
                <Tooltip 
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
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="deals" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Porcentaje']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  fontSize={12}
                />
              </PieChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip 
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
                <Area
                  type="monotone"
                  dataKey="views"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stackId="2"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `${value / 1000}k€`}
                />
                <YAxis 
                  type="category" 
                  dataKey="sector" 
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  width={80}
                />
                <Tooltip 
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
                <Bar 
                  dataKey="revenue" 
                  fill="#f59e0b" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
