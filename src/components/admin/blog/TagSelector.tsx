// ============= TAG SELECTOR COMPONENT =============
// Selector de tags con autocompletado y chips visuales

import { useState, useRef, useEffect } from 'react';
import { X, Tag, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBlogTags, MASTER_TAGS, MAX_TAGS_PER_POST } from '@/hooks/useBlogTags';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  category?: string;
  maxTags?: number;
  className?: string;
}

const TagSelector = ({
  selectedTags = [],
  onChange,
  category,
  maxTags = MAX_TAGS_PER_POST,
  className,
}: TagSelectorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { searchTags, suggestTagsForCategory, mapToOfficialTag } = useBlogTags();

  // Filtrar sugerencias
  const suggestions = inputValue.trim()
    ? searchTags(inputValue).filter(tag => !selectedTags.includes(tag))
    : (category ? suggestTagsForCategory(category) : MASTER_TAGS.slice(0, 8))
        .filter(tag => !selectedTags.includes(tag));

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Añadir tag
  const addTag = (tag: string) => {
    if (selectedTags.length >= maxTags) return;
    
    const normalizedTag = mapToOfficialTag(tag);
    if (!selectedTags.includes(normalizedTag)) {
      onChange([...selectedTags, normalizedTag]);
    }
    setInputValue('');
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  // Eliminar tag
  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        addTag(suggestions[highlightedIndex]);
      } else {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const canAddMore = selectedTags.length < maxTags;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <label className="text-xs font-medium text-muted-foreground mb-2 block">
        Etiquetas ({selectedTags.length}/{maxTags})
      </label>
      
      {/* Tags seleccionados + Input */}
      <div 
        className={cn(
          'flex flex-wrap gap-1.5 p-2 rounded-md border bg-background min-h-[42px] cursor-text',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 pr-1 text-xs"
          >
            <Tag className="h-3 w-3" />
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {canAddMore && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? 'Buscar o añadir tag...' : ''}
            className="flex-1 min-w-[120px] border-0 p-0 h-6 text-sm focus-visible:ring-0 bg-transparent"
          />
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && suggestions.length > 0 && canAddMore && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-auto">
          {inputValue.trim() && !suggestions.some(s => s.toLowerCase() === inputValue.toLowerCase()) && (
            <button
              type="button"
              onClick={() => addTag(inputValue.trim())}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 border-b"
            >
              <Plus className="h-3 w-3" />
              Crear "{inputValue.trim()}"
            </button>
          )}
          
          {suggestions.map((tag, index) => {
            const isMasterTag = MASTER_TAGS.includes(tag as any);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center justify-between',
                  index === highlightedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                )}
              >
                <span className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {tag}
                </span>
                {isMasterTag && (
                  <span className="text-xs text-muted-foreground">oficial</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Tags sugeridos cuando está vacío */}
      {selectedTags.length === 0 && !isOpen && (
        <div className="mt-2">
          <span className="text-xs text-muted-foreground">Sugeridos: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {(category ? suggestTagsForCategory(category) : MASTER_TAGS.slice(0, 4))
              .slice(0, 4)
              .map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="text-xs px-2 py-0.5 rounded border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  + {tag}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Mensaje de límite alcanzado */}
      {!canAddMore && (
        <p className="text-xs text-muted-foreground mt-1">
          Límite de {maxTags} tags alcanzado
        </p>
      )}
    </div>
  );
};

export default TagSelector;
