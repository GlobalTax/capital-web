
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Target, BarChart3, TrendingUp } from 'lucide-react';

interface MarketingKPICardsProps {
  companies: any[];
  events: any[];
  summary: any;
}

const MarketingKPICards = ({ companies, events, summary }: MarketingKPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas Identificadas</CardTitle>
          <Building2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{companies.length}</div>
          <p className="text-xs text-gray-600">
            {companies.filter(c => c.visitCount > 1).length} visitantes recurrentes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Calientes</CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {summary?.leadScore?.high || 0}
          </div>
          <p className="text-xs text-gray-600">
            Score ≥ 70 puntos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{events.length}</div>
          <p className="text-xs text-gray-600">
            Últimos 30 días
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary?.attribution?.totalConversions || 0}
          </div>
          <p className="text-xs text-gray-600">
            Tasa: {summary?.attribution?.conversionRate?.toFixed(1) || 0}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingKPICards;
