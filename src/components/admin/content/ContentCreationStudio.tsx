import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, FileText, Award, Zap, Eye, Download, Copy } from 'lucide-react';
import { useLeadMagnets } from '@/hooks/useLeadMagnets';
import { useLeadMagnetGeneration } from '@/hooks/useLeadMagnetGeneration';
import { STANDARD_SECTORS } from '@/components/admin/shared/sectorOptions';

const CONTENT_TEMPLATES = {
  'sector-report': {
    title: 'Informe Sectorial',
    icon: FileText,
    description: 'Análisis completo del mercado con múltiplos y tendencias',
    prompt: 'Genera un informe detallado del sector {sector} incluyendo análisis de mercado, múltiplos de valoración típicos, casos de éxito recientes y perspectivas futuras.'
  },
  'case-study': {
    title: 'Caso de Éxito',
    icon: Award,
    description: 'Documentación de transacciones exitosas',
    prompt: 'Crea un caso de éxito profesional sobre {title} en el sector {sector}, incluyendo retos, solución, proceso y resultados obtenidos.'
  },
  'valuation-guide': {
    title: 'Guía de Valoración',
    icon: Zap,
    description: 'Metodologías y mejores prácticas',
    prompt: 'Desarrolla una guía completa de valoración para {sector}, incluyendo metodologías, múltiplos típicos, factores clave y casos prácticos.'
  }
};

const ContentCreationStudio = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'report' as 'report' | 'whitepaper' | 'checklist' | 'template',
    sector: '',
    description: '',
    content: '',
  });
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  const { createLeadMagnet } = useLeadMagnets();
  const { generateLeadMagnetContent, isGenerating } = useLeadMagnetGeneration();

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = CONTENT_TEMPLATES[templateKey as keyof typeof CONTENT_TEMPLATES];
    setFormData(prev => ({
      ...prev,
      description: template.description,
      type: templateKey === 'case-study' ? 'whitepaper' : 'report'
    }));
  };

  const handleGenerateWithAI = async () => {
    if (!formData.title || !formData.sector) return;

    try {
      const { content } = await generateLeadMagnetContent({
        title: formData.title,
        type: formData.type,
        sector: formData.sector,
        description: formData.description
      });

      setFormData(prev => ({ ...prev, content }));
      setPreviewMode('preview');
    } catch (error) {
      console.error('Error generando contenido:', error);
    }
  };

  const handleSaveContent = async () => {
    await createLeadMagnet.mutateAsync({
      title: formData.title,
      type: formData.type,
      sector: formData.sector,
      description: formData.description,
      meta_title: formData.title,
      meta_description: formData.description,
    });

    // Reset form
    setFormData({
      title: '',
      type: 'report',
      sector: '',
      description: '',
      content: '',
    });
    setSelectedTemplate('');
    setPreviewMode('edit');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light text-foreground tracking-tight">Content Studio</h1>
          <p className="text-muted-foreground font-light mt-1">
            Crea recursos web profesionales con IA
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(CONTENT_TEMPLATES).map(([key, template]) => {
              const IconComponent = template.icon;
              return (
                <Button
                  key={key}
                  variant={selectedTemplate === key ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleTemplateSelect(key)}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{template.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Editor</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {previewMode === 'edit' ? 'Preview' : 'Editar'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as 'edit' | 'preview')}>
              <TabsContent value="edit" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Análisis del Mercado Tech 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sector</label>
                    <Select 
                      value={formData.sector} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {STANDARD_SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector.toLowerCase()}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el contenido y valor que proporcionará..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating || !formData.title || !formData.sector}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? 'Generando...' : 'Generar con IA'}
                  </Button>
                  
                  {formData.content && (
                    <Button 
                      onClick={handleSaveContent}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Guardar Contenido
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {formData.content ? (
                  <div className="bg-muted/30 rounded-lg p-6">
                    <div className="prose prose-sm max-w-none">
                      <h1 className="text-2xl font-bold mb-4">{formData.title}</h1>
                      <div className="flex items-center gap-2 mb-6">
                        <Badge variant="secondary">{formData.sector}</Badge>
                        <Badge variant="outline">{formData.type}</Badge>
                      </div>
                      <div className="whitespace-pre-wrap">{formData.content}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Genera contenido para ver el preview</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentCreationStudio;