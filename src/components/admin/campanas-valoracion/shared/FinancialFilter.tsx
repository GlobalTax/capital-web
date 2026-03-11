import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, ChevronDown } from 'lucide-react';
import { formatNumberWithDots, parseNumberWithDots } from '@/utils/numberFormatting';

export interface FinancialFilterValue {
  min: number | null;
  max: number | null;
}

interface FinancialFilterProps {
  label: string;
  value: FinancialFilterValue;
  onChange: (value: FinancialFilterValue) => void;
}

function formatLabel(value: FinancialFilterValue, label: string): string {
  const { min, max } = value;
  if (min === null && max === null) return label;
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M€`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K€`;
    return `${n}€`;
  };
  if (min !== null && max !== null) return `${fmt(min)} - ${fmt(max)}`;
  if (min !== null) return `≥ ${fmt(min)}`;
  if (max !== null) return `≤ ${fmt(max)}`;
  return label;
}

export function FinancialFilter({ label, value, onChange }: FinancialFilterProps) {
  const [open, setOpen] = useState(false);
  const [minStr, setMinStr] = useState(() => value.min ? formatNumberWithDots(value.min) : '');
  const [maxStr, setMaxStr] = useState(() => value.max ? formatNumberWithDots(value.max) : '');

  const hasValue = value.min !== null || value.max !== null;

  const handleOpen = useCallback((isOpen: boolean) => {
    if (isOpen) {
      setMinStr(value.min ? formatNumberWithDots(value.min) : '');
      setMaxStr(value.max ? formatNumberWithDots(value.max) : '');
    }
    setOpen(isOpen);
  }, [value]);

  const applyFilter = () => {
    const min = minStr ? parseNumberWithDots(minStr) : null;
    const max = maxStr ? parseNumberWithDots(maxStr) : null;
    onChange({ min: min && min > 0 ? min : null, max: max && max > 0 ? max : null });
    setOpen(false);
  };

  const clearFilter = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange({ min: null, max: null });
    setMinStr('');
    setMaxStr('');
    setOpen(false);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinStr(e.target.value.replace(/[^\d.]/g, ''));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxStr(e.target.value.replace(/[^\d.]/g, ''));
  };

  const handleMinBlur = () => {
    const parsed = parseNumberWithDots(minStr);
    setMinStr(parsed > 0 ? formatNumberWithDots(parsed) : '');
  };

  const handleMaxBlur = () => {
    const parsed = parseNumberWithDots(maxStr);
    setMaxStr(parsed > 0 ? formatNumberWithDots(parsed) : '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilter();
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-xs gap-1 px-2.5 ${hasValue ? 'border-primary text-primary bg-primary/5' : ''}`}
        >
          <span className="truncate max-w-[140px]">{formatLabel(value, label)}</span>
          {hasValue ? (
            <X className="h-3 w-3 shrink-0 opacity-60 hover:opacity-100" onClick={clearFilter} />
          ) : (
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-0.5 block">Mín.</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={minStr}
                onChange={handleMinChange}
                onBlur={handleMinBlur}
                onKeyDown={handleKeyDown}
                className="h-8 text-xs"
              />
            </div>
            <span className="text-muted-foreground text-xs mt-4">—</span>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-0.5 block">Máx.</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="∞"
                value={maxStr}
                onChange={handleMaxChange}
                onBlur={handleMaxBlur}
                onKeyDown={handleKeyDown}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs" onClick={clearFilter}>
              Limpiar
            </Button>
            <Button size="sm" className="flex-1 h-7 text-xs" onClick={applyFilter}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Check if a value matches a custom min/max filter */
export function matchesCustomRange(amount: number | null | undefined, filter: FinancialFilterValue): boolean {
  if (filter.min === null && filter.max === null) return true;
  const val = amount || 0;
  if (filter.min !== null && val < filter.min) return false;
  if (filter.max !== null && val > filter.max) return false;
  return true;
}
