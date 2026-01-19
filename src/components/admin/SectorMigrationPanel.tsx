import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Building2, 
  Briefcase,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useSectorMigration } from '@/hooks/useSectorMigration';
import { PE_SECTORS } from '@/constants/peSectors';

const SectorMigrationPanel: React.FC = () => {
  const {
    isLoading,
    previewResult,
    executeResult,
    previewMigration,
    executeMigration,
    clearResults,
  } = useSectorMigration();

  const [activeTab, setActiveTab] = useState('overview');

  const result = executeResult || previewResult;
  const isPreview = !executeResult && !!previewResult;

  const getSectorLabel = (sectorId: string): string => {
    const sector = PE_SECTORS.find(s => s.id === sectorId);
    return sector?.nameEs || sectorId;
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'direct':
        return <Badge variant="default" className="bg-green-500">Directo</Badge>;
      case 'ai':
        return <Badge variant="default" className="bg-blue-500">IA</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Omitido</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const totalCompanies = result?.result.companiesProcessed || 0;
  const migratedCompanies = result?.result.companiesMigrated || 0;
  const totalFunds = result?.result.fundsProcessed || 0;
  const migratedFunds = result?.result.fundsMigrated || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Migración de Sectores PE
            </CardTitle>
            <CardDescription>
              Normaliza sectores existentes a la taxonomía estándar PE/Search Fund
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={previewMigration}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>
            <Button
              onClick={executeMigration}
              disabled={isLoading || !previewResult}
              variant={previewResult ? 'default' : 'secondary'}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Ejecutar Migración
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!result ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Haz clic en "Vista Previa" para ver qué se migrará</p>
            <p className="text-sm mt-2">
              La vista previa no modifica datos, solo muestra el resultado esperado
            </p>
          </div>
        ) : (
          <>
            {isPreview && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <strong>Modo Vista Previa:</strong> Los datos no han sido modificados.
                  Haz clic en "Ejecutar Migración" para aplicar los cambios.
                </p>
              </div>
            )}

            {executeResult && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <strong>Migración Completada:</strong> Los datos han sido actualizados.
                </p>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="font-medium">Empresas</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {migratedCompanies}/{totalCompanies}
                    </span>
                  </div>
                  <Progress value={(migratedCompanies / Math.max(totalCompanies, 1)) * 100} className="h-2" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>✓ {result.result.companiesMigrated} migradas</span>
                    <span>⊘ {result.result.companiesSkipped} omitidas</span>
                    <span>✗ {result.result.companiesErrors} errores</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <span className="font-medium">Fondos SF</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {migratedFunds}/{totalFunds}
                    </span>
                  </div>
                  <Progress value={(migratedFunds / Math.max(totalFunds, 1)) * 100} className="h-2" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>✓ {result.result.fundsMigrated} migrados</span>
                    <span>⊘ {result.result.fundsSkipped} omitidos</span>
                    <span>✗ {result.result.fundsErrors} errores</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Distribución</TabsTrigger>
                <TabsTrigger value="companies">Empresas</TabsTrigger>
                <TabsTrigger value="funds">Fondos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Distribución por Sector PE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(result.sectorDistribution || {})
                        .sort(([, a], [, b]) => b - a)
                        .map(([sector, count]) => (
                          <div key={sector} className="flex items-center gap-2">
                            <div className="w-40 text-sm truncate" title={getSectorLabel(sector)}>
                              {getSectorLabel(sector)}
                            </div>
                            <div className="flex-1">
                              <div
                                className="h-4 bg-primary/20 rounded"
                                style={{
                                  width: `${(count / Math.max(...Object.values(result.sectorDistribution || {}))) * 100}%`,
                                }}
                              >
                                <div
                                  className="h-full bg-primary rounded"
                                  style={{ width: '100%' }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="companies" className="mt-4">
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Empresa</th>
                          <th className="text-left py-2 px-2">Sector Original</th>
                          <th className="text-left py-2 px-2">Sector PE</th>
                          <th className="text-left py-2 px-2">Método</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.result.details.companies.map((company) => (
                          <tr key={company.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2 font-medium">{company.name}</td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {company.originalSector || '-'}
                            </td>
                            <td className="py-2 px-2">
                              {company.newSectorPe ? (
                                <Badge variant="outline">
                                  {getSectorLabel(company.newSectorPe)}
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {getMethodBadge(company.method)}
                              {company.confidence && company.method === 'ai' && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({Math.round(company.confidence * 100)}%)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="funds" className="mt-4">
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Fondo</th>
                          <th className="text-left py-2 px-2">Sectores Originales</th>
                          <th className="text-left py-2 px-2">Sectores PE</th>
                          <th className="text-left py-2 px-2">Método</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.result.details.funds.map((fund) => (
                          <tr key={fund.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2 font-medium">{fund.name}</td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {fund.originalSectors.length > 0 
                                ? fund.originalSectors.join(', ')
                                : '-'}
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex flex-wrap gap-1">
                                {fund.newSectorsPe.map((sector) => (
                                  <Badge key={sector} variant="outline" className="text-xs">
                                    {getSectorLabel(sector)}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              {getMethodBadge(fund.method)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorMigrationPanel;
