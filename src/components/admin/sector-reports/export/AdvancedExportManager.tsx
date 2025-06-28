
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Download, Share2, Globe, Presentation, File, 
  Palette, Image, Settings, Crown, Zap, Monitor
} from 'lucide-react';
import { SectorReportResult, ExportOptions } from '@/types/sectorReports';
import { useToast } from '@/hooks/use-toast';

interface AdvancedExportManagerProps {
  report: SectorReportResult;
  onExport: (options: ExportOptions) => void;
}

const AdvancedExportManager: React.FC<AdvancedExportManagerProps> = ({
  report,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('format');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    style: 'corporate',
    branding: {
      colors: ['#1976D2', '#388E3C'],
      fonts: ['Arial', 'Helvetica']
    },
    includeVisualizations: true,
    interactive: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Profesional',
      description: 'Documento PDF listo para imprimir con diseño profesional',
      icon: FileText,
      features: ['Diseño profesional', 'Listo para imprimir', 'Fácil compartir'],
      premium: false
    },
    {
      id: 'word',
      name: 'Microsoft Word',
      description: 'Documento Word editable con estilos corporativos',
      icon: File,
      features: ['Totalmente editable', 'Estilos corporativos', 'Compatible'],
      premium: true
    },
    {
      id: 'powerpoint',
      name: 'PowerPoint',
      description: 'Presentación lista para usar con slides profesionales',
      icon: Presentation,
      features: ['Slides automáticos', 'Gráficos integrados', 'Template premium'],
      premium: true
    },
    {
      id: 'web',
      name: 'Página Web',
      description: 'Página web interactiva con navegación y gráficos dinámicos',
      icon: Globe,
      features: ['Completamente interactiva', 'Navegación fluida', 'Responsive'],
      premium: true
    }
  ];

  const styleTemplates = [
    {
      id: 'corporate',
      name: 'Corporativo',
      description: 'Diseño formal y profesional para presentaciones ejecutivas',
      preview: '/api/preview/corporate',
      colors: ['#1976D2', '#F5F5F5', '#37474F']
    },
    {
      id: 'modern',
      name: 'Moderno',
      description: 'Diseño contemporáneo con elementos visuales atractivos',
      preview: '/api/preview/modern',
      colors: ['#6366F1', '#EC4899', '#F59E0B']
    },
    {
      id: 'classic',
      name: 'Clásico',
      description: 'Estilo tradicional y elegante para documentos formales',
      preview: '/api/preview/classic',
      colors: ['#374151', '#9CA3AF', '#F3F4F6']
    },
    {
      id: 'minimal',
      name: 'Minimalista',
      description: 'Diseño limpio y simple centrado en el contenido',
      preview: '/api/preview/minimal',
      colors: ['#000000', '#FFFFFF', '#6B7280']
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportOptions);
      toast({
        title: "Exportación completada",
        description: `Reporte exportado como ${exportOptions.format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error en la exportación",
        description: "No se pudo exportar el reporte. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  const getFormatIcon = (format: string) => {
    const format_obj = exportFormats.find(f => f.id === format);
    return format_obj ? format_obj.icon : FileText;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Download className="h-5 w-5 text-green-500" />
            Exportación Avanzada
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Exporta tu reporte en múltiples formatos con estilos personalizados
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {report.wordCount.toLocaleString()} palabras
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="format">Formato</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
          <TabsTrigger value="branding">Marca</TabsTrigger>
          <TabsTrigger value="options">Opciones</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => {
              const IconComponent = format.icon;
              return (
                <Card 
                  key={format.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    exportOptions.format === format.id 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => updateExportOptions({ format: format.id as any })}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {format.name}
                      {format.premium && <Crown className="h-4 w-4 text-yellow-500" />}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {format.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {format.features.map(feature => (
                        <div key={feature} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="h-1 w-1 bg-green-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {styleTemplates.map((style) => (
              <Card
                key={style.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  exportOptions.style === style.id 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200'
                }`}
                onClick={() => updateExportOptions({ style: style.id as any })}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{style.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {style.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Vista previa del estilo</span>
                    </div>
                    <div className="flex gap-1">
                      {style.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colores de Marca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Color Primario</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={exportOptions.branding.colors?.[0] || '#1976D2'}
                      onChange={(e) => updateExportOptions({
                        branding: {
                          ...exportOptions.branding,
                          colors: [e.target.value, exportOptions.branding.colors?.[1] || '#388E3C']
                        }
                      })}
                      className="w-12 h-8 p-1 border rounded"
                    />
                    <Input
                      value={exportOptions.branding.colors?.[0] || '#1976D2'}
                      onChange={(e) => updateExportOptions({
                        branding: {
                          ...exportOptions.branding,
                          colors: [e.target.value, exportOptions.branding.colors?.[1] || '#388E3C']
                        }
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Color Secundario</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={exportOptions.branding.colors?.[1] || '#388E3C'}
                      onChange={(e) => updateExportOptions({
                        branding: {
                          ...exportOptions.branding,
                          colors: [exportOptions.branding.colors?.[0] || '#1976D2', e.target.value]
                        }
                      })}
                      className="w-12 h-8 p-1 border rounded"
                    />
                    <Input
                      value={exportOptions.branding.colors?.[1] || '#388E3C'}
                      onChange={(e) => updateExportOptions({
                        branding: {
                          ...exportOptions.branding,
                          colors: [exportOptions.branding.colors?.[0] || '#1976D2', e.target.value]
                        }
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Logo y Tipografía
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo">Logo de la Empresa</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: PNG, JPG, SVG (máx. 2MB)
                  </p>
                </div>
                <div>
                  <Label htmlFor="font">Tipografía Principal</Label>
                  <Select value={exportOptions.branding.fonts?.[0] || 'Arial'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times">Times New Roman</SelectItem>
                      <SelectItem value="Calibri">Calibri</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Opciones de Contenido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-visualizations"
                    checked={exportOptions.includeVisualizations}
                    onCheckedChange={(checked) => 
                      updateExportOptions({ includeVisualizations: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-visualizations">
                    Incluir visualizaciones y gráficos
                  </Label>
                </div>
                
                {exportOptions.format === 'web' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interactive"
                      checked={exportOptions.interactive}
                      onCheckedChange={(checked) => 
                        updateExportOptions({ interactive: checked as boolean })
                      }
                    />
                    <Label htmlFor="interactive">
                      Elementos interactivos (solo web)
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Vista Previa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500">
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(getFormatIcon(exportOptions.format), { className: "h-6 w-6" })}
                    <span className="font-medium">{exportOptions.format.toUpperCase()}</span>
                  </div>
                  <span className="text-sm">Estilo: {exportOptions.style}</span>
                  <div className="flex gap-1 mt-2">
                    {exportOptions.branding.colors?.map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          Formato: <span className="font-medium">{exportOptions.format.toUpperCase()}</span> • 
          Estilo: <span className="font-medium">{exportOptions.style}</span>
          {exportOptions.includeVisualizations && ' • Con visualizaciones'}
        </div>
        
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdvancedExportManager;
