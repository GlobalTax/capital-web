import { useState } from 'react';
import { Plus, Building2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MNABoutiquesTable, MNABoutiqueForm } from '@/components/admin/mna-boutiques';
import { MNAFavoritesTable } from '@/components/admin/mna-boutiques/MNAFavoritesTable';
import { useFavoriteMNABoutiques } from '@/hooks/useMNABoutiqueFavorites';

export default function MNADirectoryPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const { data: favoriteBoutiques } = useFavoriteMNABoutiques();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-normal">Boutiques M&A</h1>
            <p className="text-sm text-muted-foreground">
              Directorio de competidores y asesores de M&A · {favoriteBoutiques?.length || 0} favoritos
            </p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva boutique
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva boutique M&A</DialogTitle>
            </DialogHeader>
            <MNABoutiqueForm 
              onSuccess={() => setIsCreateOpen(false)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="favorites" className="gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
            Favoritos ({favoriteBoutiques?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="boutiques">Boutiques</TabsTrigger>
          <TabsTrigger value="people" disabled>Personas</TabsTrigger>
          <TabsTrigger value="deals" disabled>Deals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites" className="mt-6">
          <MNAFavoritesTable />
        </TabsContent>
        
        <TabsContent value="boutiques" className="mt-6">
          <MNABoutiquesTable />
        </TabsContent>
        
        <TabsContent value="people" className="mt-6">
          {/* Future: Cross-boutique people view */}
          <p className="text-muted-foreground">Próximamente: Vista global de personas</p>
        </TabsContent>
        
        <TabsContent value="deals" className="mt-6">
          {/* Future: Cross-boutique deals view */}
          <p className="text-muted-foreground">Próximamente: Vista global de deals</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
