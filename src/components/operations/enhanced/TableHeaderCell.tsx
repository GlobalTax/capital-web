import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowUpDown, Filter } from 'lucide-react';
import { ColumnDef } from '@/hooks/useColumnResizing';
import { ResizeHandle } from './ResizeHandle';

interface TableHeaderCellProps {
  column: ColumnDef;
  onSort?: (columnKey: string) => void;
  onFilter?: (columnKey: string, value: string) => void;
  onResize?: (delta: number) => void;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  column,
  onSort,
  onFilter,
  onResize,
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  return (
    <th
      className="relative group bg-muted/50 border-b border-r last:border-r-0"
      style={{ width: column.width, minWidth: column.minWidth || 80 }}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="font-medium text-sm">{column.title}</span>

        <div className="flex items-center gap-1 ml-auto">
          {column.sortable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onSort?.(column.key)}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          )}

          {column.filterable && (
            <Popover open={showFilter} onOpenChange={setShowFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <Input
                  placeholder={`Filtrar ${column.title}...`}
                  value={filterValue}
                  onChange={(e) => {
                    setFilterValue(e.target.value);
                    onFilter?.(column.key, e.target.value);
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {onResize && <ResizeHandle onResize={onResize} />}
    </th>
  );
};
