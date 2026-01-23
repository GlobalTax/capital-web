// ============= ADD SNAPSHOT ROW =============
// Fila inline para añadir un registro de fecha para una campaña existente

import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SnapshotInput } from '@/hooks/useCampaignRegistry';

interface AddSnapshotRowProps {
  campaignId: string;
  onSave: (data: SnapshotInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddSnapshotRow: React.FC<AddSnapshotRowProps> = ({
  campaignId,
  onSave,
  onCancel,
  isLoading
}) => {
  const [snapshotDate, setSnapshotDate] = useState<Date>(new Date());
  const [results, setResults] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [targetCpl, setTargetCpl] = useState('');
  const [internalStatus, setInternalStatus] = useState<'ok' | 'watch' | 'stop' | ''>('');
  const [notes, setNotes] = useState('');

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = async () => {
    const data: SnapshotInput = {
      campaign_id: campaignId,
      snapshot_date: format(snapshotDate, 'yyyy-MM-dd'),
      results: results ? parseInt(results, 10) : 0,
      amount_spent: amountSpent ? parseFloat(amountSpent.replace(',', '.')) : 0,
      daily_budget: dailyBudget ? parseFloat(dailyBudget.replace(',', '.')) : null,
      monthly_budget: monthlyBudget ? parseFloat(monthlyBudget.replace(',', '.')) : null,
      target_cpl: targetCpl ? parseFloat(targetCpl.replace(',', '.')) : null,
      internal_status: internalStatus || null,
      notes: notes || null
    };

    await onSave(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  // Calculate cost per result preview
  const resultsNum = parseInt(results, 10) || 0;
  const amountNum = parseFloat(amountSpent.replace(',', '.')) || 0;
  const costPerResult = resultsNum > 0 ? amountNum / resultsNum : null;

  return (
    <tr className="bg-primary/5 border-b animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Campaña cell - shows "Nueva fecha" indicator */}
      <td className="px-2 py-2 text-sm text-muted-foreground italic" colSpan={1}>
        ↳ Nuevo registro
      </td>
      
      {/* Delivery - empty */}
      <td className="px-2 py-2 text-sm text-muted-foreground">—</td>
      
      {/* Fecha */}
      <td className="px-2 py-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 w-full justify-start text-left font-normal text-xs",
                !snapshotDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {format(snapshotDate, "dd/MM", { locale: es })}
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
      </td>
      
      {/* Resultados */}
      <td className="px-1 py-1">
        <Input
          ref={firstInputRef}
          type="number"
          value={results}
          onChange={(e) => setResults(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0"
          className="h-8 text-xs text-right tabular-nums"
          min="0"
        />
      </td>
      
      {/* Coste/Res (calculated) */}
      <td className="px-2 py-2 text-xs text-right tabular-nums text-muted-foreground">
        {costPerResult 
          ? new Intl.NumberFormat('es-ES', { 
              style: 'currency', 
              currency: 'EUR',
              minimumFractionDigits: 2
            }).format(costPerResult)
          : '—'
        }
      </td>
      
      {/* Gastado */}
      <td className="px-1 py-1">
        <Input
          type="text"
          value={amountSpent}
          onChange={(e) => setAmountSpent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0.00"
          className="h-8 text-xs text-right tabular-nums"
        />
      </td>
      
      {/* Ppto Diario */}
      <td className="px-1 py-1">
        <Input
          type="text"
          value={dailyBudget}
          onChange={(e) => setDailyBudget(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0.00"
          className="h-8 text-xs text-right tabular-nums"
        />
      </td>
      
      {/* Ppto Mensual */}
      <td className="px-1 py-1">
        <Input
          type="text"
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0.00"
          className="h-8 text-xs text-right tabular-nums"
        />
      </td>
      
      {/* CPL Objetivo */}
      <td className="px-1 py-1">
        <Input
          type="text"
          value={targetCpl}
          onChange={(e) => setTargetCpl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0.00"
          className="h-8 text-xs text-right tabular-nums"
        />
      </td>
      
      {/* Estado */}
      <td className="px-1 py-1">
        <Select value={internalStatus} onValueChange={(v) => setInternalStatus(v as 'ok' | 'watch' | 'stop' | '')}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ok">
              <span className="text-green-700">OK</span>
            </SelectItem>
            <SelectItem value="watch">
              <span className="text-amber-700">Vigilar</span>
            </SelectItem>
            <SelectItem value="stop">
              <span className="text-red-700">Parar</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </td>
      
      {/* Notas */}
      <td className="px-1 py-1">
        <Input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Notas..."
          className="h-8 text-xs"
        />
      </td>
      
      {/* Actions */}
      <td className="px-2 py-1">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
