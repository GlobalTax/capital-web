import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface AuthorSelectorProps {
  authorName: string;
  authorAvatarUrl?: string;
  onAuthorChange: (name: string, avatarUrl?: string) => void;
  className?: string;
}

const AuthorSelector: React.FC<AuthorSelectorProps> = ({
  authorName,
  authorAvatarUrl,
  onAuthorChange,
  className = ""
}) => {
  const { teamMembers, isLoading } = useTeamMembers();

  const handleAuthorSelect = (selectedName: string) => {
    if (selectedName === 'Equipo Capittal') {
      onAuthorChange('Equipo Capittal', '');
    } else {
      const selectedMember = teamMembers.find(member => member.name === selectedName);
      onAuthorChange(selectedName, selectedMember?.image_url || '');
    }
  };

  const getAuthorAvatar = () => {
    if (authorName === 'Equipo Capittal') {
      return { name: 'Equipo Capittal', avatarUrl: '', position: 'Equipo' };
    }
    const member = teamMembers.find(m => m.name === authorName);
    return {
      name: authorName,
      avatarUrl: member?.image_url || authorAvatarUrl || '',
      position: member?.position || ''
    };
  };

  const author = getAuthorAvatar();

  return (
    <div className={className}>
      <Label className="text-sm font-medium">Autor</Label>
      <div className="space-y-3 mt-2">
        {/* Selected Author Display */}
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatarUrl} alt={author.name} />
            <AvatarFallback>
              {author.name === 'Equipo Capittal' ? (
                <User className="h-5 w-5" />
              ) : (
                author.name.split(' ').map(n => n[0]).join('').toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{author.name}</p>
            {author.position && (
              <p className="text-xs text-muted-foreground">{author.position}</p>
            )}
          </div>
        </div>

        {/* Author Selector */}
        <Select value={authorName} onValueChange={handleAuthorSelect} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccionar autor"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Equipo Capittal">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">Equipo Capittal</p>
                  <p className="text-xs text-muted-foreground">Por defecto</p>
                </div>
              </div>
            </SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.name}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.image_url || ''} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{member.name}</p>
                    {member.position && (
                      <p className="text-xs text-muted-foreground">{member.position}</p>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AuthorSelector;