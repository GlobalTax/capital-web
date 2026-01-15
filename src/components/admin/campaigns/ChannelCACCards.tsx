// ============= CHANNEL CAC CARDS =============
// Tarjetas con métricas de CAC por canal

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Euro, Users, Target } from 'lucide-react';
import { ChannelAnalytics } from '@/hooks/useCampaignCosts';
import { cn } from '@/lib/utils';

interface ChannelCACCardsProps {
  analytics: ChannelAnalytics[];
  isLoading?: boolean;
}

const CHANNEL_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  meta_ads: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
  google_ads: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
  linkedin_ads: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
  other: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-600' },
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const ChannelCACCards: React.FC<ChannelCACCardsProps> = ({ analytics, isLoading }) => {
  // Calculate totals
  const totalSpend = analytics.reduce((sum, a) => sum + a.totalSpend, 0);
  const totalLeads = analytics.reduce((sum, a) => sum + a.totalLeads + a.totalValuations, 0);
  const avgCAC = totalLeads > 0 ? totalSpend / totalLeads : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-20 mb-2" />
              <div className="h-3 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Channel Cards */}
      {analytics.map((channel) => {
        const colors = CHANNEL_COLORS[channel.channel] || CHANNEL_COLORS.other;
        const totalContacts = channel.totalLeads + channel.totalValuations;
        
        return (
          <Card 
            key={channel.channel} 
            className={cn('border-2', colors.border, colors.bg)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{channel.channelLabel}</span>
                {channel.trend !== 0 && (
                  <span className={cn(
                    'flex items-center text-xs',
                    channel.trend > 0 ? 'text-red-600' : 'text-green-600'
                  )}>
                    {channel.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(channel.trend)}%
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{formatCurrency(channel.totalSpend)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{totalContacts} leads</span>
                  </div>
                  <div className={cn('flex items-center gap-1 font-medium', colors.icon)}>
                    <Target className="h-3 w-3" />
                    <span>CAC: {formatCurrency(channel.cac)}</span>
                  </div>
                </div>

                {(channel.totalLeads > 0 || channel.totalValuations > 0) && (
                  <div className="text-xs text-muted-foreground">
                    {channel.totalLeads > 0 && <span>{channel.totalLeads} contactos</span>}
                    {channel.totalLeads > 0 && channel.totalValuations > 0 && <span> · </span>}
                    {channel.totalValuations > 0 && <span>{channel.totalValuations} valoraciones</span>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Total Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Euro className="h-4 w-4 text-primary" />
            Total Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(totalSpend)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{totalLeads} leads totales</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm font-medium text-primary">
              <Target className="h-3 w-3" />
              <span>CAC promedio: {formatCurrency(avgCAC)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelCACCards;
