import React from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { PE_SECTORS, PE_SECTOR_BY_ID } from '@/constants/peSectors';

interface PESectorSelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  showEnglish?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const PESectorSelect: React.FC<PESectorSelectProps> = ({
  value,
  onChange,
  multiple = false,
  showEnglish = false,
  placeholder = 'Seleccionar sector...',
  disabled = false,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value as string] : [];
  }, [value, multiple]);

  const getDisplayLabel = (sectorId: string) => {
    const sector = PE_SECTOR_BY_ID[sectorId];
    return sector ? (showEnglish ? sector.nameEn : sector.nameEs) : sectorId;
  };

  const handleSelect = (sectorId: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(sectorId)
        ? currentValues.filter(v => v !== sectorId)
        : [...currentValues, sectorId];
      onChange(newValues);
    } else {
      onChange(sectorId === value ? '' : sectorId);
      setOpen(false);
    }
  };

  const renderTriggerContent = () => {
    if (selectedValues.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    if (multiple && selectedValues.length > 2) {
      return (
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">
            {selectedValues.length} sectores
          </Badge>
        </div>
      );
    }

    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map(v => (
            <Badge key={v} variant="secondary" className="text-xs">
              {getDisplayLabel(v)}
            </Badge>
          ))}
        </div>
      );
    }

    return getDisplayLabel(selectedValues[0]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            selectedValues.length === 0 && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0 opacity-50" />
            {renderTriggerContent()}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar sector..." />
          <CommandList>
            <CommandEmpty>No se encontró ningún sector.</CommandEmpty>
            <CommandGroup>
              {PE_SECTORS.map((sector) => {
                const isSelected = selectedValues.includes(sector.id);
                return (
                  <CommandItem
                    key={sector.id}
                    value={`${sector.nameEs} ${sector.nameEn}`}
                    onSelect={() => handleSelect(sector.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className={cn(isSelected && 'font-medium')}>
                        {showEnglish ? sector.nameEn : sector.nameEs}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {showEnglish ? sector.nameEs : sector.nameEn}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PESectorSelect;
