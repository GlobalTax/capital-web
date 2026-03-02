import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, Zap, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ValuationRange, findMatchingRange, fetchCampaignRanges } from '@/utils/assignMultiplesFromRanges';

interface Props {
  campaignId: string;
  valuationType: string;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export function ValuationRangesConfig({ campaignId, valuationType }: Props) {
  const queryClient = useQueryClient();
  const isRevenue = valuationType === 'revenue_multiple';
  const baseLabel = isRevenue ? 'Facturación' : 'EBITDA';

  const { data: existingRanges = [], isLoading } = useQuery({
    queryKey: ['valuation-ranges', campaignId],
    queryFn: () => fetchCampaignRanges(campaignId),
  });

  const [ranges, setRanges] = useState<ValuationRange[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (existingRanges.length > 0 && !dirty) {
      setRanges(existingRanges);
    }
  }, [existingRanges, dirty]);

  const updateRange = (index: number, field: keyof ValuationRange, value: any) => {
    setRanges(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirty(true);
  };

  const addRange = () => {
    const lastMax = ranges.length > 0 ? ranges[ranges.length - 1].max_value : null;
    setRanges(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        campaign_id: campaignId,
        range_order: prev.length + 1,
        min_value: lastMax ?? 0,
        max_value: null,
        multiple_low: 3,
        multiple_mid: 5,
        multiple_high: 7,
        range_label: '',
      },
    ]);
    setDirty(true);
  };

  const removeRange = (index: number) => {
    setRanges(prev => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await supabase.from('valuation_ranges').delete().eq('campaign_id', campaignId);
      if (ranges.length === 0) return;

      const toInsert = ranges.map((r, i) => ({
        campaign_id: campaignId,
        range_order: i + 1,
        min_value: r.min_value,
        max_value: r.max_value,
        multiple_low: r.multiple_low,
        multiple_mid: r.multiple_mid,
        multiple_high: r.multiple_high,
        range_label: r.range_label || `Rango ${i + 1}`,
      }));

      const { error } = await supabase.from('valuation_ranges').insert(toInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Rangos guardados');
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['valuation-ranges', campaignId] });
    },
    onError: (e: any) => toast.error('Error: ' + e.message),
  });

  const [applying, setApplying] = useState(false);

  const handleApplyToExisting = async () => {
    setApplying(true);
    try {
      const latestRanges = await fetchCampaignRanges(campaignId);
      if (latestRanges.length === 0) {
        toast.error('No hay rangos guardados. Guarda primero.');
        return;
      }

      const { data: companies, error } = await supabase
        .from('valuation_campaign_companies')
        .select('id, ebitda, revenue')
        .eq('campaign_id', campaignId)
        .neq('status', 'excluded');

      if (error) throw error;

      let updated = 0;
      for (const c of companies || []) {
        const baseValue = isRevenue ? (c.revenue || 0) : (c.ebitda || 0);
        if (!baseValue) continue;

        const assignment = findMatchingRange(baseValue, latestRanges);
        if (!assignment) continue;

        const { error: updateErr } = await supabase
          .from('valuation_campaign_companies')
          .update({
            multiple_used: assignment.multiple_mid,
            valuation_low: baseValue * assignment.multiple_low,
            valuation_central: baseValue * assignment.multiple_mid,
            valuation_high: baseValue * assignment.multiple_high,
            range_label: assignment.range_label,
            is_auto_assigned: true,
            status: 'calculated',
          })
          .eq('id', c.id);

        if (!updateErr) updated++;
      }

      toast.success(`${updated} empresas actualizadas con rangos`);
      queryClient.invalidateQueries({ queryKey: ['campaign-companies', campaignId] });
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rangos de Valoración Automáticos</CardTitle>
        <CardDescription>
          Define rangos de {baseLabel} que asignarán múltiplos automáticamente al calcular empresas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ranges.map((range, index) => (
          <div key={range.id} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs">Etiqueta</Label>
                <Input
                  placeholder="ej: Pequeña"
                  value={range.range_label || ''}
                  onChange={e => updateRange(index, 'range_label', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Desde €</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={range.min_value ?? ''}
                  onChange={e => updateRange(index, 'min_value', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Hasta €</Label>
                <Input
                  type="number"
                  placeholder="Sin límite"
                  value={range.max_value ?? ''}
                  onChange={e => updateRange(index, 'max_value', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeRange(index)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            <div className="flex items-end gap-3 pl-4 border-l-2 border-primary/20">
              <div className="text-sm text-muted-foreground font-medium self-center">Múltiplos:</div>
              <div className="flex-1">
                <Label className="text-xs">Conservador</Label>
                <Input
                  type="number" step="0.1" placeholder="2.0"
                  value={range.multiple_low}
                  onChange={e => updateRange(index, 'multiple_low', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Base</Label>
                <Input
                  type="number" step="0.1" placeholder="3.0"
                  value={range.multiple_mid}
                  onChange={e => updateRange(index, 'multiple_mid', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Optimista</Label>
                <Input
                  type="number" step="0.1" placeholder="4.0"
                  value={range.multiple_high}
                  onChange={e => updateRange(index, 'multiple_high', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addRange}>
          <Plus className="w-4 h-4 mr-2" />Añadir Rango
        </Button>

        {ranges.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Vista Previa</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 text-sm space-y-2">
                {ranges.map((r, i) => {
                  const from = r.min_value != null ? formatCurrency(r.min_value) : '0€';
                  const to = r.max_value != null ? formatCurrency(r.max_value) : 'Sin límite';
                  return (
                    <li key={i}>
                      <strong>{r.range_label || `Rango ${i + 1}`}</strong>: {from} – {to}
                      <div className="ml-6 mt-1 text-xs space-y-0.5">
                        <div>→ Conservador: {r.multiple_low}x</div>
                        <div>→ Base: {r.multiple_mid}x</div>
                        <div>→ Optimista: {r.multiple_high}x</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <Button
          variant="outline"
          onClick={() => { setRanges(existingRanges); setDirty(false); }}
          disabled={!dirty}
        >
          Cancelar
        </Button>
        <div className="flex gap-2">
          {existingRanges.length > 0 && (
            <Button variant="outline" onClick={handleApplyToExisting} disabled={applying}>
              {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Aplicar a existentes
            </Button>
          )}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar Rangos
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
