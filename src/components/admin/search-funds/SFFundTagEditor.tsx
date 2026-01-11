import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SFFundTagEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  variant?: 'default' | 'destructive';
}

export function SFFundTagEditor({ 
  value, 
  onChange, 
  placeholder = 'Añadir...', 
  variant = 'default' 
}: SFFundTagEditorProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemove = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
  };

  return (
    <div className="space-y-2">
      {/* Tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge 
              key={tag} 
              variant={variant === 'destructive' ? 'destructive' : 'secondary'}
              className={cn(
                "gap-1 pr-1",
                variant === 'default' && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="ml-0.5 hover:bg-primary/20 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
