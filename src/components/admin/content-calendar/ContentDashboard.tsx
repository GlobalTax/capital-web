import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { type ContentCalendarItem } from '@/hooks/useContentCalendar';

const CHANNEL_LABELS: Record<string, string> = {
  linkedin_company: 'LinkedIn Empresa',
  linkedin_personal: 'LinkedIn Personal',
  blog: 'Blog',
  newsletter: 'Newsletter',
  crm_internal: 'CRM Interno',
};

const STATUS_LABELS: Record<string, string> = {
  idea: 'Ideas',
  draft: 'Borrador',
  review: 'Revisión',
  scheduled: 'Programado',
  published: 'Publicado',
  archived: 'Archivado',
};

const STATUS_COLORS: Record<string, string> = {
  idea: '#94a3b8',
  draft: '#3b82f6',
  review: '#f59e0b',
  scheduled: '#a855f7',
  published: '#22c55e',
  archived: '#6b7280',
};

const CHANNEL_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#64748b'];

interface ContentDashboardProps {
  items: ContentCalendarItem[];
}

const ContentDashboard: React.FC<ContentDashboardProps> = ({ items }) => {
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
    return Object.entries(counts).map(([status, count]) => ({
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
          No hay datos aún. Genera ideas con la pestaña IA para empezar.
        </CardContent>
      </Card>
    );
  }

  return (
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
              <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
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
  );
};

export default ContentDashboard;
