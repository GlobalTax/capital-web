import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  FileText, 
  Award, 
  Download, 
  Eye, 
  Users, 
  TrendingUp,
  Filter,
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useLeadMagnets } from '@/hooks/useLeadMagnets';
import { supabase } from '@/integrations/supabase/client';
import { fetchContentMetrics, fetchTopPerformingPosts } from '@/utils/analytics/contentMetrics';
import { formatCurrency } from '@/utils/formatters';

interface ContentMetrics {
  totalViews: number;
  uniqueVisitors: number;
  avgEngagement: number;
  topPosts: any[];
}

const ContentPerformancePage = () => {
  const { posts: blogPosts, isLoading: blogLoading } = useBlogPosts();
  const { leadMagnets, isLoading: magnetsLoading } = useLeadMagnets();
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics>({
    totalViews: 0,
    uniqueVisitors: 0,
    avgEngagement: 0,
    topPosts: []
  });

  // Fetch all data in parallel for better performance
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [caseStudiesRes, metricsRes, topPostsRes] = await Promise.all([
          supabase
            .from('case_studies')
            .select('*')
            .eq('is_active', true),
          
          supabase
            .from('content_analytics')
            .select('page_views, unique_visitors, engagement_score'),
          
          supabase
            .from('blog_posts')
            .select(`
              id,
              title,
              category,
              created_at,
              is_published,
              blog_post_metrics (
                total_views,
                unique_views,
                avg_scroll_percentage
              )
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
        ]);

        if (caseStudiesRes.error) throw caseStudiesRes.error;
        if (metricsRes.error) throw metricsRes.error;
        if (topPostsRes.error) throw topPostsRes.error;

        setCaseStudies(caseStudiesRes.data || []);
        
        // Calculate content metrics
        const metrics = metricsRes.data || [];
        const totalViews = metrics.reduce((sum, m) => sum + (m.page_views || 0), 0);
        const totalUniqueVisitors = metrics.reduce((sum, m) => sum + (m.unique_visitors || 0), 0);
        const avgEngagement = metrics.length > 0 
          ? Math.round(metrics.reduce((sum, m) => sum + (m.engagement_score || 0), 0) / metrics.length)
          : 0;

        const topPosts = topPostsRes.data?.slice(0, 5).map(post => {
          const postMetrics = Array.isArray(post.blog_post_metrics) ? post.blog_post_metrics[0] : post.blog_post_metrics;
          return {
            id: post.id,
            title: post.title,
            category: post.category,
            views: postMetrics?.total_views || 0,
            engagement: postMetrics?.avg_scroll_percentage || 0
          };
        }) || [];

        setContentMetrics({
          totalViews,
          uniqueVisitors: totalUniqueVisitors,
          avgEngagement,
          topPosts
        });

      } catch (error) {
        console.error('Error fetching content data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Memoized calculations for better performance
  const metrics = useMemo(() => {
    const totalPosts = (blogPosts as any[])?.length || 0;
    const publishedPosts = (blogPosts as any[])?.filter(p => p.is_published).length || 0;
    const totalCaseStudies = caseStudies?.length || 0;
    const totalLeadMagnets = leadMagnets?.length || 0;
    const activeMagnets = leadMagnets?.filter(m => m.status === 'active').length || 0;
    const totalDownloads = leadMagnets?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0;

    return {
      totalPosts,
      publishedPosts,
      totalCaseStudies,
      totalLeadMagnets,
      activeMagnets,
      totalDownloads
    };
  }, [blogPosts, caseStudies, leadMagnets]);

  // Memoized filtered content for better search performance
  const filteredContent = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return {
      blogPosts: (blogPosts as any[])?.filter(post => 
        post.title?.toLowerCase().includes(searchLower) ||
        post.category?.toLowerCase().includes(searchLower)
      ) || [],
      
      caseStudies: caseStudies?.filter(cs => 
        cs.title?.toLowerCase().includes(searchLower) ||
        cs.sector?.toLowerCase().includes(searchLower)
      ) || [],
      
      magnets: leadMagnets?.filter(m => 
        m.title?.toLowerCase().includes(searchLower) ||
        m.sector?.toLowerCase().includes(searchLower)
      ) || []
    };
  }, [blogPosts, caseStudies, leadMagnets, searchTerm]);

  const isLoadingData = blogLoading || magnetsLoading || isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Performance de Contenido</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Analiza el rendimiento y métricas de todo tu contenido
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contenido
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Posts de Blog</p>
                <p className="text-2xl font-semibold">{metrics.totalPosts}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+12%</span>
                </div>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Casos de Éxito</p>
                <p className="text-2xl font-semibold">{metrics.totalCaseStudies}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+8%</span>
                </div>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Lead Magnets</p>
                <p className="text-2xl font-semibold">{metrics.totalLeadMagnets}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+5%</span>
                </div>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Descargas</p>
                <p className="text-2xl font-semibold">{metrics.totalDownloads.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+24%</span>
                </div>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Últimos 30 días
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts ({metrics.totalPosts})</TabsTrigger>
          <TabsTrigger value="cases">Casos de Éxito ({metrics.totalCaseStudies})</TabsTrigger>
          <TabsTrigger value="magnets">Lead Magnets ({metrics.totalLeadMagnets})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadMagnets?.slice(0, 5).map((magnet, index) => (
                    <div key={magnet.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{magnet.title}</p>
                          <Badge variant="secondary" className="text-xs">{magnet.sector}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{magnet.download_count || 0}</p>
                        <p className="text-xs text-muted-foreground">descargas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Posts de Blog</span>
                    <span className="text-sm font-medium">{((metrics.totalPosts / (metrics.totalPosts + metrics.totalCaseStudies + metrics.totalLeadMagnets)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Casos de Éxito</span>
                    <span className="text-sm font-medium">{((metrics.totalCaseStudies / (metrics.totalPosts + metrics.totalCaseStudies + metrics.totalLeadMagnets)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lead Magnets</span>
                    <span className="text-sm font-medium">{((metrics.totalLeadMagnets / (metrics.totalPosts + metrics.totalCaseStudies + metrics.totalLeadMagnets)) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          {isLoadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.blogPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge variant={post.is_published ? "default" : "secondary"} className="text-xs">
                          {post.is_published ? "Publicado" : "Borrador"}
                        </Badge>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post.category} • {post.reading_time} min
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>By {post.author_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.caseStudies.map((cs) => (
              <Card key={cs.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="default" className="text-xs">{cs.sector}</Badge>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2">{cs.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cs.valuation_amount ? formatCurrency(cs.valuation_amount, cs.valuation_currency || 'EUR') : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{cs.year}</span>
                      <span>{cs.company_size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="magnets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.magnets.map((magnet) => (
              <Card key={magnet.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge variant={magnet.status === 'active' ? "default" : "secondary"} className="text-xs">
                        {magnet.status === 'active' ? "Activo" : "Inactivo"}
                      </Badge>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2">{magnet.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {magnet.sector} • {magnet.type}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{magnet.download_count || 0} descargas</span>
                      <span className="text-green-600 font-medium">{magnet.lead_conversion_count || 0} leads</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentPerformancePage;