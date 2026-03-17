import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Columns3, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import type { ListColumnDef } from '@/hooks/useListColumnPreferences';

interface ListColumnConfiguratorProps {
  columns: ListColumnDef[];
  onToggle: (key: string) => void;
  onMove: (key: string, direction: 'up' | 'down') => void;
  onReset: () => void;
  isMadreList?: boolean;
}

export const ListColumnConfigurator: React.FC<ListColumnConfiguratorProps> = ({
  columns,
  onToggle,
  onMove,
  onReset,
  isMadreList = false,
}) => {
  const sorted = [...columns].sort((a, b) => a.position - b.position);
  const filtered = isMadreList ? sorted : sorted.filter(c => c.key !== 'sublistas');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Columns3 className="h-4 w-4" />
          Columnas
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium">Columnas visibles</span>
          <Button variant="ghost" size="xs" onClick={onReset} className="text-xs gap-1 text-muted-foreground">
            <RotateCcw className="h-3 w-3" /> Restablecer
          </Button>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-1">
          {filtered.map((col, idx) => (
            <div
              key={col.key}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 group"
            >
              <Checkbox
                checked={col.visible}
                onCheckedChange={() => onToggle(col.key)}
                id={`col-${col.key}`}
              />
              <label
                htmlFor={`col-${col.key}`}
                className="flex-1 text-sm cursor-pointer select-none"
              >
                {col.label}
              </label>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onMove(col.key, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onMove(col.key, 'down')}
                  disabled={idx === filtered.length - 1}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
