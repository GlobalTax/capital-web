// ============= ADD CAMPAIGN MODAL =============
// Modal para crear/editar campañas

import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateCampaignInput, CHANNEL_LABELS } from '@/hooks/useCampaignRegistry';

interface AddCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCampaignInput) => void;
  isLoading?: boolean;
}

const CHANNELS = [
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'linkedin_ads', label: 'LinkedIn Ads' },
  { value: 'other', label: 'Otros' },
];

export const AddCampaignModal: React.FC<AddCampaignModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading
}) => {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'meta_ads' | 'google_ads' | 'linkedin_ads' | 'other'>('meta_ads');
  const [deliveryStatus, setDeliveryStatus] = useState<'active' | 'paused'>('active');
  
  // First snapshot (optional)
  const [includeFirstSnapshot, setIncludeFirstSnapshot] = useState(true);
  const [snapshotDate, setSnapshotDate] = useState<Date>(new Date());
  const [results, setResults] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [targetCpl, setTargetCpl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const data: CreateCampaignInput = {
      name: name.trim(),
      channel,
      delivery_status: deliveryStatus
    };

    if (includeFirstSnapshot) {
      data.initial_snapshot = {
        snapshot_date: format(snapshotDate, 'yyyy-MM-dd'),
        results: results ? parseInt(results, 10) : 0,
        amount_spent: amountSpent ? parseFloat(amountSpent.replace(',', '.')) : 0,
        daily_budget: dailyBudget ? parseFloat(dailyBudget.replace(',', '.')) : null,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget.replace(',', '.')) : null,
        target_cpl: targetCpl ? parseFloat(targetCpl.replace(',', '.')) : null,
      };
    }

    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setChannel('meta_ads');
    setDeliveryStatus('active');
    setIncludeFirstSnapshot(true);
    setSnapshotDate(new Date());
    setResults('');
    setAmountSpent('');
    setDailyBudget('');
    setMonthlyBudget('');
    setTargetCpl('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Campaña</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campaign name */}
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Nombre de la campaña *</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Generación clientes potenciales - Venta empresas"
              required
            />
          </div>

          {/* Channel and delivery status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Canal</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map(ch => (
                    <SelectItem key={ch.value} value={ch.value}>
                      {ch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Entrega</Label>
              <RadioGroup
                value={deliveryStatus}
                onValueChange={(v) => setDeliveryStatus(v as 'active' | 'paused')}
                className="flex gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="font-normal flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Activa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paused" id="paused" />
                  <Label htmlFor="paused" className="font-normal flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Pausada
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator className="my-4" />

          {/* First snapshot section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Primer registro (opcional)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIncludeFirstSnapshot(!includeFirstSnapshot)}
              >
                {includeFirstSnapshot ? 'Omitir' : 'Añadir'}
              </Button>
            </div>

            {includeFirstSnapshot && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                {/* Date picker */}
                <div className="space-y-2">
                  <Label>Fecha del registro</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !snapshotDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {snapshotDate ? format(snapshotDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={snapshotDate}
                        onSelect={(date) => date && setSnapshotDate(date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Resultados</Label>
                    <Input
                      type="number"
                      value={results}
                      onChange={(e) => setResults(e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gastado (€)</Label>
                    <Input
                      type="text"
                      value={amountSpent}
                      onChange={(e) => setAmountSpent(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ppto. Diario (€)</Label>
                    <Input
                      type="text"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ppto. Mensual (€)</Label>
                    <Input
                      type="text"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">CPL Objetivo (€)</Label>
                    <Input
                      type="text"
                      value={targetCpl}
                      onChange={(e) => setTargetCpl(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Crear campaña'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
