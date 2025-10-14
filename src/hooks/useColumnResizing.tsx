import { useState, useCallback } from 'react';

export interface ColumnDef {
  key: string;
  title: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
}

export const useColumnResizing = (initialColumns: ColumnDef[]) => {
  const [columns, setColumns] = useState<ColumnDef[]>(initialColumns);

  const handleResize = useCallback((columnKey: string, delta: number) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.key !== columnKey) return col;

        const newWidth = col.width + delta;
        const minWidth = col.minWidth ?? 80;
        const maxWidth = col.maxWidth ?? 600;

        return {
          ...col,
          width: Math.max(minWidth, Math.min(maxWidth, newWidth)),
        };
      })
    );
  }, []);

  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  const visibleColumns = columns.filter((col) => col.visible !== false);

  return {
    columns,
    visibleColumns,
    handleResize,
    toggleColumnVisibility,
  };
};
