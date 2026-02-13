import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { VALUATION_SECTORS } from '@/types/professionalValuation';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  data: Partial<ValuationCampaign>;
  updateField: <K extends keyof ValuationCampaign>(key: K, value: ValuationCampaign[K]) => void;
}

export function CampaignConfigStep({ data, updateField }: Props) {
  const [generatingComparables, setGeneratingComparables] = useState(false);

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plantilla de Valoración */}
      <Card>
        <CardHeader><CardTitle className="text-base">Plantilla de Valoración</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Múltiplo EBITDA (opcional)</Label>
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

          {/* Años financieros */}
          <div className="space-y-2">
            <Label className="font-medium">Años financieros</Label>
            <p className="text-xs text-muted-foreground">Define los 3 años de datos financieros que se pedirán a las empresas</p>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(idx => {
                const years = data.financial_years || [new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3];
                return (
                  <div key={idx} className="space-y-1">
                    <Label className="text-xs">Año {idx + 1}</Label>
                    <Input
                      type="number"
                      value={years[idx] ?? ''}
                      onChange={e => {
                        const newYears = [...years];
                        newYears[idx] = parseInt(e.target.value) || 0;
                        updateField('financial_years', newYears as any);
                      }}
                    />
                  </div>
                );
              })}
            </div>
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
    </div>
  );
}
