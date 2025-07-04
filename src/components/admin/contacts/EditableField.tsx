import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string;
  placeholder?: string;
  label?: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  placeholder,
  label,
  onSave,
  className,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editValue !== value) {
      setIsSaving(true);
      try {
        await onSave(editValue);
      } catch (error) {
        console.error('Error saving field:', error);
        setEditValue(value); // Revert on error
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow clicking save/cancel buttons
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 150);
  };

  if (isEditing) {
    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <label className="text-sm text-gray-600">{label}</label>
        )}
        <div className="relative">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="pr-16"
            disabled={isSaving}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="p-1 hover:bg-green-100 rounded text-green-600"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="text-sm text-gray-600">{label}</label>
      )}
      <div
        onClick={handleEdit}
        className={cn(
          "min-h-[40px] px-3 py-2 border border-transparent rounded-md cursor-pointer",
          "hover:border-gray-300 hover:bg-gray-50 transition-colors",
          "flex items-center text-sm",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {value || (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>
    </div>
  );
};