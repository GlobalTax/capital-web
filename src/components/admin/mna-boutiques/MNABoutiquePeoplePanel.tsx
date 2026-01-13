import { useState } from 'react';
import { Plus, Linkedin, Mail, Phone, MoreHorizontal, Trash2, Pencil, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDeleteMNABoutiquePerson } from '@/hooks/useMNABoutiquePeople';
import { MNAPersonForm } from './MNAPersonForm';
import type { MNABoutiquePerson } from '@/types/mnaBoutique';
import { MNA_PERSON_ROLE_LABELS } from '@/types/mnaBoutique';

interface MNABoutiquePeoplePanelProps {
  boutiqueId: string;
  people: MNABoutiquePerson[];
}

export function MNABoutiquePeoplePanel({ boutiqueId, people }: MNABoutiquePeoplePanelProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<MNABoutiquePerson | null>(null);
  const deleteMutation = useDeleteMNABoutiquePerson();

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta persona?')) {
      deleteMutation.mutate(id);
    }
  };

  // Sort: primary contacts first, then by role hierarchy
  const roleOrder = ['partner', 'managing_director', 'director', 'vp', 'associate', 'analyst', 'other'];
  const sortedPeople = [...people].sort((a, b) => {
    if (a.is_primary_contact !== b.is_primary_contact) {
      return a.is_primary_contact ? -1 : 1;
    }
    const aOrder = roleOrder.indexOf(a.role || 'other');
    const bOrder = roleOrder.indexOf(b.role || 'other');
    return aOrder - bOrder;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-normal">Equipo ({people.length})</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Añadir persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir persona</DialogTitle>
            </DialogHeader>
            <MNAPersonForm 
              boutiqueId={boutiqueId} 
              onSuccess={() => setIsAddOpen(false)}
              onCancel={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {people.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hay personas registradas</p>
          <Button variant="link" onClick={() => setIsAddOpen(true)}>
            Añadir primera persona
          </Button>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Nombre</TableHead>
                <TableHead className="min-w-[120px]">Rol</TableHead>
                <TableHead className="min-w-[150px]">Título</TableHead>
                <TableHead className="min-w-[100px]">Contacto</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-normal">{person.full_name}</span>
                      {person.is_primary_contact && (
                        <Badge variant="secondary" className="text-xs">Principal</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {person.role ? (
                      <Badge variant="outline">
                        {MNA_PERSON_ROLE_LABELS[person.role]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {person.title || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {person.email && (
                        <a href={`mailto:${person.email}`} className="text-muted-foreground hover:text-primary">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {person.phone && (
                        <a href={`tel:${person.phone}`} className="text-muted-foreground hover:text-primary">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      {person.linkedin_url && (
                        <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingPerson(person)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(person.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit modal */}
      <Dialog open={!!editingPerson} onOpenChange={(open) => !open && setEditingPerson(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar persona</DialogTitle>
          </DialogHeader>
          {editingPerson && (
            <MNAPersonForm 
              boutiqueId={boutiqueId}
              person={editingPerson}
              onSuccess={() => setEditingPerson(null)}
              onCancel={() => setEditingPerson(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
