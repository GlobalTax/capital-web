import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Users, Briefcase, Target, History, FileText } from 'lucide-react';
import { useSFFund, useCreateSFFund, useUpdateSFFund } from '@/hooks/useSFFunds';
import { useSFPeople, useDeleteSFPerson } from '@/hooks/useSFPeople';
import { useSFAcquisitions, useDeleteSFAcquisition } from '@/hooks/useSFAcquisitions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SFFundForm } from '@/components/admin/search-funds/SFFundForm';
import { SFFundHistory } from '@/components/admin/search-funds/SFFundHistory';
import { SFPersonEditModal } from '@/components/admin/search-funds/SFPersonEditModal';
import { SFAcquisitionEditModal } from '@/components/admin/search-funds/SFAcquisitionEditModal';
import { SFFundDetailSidebar } from '@/components/admin/search-funds/SFFundDetailSidebar';
import { SFFundDetailHeader } from '@/components/admin/search-funds/SFFundDetailHeader';
import { SFFundPeoplePanel } from '@/components/admin/search-funds/SFFundPeoplePanel';
import { SFFundAcquisitionsPanel } from '@/components/admin/search-funds/SFFundAcquisitionsPanel';
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

export default function SFFundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
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
  const [activeTab, setActiveTab] = useState('overview');

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

  // New fund: show simple form
  if (isNew) {
    return (
      <div className="flex flex-col h-full">
        <SFFundDetailHeader fund={null} isNew={true} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <SFFundForm 
              initialData={undefined} 
              onSubmit={handleSubmit}
              isSaving={isSaving}
            />
          </div>
        </div>
      </div>
    );
  }

  // Existing fund: Apollo-style layout
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SFFundDetailHeader 
        fund={fund || null} 
        isNew={false}
        onEdit={() => setActiveTab('edit')}
      />

      {/* Main content: Sidebar + Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {fund && <SFFundDetailSidebar fund={fund} />}

        {/* Right Panel */}
        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList className="h-10 bg-transparent border-0 p-0 gap-4">
                <TabsTrigger 
                  value="overview" 
                  className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm"
                >
                  Resumen
                </TabsTrigger>
                <TabsTrigger 
                  value="people" 
                  className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
                >
                  <Users className="h-3.5 w-3.5" />
                  Personas
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {people.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="acquisitions" 
                  className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Adquisiciones
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {acquisitions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="matches" 
                  className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
                >
                  <Target className="h-3.5 w-3.5" />
                  Matches
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {fund?.matches?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
                >
                  <History className="h-3.5 w-3.5" />
                  Historial
                </TabsTrigger>
                <TabsTrigger 
                  value="edit" 
                  className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Editar
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0 p-4 space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-semibold">{people.length}</div>
                      <div className="text-xs text-muted-foreground">Personas</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-semibold">{acquisitions.length}</div>
                      <div className="text-xs text-muted-foreground">Adquisiciones</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-semibold">{fund?.matches?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Matches</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-semibold">{acquisitions.filter(a => a.status === 'owned').length}</div>
                      <div className="text-xs text-muted-foreground">En cartera</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent people */}
                <Card>
                  <CardContent className="p-4">
                    <SFFundPeoplePanel
                      people={people.slice(0, 5)}
                      onAdd={() => setEditingPerson('new')}
                      onEdit={(person) => setEditingPerson(person)}
                      onDelete={(person) => setDeleteConfirm({ type: 'person', id: person.id, name: person.full_name })}
                    />
                    {people.length > 5 && (
                      <Button 
                        variant="link" 
                        className="mt-2 p-0 h-auto text-xs"
                        onClick={() => setActiveTab('people')}
                      >
                        Ver todas ({people.length})
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Recent acquisitions */}
                <Card>
                  <CardContent className="p-4">
                    <SFFundAcquisitionsPanel
                      acquisitions={acquisitions.slice(0, 5)}
                      fundId={id!}
                      fundName={fund?.name || ''}
                      portfolioUrl={fund?.portfolio_url}
                      lastScrapedAt={fund?.last_portfolio_scraped_at}
                      onAdd={() => setEditingAcquisition('new')}
                      onEdit={(acq) => setEditingAcquisition(acq)}
                      onDelete={(acq) => setDeleteConfirm({ type: 'acquisition', id: acq.id, name: acq.company_name })}
                    />
                    {acquisitions.length > 5 && (
                      <Button 
                        variant="link" 
                        className="mt-2 p-0 h-auto text-xs"
                        onClick={() => setActiveTab('acquisitions')}
                      >
                        Ver todas ({acquisitions.length})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* People Tab */}
              <TabsContent value="people" className="m-0 p-4">
                <Card>
                  <CardContent className="p-4">
                    <SFFundPeoplePanel
                      people={people}
                      onAdd={() => setEditingPerson('new')}
                      onEdit={(person) => setEditingPerson(person)}
                      onDelete={(person) => setDeleteConfirm({ type: 'person', id: person.id, name: person.full_name })}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Acquisitions Tab */}
              <TabsContent value="acquisitions" className="m-0 p-4">
                <Card>
                  <CardContent className="p-4">
                    <SFFundAcquisitionsPanel
                      acquisitions={acquisitions}
                      fundId={id!}
                      fundName={fund?.name || ''}
                      portfolioUrl={fund?.portfolio_url}
                      lastScrapedAt={fund?.last_portfolio_scraped_at}
                      onAdd={() => setEditingAcquisition('new')}
                      onEdit={(acq) => setEditingAcquisition(acq)}
                      onDelete={(acq) => setDeleteConfirm({ type: 'acquisition', id: acq.id, name: acq.company_name })}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Matches Tab */}
              <TabsContent value="matches" className="m-0 p-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">Matches</h3>
                        <Badge variant="secondary" className="text-xs">
                          {fund?.matches?.length || 0}
                        </Badge>
                      </div>
                    </div>
                    
                    {fund?.matches && fund.matches.length > 0 ? (
                      <div className="divide-y">
                        {fund.matches.map((match) => (
                          <div key={match.id} className="py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {match.crm_entity_type === 'operation' ? 'Operación' : 'Mandato'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Score: {match.match_score || 0}%
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">{match.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">No hay matches</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="m-0 p-4">
                <SFFundHistory fundId={id!} />
              </TabsContent>

              {/* Edit Tab */}
              <TabsContent value="edit" className="m-0 p-4">
                <div className="max-w-3xl">
                  <SFFundForm 
                    initialData={fund} 
                    onSubmit={handleSubmit}
                    isSaving={isSaving}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

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
