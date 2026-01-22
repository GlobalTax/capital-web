// ============= SPREADSHEET NAVIGATION HOOK =============
// Hook para navegación tipo Excel en tablas

import { useState, useCallback, useEffect } from 'react';

export interface CellPosition {
  rowIndex: number;
  columnKey: string;
}

interface UseSpreadsheetNavigationOptions {
  rows: any[];
  columns: string[];
  editableColumns: string[];
  onCellChange?: (position: CellPosition) => void;
}

export const useSpreadsheetNavigation = ({
  rows,
  columns,
  editableColumns,
  onCellChange
}: UseSpreadsheetNavigationOptions) => {
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);

  // Move to next editable cell
  const moveToNextEditableCell = useCallback((
    currentRow: number,
    currentCol: string,
    direction: 'next' | 'prev'
  ): CellPosition | null => {
    const editableIndices = columns
      .map((col, idx) => ({ col, idx }))
      .filter(({ col }) => editableColumns.includes(col));
    
    if (editableIndices.length === 0) return null;

    const currentEditableIdx = editableIndices.findIndex(({ col }) => col === currentCol);
    
    if (direction === 'next') {
      // Try next column in same row
      if (currentEditableIdx < editableIndices.length - 1) {
        return {
          rowIndex: currentRow,
          columnKey: editableIndices[currentEditableIdx + 1].col
        };
      }
      // Move to first editable column of next row
      if (currentRow < rows.length - 1) {
        return {
          rowIndex: currentRow + 1,
          columnKey: editableIndices[0].col
        };
      }
    } else {
      // Try previous column in same row
      if (currentEditableIdx > 0) {
        return {
          rowIndex: currentRow,
          columnKey: editableIndices[currentEditableIdx - 1].col
        };
      }
      // Move to last editable column of previous row
      if (currentRow > 0) {
        return {
          rowIndex: currentRow - 1,
          columnKey: editableIndices[editableIndices.length - 1].col
        };
      }
    }
    
    return null;
  }, [columns, editableColumns, rows.length]);

  // Navigate in a direction
  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right' | 'tab') => {
    if (!focusedCell) return;

    const { rowIndex, columnKey } = focusedCell;
    let newPosition: CellPosition | null = null;

    switch (direction) {
      case 'up':
        if (rowIndex > 0) {
          newPosition = { rowIndex: rowIndex - 1, columnKey };
        }
        break;
      case 'down':
        if (rowIndex < rows.length - 1) {
          newPosition = { rowIndex: rowIndex + 1, columnKey };
        }
        break;
      case 'left':
        newPosition = moveToNextEditableCell(rowIndex, columnKey, 'prev');
        break;
      case 'right':
      case 'tab':
        newPosition = moveToNextEditableCell(rowIndex, columnKey, 'next');
        break;
    }

    if (newPosition) {
      setFocusedCell(newPosition);
      onCellChange?.(newPosition);
    }
  }, [focusedCell, rows.length, moveToNextEditableCell, onCellChange]);

  // Focus a specific cell
  const focusCell = useCallback((position: CellPosition) => {
    setFocusedCell(position);
    onCellChange?.(position);
  }, [onCellChange]);

  // Clear focus
  const clearFocus = useCallback(() => {
    setFocusedCell(null);
  }, []);

  // Check if a cell is focused
  const isCellFocused = useCallback((rowIndex: number, columnKey: string) => {
    return focusedCell?.rowIndex === rowIndex && focusedCell?.columnKey === columnKey;
  }, [focusedCell]);

  return {
    focusedCell,
    focusCell,
    clearFocus,
    navigate,
    isCellFocused
  };
};
