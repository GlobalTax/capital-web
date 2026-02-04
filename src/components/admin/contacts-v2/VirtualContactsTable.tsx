// ============= VIRTUAL CONTACTS TABLE =============
// Virtualized table using CSS height inheritance

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
  isLoading?: boolean;
}

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 32;

const VirtualContactsTable: React.FC<VirtualContactsTableProps> = ({
  contacts,
  selectedIds,
  onSelect,
  onSelectAll,
  onViewDetails,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(400);

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

    // Initial update
    updateHeight();

    // Use ResizeObserver for dynamic updates
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
        onSelect={() => onSelect(contact.id)}
        onViewDetails={() => onViewDetails(contact)}
        style={style}
      />
    );
  }, [contacts, selectedIds, onSelect, onViewDetails]);

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
    <div ref={containerRef} className="h-full flex flex-col bg-background border border-border rounded-lg overflow-hidden">
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
        <div className="flex-1 grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-2 text-[11px] font-medium text-muted-foreground">
          <span>Nombre</span>
          <span>Empresa</span>
          <span>Estado</span>
          <span>Canal</span>
          <span>Fecha</span>
          <span className="text-right">Valoración</span>
        </div>
      </div>

      {/* Virtualized List */}
      <List
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
