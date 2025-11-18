import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, AtSign } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface NoteComposerProps {
  operationId: string;
  parentNoteId?: string;
  onSubmit: (data: {
    operation_id: string;
    note_text: string;
    is_internal: boolean;
    mentions: string[];
    parent_note_id?: string;
  }) => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

export const NoteComposer: React.FC<NoteComposerProps> = ({
  operationId,
  parentNoteId,
  onSubmit,
  isSubmitting,
  placeholder = 'Escribe una nota...',
}) => {
  const [noteText, setNoteText] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const { users: adminUsers } = useAdminUsers();

  const handleSubmit = () => {
    if (!noteText.trim()) return;

    onSubmit({
      operation_id: operationId,
      note_text: noteText,
      is_internal: isInternal,
      mentions,
      parent_note_id: parentNoteId,
    });

    setNoteText('');
    setMentions([]);
  };

  const handleMention = (userId: string) => {
    if (!mentions.includes(userId)) {
      setMentions([...mentions, userId]);
    }
    setShowMentions(false);
  };

  const removeMention = (userId: string) => {
    setMentions(mentions.filter((id) => id !== userId));
  };

  const getMentionedUsers = () => {
    return adminUsers.filter((user) => mentions.includes(user.user_id));
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
          }
        }}
      />

      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getMentionedUsers().map((user) => (
            <Badge key={user.user_id} variant="secondary" className="gap-1">
              <AtSign className="h-3 w-3" />
              {user.full_name || user.email}
              <button
                onClick={() => removeMention(user.user_id)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="internal"
              checked={isInternal}
              onCheckedChange={setIsInternal}
            />
            <Label htmlFor="internal" className="text-sm">
              {isInternal ? 'Nota interna' : 'Compartible'}
            </Label>
          </div>

          <Popover open={showMentions} onOpenChange={setShowMentions}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <AtSign className="h-4 w-4 mr-2" />
                Mencionar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Buscar usuario..." />
                <CommandEmpty>No se encontraron usuarios</CommandEmpty>
                <CommandGroup>
                  {adminUsers.map((user) => (
                    <CommandItem
                      key={user.user_id}
                      onSelect={() => handleMention(user.user_id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user.full_name || user.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!noteText.trim() || isSubmitting}
          size="sm"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: Presiona Ctrl+Enter para enviar rápidamente
      </p>
    </div>
  );
};
