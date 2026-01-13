import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MNABoutiquesTable, MNABoutiqueForm } from '@/components/admin/mna-boutiques';

export default function MNADirectoryPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
              Directorio de competidores y asesores de M&A
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
      <Tabs defaultValue="boutiques" className="w-full">
        <TabsList>
          <TabsTrigger value="boutiques">Boutiques</TabsTrigger>
          <TabsTrigger value="people" disabled>Personas</TabsTrigger>
          <TabsTrigger value="deals" disabled>Deals</TabsTrigger>
        </TabsList>
        
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
