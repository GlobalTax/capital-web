
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Crown,
  Target,
  Building2
} from 'lucide-react';
import { ApolloContact } from '@/types/integrations';

interface ApolloContactsKPICardsProps {
  apolloContacts: ApolloContact[];
}

const ApolloContactsKPICards = ({ apolloContacts }: ApolloContactsKPICardsProps) => {
  const decisionMakers = apolloContacts.filter(c => c.is_decision_maker);
  const totalContacts = apolloContacts.length;
  const avgContactScore = totalContacts > 0 
    ? apolloContacts.reduce((sum, c) => sum + c.contact_score, 0) / totalContacts 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalContacts}</div>
          <p className="text-xs text-muted-foreground">Contactos enriquecidos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Decision Makers</CardTitle>
          <Crown className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{decisionMakers.length}</div>
          <p className="text-xs text-muted-foreground">Altos cargos identificados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(avgContactScore)}</div>
          <p className="text-xs text-muted-foreground">Calidad de contactos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas</CardTitle>
          <Building2 className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(apolloContacts.map(c => c.company_domain)).size}
          </div>
          <p className="text-xs text-muted-foreground">Con contactos enriquecidos</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApolloContactsKPICards;
