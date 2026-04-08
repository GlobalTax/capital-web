import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRESETS = [5, 7, 10, 14, 21, 30];

interface FollowUpReminderConfigProps {
  campaignId: string;
  currentDays: number | null;
}

export function FollowUpReminderConfig({ campaignId, currentDays }: FollowUpReminderConfigProps) {
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (days: number | null) => {
      const { error } = await (supabase as any)
        .from('valuation_campaigns')
        .update({ followup_reminder_days: days })
        .eq('id', campaignId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outbound-summary-raw'] });
      queryClient.invalidateQueries({ queryKey: ['followup-alerts'] });
      setOpen(false);
      toast({ title: 'Recordatorio actualizado' });
    },
  });

  const handleSelect = (days: number) => {
    mutation.mutate(days);
  };

  const handleCustom = () => {
    const v = parseInt(customValue, 10);
    if (v > 0) {
      mutation.mutate(v);
      setCustomValue('');
    }
  };

  const handleClear = () => {
    mutation.mutate(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 w-7 p-0 ${currentDays ? 'text-amber-600' : 'text-muted-foreground/40'}`}
          title={currentDays ? `Aviso cada ${currentDays}d` : 'Sin aviso de follow-up'}
        >
          <Clock className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="center">
        <p className="text-xs font-medium mb-2">Avisar follow-up cada:</p>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {PRESETS.map(d => (
            <Button
              key={d}
              variant={currentDays === d ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleSelect(d)}
              disabled={mutation.isPending}
            >
              {d}d
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Input
            type="number"
            min={1}
            placeholder="Otro"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="h-7 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={handleCustom}
            disabled={!customValue || mutation.isPending}
          >
            OK
          </Button>
        </div>
        {currentDays && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs w-full mt-2 text-muted-foreground"
            onClick={handleClear}
            disabled={mutation.isPending}
          >
            <X className="h-3 w-3 mr-1" /> Quitar aviso
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
