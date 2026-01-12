import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Users, Building2, Target, History, FileText, Briefcase } from 'lucide-react';
import { useCRFund, useCreateCRFund, useUpdateCRFund, useDeleteCRFund } from '@/hooks/useCRFunds';
import { useCRPeople, useDeleteCRPerson } from '@/hooks/useCRPeople';
import { useCRPortfolio, useDeleteCRPortfolio } from '@/hooks/useCRPortfolio';
import { useCRDealsWithRelations, useDeleteCRDeal } from '@/hooks/useCRDeals';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CRFundForm } from '@/components/admin/capital-riesgo/CRFundForm';
import { CRFundHistory } from '@/components/admin/capital-riesgo/CRFundHistory';
import { CRPersonEditModal } from '@/components/admin/capital-riesgo/CRPersonEditModal';
import { CRPortfolioEditModal } from '@/components/admin/capital-riesgo/CRPortfolioEditModal';
import { CRFundDetailSidebar } from '@/components/admin/capital-riesgo/CRFundDetailSidebar';
import { CRFundDetailHeader } from '@/components/admin/capital-riesgo/CRFundDetailHeader';
import { CRFundPeoplePanel } from '@/components/admin/capital-riesgo/CRFundPeoplePanel';
import { CRFundPortfolioPanel } from '@/components/admin/capital-riesgo/CRFundPortfolioPanel';
import { CRFundDealsPanel } from '@/components/admin/capital-riesgo/CRFundDealsPanel';
import { CRDealEditModal } from '@/components/admin/capital-riesgo/CRDealEditModal';
import { CRFund, CRFundFormData, CRPerson, CRPortfolio, CRDeal } from '@/types/capitalRiesgo';
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

