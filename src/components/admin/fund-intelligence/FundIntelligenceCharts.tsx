import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FundNews } from '@/hooks/useFundIntelligence';
import { format, subMonths, startOfMonth, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

interface FundIntelligenceChartsProps {
  news: FundNews[];
}

const NEWS_TYPE_COLORS: Record<string, string> = {
  acquisition: 'hsl(var(--chart-1))',
  exit: 'hsl(var(--chart-2))',
  fundraising: 'hsl(var(--chart-3))',
  team: 'hsl(var(--chart-4))',
  portfolio: 'hsl(var(--chart-5))',
  other: 'hsl(var(--muted-foreground))',
};

const NEWS_TYPE_LABELS: Record<string, string> = {
  acquisition: 'Adquisiciones',
  exit: 'Exits',
  fundraising: 'Fundraising',
  team: 'Equipo',
  portfolio: 'Portfolio',
  other: 'Otros',
};

export const FundIntelligenceCharts = ({ news }: FundIntelligenceChartsProps) => {
  // News by type (Pie Chart)
  const newsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    news.forEach(n => {
      const type = n.news_type || 'other';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([type, count]) => ({
        name: NEWS_TYPE_LABELS[type] || type,
        value: count,
        color: NEWS_TYPE_COLORS[type] || NEWS_TYPE_COLORS.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [news]);

  // News by month (Bar Chart - last 6 months)
  const newsByMonth = useMemo(() => {
    const months: { month: string; date: Date; count: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = startOfMonth(subMonths(now, i));
      months.push({
        month: format(monthDate, 'MMM', { locale: es }),
        date: monthDate,
        count: 0,
      });
    }

    news.forEach(n => {
      const newsDate = new Date(n.created_at);
      const monthStart = startOfMonth(newsDate);
      
      const monthEntry = months.find(m => 
        m.date.getFullYear() === monthStart.getFullYear() &&
        m.date.getMonth() === monthStart.getMonth()
      );
      
      if (monthEntry) {
        monthEntry.count++;
      }
    });

    return months.map(({ month, count }) => ({ month, count }));
  }, [news]);

  // Top funds by news count
  const topFunds = useMemo(() => {
    const fundCounts: Record<string, { name: string; count: number; type: 'sf' | 'cr' }> = {};
    
    news.forEach(n => {
      const key = n.fund_id;
      if (!fundCounts[key]) {
        // We don't have fund name in news, use first 8 chars of ID as placeholder
        fundCounts[key] = { 
          name: n.fund_id.substring(0, 8), 
          count: 0,
          type: n.fund_type 
        };
      }
      fundCounts[key].count++;
    });

    return Object.values(fundCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [news]);

  // Material changes trend
  const materialChangesStats = useMemo(() => {
    const sixMonthsAgo = subMonths(new Date(), 6);
    const recentNews = news.filter(n => isAfter(new Date(n.created_at), sixMonthsAgo));
    const materialCount = recentNews.filter(n => n.is_material_change).length;
    const processedCount = recentNews.filter(n => n.is_processed).length;
    
    return {
      total: recentNews.length,
      material: materialCount,
      processed: processedCount,
      pending: recentNews.length - processedCount,
    };
  }, [news]);

  if (news.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No hay datos de noticias para mostrar gráficos.
          <br />
          Ejecuta un scan de noticias para comenzar a recopilar datos.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pie Chart - News by Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Noticias por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={newsByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {newsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart - News by Month */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Noticias por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={newsByMonth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Noticias"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resumen (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{materialChangesStats.total}</div>
              <div className="text-sm text-muted-foreground">Total noticias</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-orange-500">{materialChangesStats.material}</div>
              <div className="text-sm text-muted-foreground">Cambios materiales</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-green-500">{materialChangesStats.processed}</div>
              <div className="text-sm text-muted-foreground">Procesadas</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-red-500">{materialChangesStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Funds */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fondos más Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topFunds.length > 0 ? (
              topFunds.map((fund, idx) => (
                <div key={fund.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono text-sm w-5">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-sm">{fund.name}...</span>
                    <span className="text-xs text-muted-foreground uppercase">
                      {fund.type}
                    </span>
                  </div>
                  <span className="font-bold text-primary">{fund.count}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Sin datos de fondos
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
