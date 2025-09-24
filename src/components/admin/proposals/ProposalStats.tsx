import React, { Suspense } from 'react';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LazyResponsiveContainer,
  LazyBarChart, 
  LazyBar, 
  LazyXAxis, 
  LazyYAxis, 
  LazyCartesianGrid, 
  LazyTooltip, 
  LazyPieChart, 
  LazyPie, 
  LazyCell, 
  LazyLineChart,
  LazyLine
} from '@/components/shared/LazyChart';
import { SERVICE_TYPE_LABELS, PROPOSAL_STATUS_LABELS } from '@/types/proposals';

export const ProposalStats = () => {
  const { proposals, stats } = useProposals();

  // Prepare data for charts
  const statusData = Object.entries(PROPOSAL_STATUS_LABELS).map(([status, label]) => ({
    name: label,
    value: proposals.filter(p => p.status === status).length,
    color: status === 'approved' ? '#10b981' : 
           status === 'sent' ? '#3b82f6' :
           status === 'viewed' ? '#f59e0b' :
           status === 'rejected' ? '#ef4444' : '#6b7280'
  }));

  const serviceTypeData = Object.entries(SERVICE_TYPE_LABELS).map(([type, label]) => ({
    name: label,
    proposals: proposals.filter(p => p.service_type === type).length,
    value: proposals
      .filter(p => p.service_type === type && p.estimated_fee)
      .reduce((sum, p) => sum + (p.estimated_fee || 0), 0)
  }));

  // Monthly proposals data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    
    const monthProposals = proposals.filter(p => 
      p.created_at.startsWith(monthKey)
    );

    return {
      month: monthName,
      created: monthProposals.length,
      approved: monthProposals.filter(p => p.status === 'approved').length,
      value: monthProposals
        .filter(p => p.status === 'approved' && p.estimated_fee)
        .reduce((sum, p) => sum + (p.estimated_fee || 0), 0)
    };
  }).reverse();

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total_proposals}</div>
              <div className="text-sm text-gray-600">Total Propuestas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.conversion_rate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Tasa de Conversión</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">€{stats.total_value.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Valor Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.avg_response_time.toFixed(0)}d</div>
              <div className="text-sm text-gray-600">Tiempo Medio Respuesta</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <LazyResponsiveContainer height={300}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando gráfico...</div>}>
                <LazyPieChart>
                  <LazyPie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <LazyCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </LazyPie>
                  <LazyTooltip />
                </LazyPieChart>
              </Suspense>
            </LazyResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Type Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Propuestas por Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <LazyResponsiveContainer height={300}>
              <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando gráfico...</div>}>
                <LazyBarChart data={serviceTypeData}>
                  <LazyCartesianGrid strokeDasharray="3 3" />
                  <LazyXAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <LazyYAxis />
                  <LazyTooltip 
                    formatter={(value, name) => [
                      name === 'proposals' ? value : `€${Number(value).toLocaleString()}`,
                      name === 'proposals' ? 'Propuestas' : 'Valor Total'
                    ]}
                  />
                  <LazyBar dataKey="proposals" fill="#3b82f6" name="proposals" />
                </LazyBarChart>
              </Suspense>
            </LazyResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <LazyResponsiveContainer height={300}>
            <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando gráfico...</div>}>
              <LazyLineChart data={monthlyData}>
                <LazyCartesianGrid strokeDasharray="3 3" />
                <LazyXAxis dataKey="month" />
                <LazyYAxis />
                <LazyTooltip 
                  formatter={(value, name) => [
                    name === 'value' ? `€${Number(value).toLocaleString()}` : value,
                    name === 'created' ? 'Creadas' : 
                    name === 'approved' ? 'Aprobadas' : 'Valor'
                  ]}
                />
                <LazyLine 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="created"
                />
                <LazyLine 
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="approved"
                />
              </LazyLineChart>
            </Suspense>
          </LazyResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Tipo de Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Servicio</th>
                  <th className="text-right py-2">Propuestas</th>
                  <th className="text-right py-2">Aprobadas</th>
                  <th className="text-right py-2">Conversión</th>
                  <th className="text-right py-2">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {serviceTypeData.map((item) => {
                  const approved = proposals.filter(p => 
                    p.service_type === Object.keys(SERVICE_TYPE_LABELS).find(k => 
                      SERVICE_TYPE_LABELS[k as keyof typeof SERVICE_TYPE_LABELS] === item.name
                    ) && p.status === 'approved'
                  ).length;
                  const conversionRate = item.proposals > 0 ? (approved / item.proposals) * 100 : 0;

                  return (
                    <tr key={item.name} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="text-right py-2">{item.proposals}</td>
                      <td className="text-right py-2">{approved}</td>
                      <td className="text-right py-2">{conversionRate.toFixed(1)}%</td>
                      <td className="text-right py-2">€{item.value.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};