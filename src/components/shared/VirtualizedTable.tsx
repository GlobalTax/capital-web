// ============= VIRTUALIZED TABLE COMPONENT =============
// Tabla virtualizada para grandes datasets

import { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  title: string;
  render: (item: T, index: number) => React.ReactNode;
  width?: number;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemHeight: number;
  height: number;
  className?: string;
  overscan?: number;
}

const VirtualizedTableComponent = <T,>({
  data,
  columns,
  itemHeight,
  height,
  className = '',
  overscan = 5
}: VirtualizedTableProps<T>) => {
  // Memoizar el componente de fila
  const MemoizedRow = useMemo(() => 
    memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = data[index];
      
      return (
        <div 
          style={style} 
          className={cn(
            "flex items-center border-b border-border/50",
            index % 2 === 0 ? "bg-background" : "bg-muted/30"
          )}
        >
          {columns.map((column, colIndex) => (
            <div
              key={column.key}
              className="px-4 py-2 flex-1"
              style={{ width: column.width || 'auto' }}
            >
              {column.render(item, index)}
            </div>
          ))}
        </div>
      );
    }), 
    [data, columns]
  );

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex bg-muted/50 border-b border-border sticky top-0 z-10">
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-3 font-medium text-sm text-muted-foreground flex-1"
            style={{ width: column.width || 'auto' }}
          >
            {column.title}
          </div>
        ))}
      </div>
      
      {/* Virtual List */}
      <List
        height={height}
        width="100%"
        itemCount={data.length}
        itemSize={itemHeight}
        overscanCount={overscan}
      >
        {MemoizedRow}
      </List>
    </div>
  );
};

export const VirtualizedTable = memo(VirtualizedTableComponent) as typeof VirtualizedTableComponent;