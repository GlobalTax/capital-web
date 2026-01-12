import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Quote, FileText, History, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SFAcquisition, SFFund } from '@/types/searchFunds';
import { useUpdateSFAcquisition } from '@/hooks/useSFAcquisitions';

interface SFAcquisitionDetailContentProps {
  acquisition: SFAcquisition;
  fund?: SFFund;
}

const dealTypeLabels: Record<string, string> = {
  majority: 'Mayoría',
  minority: 'Minoría',
  merger: 'Fusión',
  asset: 'Activos',
  unknown: 'Desconocido',
};

const statusLabels: Record<string, string> = {
  owned: 'En cartera',
  exited: 'Exit',
  unknown: 'Desconocido',
};

export function SFAcquisitionDetailContent({ acquisition, fund }: SFAcquisitionDetailContentProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [notes, setNotes] = useState(acquisition.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const updateAcquisition = useUpdateSFAcquisition();

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await updateAcquisition.mutateAsync({
        id: acquisition.id,
        notes
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-10 bg-transparent border-0 p-0 gap-4">
            <TabsTrigger 
              value="summary" 
              className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Resumen
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Notas
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm gap-1.5"
            >
              <History className="h-3.5 w-3.5" />
              Historial
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {/* Summary Tab */}
          <TabsContent value="summary" className="m-0 space-y-4">
            {/* Description */}
            {acquisition.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {acquisition.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-semibold">
                    {acquisition.deal_year || '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">Año de adquisición</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-lg font-semibold">
                    {dealTypeLabels[acquisition.deal_type]}
                  </div>
                  <div className="text-xs text-muted-foreground">Tipo de operación</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-lg font-semibold">
                    {statusLabels[acquisition.status]}
                  </div>
                  <div className="text-xs text-muted-foreground">Estado actual</div>
                </CardContent>
              </Card>
            </div>

            {/* Evidence */}
            {acquisition.evidence && (
              <Card className="bg-amber-50/50 border-amber-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Quote className="h-4 w-4 text-amber-600" />
                    Evidence (fuente original)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-sm text-muted-foreground italic border-l-2 border-amber-400 pl-4">
                    "{acquisition.evidence}"
                  </blockquote>
                </CardContent>
              </Card>
            )}

            {/* Fund Link */}
            {fund && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fondo inversor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{fund.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {fund.country_base || 'Sin ubicación'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/sf-directory/${fund.id}`)}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Notas internas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade notas sobre esta adquisición..."
                  rows={6}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || notes === (acquisition.notes || '')}
                  >
                    {isSavingNotes ? 'Guardando...' : 'Guardar notas'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Historial de cambios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Próximamente: historial de cambios</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
