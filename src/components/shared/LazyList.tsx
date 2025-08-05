// ============= LAZY LIST COMPONENT =============
// Componente de lista virtualizada para grandes datasets

import { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface LazyListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

const LazyListComponent = <T,>({
  items,
  itemHeight,
  height,
  renderItem,
  className = '',
  overscan = 5
}: LazyListProps<T>) => {
  // Memoizar el componente de item para evitar re-renders
  const MemoizedItem = useMemo(() => 
    memo(({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    )), 
    [items, renderItem]
  );

  return (
    <div className={className}>
      <List
        height={height}
        width="100%"
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={overscan}
      >
        {MemoizedItem}
      </List>
    </div>
  );
};

export const LazyList = memo(LazyListComponent) as typeof LazyListComponent;