import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { useLogoUpload } from '@/hooks/useLogoUpload';
import type { BlockConfig, TextAlign, TextValign } from '../types/slideTemplate';

interface SlideBlockPropertiesProps {
  selectedBlock: string | null;
  blockLabel: string;
  block: BlockConfig | null;
  onUpdate: (patch: Partial<BlockConfig>) => void;
}

export const SlideBlockProperties = ({ selectedBlock, blockLabel, block, onUpdate }: SlideBlockPropertiesProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadLogo, isUploading } = useLogoUpload();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadLogo(file);
    if (url) {
      onUpdate({ imageUrl: url } as any);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  if (!selectedBlock || !block) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
        Selecciona un bloque en la preview para editar sus propiedades
      </div>
    );
  }

  const numField = (key: 'x' | 'y' | 'w' | 'h' | 'fontSize' | 'rectRadius', lbl: string, step = 0.1) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{lbl}</Label>
      <Input
        type="number"
        step={step}
        min={0}
        value={(block as any)[key] ?? ''}
        onChange={e => onUpdate({ [key]: parseFloat(e.target.value) || 0 } as any)}
        className="h-8 text-xs"
      />
    </div>
  );

  const colorField = (key: 'color' | 'bgColor', label: string) => {
    const val = (block as any)[key];
    if (val === undefined) return null;
    return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={`#${val}`}
            onChange={e => onUpdate({ [key]: e.target.value.replace('#', '') } as any)}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <Input
            value={val}
            onChange={e => onUpdate({ [key]: e.target.value.replace('#', '') } as any)}
            className="h-8 text-xs font-mono flex-1"
            maxLength={6}
            placeholder="161B22"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 overflow-y-auto h-full">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{blockLabel}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Ajusta posición, tamaño y estilo</p>
      </div>

      {/* Visible toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Visible</Label>
        <Switch checked={block.visible} onCheckedChange={v => onUpdate({ visible: v })} />
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

      {/* Alignment */}
      {block.align !== undefined && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alineación Horizontal</p>
          <Select value={block.align || 'left'} onValueChange={(v: TextAlign) => onUpdate({ align: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Izquierda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Derecha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {block.valign !== undefined && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alineación Vertical</p>
          <Select value={block.valign || 'top'} onValueChange={(v: TextValign) => onUpdate({ valign: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Arriba</SelectItem>
              <SelectItem value="middle">Centro</SelectItem>
              <SelectItem value="bottom">Abajo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Line Spacing */}
      {block.lineSpacing !== undefined && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Interlineado ({block.lineSpacing?.toFixed(1)})
          </p>
          <Slider
            value={[block.lineSpacing || 1.0]}
            onValueChange={([v]) => onUpdate({ lineSpacing: parseFloat(v.toFixed(1)) })}
            min={0.8}
            max={2.5}
            step={0.1}
            className="w-full"
          />
        </div>
      )}

      {/* Border Radius */}
      {block.rectRadius !== undefined && (
        <div>
          {numField('rectRadius', 'Radio bordes (in)', 0.01)}
        </div>
      )}

      {/* Color */}
      {colorField('color', 'Color de Texto')}

      {/* Background Color */}
      {colorField('bgColor', 'Color de Fondo')}

      {/* Bold */}
      {block.bold !== undefined && (
        <div className="flex items-center justify-between">
          <Label className="text-xs">Negrita</Label>
          <Switch checked={block.bold} onCheckedChange={v => onUpdate({ bold: v })} />
        </div>
      )}

      {/* Italic */}
      {block.italic !== undefined && (
        <div className="flex items-center justify-between">
          <Label className="text-xs">Cursiva</Label>
          <Switch checked={block.italic} onCheckedChange={v => onUpdate({ italic: v })} />
        </div>
      )}

      {/* Image URL (for logo blocks) */}
      {'imageUrl' in block && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Logo</Label>
          <div className="flex gap-1">
            <Input
              value={(block as any).imageUrl || ''}
              onChange={e => onUpdate({ imageUrl: e.target.value } as any)}
              className="h-8 text-xs flex-1"
              placeholder="URL o sube desde tu escritorio"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-3.5 w-3.5" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileUpload}
            className="hidden"
          />
          {isUploading && (
            <p className="text-xs text-muted-foreground">Subiendo...</p>
          )}
          {(block as any).imageUrl && (
            <div className="mt-2 p-2 border border-border rounded bg-muted/30">
              <img
                src={(block as any).imageUrl}
                alt="Logo preview"
                className="max-h-12 max-w-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}
        </div>
      )}

      {/* Custom text */}
      {'text' in block && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Texto</Label>
          <Input
            value={(block as any).text || ''}
            onChange={e => onUpdate({ text: e.target.value } as any)}
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  );
};
