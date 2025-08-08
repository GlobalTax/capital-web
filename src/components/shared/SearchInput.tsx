// ============= OPTIMIZED SEARCH INPUT =============
// Input de búsqueda con debounce y throttle optimizado

import React, { memo, useCallback, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
  trackPerformance?: boolean;
}

const SearchInputComponent = ({
  placeholder = "Buscar...",
  onSearch,
  debounceMs = 300,
  className = '',
  showClearButton = true,
  trackPerformance = false
}: SearchInputProps) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  // Callback debouncado para búsqueda
  const debouncedSearch = useDebouncedCallback(
    useCallback((searchQuery: string) => {
      if (trackPerformance) {
        const startTime = performance.now();
        try {
          onSearch(searchQuery);
          const duration = performance.now() - startTime;
          performanceMonitor.record('search-operation', duration, 'interaction');
        } catch (error) {
          const duration = performance.now() - startTime;
          performanceMonitor.record('search-operation-error', duration, 'interaction');
          throw error;
        }
      } else {
        onSearch(searchQuery);
      }
    }, [onSearch, trackPerformance]),
    debounceMs
  );

  // Efecto para ejecutar búsqueda cuando cambie el query debouncado
  React.useEffect(() => {
    debouncedSearch(debouncedQuery);
  }, [debouncedQuery, debouncedSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className="pl-10 pr-10"
        />
        {showClearButton && query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const SearchInput = memo(SearchInputComponent);