import { useState } from 'react';
import { Check, ChevronsUpDown, Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useContactsForBooking, ContactForBooking } from './hooks/useContactsForBooking';

interface ContactSelectorProps {
  onSelect: (contact: ContactForBooking | null) => void;
  selectedContact: ContactForBooking | null;
  disabled?: boolean;
}

const getStatusBadge = (status: string | null) => {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    nuevo: { label: 'Nuevo', variant: 'default' },
    contactado: { label: 'Contactado', variant: 'secondary' },
    cualificado: { label: 'Cualificado', variant: 'outline' },
    perdido: { label: 'Perdido', variant: 'outline' },
  };
  
  const config = statusConfig[status || 'nuevo'] || { label: status || 'Nuevo', variant: 'secondary' as const };
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
};

export const ContactSelector = ({ onSelect, selectedContact, disabled }: ContactSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: contacts, isLoading } = useContactsForBooking(searchTerm);

  const handleSelect = (contact: ContactForBooking | null) => {
    onSelect(contact);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 py-2"
          disabled={disabled}
        >
          {selectedContact ? (
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">{selectedContact.full_name}</span>
              <span className="text-xs text-muted-foreground">
                {selectedContact.company && `${selectedContact.company} · `}
                {selectedContact.email}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar contacto existente...
            </span>
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
            <CommandEmpty>
              {isLoading ? 'Buscando...' : 'No se encontraron contactos'}
            </CommandEmpty>
            
            <CommandGroup>
              <CommandItem
                onSelect={() => handleSelect(null)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span>Introducir datos manualmente</span>
                {!selectedContact && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
            </CommandGroup>
            
            <CommandSeparator />
            
            <CommandGroup heading="Contactos">
              {contacts?.map((contact) => (
                <CommandItem
                  key={contact.id}
                  onSelect={() => handleSelect(contact)}
                  className="flex flex-col items-start py-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{contact.full_name}</span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(contact.status)}
                      {selectedContact?.id === contact.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contact.company && <span>{contact.company} · </span>}
                    {contact.email}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
