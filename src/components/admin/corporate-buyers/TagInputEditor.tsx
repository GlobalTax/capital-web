// =============================================
// TAG INPUT EDITOR
// Reusable component for inline tag editing
// =============================================

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TagInputEditorProps {
  value: string[];
  onSave: (values: string[]) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
}

export function TagInputEditor({ 
  value, 
  onSave, 
  onCancel, 
  placeholder = "Añadir...",
  className 
}: TagInputEditorProps) {
  const [tags, setTags] = useState<string[]>(value);
  const [input, setInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(tags);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-2 mb-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 shrink-0"
          onClick={addTag}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border rounded-md bg-muted/30">
        {tags.length === 0 ? (
          <span className="text-xs text-muted-foreground">Sin elementos</span>
        ) : (
          tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 text-xs">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeTag(tag)} 
              />
            </Badge>
          ))
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1">
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Guardar
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