export default function CRFundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  // Fund data
  const { data: fund, isLoading, error } = useCRFund(isNew ? undefined : id);
  const createMutation = useCreateCRFund();
  const updateMutation = useUpdateCRFund();
  const deleteFundMutation = useDeleteCRFund();

  // People data
  const { data: people = [] } = useCRPeople(isNew ? undefined : { fund_id: id });
  const deletePerson = useDeleteCRPerson();

  // Portfolio data
  const { data: portfolio = [], refetch: refetchPortfolio } = useCRPortfolio(isNew ? undefined : { fund_id: id });
  const deletePortfolio = useDeleteCRPortfolio();

  // Deals data
  const { data: deals = [] } = useCRDealsWithRelations(isNew ? undefined : { fund_id: id });
  const deleteDeal = useDeleteCRDeal();

  // Modal states
  const [editingPerson, setEditingPerson] = useState<CRPerson | null | 'new'>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<CRPortfolio | null | 'new'>(null);
  const [editingDeal, setEditingDeal] = useState<CRDeal | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'person' | 'portfolio' | 'deal' | 'fund'; id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSubmit = async (data: CRFundFormData) => {
    if (isNew) {
      await createMutation.mutateAsync(data);
      navigate('/admin/cr-directory');
    } else if (id) {
      await updateMutation.mutateAsync({ id, data });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'person') {
      await deletePerson.mutateAsync(deleteConfirm.id);
    } else if (deleteConfirm.type === 'portfolio') {
      await deletePortfolio.mutateAsync(deleteConfirm.id);
    } else if (deleteConfirm.type === 'deal') {
      await deleteDeal.mutateAsync(deleteConfirm.id);
    } else if (deleteConfirm.type === 'fund') {
      await deleteFundMutation.mutateAsync(deleteConfirm.id);
      navigate('/admin/cr-directory');
    }
    setDeleteConfirm(null);
  };

  const handleDeleteFund = () => {
    if (fund) {
      setDeleteConfirm({ type: 'fund', id: fund.id, name: fund.name });
    }
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
          <p className="text-destructive">Error al cargar el fondo</p>
          <Button variant="outline" onClick={() => navigate('/admin/cr-directory')} className="mt-4">
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
        <CRFundDetailHeader fund={null} isNew={true} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <CRFundForm 
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
      <CRFundDetailHeader 
        fund={fund || null} 
        isNew={false}
        onEdit={() => setActiveTab('edit')}
        onDelete={handleDeleteFund}
      />

      {/* Main content: Sidebar + Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {fund && <CRFundDetailSidebar fund={fund} />}

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
                  value="portfolio" 
                  className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Portfolio
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {portfolio.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="deals" 
                  className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Deals
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {deals.length}
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
              <TabsContent value="overview" className="m-0 px-4 py-3 pr-6 space-y-4">
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
                      <div className="text-2xl font-semibold">{portfolio.length}</div>
                      <div className="text-xs text-muted-foreground">Portfolio</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-semibold">{deals.length}</div>
                      <div className="text-xs text-muted-foreground">Deals</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-semibold">{portfolio.filter(p => p.status === 'active').length}</div>
                      <div className="text-xs text-muted-foreground">Activos</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent people */}
                <Card>
                  <CardContent className="p-4">
                    <CRFundPeoplePanel
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

                {/* Recent portfolio */}
                <Card>
                  <CardContent className="p-4">
                    <CRFundPortfolioPanel
                      portfolio={portfolio.slice(0, 5)}
                      fundId={fund?.id || ''}
                      fundName={fund?.name || ''}
                      fundWebsite={fund?.website}
                      portfolioUrl={fund?.portfolio_url}
                      lastScrapedAt={fund?.last_portfolio_scraped_at}
                      onAdd={() => setEditingPortfolio('new')}
                      onEdit={(item) => setEditingPortfolio(item)}
                      onDelete={(item) => setDeleteConfirm({ type: 'portfolio', id: item.id, name: item.company_name })}
                      onRefresh={() => refetchPortfolio()}
                    />
                    {portfolio.length > 5 && (
                      <Button 
                        variant="link" 
                        className="mt-2 p-0 h-auto text-xs"
                        onClick={() => setActiveTab('portfolio')}
                      >
                        Ver todas ({portfolio.length})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* People Tab */}
              <TabsContent value="people" className="m-0 px-4 py-3 pr-6">
                <CRFundPeoplePanel
                  people={people}
                  onAdd={() => setEditingPerson('new')}
                  onEdit={(person) => setEditingPerson(person)}
                  onDelete={(person) => setDeleteConfirm({ type: 'person', id: person.id, name: person.full_name })}
                />
              </TabsContent>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="m-0 px-4 py-3 pr-6">
                <CRFundPortfolioPanel
                  portfolio={portfolio}
                  fundId={fund?.id || ''}
                  fundName={fund?.name || ''}
                  fundWebsite={fund?.website}
                  portfolioUrl={fund?.portfolio_url}
                  lastScrapedAt={fund?.last_portfolio_scraped_at}
                  onAdd={() => setEditingPortfolio('new')}
                  onEdit={(item) => setEditingPortfolio(item)}
                  onDelete={(item) => setDeleteConfirm({ type: 'portfolio', id: item.id, name: item.company_name })}
                  onRefresh={() => refetchPortfolio()}
                />
              </TabsContent>

              {/* Deals Tab */}
              <TabsContent value="deals" className="m-0 px-4 py-3 pr-6">
                <CRFundDealsPanel
                  deals={deals}
                  onAdd={() => setEditingDeal('new')}
                  onEdit={(deal) => setEditingDeal(deal)}
                  onDelete={(deal) => setDeleteConfirm({ type: 'deal', id: deal.id, name: deal.company_name })}
                />
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
                                {match.crm_entity_type === 'operation' ? 'Operación' : match.crm_entity_type === 'mandato' ? 'Mandato' : 'Empresa'}
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
                <CRFundHistory fundId={id!} />
              </TabsContent>

              {/* Edit Tab */}
              <TabsContent value="edit" className="m-0 p-4">
                <div className="max-w-3xl">
                  <CRFundForm 
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
      <CRPersonEditModal
        open={editingPerson !== null}
        onOpenChange={(open) => !open && setEditingPerson(null)}
        person={editingPerson === 'new' ? null : editingPerson}
        defaultFundId={id}
      />

      {/* Portfolio Edit Modal */}
      <CRPortfolioEditModal
        open={editingPortfolio !== null}
        onOpenChange={(open) => !open && setEditingPortfolio(null)}
        portfolio={editingPortfolio === 'new' ? null : editingPortfolio}
        defaultFundId={id}
      />

      {/* Deal Edit Modal */}
      <CRDealEditModal
        open={editingDeal !== null}
        onOpenChange={(open) => !open && setEditingDeal(null)}
        deal={editingDeal === 'new' ? null : editingDeal}
        defaultFundId={id}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar {
                deleteConfirm?.type === 'person' ? 'persona' : 
                deleteConfirm?.type === 'portfolio' ? 'empresa del portfolio' : 
                deleteConfirm?.type === 'deal' ? 'deal' :
                'fondo'
              }?
            </AlertDialogTitle>
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
