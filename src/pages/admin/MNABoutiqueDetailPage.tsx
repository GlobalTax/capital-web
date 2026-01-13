import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMNABoutique, useDeleteMNABoutique } from '@/hooks/useMNABoutiques';
import { 
  MNABoutiqueDetailSidebar, 
  MNABoutiqueForm,
  MNABoutiquePeoplePanel,
  MNABoutiqueDealsPanel
} from '@/components/admin/mna-boutiques';
import { useState } from 'react';

export default function MNABoutiqueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: boutique, isLoading, error } = useMNABoutique(id);
  const deleteMutation = useDeleteMNABoutique();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = () => {
    if (confirm('¿Eliminar esta boutique?')) {
      deleteMutation.mutate(id!, {
        onSuccess: () => navigate('/admin/mna-directory'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <div className="w-72 shrink-0 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !boutique) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Boutique no encontrada</p>
        <Button variant="outline" onClick={() => navigate('/admin/mna-directory')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al directorio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/mna-directory')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar boutique</DialogTitle>
              </DialogHeader>
              <MNABoutiqueForm 
                boutique={boutique}
                onSuccess={() => setIsEditOpen(false)}
                onCancel={() => setIsEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <MNABoutiqueDetailSidebar boutique={boutique} />

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="people" className="w-full">
            <TabsList>
              <TabsTrigger value="people">Equipo ({boutique.people?.length || 0})</TabsTrigger>
              <TabsTrigger value="deals">Track Record ({boutique.deals?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="people" className="mt-6">
              <MNABoutiquePeoplePanel 
                boutiqueId={boutique.id} 
                people={boutique.people || []} 
              />
            </TabsContent>
            
            <TabsContent value="deals" className="mt-6">
              <MNABoutiqueDealsPanel 
                boutiqueId={boutique.id} 
                deals={boutique.deals || []} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
