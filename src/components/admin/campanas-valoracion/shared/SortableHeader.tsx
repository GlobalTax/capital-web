import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'revenue' | 'ebitda' | null;

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export function toggleSort(current: SortState, field: 'revenue' | 'ebitda'): SortState {
  if (current.field !== field) return { field, direction: 'desc' };
  if (current.direction === 'desc') return { field, direction: 'asc' };
  return { field: null, direction: null };
}

export function applySortToList<T extends { revenue?: number | null; ebitda?: number | null }>(
  list: T[],
  sort: SortState
): T[] {
  if (!sort.field || !sort.direction) return list;
  const sorted = [...list];
  const key = sort.field;
  const dir = sort.direction === 'asc' ? 1 : -1;
  sorted.sort((a, b) => ((a[key] || 0) - (b[key] || 0)) * dir);
  return sorted;
}

interface SortableHeaderProps {
  label: string;
  field: 'revenue' | 'ebitda';
  sort: SortState;
  onToggle: (field: 'revenue' | 'ebitda') => void;
  className?: string;
}

export function SortableHeader({ label, field, sort, onToggle, className }: SortableHeaderProps) {
  const isActive = sort.field === field;
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground transition-colors select-none",
        isActive ? "text-foreground font-medium" : "text-muted-foreground",
        className
      )}
    >
      {label}
      {isActive && sort.direction === 'asc' && <ArrowUp className="h-3.5 w-3.5" />}
      {isActive && sort.direction === 'desc' && <ArrowDown className="h-3.5 w-3.5" />}
      {!isActive && <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );
}
