import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign } from 'lucide-react';

interface ContactStats {
  total: number;
  uniqueContacts: number;
  byOrigin: Record<string, number>;
  totalValuation: number;
}

interface ContactStatsCardsProps {
  stats: ContactStats;
}

export const ContactStatsCards: React.FC<ContactStatsCardsProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const recurringContacts = stats.total - stats.uniqueContacts;
  const recurringPercentage = stats.total > 0 
    ? ((recurringContacts / stats.total) * 100).toFixed(0) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Contactos Únicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.uniqueContacts}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.total} valoraciones totales
              </div>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Contactos Recurrentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{recurringContacts}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {recurringPercentage}% del total
              </div>
            </div>
            <div className="text-2xl">🔄</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Valoraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byOrigin.valuation || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Valoración Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">
              {formatCurrency(stats.totalValuation)}
            </div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
