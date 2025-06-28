
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectorReportRequest } from '@/types/sectorReports';
import { Users, Target, MessageSquare } from 'lucide-react';

interface WizardStep3CustomizationProps {
  data: Partial<SectorReportRequest>;
  onChange: (updates: Partial<SectorReportRequest>) => void;
}

const WizardStep3Customization: React.FC<WizardStep3CustomizationProps> = ({ data, onChange }) => {
  const audiences = [
    {
      value: 'investors',
      label: 'Inversores',
      description: 'Enfoque en ROI, múltiplos y oportunidades de inversión',
      icon: '💰'
    },
    {
      value: 'entrepreneurs',
      label: 'Empresarios',
      description: 'Orientado a crecimiento, estrategia y oportunidades de negocio',
      icon: '🚀'
    },
    {
      value: 'advisors',
      label: 'Asesores',
      description: 'Análisis técnico para consultoría y asesoramiento',
      icon: '🎯'
    },
    {
      value: 'executives',
      label: 'Directivos',
      description: 'Información ejecutiva para toma de decisiones estratégicas',
      icon: '👔'
    }
  ];

  const customFocusExamples = [
    'Empresas familiares en proceso de profesionalización',
    'Impacto de la digitalización en el sector',
    'Oportunidades de consolidación del mercado',
    'Análisis de sostenibilidad y criterios ESG',
    'Comparativa mercado español vs europeo',
    'Efectos de la regulación reciente',
    'Tendencias post-COVID en el sector'
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Audiencia Objetivo
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Define el perfil de la audiencia para adaptar el tono y enfoque
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {audiences.map((audience) => (
            <div
              key={audience.value}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                data.targetAudience === audience.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onChange({ targetAudience: audience.value as any })}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{audience.icon}</div>
                <div>
                  <h4 className="font-medium mb-1">{audience.label}</h4>
                  <p className="text-sm text-gray-600">{audience.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Enfoque Específico
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Personaliza el reporte con un enfoque particular (opcional)
        </p>
        <Textarea
          placeholder="Describe cualquier aspecto específico en el que te gustaría que se enfoque el reporte..."
          value={data.customFocus || ''}
          onChange={(e) => onChange({ customFocus: e.target.value })}
          rows={4}
          className="resize-none"
        />
        
        <div className="mt-3">
          <Label className="text-sm font-medium text-gray-700">Ejemplos de enfoques:</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {customFocusExamples.map((example, index) => (
              <button
                key={index}
                type="button"
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                onClick={() => onChange({ customFocus: example })}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">💡 Consejo</h4>
            <p className="text-sm text-blue-700">
              Un enfoque específico ayuda a generar un reporte más relevante y valioso. 
              Por ejemplo, si mencionas "empresas familiares", el análisis incluirá aspectos 
              como sucesión, profesionalización y gobierno corporativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardStep3Customization;
