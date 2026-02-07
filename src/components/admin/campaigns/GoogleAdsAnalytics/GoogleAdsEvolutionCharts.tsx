// ============= GOOGLE ADS EVOLUTION CHARTS =============

import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Euro, MousePointerClick, Target } from 'lucide-react';
import { GoogleAdsDailyPoint } from './types';

interface Props {
  data: GoogleAdsDailyPoint[];
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const fmtNumber = (v: number) => new Intl.NumberFormat('es-ES').format(Math.round(v));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  let formattedDate = label;
  try {
    if (label) {
      const parsed = parseISO(label);
      if (!isNaN(parsed.getTime())) formattedDate = format(parsed, 'dd MMMM yyyy', { locale: es });
    }
  } catch { /* fallback */ }

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{formattedDate}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {entry.dataKey.includes('spend') || entry.dataKey.includes('cpc') || entry.dataKey.includes('cpa') || entry.dataKey.includes('cpm')
              ? fmtCurrency(entry.value ?? 0)
              : entry.dataKey === 'ctr' ? `${(entry.value ?? 0).toFixed(2)}%`
              : fmtNumber(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
};

export const GoogleAdsEvolutionCharts: React.FC<Props> = ({ data }) => {
  if (data.length < 3) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="py-8 text-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Se necesitan al menos 3 días de datos para gráficos</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(d => {
    try {
      const parsed = parseISO(d.date);
      return { ...d, displayDate: !isNaN(parsed.getTime()) ? format(parsed, 'dd MMM', { locale: es }) : d.date };
    } catch {
      return { ...d, displayDate: d.date };
    }
  });

  const charts = [
    { key: 'spend', name: 'Gasto Diario', icon: Euro, color: '#3b82f6', iconColor: 'text-blue-500', yFmt: (v: number) => `${Math.round(v)}€` },
    { key: 'clicks', name: 'Clics Diarios', icon: MousePointerClick, color: '#10b981', iconColor: 'text-emerald-500' },
    { key: 'conversions', name: 'Conversiones', icon: Target, color: '#f59e0b', iconColor: 'text-amber-500' },
    { key: 'ctr', name: 'CTR (%)', icon: TrendingUp, color: '#8b5cf6', iconColor: 'text-violet-500', yFmt: (v: number) => `${v.toFixed(1)}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Evolución Temporal</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.map(({ key, name, icon: Icon, color, iconColor, yFmt }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className={`h-4 w-4 ${iconColor}`} />
                {name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={yFmt} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey={key} name={name} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
