import React, { useState, useEffect } from 'react';
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

const ContentPerformancePage = () => {
  const { posts: blogPosts, isLoading: blogLoading } = useBlogPosts();
  const { leadMagnets, isLoading: magnetsLoading } = useLeadMagnets();
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch case studies
  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const { data, error } = await supabase
          .from('case_studies')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        setCaseStudies(data || []);
      } catch (error) {
        console.error('Error fetching case studies:', error);
        setCaseStudies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseStudies();
  }, []);

  // Calculate metrics
  const totalPosts = blogPosts?.length || 0;
  const publishedPosts = blogPosts?.filter(p => p.is_published).length || 0;
  const totalCaseStudies = caseStudies?.length || 0;
  const totalLeadMagnets = leadMagnets?.length || 0;
  const activeMagnets = leadMagnets?.filter(m => m.status === 'active').length || 0;
  const totalDownloads = leadMagnets?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0;

  // Filter content based on search term
  const filteredBlogPosts = blogPosts?.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredCaseStudies = caseStudies?.filter(cs => 
    cs.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cs.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredMagnets = leadMagnets?.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                <p className="text-2xl font-semibold">{totalPosts}</p>
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
                <p className="text-2xl font-semibold">{totalCaseStudies}</p>
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
                <p className="text-2xl font-semibold">{totalLeadMagnets}</p>
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
                <p className="text-2xl font-semibold">{totalDownloads.toLocaleString()}</p>
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
          <TabsTrigger value="blog">Blog Posts ({totalPosts})</TabsTrigger>
          <TabsTrigger value="cases">Casos de Éxito ({totalCaseStudies})</TabsTrigger>
          <TabsTrigger value="magnets">Lead Magnets ({totalLeadMagnets})</TabsTrigger>
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
                    <span className="text-sm font-medium">{((totalPosts / (totalPosts + totalCaseStudies + totalLeadMagnets)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Casos de Éxito</span>
                    <span className="text-sm font-medium">{((totalCaseStudies / (totalPosts + totalCaseStudies + totalLeadMagnets)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lead Magnets</span>
                    <span className="text-sm font-medium">{((totalLeadMagnets / (totalPosts + totalCaseStudies + totalLeadMagnets)) * 100).toFixed(0)}%</span>
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
              {filteredBlogPosts.map((post) => (
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
            {filteredCaseStudies.map((cs) => (
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
                        {cs.valuation_amount ? `${cs.valuation_amount.toLocaleString()}${cs.valuation_currency || '€'}` : 'N/A'}
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
            {filteredMagnets.map((magnet) => (
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