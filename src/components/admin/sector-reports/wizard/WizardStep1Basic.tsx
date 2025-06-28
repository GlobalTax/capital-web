
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectorSelect from '@/components/admin/shared/SectorSelect';
import { SectorReportRequest } from '@/types/sectorReports';
import { FileText, BarChart3, TrendingUp, FileSearch } from 'lucide-react';

interface WizardStep1BasicProps {
  data: Partial<SectorReportRequest>;
  onChange: (updates: Partial<SectorReportRequest>) => void;
}

const WizardStep1Basic: React.FC<WizardStep1BasicProps> = ({ data, onChange }) => {
  const reportTypes = [
    {
      value: 'market-analysis',
      label: 'Análisis de Mercado',
      description: 'Análisis completo del estado actual del mercado',
      icon: FileText
    },
    {
      value: 'ma-trends',
      label: 'Tendencias M&A',
      description: 'Análisis de fusiones y adquisiciones sectoriales',
      icon: TrendingUp
    },
    {
      value: 'valuation-multiples',
      label: 'Múltiplos de Valoración',
      description: 'Análisis de múltiplos financieros del sector',
      icon: BarChart3
    },
    {
      value: 'due-diligence',
      label: 'Due Diligence Sectorial',
      description: 'Guía específica para auditoría del sector',
      icon: FileSearch
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="sector" className="text-base font-medium">
          ¿Qué sector quieres analizar?
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Selecciona el sector específico para tu reporte
        </p>
        <SectorSelect
          value={data.sector || ''}
          onChange={(value) => onChange({ sector: value })}
          placeholder="Buscar y seleccionar sector..."
          required
          className="h-12"
        />
      </div>

      <div>
        <Label className="text-base font-medium">
          ¿Qué tipo de reporte necesitas?
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Cada tipo ofrece un enfoque diferente para tu análisis
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reportTypes.map((type) => (
            <div
              key={type.value}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                data.reportType === type.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onChange({ reportType: type.value as any })}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  data.reportType === type.value ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <type.icon className={`h-4 w-4 ${
                    data.reportType === type.value ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium mb-1">{type.label}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.sector && data.reportType && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">Configuración válida</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Reporte de <strong>{reportTypes.find(t => t.value === data.reportType)?.label}</strong> para el sector <strong>{data.sector}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default WizardStep1Basic;
