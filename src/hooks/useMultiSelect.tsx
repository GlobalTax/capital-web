import { useState, useCallback } from 'react';

export const useMultiSelect = <T extends { id: string }>(data: T[]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const handleSelect = useCallback(
    (id: string, index: number, event?: React.MouseEvent) => {
      if (event?.shiftKey && lastSelectedIndex !== null) {
        // Range selection
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = data.slice(start, end + 1).map((item) => item.id);
        setSelectedIds((prev) => [...new Set([...prev, ...rangeIds])]);
      } else if (event?.metaKey || event?.ctrlKey) {
        // Toggle selection
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
      } else {
        // Single selection
        setSelectedIds([id]);
      }
      setLastSelectedIndex(index);
    },
    [data, lastSelectedIndex]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(data.map((item) => item.id));
  }, [data]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
    setLastSelectedIndex(null);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  return {
    selectedIds,
    handleSelect,
    handleSelectAll,
    handleClearSelection,
    isSelected,
    selectedCount: selectedIds.length,
  };
};
