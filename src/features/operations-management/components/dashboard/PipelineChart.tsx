import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/shared/utils/format';
import type { SectorDistribution, TemporalData } from '../../types/operations';

interface PipelineChartProps {
  sectorDistribution: SectorDistribution[];
  temporalData: TemporalData[];
  topSectors: { sector: string; value: number; count: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const PipelineChart: React.FC<PipelineChartProps> = ({ 
  sectorDistribution, 
  temporalData,
  topSectors 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Operaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temporal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="temporal">Tendencia Temporal</TabsTrigger>
            <TabsTrigger value="sectors">Distribución por Sector</TabsTrigger>
            <TabsTrigger value="top">Top Sectores</TabsTrigger>
          </TabsList>

          {/* Temporal Trend */}
          <TabsContent value="temporal" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temporalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'value') {
                        return [formatCurrency(value, 'EUR'), 'Valor'];
                      }
                      return [value, 'Operaciones'];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Operaciones"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Valor (€)"
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Evolución de operaciones y valor total en los últimos 12 meses
            </p>
          </TabsContent>

          {/* Sector Distribution */}
          <TabsContent value="sectors" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sector, percentage }) => `${sector} (${percentage.toFixed(0)}%)`}
                    outerRadius={120}
                    fill="hsl(var(--primary))"
                    dataKey="count"
                  >
                    {sectorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string, props: any) => {
                      return [
                        `${value} operaciones (${formatCurrency(props.payload.value, 'EUR')})`,
                        props.payload.sector
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Distribución de operaciones por sector
            </p>
          </TabsContent>

          {/* Top Sectors */}
          <TabsContent value="top" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSectors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="sector" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => formatCurrency(value, 'EUR')}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    name="Valor Total"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Top 5 sectores por valor total de operaciones
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
