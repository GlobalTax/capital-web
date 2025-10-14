import { useRef, useState, useCallback } from 'react';
import { FixedSizeList } from 'react-window';

interface VirtualizedTableConfig {
  rowHeight: number;
  containerHeight: number;
  overscanCount?: number;
}

export const useVirtualizedTable = (
  itemCount: number,
  config: VirtualizedTableConfig
) => {
  const listRef = useRef<FixedSizeList>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  const handleItemsRendered = useCallback(
    ({ visibleStartIndex, visibleStopIndex }: { visibleStartIndex: number; visibleStopIndex: number }) => {
      setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex });
    },
    []
  );

  const scrollToItem = useCallback((index: number) => {
    listRef.current?.scrollToItem(index, 'smart');
  }, []);

  return {
    listRef,
    visibleRange,
    handleItemsRendered,
    scrollToItem,
    rowHeight: config.rowHeight,
    containerHeight: config.containerHeight,
    overscanCount: config.overscanCount ?? 5,
  };
};
