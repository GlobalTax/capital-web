import { useState } from 'react';
import { Check, ChevronsUpDown, User, UserMinus } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAdminUsers } from '@/hooks/useAdminUsers';

interface AdvisorSelectorProps {
  value: string | null;
  onChange: (userId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  showUnassign?: boolean;
}

export const AdvisorSelector = ({ 
  value, 
  onChange, 
  disabled = false,
  placeholder = 'Asignar asesor',
  showUnassign = true
}: AdvisorSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { users: adminUsers, isLoading } = useAdminUsers();

  const selectedUser = adminUsers.find(u => u.user_id === value);

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(selectedUser.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedUser.full_name || selectedUser.email}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar asesor..." />
          <CommandList>
            <CommandEmpty>No se encontraron asesores.</CommandEmpty>
            <CommandGroup>
              {showUnassign && value && (
                <CommandItem
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Sin asignar
                </CommandItem>
              )}
              {adminUsers
                .filter(u => u.is_active)
                .map((user) => (
                  <CommandItem
                    key={user.user_id}
                    value={user.full_name || user.email}
                    onSelect={() => {
                      onChange(user.user_id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.user_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user.full_name || user.email}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
