import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { History, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CRApolloImportJob } from '@/hooks/useCRApolloSearchImport';

interface CRApolloImportHistoryProps {
  imports: CRApolloImportJob[];
  isLoading: boolean;
  onRefresh: () => void;
  onDelete?: (importId: string) => Promise<void>;
  isDeleting?: boolean;
  onRetry?: (importJob: CRApolloImportJob) => void;
  isRetrying?: boolean;
}

const DELETABLE_STATUSES = ['pending', 'importing', 'failed', 'cancelled', 'searching', 'previewing'];

export const CRApolloImportHistory: React.FC<CRApolloImportHistoryProps> = ({
  imports,
  isLoading,
  onRefresh,
  onDelete,
  isDeleting = false,
  onRetry,
  isRetrying = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600">Completado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Error</Badge>;
      case 'importing':
        return <Badge className="bg-blue-500/10 text-blue-600">Importando...</Badge>;
      case 'previewing':
        return <Badge className="bg-amber-500/10 text-amber-600">Previsualizando</Badge>;
      case 'searching':
        return <Badge className="bg-purple-500/10 text-purple-600">Buscando</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCriteria = (criteria: any): string => {
    if (!criteria) return '-';
    
    const parts = [];
    if (criteria.q_keywords) {
      if (criteria.q_keywords.startsWith('list:')) {
        return `Lista: ${criteria.q_keywords.replace('list:', '')}`;
      }
      parts.push(`"${criteria.q_keywords}"`);
    }
    if (criteria.person_titles?.length) {
      parts.push(`Cargos: ${criteria.person_titles.slice(0, 2).join(', ')}${criteria.person_titles.length > 2 ? '...' : ''}`);
    }
    if (criteria.person_locations?.length) {
      parts.push(`Ubicación: ${criteria.person_locations.slice(0, 2).join(', ')}${criteria.person_locations.length > 2 ? '...' : ''}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : '-';
  };

  const canDelete = (status: string) => DELETABLE_STATUSES.includes(status);

  if (imports.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Historial de Importaciones PE/VC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay importaciones anteriores. Realiza tu primera búsqueda para comenzar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Historial de Importaciones PE/VC
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Criterios</TableHead>
                <TableHead className="text-right">Resultados</TableHead>
                <TableHead className="text-right">Importados</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.map((imp) => (
                <TableRow key={imp.id}>
                  <TableCell className="text-sm">
                    {format(new Date(imp.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {formatCriteria(imp.search_criteria)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {imp.total_results}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600 font-medium">{imp.imported_count}</span>
                    {imp.updated_count > 0 && (
                      <span className="text-blue-600 ml-1">+{imp.updated_count}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(imp.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Retry button for list imports with pending/failed status */}
                      {canDelete(imp.status) && onRetry && imp.search_criteria?.q_keywords?.startsWith('list:') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => onRetry(imp)}
                          disabled={isRetrying}
                          title="Reintentar importación"
                        >
                          {isRetrying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {/* Delete button */}
                      {canDelete(imp.status) && onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar importación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará el registro de importación incompleta. 
                                No afecta a los contactos que ya fueron importados correctamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDelete(imp.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
