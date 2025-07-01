
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Target, Users, TrendingUp, UserCheck } from 'lucide-react';
import { ApolloCompany, ApolloContact, AdConversion, LinkedInIntelligence, IntegrationsMetrics } from '@/types/integrations';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Apollo Companies</CardTitle>
          <Building2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apolloCompanies.length}</div>
          <p className="text-xs text-gray-600">Empresas enriquecidas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Apollo Contacts</CardTitle>
          <UserCheck className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apolloContacts.length}</div>
          <p className="text-xs text-gray-600">Contactos identificados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Google Ads</CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adConversions.length}</div>
          <p className="text-xs text-gray-600">Conversiones trackeadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">LinkedIn Intel</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{linkedinData.length}</div>
          <p className="text-xs text-gray-600">Señales sociales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.successRate.toFixed(1) || 0}%</div>
          <p className="text-xs text-gray-600">Integraciones exitosas</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsQuickStats;
