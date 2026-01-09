import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from 'recharts';
import {
  Newspaper, TrendingUp, CheckCircle, Bot,
  AlertCircle, Loader2
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const NewsAnalytics = () => {
  // Fetch analytics data
  const { data, isLoading } = useQuery({
    queryKey: ['news-analytics'],
    queryFn: async () => {
      // Get all articles from last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data: articles, error } = await supabase
        .from('news_articles')
        .select('id, source_name, category, is_published, is_deleted, auto_published, created_at')
        .gte('created_at', thirtyDaysAgo)
        .eq('is_deleted', false);

      if (error) throw error;

      // Process data for charts
      const bySource: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      const byDay: Record<string, { total: number; published: number }> = {};
      let totalPublished = 0;
      let autoPublished = 0;

      articles?.forEach(article => {
        // By source
        const source = article.source_name || 'Desconocido';
        bySource[source] = (bySource[source] || 0) + 1;

        // By category
        const category = article.category || 'Sin categoría';
        byCategory[category] = (byCategory[category] || 0) + 1;

        // By day
        const day = format(new Date(article.created_at), 'yyyy-MM-dd');
        if (!byDay[day]) byDay[day] = { total: 0, published: 0 };
        byDay[day].total++;
        if (article.is_published) byDay[day].published++;

        // Counters
        if (article.is_published) totalPublished++;
        if (article.auto_published) autoPublished++;
      });

      // Format for charts
      const sourceData = Object.entries(bySource)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const categoryData = Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Last 14 days for line chart
      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
        const dayData = byDay[date] || { total: 0, published: 0 };
        return {
          date: format(new Date(date), 'dd MMM', { locale: es }),
          total: dayData.total,
          published: dayData.published,
        };
      });

      return {
        total: articles?.length || 0,
        published: totalPublished,
        autoPublished,
        manualPublished: totalPublished - autoPublished,
        approvalRate: articles?.length ? Math.round((totalPublished / articles.length) * 100) : 0,
        sourceData,
        categoryData,
        dailyData: last14Days,
      };
    },
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total (30d)</p>
                <p className="text-2xl font-bold">{data?.total || 0}</p>
              </div>
              <Newspaper className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publicadas</p>
                <p className="text-2xl font-bold text-green-600">{data?.published || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auto-publicadas</p>
                <p className="text-2xl font-bold text-blue-600">{data?.autoPublished || 0}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa aprobación</p>
                <p className="text-2xl font-bold">{data?.approvalRate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* By Source Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Noticias por Fuente</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.sourceData && data.sourceData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.sourceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {data.sourceData.slice(0, 5).map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <AlertCircle className="h-5 w-5 mr-2" />
                Sin datos
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Category Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Noticias por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.categoryData && data.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.categoryData.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <AlertCircle className="h-5 w-5 mr-2" />
                Sin datos
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendencia Diaria (últimos 14 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.dailyData && data.dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Importadas"
                  dot={{ fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="published" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Publicadas"
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              <AlertCircle className="h-5 w-5 mr-2" />
              Sin datos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
