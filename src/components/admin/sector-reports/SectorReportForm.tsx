
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Sparkles, RefreshCw } from 'lucide-react';
import SectorSelect from '@/components/admin/shared/SectorSelect';
import { SectorReportRequest } from '@/types/sectorReports';

interface SectorReportFormProps {
  onGenerate: (request: SectorReportRequest) => void;
  isGenerating: boolean;
}

const SectorReportForm: React.FC<SectorReportFormProps> = ({ onGenerate, isGenerating }) => {
  const { register, handleSubmit, watch, setValue, getValues } = useForm<SectorReportRequest>({
    defaultValues: {
      sector: '',
      reportType: 'market-analysis',
      period: 'year',
      depth: 'intermediate',
      includeData: {
        multiples: true,
        caseStudies: true,
        statistics: true
      },
      targetAudience: 'entrepreneurs',
      customFocus: ''
    }
  });

  const watchedPeriod = watch('period');
  const watchedIncludeData = watch('includeData');

  const onSubmit = (data: SectorReportRequest) => {
    onGenerate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Configuración Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración Básica</CardTitle>
          <CardDescription>Define los parámetros principales del reporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sector">Sector</Label>
            <SectorSelect
              value={watch('sector')}
              onChange={(value) => setValue('sector', value)}
              placeholder="Selecciona el sector"
              required
            />
          </div>

          <div>
            <Label htmlFor="reportType">Tipo de Reporte</Label>
            <Select 
              value={watch('reportType')} 
              onValueChange={(value) => setValue('reportType', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market-analysis">Análisis de Mercado</SelectItem>
                <SelectItem value="ma-trends">Tendencias M&A</SelectItem>
                <SelectItem value="valuation-multiples">Múltiplos de Valoración</SelectItem>
                <SelectItem value="due-diligence">Due Diligence Sectorial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetAudience">Audiencia Objetivo</Label>
            <Select 
              value={watch('targetAudience')} 
              onValueChange={(value) => setValue('targetAudience', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la audiencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investors">Inversores</SelectItem>
                <SelectItem value="entrepreneurs">Empresarios</SelectItem>
                <SelectItem value="advisors">Asesores</SelectItem>
                <SelectItem value="executives">Directivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Configuración Avanzada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración Avanzada</CardTitle>
          <CardDescription>Personaliza el alcance y profundidad del análisis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="period">Período de Análisis</Label>
            <Select 
              value={watch('period')} 
              onValueChange={(value) => setValue('period', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Año</SelectItem>
                <SelectItem value="3-years">Últimos 3 Años</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {watchedPeriod === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customStartDate">Fecha Inicio</Label>
                <Input
                  type="date"
                  {...register('customStartDate')}
                />
              </div>
              <div>
                <Label htmlFor="customEndDate">Fecha Fin</Label>
                <Input
                  type="date"
                  {...register('customEndDate')}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="depth">Profundidad del Análisis</Label>
            <Select 
              value={watch('depth')} 
              onValueChange={(value) => setValue('depth', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la profundidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico (1,500-2,000 palabras)</SelectItem>
                <SelectItem value="intermediate">Intermedio (3,000-4,000 palabras)</SelectItem>
                <SelectItem value="advanced">Avanzado (5,000-6,000 palabras)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Datos a Incluir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos a Incluir</CardTitle>
          <CardDescription>Selecciona qué información incluir en el reporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="multiples">Múltiplos de Valoración</Label>
              <p className="text-sm text-gray-500">Incluir múltiplos sectoriales actuales</p>
            </div>
            <Switch
              checked={watchedIncludeData?.multiples || false}
              onCheckedChange={(checked) => 
                setValue('includeData', { ...watchedIncludeData, multiples: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="caseStudies">Casos de Éxito</Label>
              <p className="text-sm text-gray-500">Incluir casos de éxito relevantes</p>
            </div>
            <Switch
              checked={watchedIncludeData?.caseStudies || false}
              onCheckedChange={(checked) => 
                setValue('includeData', { ...watchedIncludeData, caseStudies: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="statistics">Estadísticas de Mercado</Label>
              <p className="text-sm text-gray-500">Incluir estadísticas clave del mercado</p>
            </div>
            <Switch
              checked={watchedIncludeData?.statistics || false}
              onCheckedChange={(checked) => 
                setValue('includeData', { ...watchedIncludeData, statistics: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Enfoque Personalizado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enfoque Personalizado</CardTitle>
          <CardDescription>Añade instrucciones específicas para personalizar el reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="customFocus">Enfoque Especial (Opcional)</Label>
            <Textarea
              {...register('customFocus')}
              placeholder="Ej: Enfocarse en empresas familiares, análisis de sostenibilidad, mercado español vs europeo..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón de Generación */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isGenerating || !watch('sector')}
          className="flex items-center gap-2"
          size="lg"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? 'Generando Reporte...' : 'Generar Reporte'}
        </Button>
      </div>
    </form>
  );
};

export default SectorReportForm;
