import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Link, CheckCircle, Building2 } from 'lucide-react';

interface SFRadarStatsProps {
  totalQueries: number;
  totalUrls: number;
  relevantUrls: number;
  extractedFunds: number;
}

export const SFRadarStats: React.FC<SFRadarStatsProps> = ({
  totalQueries,
  totalUrls,
  relevantUrls,
  extractedFunds
}) => {
  const stats = [
    {
      label: 'Queries',
      value: totalQueries,
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'URLs Scrapeadas',
      value: totalUrls,
      icon: Link,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Relevantes',
      value: relevantUrls,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Funds Extraídos',
      value: extractedFunds,
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
