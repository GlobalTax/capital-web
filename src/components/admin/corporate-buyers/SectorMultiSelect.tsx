// =============================================
// SECTOR MULTI-SELECT COMPONENT
// For editing corporate buyer target sectors
// =============================================

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

// Standard PE/M&A sectors (matching sectors table)
const STANDARD_SECTORS = [
  'Agricultura',
  'Alimentación y Bebidas',
  'Asesorías Profesionales',
  'Automoción',
  'Construcción',
  'Educación',
  'Energía y Renovables',
  'Farmacéutico',
  'Industrial y Manufacturero',
  'Inmobiliario',
  'Logística y Transporte',
  'Medios y Entretenimiento',
  'Químico',
  'Retail y Consumo',
  'Salud y Biotecnología',
  'Seguridad',
  'Servicios Financieros',
  'Tecnología',
  'Telecomunicaciones',
  'Textil y Moda',
  'Turismo y Hostelería',
  'Otros'
];

interface SectorMultiSelectProps {
  value: string[];
  onSave: (sectors: string[]) => Promise<void>;
  onCancel: () => void;
}

export function SectorMultiSelect({ value, onSave, onCancel }: SectorMultiSelectProps) {
  const [selected, setSelected] = useState<string[]>(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (sector: string) => {
    setSelected(prev => 
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selected);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <ScrollArea className="h-[200px] border rounded-md p-2">
        <div className="space-y-1">
          {STANDARD_SECTORS.map((sector) => (
            <label
              key={sector}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(sector)}
                onCheckedChange={() => handleToggle(sector)}
              />
              <span className="text-sm">{sector}</span>
            </label>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          className="flex-1 gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Guardar
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
