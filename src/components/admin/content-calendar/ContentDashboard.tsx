import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle2, AlertCircle, Calendar, Sparkles, FileText } from 'lucide-react';
import { type ContentCalendarItem } from '@/hooks/useContentCalendar';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const CHANNEL_LABELS: Record<string, string> = {
  linkedin_company: '🏢 LinkedIn Empresa',
  linkedin_personal: '👤 LinkedIn Personal',
  blog: '📝 Blog',
  newsletter: '📧 Newsletter',
  crm_internal: '🔒 CRM',
};

const STATUS_COLORS: Record<string, string> = {
  idea: '#94a3b8',
  draft: '#3b82f6',
  review: '#f59e0b',
  scheduled: '#a855f7',
  published: '#22c55e',
  archived: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  idea: 'Ideas',
  draft: 'Borrador',
  review: 'Revisión',
  scheduled: 'Programado',
  published: 'Publicado',
};

const CHANNEL_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#64748b'];

interface ContentDashboardProps {
  items: ContentCalendarItem[];
}

const ContentDashboard: React.FC<ContentDashboardProps> = ({ items }) => {
  const now = new Date();

  const kpis = useMemo(() => {
    const total = items.length;
    const published = items.filter(i => i.status === 'published').length;
    const withAI = items.filter(i => (i as any).ai_generated_content).length;
    const overdue = items.filter(i =>
      i.scheduled_date && isBefore(new Date(i.scheduled_date), now) && i.status !== 'published'
    ).length;
    const upcoming7 = items.filter(i =>
      i.scheduled_date &&
      isAfter(new Date(i.scheduled_date), now) &&
      isBefore(new Date(i.scheduled_date), addDays(now, 7)) &&
      i.status !== 'published'
    );
    const completionRate = total > 0 ? Math.round((published / total) * 100) : 0;

    return { total, published, withAI, overdue, upcoming7, completionRate };
  }, [items, now]);

  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => {
      const ch = (i as any).channel || 'blog';
      counts[ch] = (counts[ch] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: CHANNEL_LABELS[name] || name,
      value,
    }));
  }, [items]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return Object.entries(counts)
      .filter(([s]) => s !== 'archived')
      .map(([status, count]) => ({
        status: STATUS_LABELS[status] || status,
        count,
        fill: STATUS_COLORS[status] || '#94a3b8',
      }));
  }, [items]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => {
      const cat = i.category || 'Sin categoría';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [items]);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          No hay datos aún. Usa la pestaña <strong>IA Engine</strong> para generar contenido.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total contenidos', value: kpis.total, icon: FileText, color: 'text-foreground' },
          { label: 'Publicados', value: kpis.published, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Tasa completado', value: `${kpis.completionRate}%`, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Con IA', value: kpis.withAI, icon: Sparkles, color: 'text-purple-600' },
          { label: 'Vencidos', value: kpis.overdue, icon: AlertCircle, color: kpis.overdue > 0 ? 'text-red-600' : 'text-muted-foreground' },
          { label: 'Próximos 7 días', value: kpis.upcoming7.length, icon: Clock, color: 'text-amber-600' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <kpi.icon className={cn('h-5 w-5 shrink-0', kpi.color)} />
              <div>
                <p className="text-lg font-bold leading-none">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming deadlines */}
      {kpis.upcoming7.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Próximas entregas (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex gap-2 flex-wrap">
              {kpis.upcoming7.map(item => (
                <Badge key={item.id} variant="outline" className="text-xs gap-1.5 py-1">
                  <span>{CHANNEL_LABELS[(item as any).channel]?.split(' ')[0] || '📝'}</span>
                  <span className="font-medium truncate max-w-[200px]">{item.title}</span>
                  <span className="text-muted-foreground">
                    {item.scheduled_date && format(new Date(item.scheduled_date), 'dd MMM', { locale: es })}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pipeline por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="status" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribución por Canal</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {channelData.map((_, i) => (
                    <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cobertura por Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentDashboard;
