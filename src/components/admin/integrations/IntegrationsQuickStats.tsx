
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Target, Users, TrendingUp, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { ApolloCompany, ApolloContact, AdConversion, LinkedInIntelligence, IntegrationsMetrics } from '@/types/integrations';
import { IntegrationsKPICards } from './IntegrationsKPICards';

interface IntegrationsQuickStatsProps {
  apolloCompanies: ApolloCompany[];
  apolloContacts: ApolloContact[];
  adConversions: AdConversion[];
  linkedinData: LinkedInIntelligence[];
  metrics: IntegrationsMetrics | null;
  isLoading: boolean;
}

const IntegrationsQuickStats = ({
  apolloCompanies,
  apolloContacts,
  adConversions,
  linkedinData,
  metrics,
  isLoading
}: IntegrationsQuickStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Principales */}
      <IntegrationsKPICards metrics={metrics} isLoading={false} />
      
      {/* Cards de Métricas Detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apollo Companies</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apolloCompanies.length}</div>
            <p className="text-xs text-muted-foreground">Empresas enriquecidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apollo Contacts</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apolloContacts.length}</div>
            <p className="text-xs text-muted-foreground">Contactos identificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Google Ads</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adConversions.length}</div>
            <p className="text-xs text-muted-foreground">Conversiones trackeadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LinkedIn Intel</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkedinData.length}</div>
            <p className="text-xs text-muted-foreground">Señales sociales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Integraciones exitosas</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Conexiones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Apollo API</h4>
                <p className="text-sm text-muted-foreground">
                  {apolloCompanies.length + apolloContacts.length} registros totales
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Activo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Google Ads</h4>
                <p className="text-sm text-muted-foreground">
                  {adConversions.length} conversiones registradas
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Sincronizado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">LinkedIn</h4>
                <p className="text-sm text-muted-foreground">
                  {linkedinData.length} señales disponibles
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  Limitado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsQuickStats;
