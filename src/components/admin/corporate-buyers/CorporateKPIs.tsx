// =============================================
// CORPORATE BUYERS KPIs
// =============================================

import { Building2, Star, Globe, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CorporateBuyer, BUYER_TYPE_LABELS } from '@/types/corporateBuyers';

interface CorporateKPIsProps {
  buyers: CorporateBuyer[];
  favoritesCount: number;
}

export const CorporateKPIs = ({ buyers, favoritesCount }: CorporateKPIsProps) => {
  const totalBuyers = buyers.length;
  
  // Count by type
  const typeCounts = buyers.reduce((acc, buyer) => {
    if (buyer.buyer_type) {
      acc[buyer.buyer_type] = (acc[buyer.buyer_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get top type
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  // Count unique countries
  const uniqueCountries = new Set(buyers.map(b => b.country_base).filter(Boolean)).size;

  const kpis = [
    {
      label: 'Total Compradores',
      value: totalBuyers,
      icon: Building2,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Favoritos',
      value: favoritesCount,
      icon: Star,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Países',
      value: uniqueCountries,
      icon: Globe,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      label: topType ? BUYER_TYPE_LABELS[topType[0] as keyof typeof BUYER_TYPE_LABELS] : 'Tipo Principal',
      value: topType ? topType[1] : 0,
      icon: Briefcase,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
