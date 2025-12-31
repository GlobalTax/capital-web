import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Link2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeadSearch, LeadSearchResult, getLeadTypeLabel } from './hooks/useLeadSearch';

interface LeadSearchSelectProps {
  value?: { id: string; type: string } | null;
  onChange: (lead: { id: string; type: string } | null) => void;
  placeholder?: string;
}

export const LeadSearchSelect = ({ value, onChange, placeholder = 'Buscar lead...' }: LeadSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const { searchTerm, setSearchTerm, results, isLoading } = useLeadSearch();
  const [selectedLead, setSelectedLead] = useState<LeadSearchResult | null>(null);

  const handleSelect = (lead: LeadSearchResult) => {
    setSelectedLead(lead);
    onChange({ id: lead.id, type: lead.type });
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedLead(null);
    onChange(null);
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between"
          >
            {selectedLead ? (
              <span className="flex items-center gap-2 truncate">
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{selectedLead.full_name}</span>
                <Badge variant="secondary" className="text-xs">
                  {getLeadTypeLabel(selectedLead.type)}
                </Badge>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Buscar por nombre, email o empresa..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Buscando...
                </div>
              )}
              {!isLoading && searchTerm.length >= 2 && results.length === 0 && (
                <CommandEmpty>No se encontraron leads.</CommandEmpty>
              )}
              {!isLoading && searchTerm.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar
                </div>
              )}
              {results.length > 0 && (
                <CommandGroup heading="Leads encontrados">
                  {results.map((lead) => (
                    <CommandItem
                      key={`${lead.type}-${lead.id}`}
                      value={`${lead.type}-${lead.id}`}
                      onSelect={() => handleSelect(lead)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedLead?.id === lead.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{lead.full_name}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {getLeadTypeLabel(lead.type)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {lead.email}
                          {lead.company && ` • ${lead.company}`}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedLead && (
        <Button variant="ghost" size="icon" onClick={handleClear} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
