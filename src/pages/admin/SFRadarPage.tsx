import React, { useState } from 'react';
import { Radar, RefreshCw, Search, Filter, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SFRadarStats } from '@/components/admin/search-funds/SFRadarStats';
import { SFQueryTable } from '@/components/admin/search-funds/SFQueryTable';
import { SFScrapedUrlsTable } from '@/components/admin/search-funds/SFScrapedUrlsTable';
import { SFExtractProfileDialog } from '@/components/admin/search-funds/SFExtractProfileDialog';
import { useSFSearchQueries, useSFScrapedUrls, useExecuteRadarQuery } from '@/hooks/useSFRadar';

const SFRadarPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [extractDialogOpen, setExtractDialogOpen] = useState(false);
  const [urlToExtract, setUrlToExtract] = useState<string>('');

  const { data: queries, isLoading: queriesLoading, refetch: refetchQueries } = useSFSearchQueries({
    country: selectedCountry,
    intent: selectedIntent
  });

  const { data: scrapedUrls, isLoading: urlsLoading, refetch: refetchUrls } = useSFScrapedUrls();
  const executeRadar = useExecuteRadarQuery();

  const handleExecuteQuery = async (queryId: string) => {
    try {
      await executeRadar.mutateAsync(queryId);
      toast.success('Query ejecutada correctamente');
      refetchUrls();
    } catch (error) {
      toast.error('Error al ejecutar la query');
    }
  };

  const handleExtractProfile = (url: string) => {
    setUrlToExtract(url);
    setExtractDialogOpen(true);
  };

  const handleRefreshAll = () => {
    refetchQueries();
    refetchUrls();
    toast.success('Datos actualizados');
  };

  const relevantUrls = scrapedUrls?.filter(u => u.is_relevant === true) || [];
  const pendingUrls = scrapedUrls?.filter(u => u.is_relevant === null) || [];
  const discardedUrls = scrapedUrls?.filter(u => u.is_relevant === false) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Radar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Radar de Búsqueda</h1>
            <p className="text-muted-foreground text-sm">
              Descubre searchers y Search Funds activos en Europa
            </p>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExtractDialogOpen(true)}>
            <Search className="h-4 w-4 mr-2" />
            Extraer URL Manual
          </Button>
        </div>
      </div>

      {/* Stats */}
      <SFRadarStats 
        totalQueries={queries?.length || 0}
        totalUrls={scrapedUrls?.length || 0}
        relevantUrls={relevantUrls.length}
        extractedFunds={relevantUrls.filter(u => u.fund_id).length}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queries Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Queries de Búsqueda</CardTitle>
                <CardDescription>
                  {queries?.length || 0} queries configuradas por país
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SFQueryTable 
              queries={queries || []}
              isLoading={queriesLoading}
              onExecute={handleExecuteQuery}
              isExecuting={executeRadar.isPending}
            />
          </CardContent>
        </Card>

        {/* URLs Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">URLs Encontradas</CardTitle>
                <CardDescription>
                  {scrapedUrls?.length || 0} URLs procesadas
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="relevant" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="relevant" className="text-xs">
                  Relevantes ({relevantUrls.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">
                  Pendientes ({pendingUrls.length})
                </TabsTrigger>
                <TabsTrigger value="discarded" className="text-xs">
                  Descartadas ({discardedUrls.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="relevant">
                <SFScrapedUrlsTable 
                  urls={relevantUrls}
                  isLoading={urlsLoading}
                  onExtract={handleExtractProfile}
                />
              </TabsContent>
              <TabsContent value="pending">
                <SFScrapedUrlsTable 
                  urls={pendingUrls}
                  isLoading={urlsLoading}
                  onExtract={handleExtractProfile}
                />
              </TabsContent>
              <TabsContent value="discarded">
                <SFScrapedUrlsTable 
                  urls={discardedUrls}
                  isLoading={urlsLoading}
                  onExtract={handleExtractProfile}
                  showExtractButton={false}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Extract Profile Dialog */}
      <SFExtractProfileDialog 
        open={extractDialogOpen}
        onOpenChange={setExtractDialogOpen}
        initialUrl={urlToExtract}
        onSuccess={() => {
          refetchUrls();
          setUrlToExtract('');
        }}
      />
    </div>
  );
};

export default SFRadarPage;
