
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import MarketingKPICards from './MarketingKPICards';
import CompanyIntelligence from '../CompanyIntelligence';

interface MarketingOverviewTabProps {
  companies: any[];
  events: any[];
  summary: any;
  alerts: any[];
  markAlertAsRead: (alertId: string) => void;
}

const MarketingOverviewTab = ({ 
  companies, 
  events, 
  summary, 
  alerts, 
  markAlertAsRead 
}: MarketingOverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <MarketingKPICards 
        companies={companies}
        events={events}
        summary={summary}
      />

      {/* Componente de Empresas Mejorado */}
      <CompanyIntelligence limit={10} />

      {/* Gráficos Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel de Conversión */}
        <Card>
          <CardHeader>
            <CardTitle>Embudo de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.conversionFunnel && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.conversionFunnel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Canales de Attribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top Canales de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.attribution?.topChannels && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.attribution.topChannels}
                    dataKey="attributedValue"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ channel, attributedValue }) => `${channel}: €${attributedValue.toFixed(0)}`}
                  >
                    {summary.attribution.topChannels.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`€${value}`, 'Valor Atribuido']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas Recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Alertas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="border-l-4 border-red-400 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{alert.priority.toUpperCase()}</Badge>
                  <span className="text-xs text-gray-500">{alert.type}</span>
                </div>
                <h4 className="font-semibold text-sm mt-1">{alert.title}</h4>
                <p className="text-xs text-gray-600">{alert.description}</p>
                {!alert.isRead && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    Marcar como leída
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingOverviewTab;
