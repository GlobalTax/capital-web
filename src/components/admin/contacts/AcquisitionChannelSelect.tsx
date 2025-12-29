import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, ChevronsUpDown, Plus, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useAcquisitionChannels, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  type ChannelCategory,
  type AcquisitionChannel,
} from '@/hooks/useAcquisitionChannels';
import { useToast } from '@/hooks/use-toast';

interface AcquisitionChannelSelectProps {
  value?: string | null;
  onChange: (channelId: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export const AcquisitionChannelSelect: React.FC<AcquisitionChannelSelectProps> = ({
  value,
  onChange,
  disabled,
  className,
}) => {
  const { toast } = useToast();
  const { channels, channelsByCategory, isLoading, createChannel } = useAcquisitionChannels();
  const [open, setOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ChannelCategory>('paid');

  const selectedChannel = channels.find(c => c.id === value);

  const handleCreateChannel = async () => {
    if (!newName.trim()) return;

    try {
      await createChannel.mutateAsync({ name: newName.trim(), category: newCategory });
      toast({ title: 'Canal creado', description: `"${newName}" añadido correctamente` });
      setNewName('');
      setShowNewForm(false);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear el canal', variant: 'destructive' });
    }
  };

  const handleSelect = (channelId: string) => {
    onChange(channelId === value ? null : channelId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between h-9 font-normal border-[hsl(var(--linear-border))]",
            !selectedChannel && "text-muted-foreground",
            className
          )}
        >
          {selectedChannel ? (
            <div className="flex items-center gap-2 truncate">
              <Megaphone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{selectedChannel.name}</span>
              <Badge 
                variant="outline" 
                className={cn("h-5 text-[10px] shrink-0", CATEGORY_COLORS[selectedChannel.category])}
              >
                {CATEGORY_LABELS[selectedChannel.category]}
              </Badge>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <Megaphone className="h-3.5 w-3.5" />
              Seleccionar canal...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar canal..." />
          <CommandList>
            <CommandEmpty>
              No se encontraron canales.
            </CommandEmpty>
            
            {Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
              <CommandGroup 
                key={category} 
                heading={CATEGORY_LABELS[category as ChannelCategory]}
              >
                {categoryChannels.map((channel) => (
                  <CommandItem
                    key={channel.id}
                    value={channel.name}
                    onSelect={() => handleSelect(channel.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === channel.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{channel.name}</span>
                    <Badge 
                      variant="outline" 
                      className={cn("h-5 text-[10px] ml-2", CATEGORY_COLORS[channel.category])}
                    >
                      {CATEGORY_LABELS[channel.category]}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            
            <CommandSeparator />
            
            {/* Add new channel inline */}
            <div className="p-2">
              {showNewForm ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Nombre del canal..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateChannel();
                      if (e.key === 'Escape') setShowNewForm(false);
                    }}
                  />
                  <Select value={newCategory} onValueChange={(v) => setNewCategory(v as ChannelCategory)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7"
                      onClick={() => setShowNewForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-7"
                      onClick={handleCreateChannel}
                      disabled={!newName.trim() || createChannel.isPending}
                    >
                      {createChannel.isPending ? 'Creando...' : 'Crear'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-muted-foreground"
                  onClick={() => setShowNewForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir nuevo canal
                </Button>
              )}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
