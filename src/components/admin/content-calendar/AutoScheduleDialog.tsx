import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Sparkles, Loader2, Check, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ContentCalendarItem } from '@/hooks/useContentCalendar';

interface AutoScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ContentCalendarItem[];
  onConfirm: (updates: { id: string; scheduled_date: string }[]) => void;
}

type ScheduleResult = { id: string; title: string; channel: string; scheduled_date: string; selected: boolean };

const CHANNEL_LABELS: Record<string, string> = {
  linkedin_company: 'LinkedIn Empresa',
  linkedin_personal: 'LinkedIn Personal',
  blog: 'Blog',
  newsletter: 'Newsletter',
  crm_internal: 'CRM Interno',
};

const AutoScheduleDialog: React.FC<AutoScheduleDialogProps> = ({ open, onOpenChange, items, onConfirm }) => {
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [horizon, setHorizon] = useState<'2w' | '1m' | '2m'>('1m');
  const [includeStatuses, setIncludeStatuses] = useState<Record<string, boolean>>({ idea: true, draft: true, review: false });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ScheduleResult[] | null>(null);
  const [step, setStep] = useState<'config' | 'preview'>('config');

  const unscheduledItems = useMemo(() => {
    const activeStatuses = Object.entries(includeStatuses).filter(([, v]) => v).map(([k]) => k);
    return items.filter(i => !i.scheduled_date && activeStatuses.includes(i.status));
  }, [items, includeStatuses]);

  const alreadyScheduled = useMemo(() => {
    return items.filter(i => i.scheduled_date);
  }, [items]);

  const endDate = useMemo(() => {
    const start = new Date(startDate);
    if (horizon === '2w') return format(addDays(start, 14), 'yyyy-MM-dd');
    if (horizon === '1m') return format(addDays(start, 30), 'yyyy-MM-dd');
    return format(addDays(start, 60), 'yyyy-MM-dd');
  }, [startDate, horizon]);

  const handleGenerate = async () => {
    if (unscheduledItems.length === 0) {
      toast.warning('No hay items sin fecha para programar');
      return;
    }
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content-calendar-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mode: 'auto_schedule',
            items_to_schedule: unscheduledItems.map(i => ({
              id: i.id,
              title: i.title,
              channel: i.channel,
              content_type: i.content_type,
              priority: i.priority,
              category: i.category,
              notes: i.notes,
              key_data: i.key_data,
            })),
            already_scheduled: alreadyScheduled.map(i => ({
              channel: i.channel,
              scheduled_date: i.scheduled_date,
            })),
            start_date: startDate,
            end_date: endDate,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Error ${response.status}`);
      }

      const data = await response.json();
      const schedule = data.result?.schedule || [];

      setResults(
        schedule.map((s: any) => {
          const original = unscheduledItems.find(i => i.id === s.item_id);
          return {
            id: s.item_id,
            title: original?.title || 'Sin título',
            channel: original?.channel || '',
            scheduled_date: s.scheduled_date,
            selected: true,
          };
        })
      );
      setStep('preview');
    } catch (e: any) {
      console.error('Auto-schedule error:', e);
      toast.error(e.message || 'Error al generar el calendario');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (!results) return;
    const selected = results.filter(r => r.selected);
    if (selected.length === 0) {
      toast.warning('Selecciona al menos un item');
      return;
    }
    onConfirm(selected.map(r => ({ id: r.id, scheduled_date: r.scheduled_date })));
    handleClose();
    toast.success(`${selected.length} items programados`);
  };

  const handleClose = () => {
    setStep('config');
    setResults(null);
    onOpenChange(false);
  };

  const toggleStatus = (status: string) => {
    setIncludeStatuses(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const updateDate = (idx: number, date: string) => {
    setResults(prev => prev ? prev.map((r, i) => i === idx ? { ...r, scheduled_date: date } : r) : null);
  };

  const toggleSelect = (idx: number) => {
    setResults(prev => prev ? prev.map((r, i) => i === idx ? { ...r, selected: !r.selected } : r) : null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Agendar con IA
          </DialogTitle>
          <DialogDescription>
            La IA asignará fechas óptimas a tus contenidos sin programar
          </DialogDescription>
        </DialogHeader>

        {step === 'config' && (
          <div className="space-y-5">
            {/* Status filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estados a incluir</label>
              <div className="flex gap-4">
                {[
                  { key: 'idea', label: 'Ideas' },
                  { key: 'draft', label: 'Borradores' },
                  { key: 'review', label: 'En revisión' },
                ].map(s => (
                  <label key={s.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={includeStatuses[s.key]}
                      onCheckedChange={() => toggleStatus(s.key)}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Start date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="max-w-xs"
              />
            </div>

            {/* Horizon */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Horizonte temporal</label>
              <Select value={horizon} onValueChange={(v) => setHorizon(v as any)}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2w">2 semanas</SelectItem>
                  <SelectItem value="1m">1 mes</SelectItem>
                  <SelectItem value="2m">2 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p><strong>{unscheduledItems.length}</strong> items sin fecha para programar</p>
              <p>Rango: {format(new Date(startDate), 'd MMM', { locale: es })} → {format(new Date(endDate), 'd MMM yyyy', { locale: es })}</p>
              <p>{alreadyScheduled.length} items ya programados (se respetarán)</p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || unscheduledItems.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generando calendario...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generar calendario ({unscheduledItems.length} items)</>
              )}
            </Button>
          </div>
        )}

        {step === 'preview' && results && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revisa y ajusta las fechas propuestas. Desmarca los que no quieras programar.
            </p>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left w-8"></th>
                    <th className="p-2 text-left">Título</th>
                    <th className="p-2 text-left">Canal</th>
                    <th className="p-2 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={r.id} className={`border-t ${!r.selected ? 'opacity-40' : ''}`}>
                      <td className="p-2">
                        <Checkbox checked={r.selected} onCheckedChange={() => toggleSelect(idx)} />
                      </td>
                      <td className="p-2 font-medium truncate max-w-[200px]" title={r.title}>{r.title}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">{CHANNEL_LABELS[r.channel] || r.channel}</Badge>
                      </td>
                      <td className="p-2">
                        <Input
                          type="date"
                          value={r.scheduled_date}
                          onChange={e => updateDate(idx, e.target.value)}
                          className="h-8 w-36"
                          disabled={!r.selected}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setStep('config'); setResults(null); }}>
                <X className="h-4 w-4 mr-1" /> Volver
              </Button>
              <Button onClick={handleConfirm}>
                <Check className="h-4 w-4 mr-1" /> Confirmar {results.filter(r => r.selected).length} items
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AutoScheduleDialog;
