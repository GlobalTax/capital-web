// ============= CR PEOPLE TABLE =============
// Tabla de personas de Capital Riesgo estilo Apollo

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, ExternalLink, Mail, Pencil } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CRPersonWithFund, CRPersonRole, CRPerson, CR_PERSON_ROLE_LABELS } from '@/types/capitalRiesgo';
import { CRPersonEditModal } from './CRPersonEditModal';

interface CRPeopleTableProps {
  people: CRPersonWithFund[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
}

const roleColors: Record<CRPersonRole, string> = {
  partner: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  managing_partner: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  principal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  director: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  associate: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  analyst: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  operating_partner: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  advisor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

const getLocationDisplay = (person: CRPersonWithFund) => {
  if (person.location) return person.location;
  if (person.fund?.country_base) return person.fund.country_base;
  return '—';
};

export const CRPeopleTable: React.FC<CRPeopleTableProps> = ({
  people,
  isLoading,
  selectedIds,
  onToggleSelection,
  onSelectAll,
}) => {
  const [editingPerson, setEditingPerson] = useState<CRPerson | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const allSelected = people.length > 0 && selectedIds.size === people.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < people.length;

  const handleRowClick = (person: CRPersonWithFund) => {
    setEditingPerson(person);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingPerson(null);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Add New Button */}
      <div className="mb-4 flex justify-end">
        <Button onClick={handleAddNew} size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Nueva Persona
        </Button>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50 hover:bg-muted/30">
              <TableHead className="w-10 h-10">
                <Checkbox 
                  checked={allSelected}
                  // @ts-ignore - indeterminate is valid
                  indeterminate={someSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Nombre
              </TableHead>
              <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Rol
              </TableHead>
              <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Fondo
              </TableHead>
              <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ubicación
              </TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No se encontraron personas
                </TableCell>
              </TableRow>
            ) : (
              people.map((person) => (
                <TableRow 
                  key={person.id} 
                  className="h-11 hover:bg-muted/50 border-b border-border/30 cursor-pointer"
                  data-selected={selectedIds.has(person.id)}
                  onClick={() => handleRowClick(person)}
                >
                  <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.has(person.id)}
                      onCheckedChange={() => onToggleSelection(person.id)}
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{person.full_name}</span>
                      {person.linkedin_url && (
                        <a 
                          href={person.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-blue-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge className={`text-[10px] h-5 ${roleColors[person.role as CRPersonRole] || 'bg-gray-100'}`}>
                      {CR_PERSON_ROLE_LABELS[person.role as keyof typeof CR_PERSON_ROLE_LABELS] || person.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                    {person.fund ? (
                      <Link 
                        to={`/admin/cr-directory/${person.fund.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {person.fund.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {person.email ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{person.email}</span>
                        {person.is_email_verified && (
                          <Badge className="h-4 px-1 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            ✓
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-sm text-muted-foreground">
                      {getLocationDisplay(person)}
                    </span>
                  </TableCell>
                  <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                    {person.linkedin_url && (
                      <a 
                        href={person.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-xl">
            <span className="text-sm font-medium">
              {selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}
            </span>
            <Separator orientation="vertical" className="h-5 bg-slate-700" />
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-slate-800"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <CRPersonEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        person={editingPerson}
      />
    </>
  );
};

export default CRPeopleTable;
