import { useState, useCallback, useMemo } from 'react';

export interface ListColumnDef {
  key: string;
  label: string;
  visible: boolean;
  position: number;
  sortable?: boolean;
  align?: 'left' | 'right';
  minWidth?: string;
  fixed?: boolean; // columns that can't be hidden (checkbox, actions)
}

const DEFAULT_COLUMNS: ListColumnDef[] = [
  { key: 'empresa', label: 'Empresa', visible: true, position: 0, sortable: true },
  { key: 'sublistas', label: 'Sublistas', visible: true, position: 1 },
  { key: 'cif', label: 'CIF', visible: true, position: 2 },
  { key: 'contacto', label: 'Contacto', visible: true, position: 3 },
  { key: 'email', label: 'Email', visible: true, position: 4 },
  { key: 'linkedin', label: 'LinkedIn', visible: true, position: 5 },
  { key: 'director_ejecutivo', label: 'Director Ejecutivo', visible: true, position: 6 },
  { key: 'web', label: 'Web', visible: true, position: 7 },
  { key: 'provincia', label: 'Provincia', visible: true, position: 8 },
  { key: 'facturacion', label: 'Facturación', visible: true, position: 9, sortable: true, align: 'right' },
  { key: 'ebitda', label: 'EBITDA', visible: true, position: 10, sortable: true, align: 'right' },
  { key: 'num_trabajadores', label: 'Empleados', visible: true, position: 11, sortable: true, align: 'right' },
  { key: 'consolidador', label: 'Consolidador', visible: true, position: 12, minWidth: '180px' },
  { key: 'notas', label: 'Notas', visible: true, position: 13, minWidth: '160px' },
  { key: 'lista_madre', label: 'Lista Madre', visible: true, position: 14, minWidth: '160px' },
];

const STORAGE_KEY = 'list-column-prefs';

function loadPreferences(listId?: string): ListColumnDef[] | null {
  try {
    const key = listId ? `${STORAGE_KEY}-${listId}` : STORAGE_KEY;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function savePreferences(columns: ListColumnDef[], listId?: string) {
  try {
    const key = listId ? `${STORAGE_KEY}-${listId}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(columns));
  } catch {
    // silent
  }
}

export const useListColumnPreferences = (listId?: string, isMadreList = false, isSublist = false) => {
  const [columns, setColumns] = useState<ListColumnDef[]>(() => {
    const saved = loadPreferences(listId);
    if (saved) {
      // Merge with defaults to pick up any new columns added later
      const savedKeys = new Set(saved.map(c => c.key));
      const merged = [...saved];
      DEFAULT_COLUMNS.forEach(def => {
        if (!savedKeys.has(def.key)) {
          merged.push({ ...def, position: merged.length });
        }
      });
      return merged;
    }
    return DEFAULT_COLUMNS.map(c => ({ ...c }));
  });

  const visibleColumns = useMemo(() => {
    return columns
      .filter(c => {
        if (c.key === 'sublistas' && !isMadreList) return false;
        if (c.key === 'lista_madre' && !isSublist) return false;
        return c.visible;
      })
      .sort((a, b) => a.position - b.position);
  }, [columns, isMadreList, isSublist]);

  const toggleColumn = useCallback((key: string) => {
    setColumns(prev => {
      const next = prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c);
      savePreferences(next, listId);
      return next;
    });
  }, [listId]);

  const moveColumn = useCallback((key: string, direction: 'up' | 'down') => {
    setColumns(prev => {
      const sorted = [...prev].sort((a, b) => a.position - b.position);
      const idx = sorted.findIndex(c => c.key === key);
      if (idx < 0) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      
      // Swap positions
      const tempPos = sorted[idx].position;
      sorted[idx] = { ...sorted[idx], position: sorted[swapIdx].position };
      sorted[swapIdx] = { ...sorted[swapIdx], position: tempPos };
      
      savePreferences(sorted, listId);
      return sorted;
    });
  }, [listId]);

  const resetToDefault = useCallback(() => {
    const defaults = DEFAULT_COLUMNS.map(c => ({ ...c }));
    setColumns(defaults);
    savePreferences(defaults, listId);
  }, [listId]);

  return {
    allColumns: columns.sort((a, b) => a.position - b.position),
    visibleColumns,
    toggleColumn,
    moveColumn,
    resetToDefault,
  };
};
