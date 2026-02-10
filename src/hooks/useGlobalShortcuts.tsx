import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Cmd on Mac
  shift?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const gTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const shortcuts: ShortcutConfig[] = [
    // Navigation shortcuts (g + key)
    { key: 'h', description: 'Ir al Dashboard', category: 'Navegación', action: () => navigate('/admin') },
    { key: 'l', description: 'Ir a Pipeline de Leads', category: 'Navegación', action: () => navigate('/admin/leads-pipeline') },
    { key: 'v', description: 'Ir a Valoraciones', category: 'Navegación', action: () => navigate('/admin/valuation-analytics') },
    { key: 'b', description: 'Ir a Reservas', category: 'Navegación', action: () => navigate('/admin/bookings') },
    { key: 'c', description: 'Ir a Contactos', category: 'Navegación', action: () => navigate('/admin/contacts') },
    { key: 'o', description: 'Ir a Operaciones', category: 'Navegación', action: () => navigate('/admin/operations') },
    { key: 'n', description: 'Ir a Newsletter', category: 'Navegación', action: () => navigate('/admin/newsletter') },
    { key: 's', description: 'Ir a Ajustes', category: 'Navegación', action: () => navigate('/admin/settings') },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Command/Ctrl + K for command palette (handled by CommandPalette)
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      return; // Let CommandPalette handle this
    }

    // Command/Ctrl + / for keyboard shortcuts help
    if ((event.metaKey || event.ctrlKey) && event.key === '/') {
      event.preventDefault();
      // Dispatch custom event to open shortcuts dialog
      window.dispatchEvent(new CustomEvent('open-shortcuts-help'));
      return;
    }

    // G + key navigation shortcuts
    const gPressed = (window as any).__gKeyPressed;
    if (gPressed) {
      const shortcut = shortcuts.find(s => s.key === event.key.toLowerCase());
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
        (window as any).__gKeyPressed = false;
      }
      return;
    }

    // Track G key press for navigation shortcuts
    if (event.key === 'g' && !event.metaKey && !event.ctrlKey) {
      (window as any).__gKeyPressed = true;
      // Reset after 1 second, clearing any previous timer
      clearTimeout(gTimerRef.current);
      gTimerRef.current = setTimeout(() => {
        (window as any).__gKeyPressed = false;
      }, 1000);
    }
  }, [navigate, shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gTimerRef.current);
    };
  }, [handleKeyDown]);

  return { shortcuts };
}

export function getShortcutsHelp() {
  return {
    'Navegación (g + tecla)': [
      { keys: ['g', 'h'], description: 'Ir al Dashboard' },
      { keys: ['g', 'l'], description: 'Ir a Pipeline de Leads' },
      { keys: ['g', 'v'], description: 'Ir a Valoraciones' },
      { keys: ['g', 'b'], description: 'Ir a Reservas' },
      { keys: ['g', 'c'], description: 'Ir a Contactos' },
      { keys: ['g', 'o'], description: 'Ir a Operaciones' },
      { keys: ['g', 'n'], description: 'Ir a Newsletter' },
      { keys: ['g', 's'], description: 'Ir a Ajustes' },
    ],
    'Acciones Globales': [
      { keys: ['⌘/Ctrl', 'K'], description: 'Abrir búsqueda rápida' },
      { keys: ['⌘/Ctrl', '/'], description: 'Ver atajos de teclado' },
      { keys: ['Esc'], description: 'Cerrar modal/panel' },
    ]
  };
}
