import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangle, Check, X, Building2, 
  ArrowRightLeft, RefreshCw, ExternalLink 
} from 'lucide-react';
import { usePortfolioChanges, useConfirmChange, useScanPortfolioDiff } from '@/hooks/usePortfolioIntelligence';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PortfolioAlertsPanel = () => {
  const { data: changes = [], isLoading } = usePortfolioChanges({ pendingOnly: true });
  const confirmMutation = useConfirmChange();
  const scanDiffMutation = useScanPortfolioDiff();

  const newCompanies = changes.filter(c => c.change_type === 'new_company');
  const possibleExits = changes.filter(c => c.change_type === 'exit');

  const handleConfirm = async (changeId: string) => {
    await confirmMutation.mutateAsync({ changeId, action: 'confirm' });
  };

  const handleDismiss = async (changeId: string) => {
    await confirmMutation.mutateAsync({ changeId, action: 'dismiss' });
  };

  const handleScanDiff = async () => {
    await scanDiffMutation.mutateAsync({ limit: 10 });
  };

  return (
    <div className="space-y-6">
      {/* Header with scan button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Alertas de Portfolio</h3>
          <p className="text-sm text-muted-foreground">
            Cambios detectados comparando webs de fondos vs base de datos
          </p>
        </div>
        <Button 
          onClick={handleScanDiff}
          disabled={scanDiffMutation.isPending}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${scanDiffMutation.isPending ? 'animate-spin' : ''}`} />
          Escanear Diferencias
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{newCompanies.length}</div>
                <div className="text-sm text-muted-foreground">Nuevas empresas detectadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{possibleExits.length}</div>
                <div className="text-sm text-muted-foreground">Posibles exits</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New companies table */}
      {newCompanies.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-500" />
              Posibles Nuevas Adquisiciones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Detectado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newCompanies.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell className="font-medium">{change.company_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(change.detected_at), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleConfirm(change.id)}
                          disabled={confirmMutation.isPending}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDismiss(change.id)}
                          disabled={confirmMutation.isPending}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Possible exits table */}
      {possibleExits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Posibles Desinversiones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Detectado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {possibleExits.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell className="font-medium">
                      {change.company_name}
                      <Badge variant="outline" className="ml-2 text-orange-600">
                        Exit?
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(change.detected_at), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleConfirm(change.id)}
                          disabled={confirmMutation.isPending}
                          title="Confirmar exit"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDismiss(change.id)}
                          disabled={confirmMutation.isPending}
                          title="Descartar (falso positivo)"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && changes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="font-semibold mb-2">Sin alertas pendientes</h3>
            <p className="text-sm text-muted-foreground">
              No hay cambios detectados que requieran revisión
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
