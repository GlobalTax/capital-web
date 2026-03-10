// ============= VIRTUAL CONTACTS TABLE =============
// Virtualized table with keyboard navigation (Ctrl+Arrows, Enter, Space)

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Checkbox } from '@/components/ui/checkbox';
import { Contact } from './types';
import ContactRow from './ContactRow';
import { cn } from '@/lib/utils';

interface VirtualContactsTableProps {
  contacts: Contact[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onViewDetails: (contact: Contact) => void;
  onPatchContact?: (id: string, updates: Partial<Contact>) => void;
  isLoading?: boolean;
}

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 32;
const PAGE_JUMP = 10;

const VirtualContactsTable: React.FC<VirtualContactsTableProps> = ({
  contacts,
  selectedIds,
  onSelect,
  onSelectAll,
  onViewDetails,
  onPatchContact,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [listHeight, setListHeight] = useState(400);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Read container height once on mount and when it changes
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        if (height > HEADER_HEIGHT + 50) {
          setListHeight(height - HEADER_HEIGHT);
        }
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Scroll to focused row
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      listRef.current.scrollToItem(focusedIndex, 'smart');
    }
  }, [focusedIndex]);

  // Reset focus when contacts list changes significantly
  useEffect(() => {
    setFocusedIndex(prev => (prev >= contacts.length ? -1 : prev));
  }, [contacts.length]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Skip if user is typing in an input/select inside the table
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    const max = contacts.length - 1;
    if (max < 0) return;

    let handled = true;

    if (e.key === 'ArrowDown' || e.key === 'j') {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Down: move focus AND select all rows in between
        const newIndex = Math.min(focusedIndex < 0 ? 0 : focusedIndex + PAGE_JUMP, max);
        const from = Math.max(focusedIndex, 0);
        for (let i = from; i <= newIndex; i++) {
          if (contacts[i] && !selectedIds.includes(contacts[i].id)) {
            onSelect(contacts[i].id);
          }
        }
        setFocusedIndex(newIndex);
      } else {
        setFocusedIndex(prev => (prev < 0 ? 0 : Math.min(prev + 1, max)));
      }
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Up: move focus AND select all rows in between
        const newIndex = Math.max(focusedIndex <= 0 ? 0 : focusedIndex - PAGE_JUMP, 0);
        const from = Math.min(focusedIndex, max);
        for (let i = from; i >= newIndex; i--) {
          if (contacts[i] && !selectedIds.includes(contacts[i].id)) {
            onSelect(contacts[i].id);
          }
        }
        setFocusedIndex(newIndex);
      } else {
        setFocusedIndex(prev => (prev <= 0 ? 0 : prev - 1));
      }
    } else if (e.key === 'Home') {
      setFocusedIndex(0);
    } else if (e.key === 'End') {
      setFocusedIndex(max);
    } else if (e.key === 'Enter') {
      // Open details for focused row
      if (focusedIndex >= 0 && contacts[focusedIndex]) {
        onViewDetails(contacts[focusedIndex]);
      }
    } else if (e.key === ' ') {
      // Toggle selection for focused row
      if (focusedIndex >= 0 && contacts[focusedIndex]) {
        onSelect(contacts[focusedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setFocusedIndex(-1);
    } else {
      handled = false;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [contacts, focusedIndex, onSelect, onViewDetails]);

  const allSelected = contacts.length > 0 && selectedIds.length === contacts.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < contacts.length;

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const contact = contacts[index];
    if (!contact) return null;
    
    return (
      <ContactRow
        key={contact.id}
        contact={contact}
        isSelected={selectedIds.includes(contact.id)}
        isFocused={index === focusedIndex}
        onSelect={() => onSelect(contact.id)}
        onViewDetails={() => onViewDetails(contact)}
        onPatchContact={onPatchContact}
        style={style}
      />
    );
  }, [contacts, selectedIds, focusedIndex, onSelect, onViewDetails, onPatchContact]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No se encontraron contactos</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-background border border-border rounded-lg overflow-hidden focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-2 px-3 border-b border-border bg-muted/30 shrink-0"
        style={{ height: HEADER_HEIGHT }}
      >
        <Checkbox
          checked={allSelected}
          ref={(ref) => {
            if (ref) {
              (ref as any).indeterminate = someSelected;
            }
          }}
          onCheckedChange={onSelectAll}
          className="h-3.5 w-3.5"
        />
        <div className="flex-1 grid grid-cols-[2fr_1fr_1.5fr_1fr_100px_80px_80px_80px_1fr_100px_90px] gap-2 text-[11px] font-medium text-muted-foreground">
          <span>Nombre</span>
          <span>Estado</span>
          <span>Empresa</span>
          <span>Canal</span>
          <span>Formulario</span>
          <span className="text-right">Facturación</span>
          <span className="text-right">EBITDA</span>
          <span className="text-right">Valoración</span>
          <span>Fecha</span>
          <span>Sector</span>
          <span>Teléfono</span>
        </div>
      </div>

      {/* Hint */}
      {focusedIndex >= 0 && (
        <div className="absolute top-1 right-2 z-10 text-[10px] text-muted-foreground/50 pointer-events-none">
          ↑↓ navegar · Ctrl+↑↓ seleccionar rápido · Enter abrir · Espacio seleccionar · Esc salir
        </div>
      )}

      {/* Virtualized List */}
      <List
        ref={listRef}
        height={listHeight}
        itemCount={contacts.length}
        itemSize={ROW_HEIGHT}
        width="100%"
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
};

export default memo(VirtualContactsTable);
