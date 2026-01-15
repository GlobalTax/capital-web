// ============= COST ENTRY FORM =============
// Formulario para añadir/editar gastos de campañas

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Euro, MousePointer, Eye, Plus, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampaignCostInput } from '@/hooks/useCampaignCosts';
import { ScreenshotUploader, ExtractedCampaignData } from './ScreenshotUploader';

const formSchema = z.object({
  channel: z.enum(['meta_ads', 'google_ads', 'linkedin_ads', 'other']),
  campaign_name: z.string().optional(),
  period_start: z.string().min(1, 'Fecha de inicio requerida'),
  period_end: z.string().min(1, 'Fecha de fin requerida'),
  amount: z.coerce.number().min(0, 'El importe debe ser positivo'),
  impressions: z.coerce.number().optional(),
  clicks: z.coerce.number().optional(),
  ctr: z.coerce.number().optional(),
  cpc: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CostEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignCostInput) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<FormData>;
  mode?: 'create' | 'edit';
}

const QUICK_PERIODS = [
  { 
    label: 'Hoy', 
    getValue: () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      return { start: today, end: today };
    }
  },
  { 
    label: 'Ayer', 
    getValue: () => {
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      return { start: yesterday, end: yesterday };
    }
  },
  { 
    label: 'Esta semana', 
    getValue: () => ({
      start: format(startOfWeek(new Date(), { locale: es }), 'yyyy-MM-dd'),
      end: format(endOfWeek(new Date(), { locale: es }), 'yyyy-MM-dd')
    })
  },
  { 
    label: 'Semana pasada', 
    getValue: () => ({
      start: format(startOfWeek(subDays(new Date(), 7), { locale: es }), 'yyyy-MM-dd'),
      end: format(endOfWeek(subDays(new Date(), 7), { locale: es }), 'yyyy-MM-dd')
    })
  },
  { 
    label: 'Este mes', 
    getValue: () => ({
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    })
  },
];

const CostEntryForm: React.FC<CostEntryFormProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  defaultValues,
  mode = 'create'
}) => {
  const [showScreenshotUploader, setShowScreenshotUploader] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel: 'meta_ads',
      period_start: format(new Date(), 'yyyy-MM-dd'),
      period_end: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      ...defaultValues
    }
  });

  const handleScreenshotData = (data: ExtractedCampaignData) => {
    setValue('channel', data.channel);
    if (data.campaign_name) setValue('campaign_name', data.campaign_name);
    setValue('period_start', data.period_start);
    setValue('period_end', data.period_end);
    setValue('amount', data.amount);
    if (data.impressions) setValue('impressions', data.impressions);
    if (data.clicks) setValue('clicks', data.clicks);
    if (data.ctr) setValue('ctr', data.ctr);
    if (data.cpc) setValue('cpc', data.cpc);
    setShowScreenshotUploader(false);
  };

  const channel = watch('channel');
  const clicks = watch('clicks');
  const impressions = watch('impressions');
  const amount = watch('amount');

  // Auto-calculate CTR and CPC
  React.useEffect(() => {
    if (impressions && clicks && impressions > 0) {
      const calculatedCtr = (clicks / impressions) * 100;
      setValue('ctr', Math.round(calculatedCtr * 100) / 100);
    }
  }, [impressions, clicks, setValue]);

  React.useEffect(() => {
    if (amount && clicks && clicks > 0) {
      const calculatedCpc = amount / clicks;
      setValue('cpc', Math.round(calculatedCpc * 100) / 100);
    }
  }, [amount, clicks, setValue]);

  const handleQuickPeriod = (getValue: () => { start: string; end: string }) => {
    const { start, end } = getValue();
    setValue('period_start', start);
    setValue('period_end', end);
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data as CampaignCostInput);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {mode === 'create' ? <Plus className="h-5 w-5" /> : null}
              {mode === 'create' ? 'Añadir Gasto de Campaña' : 'Editar Gasto'}
            </span>
            {mode === 'create' && (
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setShowScreenshotUploader(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Importar pantallazo
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Channel */}
          <div className="space-y-2">
            <Label>Canal publicitario</Label>
            <Select 
              value={channel} 
              onValueChange={(value) => setValue('channel', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meta_ads">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    Meta Ads (Facebook/Instagram)
                  </span>
                </SelectItem>
                <SelectItem value="google_ads">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Google Ads
                  </span>
                </SelectItem>
                <SelectItem value="linkedin_ads">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-700 rounded-full" />
                    LinkedIn Ads
                  </span>
                </SelectItem>
                <SelectItem value="other">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full" />
                    Otro
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaign_name">Nombre de campaña (opcional)</Label>
            <Input
              id="campaign_name"
              placeholder="Ej: Valoración Empresas Q1"
              {...register('campaign_name')}
            />
          </div>

          {/* Quick Period Buttons */}
          <div className="space-y-2">
            <Label>Período rápido</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PERIODS.map((period) => (
                <Button
                  key={period.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPeriod(period.getValue)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start">Fecha inicio</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="period_start"
                  type="date"
                  className="pl-10"
                  {...register('period_start')}
                />
              </div>
              {errors.period_start && (
                <p className="text-xs text-destructive">{errors.period_start.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="period_end">Fecha fin</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="period_end"
                  type="date"
                  className="pl-10"
                  {...register('period_end')}
                />
              </div>
              {errors.period_end && (
                <p className="text-xs text-destructive">{errors.period_end.message}</p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Importe gastado (€)</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="pl-10"
                placeholder="0.00"
                {...register('amount')}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Optional Metrics */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Métricas opcionales</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="impressions" className="text-xs">Impresiones</Label>
                <div className="relative">
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    id="impressions"
                    type="number"
                    min="0"
                    className="pl-9 h-9 text-sm"
                    placeholder="0"
                    {...register('impressions')}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="clicks" className="text-xs">Clics</Label>
                <div className="relative">
                  <MousePointer className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    id="clicks"
                    type="number"
                    min="0"
                    className="pl-9 h-9 text-sm"
                    placeholder="0"
                    {...register('clicks')}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ctr" className="text-xs">CTR (%)</Label>
                <Input
                  id="ctr"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="h-9 text-sm bg-muted"
                  placeholder="Auto"
                  {...register('ctr')}
                  readOnly
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cpc" className="text-xs">CPC (€)</Label>
                <Input
                  id="cpc"
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-9 text-sm bg-muted"
                  placeholder="Auto"
                  {...register('cpc')}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones sobre esta campaña..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Añadir Gasto' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>

        {/* Screenshot Uploader Modal */}
        <ScreenshotUploader
          open={showScreenshotUploader}
          onOpenChange={setShowScreenshotUploader}
          onDataExtracted={handleScreenshotData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CostEntryForm;
