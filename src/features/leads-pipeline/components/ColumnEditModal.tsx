/**
 * Modal for editing or creating pipeline columns
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLeadPipelineColumns, type LeadPipelineColumn } from '../hooks/useLeadPipelineColumns';

// Available icons
const AVAILABLE_ICONS = [
  '📥', '📞', '✅', '📋', '🔒', '📄', '📝', '🤝', '✍️', '⏸️', '🏆', '❌',
  '📧', '💼', '🎯', '⭐', '🔔', '📊', '💡', '🚀', '⚡', '🔥', '💪', '📦',
  '🎉', '✨', '💎', '🏅', '🎖️', '🌟', '💰', '📈',
];

// Available colors
const AVAILABLE_COLORS = [
  { value: 'bg-blue-500', label: 'Azul' },
  { value: 'bg-yellow-500', label: 'Amarillo' },
  { value: 'bg-green-500', label: 'Verde' },
  { value: 'bg-orange-500', label: 'Naranja' },
  { value: 'bg-red-500', label: 'Rojo' },
  { value: 'bg-red-400', label: 'Rojo claro' },
  { value: 'bg-purple-500', label: 'Púrpura' },
  { value: 'bg-indigo-500', label: 'Índigo' },
  { value: 'bg-emerald-500', label: 'Esmeralda' },
  { value: 'bg-emerald-600', label: 'Esmeralda oscuro' },
  { value: 'bg-gray-500', label: 'Gris' },
  { value: 'bg-slate-400', label: 'Pizarra' },
  { value: 'bg-pink-500', label: 'Rosa' },
  { value: 'bg-cyan-500', label: 'Cian' },
  { value: 'bg-teal-500', label: 'Turquesa' },
  { value: 'bg-amber-500', label: 'Ámbar' },
];

interface ColumnEditModalProps {
  column: LeadPipelineColumn | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ColumnEditModal: React.FC<ColumnEditModalProps> = ({
  column,
  isOpen,
  onClose,
}) => {
  const { updateColumn, addColumn, isUpdating, isAdding } = useLeadPipelineColumns();

  const [label, setLabel] = useState('');
  const [stageKey, setStageKey] = useState('');
  const [icon, setIcon] = useState('📋');
  const [color, setColor] = useState('bg-gray-500');

  const isEditing = !!column;
  const isLoading = isUpdating || isAdding;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (column) {
        setLabel(column.label);
        setStageKey(column.stage_key);
        setIcon(column.icon);
        setColor(column.color);
      } else {
        setLabel('');
        setStageKey('');
        setIcon('📋');
        setColor('bg-gray-500');
      }
    }
  }, [isOpen, column]);

  // Auto-generate stage_key from label
  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!isEditing) {
      // Generate stage key: lowercase, no accents, underscores
      const key = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      setStageKey(key);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!label.trim() || !stageKey.trim()) return;

    if (isEditing && column) {
      updateColumn({
        id: column.id,
        updates: { label, icon, color },
      }, {
        onSuccess: () => onClose(),
      });
    } else {
      addColumn({
        stage_key: stageKey,
        label,
        icon,
        color,
      }, {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Columna' : 'Nueva Columna'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Modifica el nombre, icono o color de la columna'
                : 'Crea una nueva columna para el pipeline'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Label */}
            <div className="grid gap-2">
              <Label htmlFor="label">Nombre</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Ej: En revisión"
                required
              />
            </div>

            {/* Stage Key (only for new columns) */}
            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="stageKey">
                  Clave interna
                  <span className="text-muted-foreground text-xs ml-2">
                    (se genera automáticamente)
                  </span>
                </Label>
                <Input
                  id="stageKey"
                  value={stageKey}
                  onChange={(e) => setStageKey(e.target.value)}
                  placeholder="en_revision"
                  required
                  pattern="[a-z0-9_]+"
                  title="Solo letras minúsculas, números y guiones bajos"
                />
              </div>
            )}

            {/* Icon Selector */}
            <div className="grid gap-2">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-1 p-2 border rounded-md max-h-[100px] overflow-y-auto">
                {AVAILABLE_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`
                      w-8 h-8 flex items-center justify-center rounded text-lg
                      hover:bg-muted transition-colors
                      ${icon === emoji ? 'bg-primary/10 ring-2 ring-primary' : ''}
                    `}
                    onClick={() => setIcon(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full ${c.value}
                      hover:scale-110 transition-transform
                      ${color === c.value ? 'ring-2 ring-offset-2 ring-foreground' : ''}
                    `}
                    onClick={() => setColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="grid gap-2">
              <Label>Vista previa</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                <span className="text-lg">{icon}</span>
                <span className="font-medium">{label || 'Nombre de la columna'}</span>
                <div className={`w-3 h-3 rounded-full ml-auto ${color}`} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !label.trim()}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear columna'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
