
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Target,
  TrendingUp
} from 'lucide-react';
import { ApolloCompany } from '@/types/integrations';

interface ApolloKPICardsProps {
  apolloCompanies: ApolloCompany[];
}

const ApolloKPICards = ({ apolloCompanies }: ApolloKPICardsProps) => {
  const targetAccountsCount = apolloCompanies.filter(c => c.is_target_account).length;
  const avgEmployeeCount = apolloCompanies
    .filter(c => c.employee_count)
    .reduce((acc, c) => acc + (c.employee_count || 0), 0) / 
    apolloCompanies.filter(c => c.employee_count).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Enriquecidas</CardTitle>
          <Building2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apolloCompanies.length}</div>
          <p className="text-xs text-muted-foreground">Empresas con datos Apollo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target Accounts</CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{targetAccountsCount}</div>
          <p className="text-xs text-muted-foreground">Empresas objetivo identificadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Promedio Empleados</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(avgEmployeeCount) || 0}</div>
          <p className="text-xs text-muted-foreground">Tamaño promedio empresa</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Industrias</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(apolloCompanies.map(c => c.industry).filter(Boolean)).size}
          </div>
          <p className="text-xs text-muted-foreground">Sectores identificados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApolloKPICards;
