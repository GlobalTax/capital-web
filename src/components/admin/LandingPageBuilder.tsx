import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Globe, 
  Settings, 
  Layout, 
  Palette,
  Code,
  BarChart3,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { useLandingPages, useLandingPageTemplates, type LandingPage } from '@/hooks/useLandingPages';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface LandingPageBuilderProps {
  pageId?: string | null;
  onClose: () => void;
}

export const LandingPageBuilder: React.FC<LandingPageBuilderProps> = ({ pageId, onClose }) => {
  const [currentPage, setCurrentPage] = useState<Partial<LandingPage>>({
    title: '',
    slug: '',
    content_config: {},
    meta_title: '',
    meta_description: '',
    is_published: false,
    analytics_config: {},
    conversion_goals: [],
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('content');
  const [isLoading, setIsLoading] = useState(false);

  const { templates } = useLandingPageTemplates();
  const { createLandingPage, updateLandingPage } = useLandingPages();

  // Cargar página existente si estamos editando
  useEffect(() => {
    if (pageId) {
      const loadPage = async () => {
        setIsLoading(true);
        try {
        const { data, error } = await (supabase as any)
          .from('landing_pages')
          .select('*')
          .eq('id', pageId)
          .single();

        if (error) throw error;
        setCurrentPage(data);
        setSelectedTemplate((data as any).template_id || '');
        } catch (error) {
          console.error('Error loading page:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadPage();
    }
  }, [pageId]);

  // Generar slug automáticamente
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Manejar cambio de título
  const handleTitleChange = (title: string) => {
    setCurrentPage(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title,
    }));
  };

  // Guardar página
  const handleSave = async (publish = false) => {
    setIsLoading(true);
    try {
      const pageData = {
        ...currentPage,
        is_published: publish,
        template_id: selectedTemplate || undefined,
      };

      if (pageId) {
        await updateLandingPage.mutateAsync({ id: pageId, updates: pageData });
      } else {
        await createLandingPage.mutateAsync(pageData as any);
      }

      if (publish) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener template seleccionado
  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);

  // Renderizar preview de la landing page
  const renderPreview = () => {
    if (!selectedTemplateData) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center">
            <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Selecciona un template para ver el preview</p>
          </div>
        </div>
      );
    }

    // Simular el renderizado del template con los datos actuales
    let htmlContent = selectedTemplateData.template_html;
    
    // Reemplazar variables del template
    const templateConfig = selectedTemplateData.template_config;
    if (templateConfig.fields) {
      templateConfig.fields.forEach((field: string) => {
        const value = currentPage.content_config?.[field] || `{${field}}`;
        htmlContent = htmlContent.replace(new RegExp(`{{${field}}}`, 'g'), value);
      });
    }

    const previewClasses = {
      desktop: 'w-full',
      tablet: 'w-[768px] mx-auto',
      mobile: 'w-[375px] mx-auto'
    };

    return (
      <div className={`${previewClasses[previewMode]} transition-all duration-300`}>
        <div 
          className="border rounded-lg overflow-hidden bg-white shadow-sm"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {pageId ? 'Editar Landing Page' : 'Nueva Landing Page'}
              </h1>
              {currentPage.title && (
                <p className="text-sm text-muted-foreground">/{currentPage.slug}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Preview controls */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button onClick={() => handleSave(true)} disabled={isLoading}>
              <Globe className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Editor */}
          <div className="lg:col-span-1 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">
                  <Layout className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="design">
                  <Palette className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                {/* Información básica */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título de la Página</Label>
                      <Input
                        id="title"
                        value={currentPage.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Ej: Descarga Gratis Nuestro Análisis de Sector"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="slug">URL (Slug)</Label>
                      <Input
                        id="slug"
                        value={currentPage.slug}
                        onChange={(e) => setCurrentPage(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="analisis-sector-gratis"
                      />
                    </div>

                    <div>
                      <Label htmlFor="template">Template Base</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates?.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {template.type}
                                </Badge>
                                {template.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Contenido del template */}
                {selectedTemplateData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contenido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTemplateData.template_config.fields?.map((field: string) => (
                        <div key={field}>
                          <Label htmlFor={field} className="capitalize">
                            {field.replace(/_/g, ' ')}
                          </Label>
                          {field.includes('description') || field.includes('benefit') ? (
                            <Textarea
                              id={field}
                              value={currentPage.content_config?.[field] || ''}
                              onChange={(e) => setCurrentPage(prev => ({
                                ...prev,
                                content_config: { ...prev.content_config, [field]: e.target.value }
                              }))}
                              placeholder={`Ingresa ${field.replace(/_/g, ' ')}`}
                            />
                          ) : (
                            <Input
                              id={field}
                              value={currentPage.content_config?.[field] || ''}
                              onChange={(e) => setCurrentPage(prev => ({
                                ...prev,
                                content_config: { ...prev.content_config, [field]: e.target.value }
                              }))}
                              placeholder={`Ingresa ${field.replace(/_/g, ' ')}`}
                            />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personalización</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Las opciones de diseño avanzado estarán disponibles en la próxima versión.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">SEO y Metadatos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="meta_title">Meta Título</Label>
                      <Input
                        id="meta_title"
                        value={currentPage.meta_title}
                        onChange={(e) => setCurrentPage(prev => ({ ...prev, meta_title: e.target.value }))}
                        placeholder="Título para SEO"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="meta_description">Meta Descripción</Label>
                      <Textarea
                        id="meta_description"
                        value={currentPage.meta_description}
                        onChange={(e) => setCurrentPage(prev => ({ ...prev, meta_description: e.target.value }))}
                        placeholder="Descripción para motores de búsqueda"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Estado de Publicación</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentPage.is_published ? 'Página publicada y visible' : 'Borrador - no visible públicamente'}
                        </p>
                      </div>
                      <Switch
                        checked={currentPage.is_published}
                        onCheckedChange={(checked) => setCurrentPage(prev => ({ ...prev, is_published: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analytics y Conversiones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Las métricas y objetivos de conversión se configurarán automáticamente una vez publicada la página.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                  <Badge variant="outline" className="ml-auto">
                    {previewMode}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full overflow-auto">
                {renderPreview()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};