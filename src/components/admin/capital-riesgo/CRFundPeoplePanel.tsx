// ============= CR FUND PEOPLE PANEL =============
// Panel de personas asociadas a un fund de Capital Riesgo

import React from 'react';
import { Plus, Pencil, Trash2, Mail, Linkedin, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CRPerson, CRPersonRoleLabels } from '@/types/capitalRiesgo';

interface CRFundPeoplePanelProps {
  people: CRPerson[];
  onAdd: () => void;
  onEdit: (person: CRPerson) => void;
  onDelete: (person: CRPerson) => void;
}

const roleColors: Record<string, string> = {
  partner: 'bg-purple-500/10 text-purple-700',
  principal: 'bg-blue-500/10 text-blue-700',
  director: 'bg-teal-500/10 text-teal-700',
  associate: 'bg-green-500/10 text-green-700',
  analyst: 'bg-amber-500/10 text-amber-700',
  operating_partner: 'bg-orange-500/10 text-orange-700',
  advisor: 'bg-slate-500/10 text-slate-700',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CRFundPeoplePanel({ people, onAdd, onEdit, onDelete }: CRFundPeoplePanelProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Personas</h3>
          <Badge variant="secondary" className="text-xs">
            {people.length}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAdd}>
          <Plus className="h-3 w-3 mr-1" />
          Añadir
        </Button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_120px_140px_100px_60px] gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b">
        <div>NOMBRE</div>
        <div>ROL</div>
        <div>EMAIL</div>
        <div>UBICACIÓN</div>
        <div className="text-right">ACCIONES</div>
      </div>

      {/* People list */}
      {people.length > 0 ? (
        <div className="divide-y">
          {people.map((person) => {
            const roleColor = roleColors[person.role] || 'bg-muted';
            
            return (
              <div
                key={person.id}
                className="grid grid-cols-[1fr_120px_140px_100px_60px] gap-2 items-center px-3 py-2 hover:bg-muted/50 group transition-colors"
              >
                {/* Nombre con avatar */}
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(person.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium truncate">{person.full_name}</span>
                      {person.is_primary_contact && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                          Principal
                        </Badge>
                      )}
                    </div>
                    {person.linkedin_url && (
                      <a
                        href={person.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="h-2.5 w-2.5" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                {/* Rol */}
                <div>
                  <Badge className={`${roleColor} text-[10px] font-normal border-0`}>
                    {CRPersonRoleLabels[person.role] || person.role}
                  </Badge>
                </div>

                {/* Email */}
                <div className="min-w-0">
                  {person.email ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{person.email}</span>
                      {person.is_email_verified && (
                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                {/* Ubicación */}
                <div>
                  {person.location ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{person.location}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onEdit(person)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => onDelete(person)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No hay personas asociadas</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onAdd}>
            <Plus className="h-3 w-3 mr-1" />
            Añadir primera persona
          </Button>
        </div>
      )}
    </div>
  );
}
