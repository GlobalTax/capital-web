
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SectorReportRequest } from '@/types/sectorReports';
import { Calendar, Database, BarChart, Building, TrendingUp } from 'lucide-react';

interface WizardStep2DataProps {
  data: Partial<SectorReportRequest>;
  onChange: (updates: Partial<SectorReportRequest>) => void;
}

const WizardStep2Data: React.FC<WizardStep2DataProps> = ({ data, onChange }) => {
  const handleIncludeDataChange = (key: keyof SectorReportRequest['includeData'], value: boolean) => {
    onChange({
      includeData: {
        ...data.includeData,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Período de Análisis
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Define el horizonte temporal para el análisis
        </p>
        <Select 
          value={data.period || ''} 
          onValueChange={(value) => onChange({ period: value as any })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecciona el período de análisis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">
              <div>
                <div className="font-medium">Último Trimestre</div>
                <div className="text-sm text-gray-500">Análisis de tendencias recientes</div>
              </div>
            </SelectItem>
            <SelectItem value="year">
              <div>
                <div className="font-medium">Último Año</div>
                <div className="text-sm text-gray-500">Visión anual completa</div>
              </div>
            </SelectItem>
            <SelectItem value="3-years">
              <div>
                <div className="font-medium">Últimos 3 Años</div>
                <div className="text-sm text-gray-500">Análisis de tendencias a medio plazo</div>
              </div>
            </SelectItem>
            <SelectItem value="custom">
              <div>
                <div className="font-medium">Período Personalizado</div>
                <div className="text-sm text-gray-500">Define fechas específicas</div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {data.period === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="customStartDate">Fecha Inicio</Label>
              <Input
                type="date"
                id="customStartDate"
                value={data.customStartDate || ''}
                onChange={(e) => onChange({ customStartDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="customEndDate">Fecha Fin</Label>
              <Input
                type="date"
                id="customEndDate"
                value={data.customEndDate || ''}
                onChange={(e) => onChange({ customEndDate: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <Label className="text-base font-medium">Profundidad del Análisis</Label>
        <p className="text-sm text-gray-600 mb-3">
          Elige el nivel de detalle y extensión del reporte
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'basic', label: 'Básico', words: '1,500-2,000', time: '1-2 min', color: 'bg-yellow-500' },
            { value: 'intermediate', label: 'Intermedio', words: '3,000-4,000', time: '2-4 min', color: 'bg-blue-500' },
            { value: 'advanced', label: 'Avanzado', words: '5,000-6,000', time: '4-6 min', color: 'bg-purple-500' }
          ].map((depth) => (
            <div
              key={depth.value}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                data.depth === depth.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onChange({ depth: depth.value as any })}
            >
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full ${depth.color} mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm`}>
                  {depth.label[0]}
                </div>
                <h4 className="font-medium mb-1">{depth.label}</h4>
                <p className="text-xs text-gray-600">{depth.words} palabras</p>
                <p className="text-xs text-gray-500">{depth.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Fuentes de Información
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona qué datos incluir en el análisis
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart className="h-5 w-5 text-blue-500" />
              <div>
                <Label className="font-medium">Múltiplos de Valoración</Label>
                <p className="text-sm text-gray-600">Ratios financieros actuales del sector</p>
              </div>
            </div>
            <Switch
              checked={data.includeData?.multiples || false}
              onCheckedChange={(checked) => handleIncludeDataChange('multiples', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-green-500" />
              <div>
                <Label className="font-medium">Casos de Éxito</Label>
                <p className="text-sm text-gray-600">Transacciones y operaciones relevantes</p>
              </div>
            </div>
            <Switch
              checked={data.includeData?.caseStudies || false}
              onCheckedChange={(checked) => handleIncludeDataChange('caseStudies', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <Label className="font-medium">Estadísticas de Mercado</Label>
                <p className="text-sm text-gray-600">Datos clave y métricas del mercado</p>
              </div>
            </div>
            <Switch
              checked={data.includeData?.statistics || false}
              onCheckedChange={(checked) => handleIncludeDataChange('statistics', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardStep2Data;
