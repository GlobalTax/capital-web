import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, TrendingUp } from 'lucide-react';
import { SectorReportRequest } from '@/types/sectorReports';
import SectorSelect from '../shared/SectorSelect';

interface SectorReportFormProps {
  onGenerate: (request: SectorReportRequest) => void;
  isGenerating: boolean;
  initialData?: Partial<SectorReportRequest>;
}

const SectorReportForm: React.FC<SectorReportFormProps> = ({ onGenerate, isGenerating, initialData }) => {
  const [formData, setFormData] = useState<SectorReportRequest>({
    sector: initialData?.sector || '',
    reportType: initialData?.reportType || 'market-analysis',
    depth: initialData?.depth || 'intermediate',
    period: initialData?.period || 'year',
    targetAudience: initialData?.targetAudience || 'entrepreneurs',
    customFocus: initialData?.customFocus || '',
    includeData: initialData?.includeData || {
      multiples: true,
      caseStudies: true,
      statistics: true,
      visualizations: false,
      infographics: false,
      heatmaps: false
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean | 'indeterminate') => {
    const booleanValue = checked === true;
    setFormData(prev => ({
      ...prev,
      includeData: {
        ...prev.includeData,
        [field]: booleanValue
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Configuración del Reporte
        </CardTitle>
        <CardDescription>
          Define los parámetros para la generación del reporte sectorial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sector">Sector</Label>
            <SectorSelect
              id="sector"
              value={formData.sector}
              onValueChange={(value) => handleSelectChange('sector', value)}
            />
          </div>

          <div>
            <Label htmlFor="reportType">Tipo de Reporte</Label>
            <Select value={formData.reportType} onValueChange={(value) => handleSelectChange('reportType', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market-analysis">Análisis de Mercado</SelectItem>
                <SelectItem value="ma-trends">Tendencias M&A</SelectItem>
                <SelectItem value="valuation-multiples">Múltiplos de Valoración</SelectItem>
                {/* <SelectItem value="esg-sustainability">ESG y Sostenibilidad</SelectItem>
                <SelectItem value="tech-disruption">Disrupción Tecnológica</SelectItem>
                <SelectItem value="geographic-comparison">Comparación Geográfica</SelectItem>
                <SelectItem value="due-diligence">Due Diligence</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="depth">Profundidad del Análisis</Label>
            <Select value={formData.depth} onValueChange={(value) => handleSelectChange('depth', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona la profundidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="period">Período de Análisis</Label>
            <Select value={formData.period} onValueChange={(value) => handleSelectChange('period', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Anual</SelectItem>
                <SelectItem value="3-years">3 Años</SelectItem>
                {/* <SelectItem value="5-years">5 Años</SelectItem>
                <SelectItem value="10-years">10 Años</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetAudience">Audiencia Objetivo</Label>
            <Input
              type="text"
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="customFocus">Enfoque Personalizado</Label>
            <Textarea
              id="customFocus"
              name="customFocus"
              value={formData.customFocus}
              onChange={handleChange}
              placeholder="Define un enfoque específico para el reporte (opcional)"
            />
          </div>

          <div>
            <Label>Datos a Incluir</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiples"
                  checked={formData.includeData.multiples}
                  onCheckedChange={(checked) => handleCheckboxChange('multiples', checked)}
                />
                <Label htmlFor="multiples">Múltiplos de Valoración</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="caseStudies"
                  checked={formData.includeData.caseStudies}
                  onCheckedChange={(checked) => handleCheckboxChange('caseStudies', checked)}
                />
                <Label htmlFor="caseStudies">Casos de Estudio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="statistics"
                  checked={formData.includeData.statistics}
                  onCheckedChange={(checked) => handleCheckboxChange('statistics', checked)}
                />
                <Label htmlFor="statistics">Estadísticas Clave</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visualizations"
                  checked={formData.includeData.visualizations}
                  onCheckedChange={(checked) => handleCheckboxChange('visualizations', checked)}
                />
                <Label htmlFor="visualizations">Visualizaciones</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="infographics"
                  checked={formData.includeData.infographics}
                  onCheckedChange={(checked) => handleCheckboxChange('infographics', checked)}
                />
                <Label htmlFor="infographics">Infografías</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="heatmaps"
                  checked={formData.includeData.heatmaps}
                  onCheckedChange={(checked) => handleCheckboxChange('heatmaps', checked)}
                />
                <Label htmlFor="heatmaps">Mapas de Calor</Label>
              </div>
            </div>
          </div>

          <Button disabled={isGenerating}>
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Reporte
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectorReportForm;
