
import React, { useEffect, useRef } from 'react';
import { Search, Command } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from '@/components/ui/sidebar';

interface SearchFormProps {
  onSearch: (query: string) => void;
  value: string;
}

export function SearchForm({ onSearch, value }: SearchFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Atajo de teclado Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape para limpiar búsqueda
      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        onSearch('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch]);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Buscar funcionalidades
          </Label>
          <SidebarInput
            ref={inputRef}
            id="search"
            placeholder="Buscar... (⌘K)"
            className="pl-8"
            value={value}
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
          
          {/* Indicador de atajo de teclado */}
          <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 opacity-40">
            <div className="flex items-center gap-1 text-xs">
              <Command className="size-3" />
              <span>K</span>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
