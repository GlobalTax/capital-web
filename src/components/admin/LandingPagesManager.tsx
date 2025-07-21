import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  LayoutTemplate, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  Globe,
  Globe as GlobeOff,
  ExternalLink,
  BarChart3,
  Calendar,
  Users,
  MousePointer
} from 'lucide-react';
import { useLandingPages, useLandingPageTemplates } from '@/hooks/useLandingPages';
import { LandingPageBuilder } from './LandingPageBuilder';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const LandingPagesManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPage, setEditingPage] = useState<string | null>(null);

  const { landingPages, isLoading, togglePublish, deleteLandingPage, duplicateLandingPage } = useLandingPages();
  const { templates } = useLandingPageTemplates();

  // Filtrar landing pages
  const filteredPages = landingPages?.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 'published') return matchesSearch && page.is_published;
    if (selectedTab === 'draft') return matchesSearch && !page.is_published;
    return matchesSearch;
  }) || [];

  // Estadísticas rápidas
  const stats = {
    total: landingPages?.length || 0,
    published: landingPages?.filter(p => p.is_published).length || 0,
    drafts: landingPages?.filter(p => !p.is_published).length || 0,
    templates: templates?.length || 0,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lead_magnet': return 'bg-green-100 text-green-800';
      case 'valuation': return 'bg-blue-100 text-blue-800';
      case 'contact': return 'bg-purple-100 text-purple-800';
      case 'sector': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'lead_magnet': return 'Lead Magnet';
      case 'valuation': return 'Valoración';
      case 'contact': return 'Contacto';
      case 'sector': return 'Sectorial';
      default: return 'Personalizada';
    }
  };

  if (showBuilder) {
    return (
      <LandingPageBuilder 
        pageId={editingPage}
        onClose={() => {
          setShowBuilder(false);
          setEditingPage(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Landing Pages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Crea y gestiona landing pages optimizadas para conversión
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowBuilder(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Landing Page
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Landing Pages</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <LayoutTemplate className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Publicadas</p>
                <p className="text-2xl font-semibold">{stats.published}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Borradores</p>
                <p className="text-2xl font-semibold">{stats.drafts}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Edit className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Templates</p>
                <p className="text-2xl font-semibold">{stats.templates}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <LayoutTemplate className="h-4 w-4 text-purple-600" />
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
            placeholder="Buscar landing pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
          <TabsTrigger value="published">Publicadas ({stats.published})</TabsTrigger>
          <TabsTrigger value="draft">Borradores ({stats.drafts})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-32 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-12">
              <LayoutTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No se encontraron resultados' : 'No hay landing pages'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Intenta con términos de búsqueda diferentes'
                  : 'Crea tu primera landing page para empezar'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowBuilder(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Landing Page
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPages.map((page) => (
                <Card key={page.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`text-xs ${
                              page.template?.type ? getTypeColor(page.template.type) : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {page.template?.type ? getTypeName(page.template.type) : 'Personalizada'}
                          </Badge>
                          {page.is_published ? (
                            <Globe className="h-4 w-4 text-green-600" />
                          ) : (
                            <GlobeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{page.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">/{page.slug}</p>
                        {page.template && (
                          <p className="text-xs text-muted-foreground">
                            Basado en: {page.template.name}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            0 visitas
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            0 conversiones
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(page.created_at).toLocaleDateString()}
                        </span>
                        {page.is_published && page.published_at && (
                          <span>Publicada {new Date(page.published_at).toLocaleDateString()}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPage(page.id);
                            setShowBuilder(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {page.is_published && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/landing/${page.slug}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateLandingPage.mutate(page.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublish.mutate({ id: page.id, publish: !page.is_published })}
                        >
                          {page.is_published ? <GlobeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar landing page?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. La landing page "{page.title}" será eliminada permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteLandingPage.mutate(page.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LandingPagesManager;