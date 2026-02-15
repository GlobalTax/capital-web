import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SectorIntelligenceRow } from '@/hooks/useSectorIntelligence';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: Partial<SectorIntelligenceRow> | null;
  onSave: (data: any) => void;
  isNew?: boolean;
}

export const SectorEditDialog: React.FC<Props> = ({ open, onOpenChange, row, onSave, isNew }) => {
  const [form, setForm] = React.useState<any>({});

  React.useEffect(() => {
    if (row) setForm({ ...row });
    else setForm({ sector: '', subsector: '', vertical: '', is_active: true });
  }, [row]);

  const handleSave = () => {
    const trimmed = { ...form, sector: form.sector?.trim(), subsector: form.subsector?.trim() };
    if (!trimmed.sector || !trimmed.subsector) return;
    onSave(trimmed);
    onOpenChange(false);
  };

  const fields: { key: string; label: string; type: 'input' | 'textarea' }[] = [
    { key: 'sector', label: 'Sector', type: 'input' },
    { key: 'subsector', label: 'Subsector', type: 'input' },
    { key: 'vertical', label: 'Vertical', type: 'input' },
    { key: 'pe_thesis', label: 'Tesis PE', type: 'textarea' },
    { key: 'quantitative_data', label: 'Datos cuantitativos', type: 'textarea' },
    { key: 'active_pe_firms', label: 'Firmas PE activas', type: 'textarea' },
    { key: 'platforms_operations', label: 'Plataformas / Operaciones', type: 'textarea' },
    { key: 'multiples_valuations', label: 'Múltiplos / Valoraciones', type: 'textarea' },
    { key: 'consolidation_phase', label: 'Fase de consolidación', type: 'input' },
    { key: 'geography', label: 'Geografía', type: 'input' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[hsl(var(--linear-bg))] border-[hsl(var(--linear-border))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--linear-text-primary))]">
            {isNew ? 'Nuevo subsector' : 'Editar subsector'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {fields.map(f => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs text-[hsl(var(--linear-text-secondary))]">{f.label}</Label>
              {f.type === 'input' ? (
                <Input
                  value={form[f.key] || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="bg-[hsl(var(--linear-bg-secondary))] border-[hsl(var(--linear-border))] text-[hsl(var(--linear-text-primary))] h-8 text-sm"
                />
              ) : (
                <Textarea
                  value={form[f.key] || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="bg-[hsl(var(--linear-bg-secondary))] border-[hsl(var(--linear-border))] text-[hsl(var(--linear-text-primary))] text-sm min-h-[80px]"
                />
              )}
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active ?? true}
              onCheckedChange={v => setForm({ ...form, is_active: v })}
            />
            <Label className="text-xs text-[hsl(var(--linear-text-secondary))]">Activo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">Cancelar</Button>
          <Button onClick={handleSave} size="sm">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
