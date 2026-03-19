import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { SlideTemplate, SlideBlockKey } from '../types/slideTemplate';
import { BLOCK_LABELS } from '../types/slideTemplate';

interface SlideBlockPropertiesProps {
  selectedBlock: SlideBlockKey | null;
  template: SlideTemplate;
  onChange: (template: SlideTemplate) => void;
}

export const SlideBlockProperties = ({ selectedBlock, template, onChange }: SlideBlockPropertiesProps) => {
  if (!selectedBlock) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
        Selecciona un bloque en la preview para editar sus propiedades
      </div>
    );
  }

  const block = template[selectedBlock];
  const label = BLOCK_LABELS[selectedBlock];

  const update = (patch: Partial<typeof block>) => {
    onChange({ ...template, [selectedBlock]: { ...block, ...patch } });
  };

  const numField = (key: 'x' | 'y' | 'w' | 'h' | 'fontSize', lbl: string, step = 0.1) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{lbl}</Label>
      <Input
        type="number"
        step={step}
        min={0}
        value={(block as any)[key] ?? ''}
        onChange={e => update({ [key]: parseFloat(e.target.value) || 0 } as any)}
        className="h-8 text-xs"
      />
    </div>
  );

  return (
    <div className="space-y-4 p-4 overflow-y-auto h-full">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Ajusta posición, tamaño y estilo</p>
      </div>

      {/* Visible toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Visible</Label>
        <Switch checked={block.visible} onCheckedChange={v => update({ visible: v })} />
      </div>

      {/* Position */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Posición (pulgadas)</p>
        <div className="grid grid-cols-2 gap-2">
          {numField('x', 'X')}
          {numField('y', 'Y')}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tamaño (pulgadas)</p>
        <div className="grid grid-cols-2 gap-2">
          {numField('w', 'Ancho')}
          {numField('h', 'Alto')}
        </div>
      </div>

      {/* Font size */}
      {block.fontSize !== undefined && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tipografía</p>
          {numField('fontSize', 'Tamaño (pt)', 1)}
        </div>
      )}

      {/* Color */}
      {block.color !== undefined && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Color</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={`#${block.color}`}
              onChange={e => update({ color: e.target.value.replace('#', '') })}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <Input
              value={block.color}
              onChange={e => update({ color: e.target.value.replace('#', '') })}
              className="h-8 text-xs font-mono flex-1"
              maxLength={6}
              placeholder="161B22"
            />
          </div>
        </div>
      )}

      {/* Bold */}
      {block.bold !== undefined && (
        <div className="flex items-center justify-between">
          <Label className="text-xs">Negrita</Label>
          <Switch checked={block.bold} onCheckedChange={v => update({ bold: v })} />
        </div>
      )}

      {/* Custom text (cta, footer) */}
      {'text' in block && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Texto</Label>
          <Input
            value={(block as any).text || ''}
            onChange={e => update({ text: e.target.value } as any)}
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  );
};
