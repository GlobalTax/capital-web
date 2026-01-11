import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2, ExternalLink, Users, Briefcase, Target, History, Plus, Pencil, Trash2 } from 'lucide-react';
import { useSFFund, useCreateSFFund, useUpdateSFFund } from '@/hooks/useSFFunds';
import { useSFPeople, useDeleteSFPerson } from '@/hooks/useSFPeople';
import { useSFAcquisitions, useDeleteSFAcquisition } from '@/hooks/useSFAcquisitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SFFundForm } from '@/components/admin/search-funds/SFFundForm';
import { SFFundHistory } from '@/components/admin/search-funds/SFFundHistory';
import { SFPersonEditModal } from '@/components/admin/search-funds/SFPersonEditModal';
import { SFAcquisitionEditModal } from '@/components/admin/search-funds/SFAcquisitionEditModal';
import { SFFund, SFFundFormData, SFPerson, SFAcquisition } from '@/types/searchFunds';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  searching: { label: 'Buscando', variant: 'default' },
  acquired: { label: 'Adquirido', variant: 'secondary' },
  holding: { label: 'Holding', variant: 'outline' },
  exited: { label: 'Exit', variant: 'outline' },
  inactive: { label: 'Inactivo', variant: 'destructive' },
};

export default function SFFundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  // Fund data
  const { data: fund, isLoading, error } = useSFFund(isNew ? undefined : id);
  const createMutation = useCreateSFFund();
  const updateMutation = useUpdateSFFund();

  // People data
  const { data: people = [] } = useSFPeople(isNew ? undefined : id);
  const deletePerson = useDeleteSFPerson();

  // Acquisitions data
  const { data: acquisitions = [] } = useSFAcquisitions(isNew ? undefined : id);
  const deleteAcquisition = useDeleteSFAcquisition();

  // Modal states
  const [editingPerson, setEditingPerson] = useState<SFPerson | null | 'new'>(null);
  const [editingAcquisition, setEditingAcquisition] = useState<SFAcquisition | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'person' | 'acquisition'; id: string; name: string } | null>(null);

  const handleSubmit = async (data: SFFundFormData) => {
    if (isNew) {
      await createMutation.mutateAsync(data as Partial<SFFund>);
      navigate('/admin/sf-directory');
    } else if (id) {
      await updateMutation.mutateAsync({ id, ...data } as Partial<SFFund> & { id: string });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'person') {
      await deletePerson.mutateAsync(deleteConfirm.id);
    } else {
      await deleteAcquisition.mutateAsync(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !isNew) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Error al cargar el fund</p>
          <Button variant="outline" onClick={() => navigate('/admin/sf-directory')} className="mt-4">
            Volver al directorio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/sf-directory')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">
                {isNew ? 'Nuevo Search Fund' : fund?.name || 'Search Fund'}
              </h1>
              {!isNew && fund?.website && (
                <a 
                  href={fund.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {fund.website} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
        {!isNew && fund && (
          <Badge variant={statusLabels[fund.status]?.variant || 'outline'}>
            {statusLabels[fund.status]?.label || fund.status}
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          {!isNew && (
            <>
              <TabsTrigger value="people" className="gap-2">
                <Users className="h-4 w-4" />
                Personas ({people.length})
              </TabsTrigger>
              <TabsTrigger value="acquisitions" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Adquisiciones ({acquisitions.length})
              </TabsTrigger>
              <TabsTrigger value="matches" className="gap-2">
                <Target className="h-4 w-4" />
                Matches ({fund?.matches?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Historial
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="info">
          <SFFundForm 
            initialData={isNew ? undefined : fund} 
            onSubmit={handleSubmit}
            isSaving={isSaving}
          />
        </TabsContent>

        {!isNew && (
          <>
            <TabsContent value="people">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personas Asociadas
                  </CardTitle>
                  <Button size="sm" onClick={() => setEditingPerson('new')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir Persona
                  </Button>
                </CardHeader>
                <CardContent>
                  {people.length > 0 ? (
                    <div className="divide-y">
                      {people.map((person) => (
                        <div 
                          key={person.id} 
                          className="py-3 flex items-center justify-between group hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                        >
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setEditingPerson(person)}
                          >
                            <p className="font-medium">{person.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {person.role} {person.email && `• ${person.email}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {person.linkedin_url && (
                              <a 
                                href={person.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                LinkedIn
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPerson(person);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({ type: 'person', id: person.id, name: person.full_name });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No hay personas asociadas</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="acquisitions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Adquisiciones
                  </CardTitle>
                  <Button size="sm" onClick={() => setEditingAcquisition('new')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir Adquisición
                  </Button>
                </CardHeader>
                <CardContent>
                  {acquisitions.length > 0 ? (
                    <div className="divide-y">
                      {acquisitions.map((acq) => (
                        <div 
                          key={acq.id} 
                          className="py-3 group hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => setEditingAcquisition(acq)}
                            >
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{acq.company_name}</p>
                                {acq.deal_year && (
                                  <Badge variant="outline">{acq.deal_year}</Badge>
                                )}
                                {acq.status === 'exited' && (
                                  <Badge variant="secondary">Exit {acq.exit_year || ''}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {[acq.sector, acq.country].filter(Boolean).join(' • ')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAcquisition(acq);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({ type: 'acquisition', id: acq.id, name: acq.company_name });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No hay adquisiciones registradas</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fund?.matches && fund.matches.length > 0 ? (
                    <div className="divide-y">
                      {fund.matches.map((match) => (
                        <div key={match.id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {match.crm_entity_type === 'operation' ? 'Operación' : 'Mandato'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Score: {match.match_score || 0}%
                            </p>
                          </div>
                          <Badge variant="outline">{match.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No hay matches</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <SFFundHistory fundId={id!} />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Person Edit Modal */}
      <SFPersonEditModal
        open={editingPerson !== null}
        onOpenChange={(open) => !open && setEditingPerson(null)}
        person={editingPerson === 'new' ? null : editingPerson}
        defaultFundId={id}
      />

      {/* Acquisition Edit Modal */}
      <SFAcquisitionEditModal
        open={editingAcquisition !== null}
        onOpenChange={(open) => !open && setEditingAcquisition(null)}
        acquisition={editingAcquisition === 'new' ? null : editingAcquisition}
        defaultFundId={id}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deleteConfirm?.type === 'person' ? 'persona' : 'adquisición'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente "{deleteConfirm?.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
