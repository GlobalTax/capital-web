// ============= GOOGLE ADS CAMPAIGN CARD =============

import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Euro, CalendarDays, Target, MousePointerClick, TrendingUp, ChevronDown, ChevronUp, Percent } from 'lucide-react';
import { GoogleAdsCampaignStats } from './types';
import { cn } from '@/lib/utils';

interface Props {
  stats: GoogleAdsCampaignStats;
  colorIndex: number;
}

const COLORS = [
  'from-blue-500/10 to-blue-600/5 border-blue-500/30',
  'from-emerald-500/10 to-emerald-600/5 border-emerald-500/30',
  'from-amber-500/10 to-amber-600/5 border-amber-500/30',
  'from-violet-500/10 to-violet-600/5 border-violet-500/30',
  'from-rose-500/10 to-rose-600/5 border-rose-500/30',
];

const BADGE_COLORS = [
  'bg-blue-500/20 text-blue-700 border-blue-500/30',
  'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  'bg-amber-500/20 text-amber-700 border-amber-500/30',
  'bg-violet-500/20 text-violet-700 border-violet-500/30',
  'bg-rose-500/20 text-rose-700 border-rose-500/30',
];

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtNumber = (v?: number) => (!v ? '—' : new Intl.NumberFormat('es-ES').format(Math.round(v)));

export const GoogleAdsCampaignCard: React.FC<Props> = ({ stats, colorIndex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorClass = COLORS[colorIndex % COLORS.length];
  const badgeClass = BADGE_COLORS[colorIndex % BADGE_COLORS.length];

  const sortedRecords = useMemo(() => [...stats.records].sort((a, b) => b.date.localeCompare(a.date)), [stats.records]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn('bg-gradient-to-br transition-all', colorClass)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-base font-semibold leading-tight">{stats.campaignName}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={badgeClass}>
                  <Percent className="h-3 w-3 mr-1" />{stats.percentOfTotal.toFixed(1)}% del total
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  <CalendarDays className="h-3 w-3 mr-1" />{stats.activeDays} días
                </Badge>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground"><Euro className="h-3 w-3" /><span className="text-[10px] uppercase tracking-wider">Gasto</span></div>
              <p className="text-lg font-bold">{fmtCurrency(stats.totalSpend)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground"><MousePointerClick className="h-3 w-3" /><span className="text-[10px] uppercase tracking-wider">Clics</span></div>
              <p className="text-lg font-bold">{fmtNumber(stats.totalClicks)}</p>
              <p className="text-xs text-muted-foreground">CPC: {fmtCurrency(stats.avgCpc)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground"><Target className="h-3 w-3" /><span className="text-[10px] uppercase tracking-wider">Conv.</span></div>
              <p className="text-lg font-bold">{fmtNumber(stats.totalConversions)}</p>
              <p className="text-xs text-muted-foreground">CPA: {fmtCurrency(stats.avgCpa)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-3 w-3" /><span className="text-[10px] uppercase tracking-wider">CTR</span></div>
              <p className="text-lg font-bold">{stats.avgCtr > 0 ? `${stats.avgCtr.toFixed(2)}%` : '—'}</p>
            </div>
          </div>

          <CollapsibleContent>
            <div className="border rounded-lg overflow-hidden mt-4">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Fecha</TableHead>
                      <TableHead className="text-xs text-right">Gasto</TableHead>
                      <TableHead className="text-xs text-right">Clics</TableHead>
                      <TableHead className="text-xs text-right">Conv.</TableHead>
                      <TableHead className="text-xs text-right">CPC</TableHead>
                      <TableHead className="text-xs text-right">CPM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRecords.map((r, idx) => {
                      const clicks = r.clicks || 0;
                      const cpc = clicks > 0 ? r.spend / clicks : 0;
                      return (
                        <TableRow key={r.id || idx} className="text-sm">
                          <TableCell className="font-medium">{format(parseISO(r.date), 'dd MMM yyyy', { locale: es })}</TableCell>
                          <TableCell className="text-right">{fmtCurrency(r.spend)}</TableCell>
                          <TableCell className="text-right">{fmtNumber(r.clicks)}</TableCell>
                          <TableCell className="text-right">{fmtNumber(r.conversions)}</TableCell>
                          <TableCell className="text-right">{cpc > 0 ? fmtCurrency(cpc) : '—'}</TableCell>
                          <TableCell className="text-right">{r.cpm ? fmtCurrency(r.cpm) : '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};
