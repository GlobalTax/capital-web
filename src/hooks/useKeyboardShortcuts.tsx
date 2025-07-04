import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignore shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Only allow Escape to work in input fields
      if (event.key !== 'Escape') return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.callback();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      modifiers: [
        s.ctrlKey && 'Ctrl',
        s.shiftKey && 'Shift',
        s.altKey && 'Alt'
      ].filter(Boolean).join('+'),
      description: s.description
    }))
  };
};

// Hook especializado para el módulo de contactos
export const useContactsKeyboardShortcuts = ({
  onSearch,
  onNewContact,
  onExport,
  onClearFilters,
  onSelectNext,
  onSelectPrevious,
  onViewSelected,
  enabled = true
}: {
  onSearch: () => void;
  onNewContact: () => void;
  onExport: () => void;
  onClearFilters: () => void;
  onSelectNext: () => void;
  onSelectPrevious: () => void;
  onViewSelected: () => void;
  enabled?: boolean;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      callback: onSearch,
      description: 'Abrir búsqueda rápida'
    },
    {
      key: 'n',
      ctrlKey: true,
      callback: onNewContact,
      description: 'Crear nuevo contacto'
    },
    {
      key: 'e',
      ctrlKey: true,
      callback: onExport,
      description: 'Exportar contactos'
    },
    {
      key: 'Escape',
      callback: onClearFilters,
      description: 'Limpiar filtros y búsqueda'
    },
    {
      key: 'ArrowDown',
      callback: onSelectNext,
      description: 'Seleccionar siguiente contacto'
    },
    {
      key: 'ArrowUp',
      callback: onSelectPrevious,
      description: 'Seleccionar contacto anterior'
    },
    {
      key: 'Enter',
      callback: onViewSelected,
      description: 'Ver detalles del contacto seleccionado'
    }
  ];

  return useKeyboardShortcuts({ shortcuts, enabled });
};