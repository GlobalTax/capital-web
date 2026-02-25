import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Save, Download, Calendar, TrendingUp } from 'lucide-react';
import { VALUATION_SECTORS } from '@/types/professionalValuation';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TEMPLATES_KEY = 'campaign-sector-templates';

interface SectorTemplate {
  custom_multiple?: number | null;
  multiple_low?: number | null;
  multiple_high?: number | null;
  valuation_context?: string;
  strengths_template?: string;
  weaknesses_template?: string;
  comparables_text?: string;
  include_comparables?: boolean;
  advisor_name?: string;
  advisor_email?: string;
  advisor_phone?: string;
  advisor_role?: string;
  use_custom_advisor?: boolean;
  lead_source?: string;
  service_type?: string;
  ai_personalize?: boolean;
}

function getSavedTemplates(): Record<string, SectorTemplate> {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}');
  } catch {
    return {};
  }
}

interface Props {
  data: Partial<ValuationCampaign>;
  updateField: <K extends keyof ValuationCampaign>(key: K, value: ValuationCampaign[K]) => void;
}

export function CampaignConfigStep({ data, updateField }: Props) {
  const [generatingComparables, setGeneratingComparables] = useState(false);
  const [hasTemplateForSector, setHasTemplateForSector] = useState(false);

  // Check if template exists when sector changes
  useEffect(() => {
    if (data.sector) {
      const templates = getSavedTemplates();
      const exists = !!templates[data.sector];
      setHasTemplateForSector(exists);
      if (exists) {
        toast.info(`Hay una plantilla guardada para ${data.sector}. Pulsa 'Cargar plantilla' para usarla.`);
      }
    }
  }, [data.sector]);

  const handleSaveTemplate = useCallback(() => {
    if (!data.sector) {
      toast.error('Selecciona un sector primero');
      return;
    }
    const templates = getSavedTemplates();
    const template: SectorTemplate = {
      custom_multiple: data.custom_multiple,
      multiple_low: data.multiple_low,
      multiple_high: data.multiple_high,
      valuation_context: data.valuation_context || '',
      strengths_template: data.strengths_template || '',
      weaknesses_template: data.weaknesses_template || '',
      comparables_text: data.comparables_text || '',
      include_comparables: data.include_comparables || false,
      advisor_name: data.advisor_name || '',
      advisor_email: data.advisor_email || '',
      advisor_phone: data.advisor_phone || '',
      advisor_role: data.advisor_role || '',
      use_custom_advisor: data.use_custom_advisor || false,
      lead_source: data.lead_source || '',
      service_type: data.service_type || '',
      ai_personalize: data.ai_personalize || false,
    };
    templates[data.sector] = template;
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    setHasTemplateForSector(true);
    toast.success(`Plantilla guardada para ${data.sector}`);
  }, [data]);

  const handleLoadTemplate = useCallback(() => {
    if (!data.sector) return;
    const templates = getSavedTemplates();
    const template = templates[data.sector];
    if (!template) return;

    if (!confirm('Se sobrescribirán los valores actuales. ¿Continuar?')) return;

    const fields: (keyof SectorTemplate)[] = [
      'custom_multiple', 'multiple_low', 'multiple_high', 'valuation_context',
      'strengths_template', 'weaknesses_template', 'comparables_text', 'include_comparables',
      'advisor_name', 'advisor_email', 'advisor_phone', 'advisor_role',
      'use_custom_advisor', 'lead_source', 'service_type', 'ai_personalize',
    ];
    for (const key of fields) {
      if (template[key] !== undefined) {
        updateField(key as any, template[key] as any);
      }
    }
    toast.success('Plantilla cargada');
  }, [data.sector, updateField]);

  const handleGenerateComparables = async () => {
    if (!data.sector) {
      toast.error('Selecciona un sector primero');
      return;
    }
    setGeneratingComparables(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('rewrite-comparables', {
        body: {
          rawText: `Busca transacciones recientes de M&A en el sector ${data.sector} en España y Europa. Incluye operaciones con múltiplos EV/EBITDA conocidos.`,
          sector: data.sector,
          clientCompany: 'Campaña Outbound',
        },
      });
      if (error) throw error;
      if (result?.formattedText) {
        updateField('comparables_text', result.formattedText);
        toast.success('Comparables generados con IA');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al generar comparables');
    } finally {
      setGeneratingComparables(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Identificación */}
      <Card>
        <CardHeader><CardTitle className="text-base">Identificación</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la campaña *</Label>
              <Input
                placeholder="Ej: Logística España Q1 2026"
                value={data.name || ''}
                onChange={e => updateField('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sector *</Label>
              <Select value={data.sector || ''} onValueChange={v => updateField('sector', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar sector" /></SelectTrigger>
                <SelectContent>
                  {VALUATION_SECTORS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 mt-1">
                <Button variant="outline" size="sm" onClick={handleSaveTemplate} disabled={!data.sector}>
                  <Save className="h-3 w-3 mr-1" />Guardar como plantilla
                </Button>
                {hasTemplateForSector && (
                  <Button variant="outline" size="sm" onClick={handleLoadTemplate}>
                    <Download className="h-3 w-3 mr-1" />Cargar plantilla
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plantilla de Valoración */}
      <Card>
        <CardHeader><CardTitle className="text-base">Plantilla de Valoración</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de valoración */}
          <div className="space-y-3">
            <Label className="font-medium">Método de valoración</Label>
            <RadioGroup
              value={data.valuation_type || 'ebitda_multiple'}
              onValueChange={(v) => updateField('valuation_type' as any, v)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div>
                <RadioGroupItem value="ebitda_multiple" id="vt_ebitda" className="sr-only peer" />
                <Label
                  htmlFor="vt_ebitda"
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                    "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold text-sm">Múltiplo de EBITDA</span>
                    <Badge variant="secondary" className="text-[10px]">Estándar</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Valoración = EBITDA × Múltiplo. Método más común para empresas rentables.</p>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="revenue_multiple" id="vt_revenue" className="sr-only peer" />
                <Label
                  htmlFor="vt_revenue"
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                    "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold text-sm">Múltiplo de Facturación</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Valoración = Facturación × Múltiplo. Útil para empresas en crecimiento o sectores donde la facturación es más relevante.</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Múltiplo {(data.valuation_type || 'ebitda_multiple') === 'revenue_multiple' ? 'Facturación' : 'EBITDA'} (opcional)</Label>
              <Input type="number" step="0.1" placeholder="Auto"
                value={data.custom_multiple ?? ''} onChange={e => updateField('custom_multiple', e.target.value ? parseFloat(e.target.value) : null as any)} />
            </div>
            <div className="space-y-2">
              <Label>Múltiplo bajo</Label>
              <Input type="number" step="0.1" placeholder="Auto"
                value={data.multiple_low ?? ''} onChange={e => updateField('multiple_low', e.target.value ? parseFloat(e.target.value) : null as any)} />
            </div>
            <div className="space-y-2">
              <Label>Múltiplo alto</Label>
              <Input type="number" step="0.1" placeholder="Auto"
                value={data.multiple_high ?? ''} onChange={e => updateField('multiple_high', e.target.value ? parseFloat(e.target.value) : null as any)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contexto de la valoración</Label>
            <Textarea rows={3} placeholder="Contexto general que se aplicará a todas las valoraciones..."
              value={data.valuation_context || ''} onChange={e => updateField('valuation_context', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fortalezas (plantilla)</Label>
              <Textarea rows={4} placeholder="• Fortaleza 1&#10;• Fortaleza 2..."
                value={data.strengths_template || ''} onChange={e => updateField('strengths_template', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Debilidades (plantilla)</Label>
              <Textarea rows={4} placeholder="• Debilidad 1&#10;• Debilidad 2..."
                value={data.weaknesses_template || ''} onChange={e => updateField('weaknesses_template', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Comparables</Label>
              <Button variant="outline" size="sm" onClick={handleGenerateComparables} disabled={generatingComparables}>
                {generatingComparables ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                Generar con IA
              </Button>
            </div>
            <Textarea rows={4} placeholder="Texto de comparables..." 
              value={data.comparables_text || ''} onChange={e => updateField('comparables_text', e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={data.include_comparables || false} onCheckedChange={v => updateField('include_comparables', v)} />
            <Label>Incluir comparables en PDF</Label>
          </div>

          {/* Modo de años */}
          <div className="space-y-3">
            <Label className="font-medium">¿Con cuántos años valorar?</Label>
            <RadioGroup
              value={data.years_mode || '1_year'}
              onValueChange={(v) => {
                updateField('years_mode' as any, v);
                const baseYear = (data.financial_years?.[0]) || new Date().getFullYear() - 1;
                if (v === '1_year') {
                  updateField('financial_years', [baseYear] as any);
                } else {
                  updateField('financial_years', [baseYear, baseYear - 1, baseYear - 2] as any);
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div>
                <RadioGroupItem value="1_year" id="years_1" className="sr-only peer" />
                <Label
                  htmlFor="years_1"
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                    "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold text-sm">Último año disponible</span>
                    <Badge variant="secondary" className="text-[10px]">Recomendado</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Solo necesitas datos del último ejercicio cerrado. Más rápido y simple.</p>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="3_years" id="years_3" className="sr-only peer" />
                <Label
                  htmlFor="years_3"
                  className={cn(
                    "flex flex-col items-start gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                    "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold text-sm">Últimos 3 años</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Valoración más precisa con el histórico de 3 ejercicios.</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Años financieros */}
          <div className="space-y-2">
            <Label className="font-medium">Años financieros</Label>
            <p className="text-xs text-muted-foreground">Indica el último ejercicio depositado en el Registro Mercantil.</p>
            {(() => {
              const yearsMode = data.years_mode || '1_year';
              const years = data.financial_years || [new Date().getFullYear() - 1];
              const baseYear = years[0] ?? new Date().getFullYear() - 1;

              if (yearsMode === '1_year') {
                return (
                  <div className="max-w-[200px] space-y-1">
                    <Label className="text-xs">Último año disponible</Label>
                    <Input
                      type="number"
                      value={baseYear}
                      onChange={e => {
                        const v = parseInt(e.target.value) || 0;
                        updateField('financial_years', [v] as any);
                      }}
                    />
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Último año disponible</Label>
                    <Input
                      type="number"
                      value={baseYear}
                      onChange={e => {
                        const v = parseInt(e.target.value) || 0;
                        updateField('financial_years', [v, v - 1, v - 2] as any);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Año anterior</Label>
                    <Input type="number" value={baseYear - 1} disabled className="opacity-60" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Dos años antes</Label>
                    <Input type="number" value={baseYear - 2} disabled className="opacity-60" />
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* IA y CRM */}
      <Card>
        <CardHeader><CardTitle className="text-base">IA y CRM</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch checked={data.ai_personalize || false} onCheckedChange={v => updateField('ai_personalize', v)} />
            <Label>Personalizar fortalezas/debilidades por empresa con IA</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origen del lead</Label>
              <Input value={data.lead_source || 'Outbound'} onChange={e => updateField('lead_source', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de servicio</Label>
              <Select value={data.service_type || 'vender'} onValueChange={v => updateField('service_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vender">Vender</SelectItem>
                  <SelectItem value="comprar">Comprar</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Firma del Informe */}
      <Card>
        <CardHeader><CardTitle className="text-base">Firma del Informe</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch checked={data.use_custom_advisor || false} onCheckedChange={v => updateField('use_custom_advisor', v)} />
            <Label>Usar firma personalizada</Label>
          </div>
          {!data.use_custom_advisor ? (
            <p className="text-sm text-muted-foreground">Se usará la firma global configurada en el sistema.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del asesor</Label>
                <Input placeholder="Nombre completo" value={data.advisor_name || ''} onChange={e => updateField('advisor_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="asesor@capittal.es" value={data.advisor_email || ''} onChange={e => updateField('advisor_email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input placeholder="+34 600 000 000" value={data.advisor_phone || ''} onChange={e => updateField('advisor_phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input placeholder="Director de M&A" value={data.advisor_role || ''} onChange={e => updateField('advisor_role', e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
