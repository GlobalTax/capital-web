/**
 * Modal para crear o editar estados de contactos
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
import { useContactStatuses, STATUS_COLOR_MAP, type ContactStatus } from '@/hooks/useContactStatuses';

// Available icons
const AVAILABLE_ICONS = [
  '📥', '📞', '✅', '📋', '🔒', '📄', '📝', '🤝', '✍️', '⏸️', '🏆', '❌',
  '📧', '💼', '🎯', '⭐', '🔔', '📊', '💡', '🚀', '⚡', '🔥', '💪', '📦',
  '🎉', '✨', '💎', '🏅', '🎖️', '🌟', '💰', '📈',
];

// Available colors (keys from STATUS_COLOR_MAP)
const AVAILABLE_COLORS = [
  { value: 'blue', label: 'Azul' },
  { value: 'purple', label: 'Púrpura' },
  { value: 'cyan', label: 'Cian' },
  { value: 'indigo', label: 'Índigo' },
  { value: 'orange', label: 'Naranja' },
  { value: 'yellow', label: 'Amarillo' },
  { value: 'green', label: 'Verde' },
  { value: 'red', label: 'Rojo' },
  { value: 'gray', label: 'Gris' },
  { value: 'emerald', label: 'Esmeralda' },
  { value: 'slate', label: 'Pizarra' },
  { value: 'amber', label: 'Ámbar' },
  { value: 'teal', label: 'Turquesa' },
  { value: 'pink', label: 'Rosa' },
];

interface StatusEditModalProps {
  status: ContactStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StatusEditModal: React.FC<StatusEditModalProps> = ({
  status,
  isOpen,
  onClose,
}) => {
  const { updateStatus, addStatus, isUpdating, isAdding } = useContactStatuses();

  const [label, setLabel] = useState('');
  const [statusKey, setStatusKey] = useState('');
  const [icon, setIcon] = useState('📋');
  const [color, setColor] = useState('gray');

  const isEditing = !!status;
  const isLoading = isUpdating || isAdding;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (status) {
        setLabel(status.label);
        setStatusKey(status.status_key);
        setIcon(status.icon);
        setColor(status.color);
      } else {
        setLabel('');
        setStatusKey('');
        setIcon('📋');
        setColor('gray');
      }
    }
  }, [isOpen, status]);

  // Auto-generate status_key from label
  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!isEditing) {
      // Generate status key: lowercase, no accents, underscores
      const key = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      setStatusKey(key);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim() || !statusKey.trim()) return;

    if (isEditing && status) {
      updateStatus(
        {
          id: status.id,
          updates: { label, icon, color },
        },
        {
          onSuccess: () => onClose(),
        }
      );
    } else {
      addStatus(
        {
          status_key: statusKey,
          label,
          icon,
          color,
        },
        {
          onSuccess: () => onClose(),
        }
      );
    }
  };

  const getColorClasses = (colorKey: string) => {
    return STATUS_COLOR_MAP[colorKey] || STATUS_COLOR_MAP.gray;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Estado' : 'Nuevo Estado'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica el nombre, icono o color del estado'
                : 'Crea un nuevo estado para los contactos'}
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

            {/* Status Key (only for new statuses) */}
            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="statusKey">
                  Clave interna
                  <span className="text-muted-foreground text-xs ml-2">
                    (se genera automáticamente)
                  </span>
                </Label>
                <Input
                  id="statusKey"
                  value={statusKey}
                  onChange={(e) => setStatusKey(e.target.value)}
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
              <div className="flex flex-wrap gap-1 p-2 border rounded-md max-h-[100px] overflow-y-auto bg-background">
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
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
                {AVAILABLE_COLORS.map((c) => {
                  const classes = getColorClasses(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      className={`
                        px-3 py-1 rounded text-xs font-medium
                        ${classes.bg} ${classes.text}
                        hover:scale-105 transition-transform
                        ${color === c.value ? 'ring-2 ring-offset-1 ring-foreground' : ''}
                      `}
                      onClick={() => setColor(c.value)}
                      title={c.label}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="grid gap-2">
              <Label>Vista previa</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                <span className="text-lg">{icon}</span>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${getColorClasses(color).bg} ${getColorClasses(color).text}`}
                >
                  {label || 'Nombre del estado'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !label.trim()}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear estado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
