import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Save, 
  Eye, 
  RefreshCw,
  Type,
  Image,
  Link,
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  AlertCircle
} from 'lucide-react';

interface ContentBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'button' | 'stats' | 'testimonial';
  content: any;
  order: number;
}

interface PageContent {
  id: string;
  name: string;
  title: string;
  description: string;
  blocks: ContentBlock[];
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

const DEMO_CONTENT: PageContent = {
  id: 'programa-colaboradores',
  name: 'Programa de Colaboradores',
  title: 'Únete al equipo de expertos en M&A',
  description: 'Forma parte de nuestra red de profesionales y accede a oportunidades exclusivas',
  blocks: [
    {
      id: 'hero-1',
      type: 'hero',
      content: {
        title: 'Únete al equipo de expertos en M&A',
        subtitle: 'Forma parte de nuestra red de profesionales y accede a oportunidades exclusivas de valoración y transacciones',
        buttonText: 'Aplicar Ahora',
        buttonAction: '#application-form',
        backgroundImage: null
      },
      order: 1
    },
    {
      id: 'stats-1',
      type: 'stats',
      content: {
        stats: [
          { label: 'Colaboradores Activos', value: '50+' },
          { label: 'Valor Gestionado', value: '€1.2B' },
          { label: 'Satisfacción', value: '98,7%' }
        ]
      },
      order: 2
    }
  ],
  seoMeta: {
    title: 'Programa de Colaboradores - Capittal',
    description: 'Únete a nuestra red de expertos en M&A. Oportunidades exclusivas de valoración y transacciones.',
    keywords: ['colaboradores', 'M&A', 'valoración', 'transacciones', 'expertos']
  }
};

export const ContentEditor = () => {
  const [content, setContent] = useState<PageContent>(DEMO_CONTENT);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsDirty(false);
  };

  const handleContentChange = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleBlockChange = (blockId: string, newContent: any) => {
    setContent(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { ...block, content: { ...block.content, ...newContent } }
          : block
      )
    }));
    setIsDirty(true);
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-2xl';
      default: return 'max-w-full';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor de Contenido</h1>
          <p className="text-gray-600 mt-1">
            Edita el contenido de {content.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Vista Previa
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {isDirty && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tienes cambios sin guardar. No olvides guardar antes de salir.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="gap-2">
                <Type className="h-4 w-4" />
                Contenido
              </TabsTrigger>
              <TabsTrigger value="design" className="gap-2">
                <Palette className="h-4 w-4" />
                Diseño
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2">
                <Settings className="h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {/* Page Meta */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Página</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="page-title">Título Principal</Label>
                    <Input
                      id="page-title"
                      value={content.title}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      placeholder="Título que aparece en la página"
                    />
                  </div>
                  <div>
                    <Label htmlFor="page-description">Descripción</Label>
                    <Textarea
                      id="page-description"
                      value={content.description}
                      onChange={(e) => handleContentChange('description', e.target.value)}
                      placeholder="Descripción breve de la página"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content Blocks */}
              {content.blocks.map((block) => (
                <Card key={block.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="capitalize">
                        Bloque {block.type}
                      </CardTitle>
                      <Badge variant="outline">{block.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {block.type === 'hero' && (
                      <>
                        <div>
                          <Label>Título del Hero</Label>
                          <Input
                            value={block.content.title}
                            onChange={(e) => handleBlockChange(block.id, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Subtítulo</Label>
                          <Textarea
                            value={block.content.subtitle}
                            onChange={(e) => handleBlockChange(block.id, { subtitle: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Texto del Botón</Label>
                          <Input
                            value={block.content.buttonText}
                            onChange={(e) => handleBlockChange(block.id, { buttonText: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                    
                    {block.type === 'stats' && (
                      <div className="space-y-4">
                        <Label>Estadísticas</Label>
                        {block.content.stats.map((stat: any, index: number) => (
                          <div key={index} className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Etiqueta"
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...block.content.stats];
                                newStats[index].label = e.target.value;
                                handleBlockChange(block.id, { stats: newStats });
                              }}
                            />
                            <Input
                              placeholder="Valor"
                              value={stat.value}
                              onChange={(e) => {
                                const newStats = [...block.content.stats];
                                newStats[index].value = e.target.value;
                                handleBlockChange(block.id, { stats: newStats });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Diseño</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Esquema de Colores</Label>
                    <Select defaultValue="default">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Por Defecto</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="blue">Azul Corporativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipografía</Label>
                    <Select defaultValue="inter">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="opensans">Open Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Optimización SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seo-title">Título SEO</Label>
                    <Input
                      id="seo-title"
                      value={content.seoMeta.title}
                      onChange={(e) => handleContentChange('seoMeta', {
                        ...content.seoMeta,
                        title: e.target.value
                      })}
                      placeholder="Título para buscadores (max 60 caracteres)"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {content.seoMeta.title.length}/60 caracteres
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="seo-description">Meta Descripción</Label>
                    <Textarea
                      id="seo-description"
                      value={content.seoMeta.description}
                      onChange={(e) => handleContentChange('seoMeta', {
                        ...content.seoMeta,
                        description: e.target.value
                      })}
                      placeholder="Descripción para buscadores (max 160 caracteres)"
                      rows={3}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {content.seoMeta.description.length}/160 caracteres
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          {/* Preview Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 mb-4">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              {/* Preview Content */}
              <div className={`border rounded-lg p-4 bg-white ${getPreviewWidth()} mx-auto transition-all duration-300`}>
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold">{content.title}</h1>
                    <p className="text-gray-600 mt-2">{content.description}</p>
                  </div>
                  
                  {content.blocks.map(block => (
                    <div key={block.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <div className="text-sm font-medium text-blue-600 uppercase">
                        {block.type}
                      </div>
                      {block.type === 'hero' && (
                        <div className="mt-1">
                          <div className="font-semibold">{block.content.title}</div>
                          <div className="text-sm text-gray-600">{block.content.subtitle}</div>
                          <Button size="sm" className="mt-2">
                            {block.content.buttonText}
                          </Button>
                        </div>
                      )}
                      {block.type === 'stats' && (
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {block.content.stats.map((stat: any, index: number) => (
                            <div key={index} className="text-center">
                              <div className="font-bold text-sm">{stat.value}</div>
                              <div className="text-xs text-gray-600">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Image className="h-4 w-4" />
                Añadir Imagen
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Type className="h-4 w-4" />
                Añadir Texto
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Link className="h-4 w-4" />
                Añadir Botón
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};