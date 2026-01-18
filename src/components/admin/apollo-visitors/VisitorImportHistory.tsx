import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Users, 
  Building2,
  RefreshCw,
  Globe,
  List,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { VisitorImport } from '@/hooks/useApolloVisitorImport';

interface VisitorImportHistoryProps {
  imports: VisitorImport[];
  isLoading: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function VisitorImportHistory({
  imports,
  isLoading,
  onRefresh,
  onDelete,
  isDeleting,
}: VisitorImportHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!imports || imports.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No hay importaciones en el historial</p>
        <p className="text-sm mt-1">Las importaciones aparecerán aquí cuando las realices</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Error</Badge>;
      case 'importing':
        return <Badge variant="secondary" className="animate-pulse">Importando...</Badge>;
      case 'searching':
        return <Badge variant="secondary" className="animate-pulse">Buscando...</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getImportTypeIcon = (item: VisitorImport) => {
    if (item.list_id?.includes('website_visitors') || item.import_type === 'organizations') {
      return <Globe className="h-4 w-4 text-blue-500" />;
    }
    return <List className="h-4 w-4 text-purple-500" />;
  };

  const getImportTypeLabel = (item: VisitorImport) => {
    if (item.list_id?.includes('website_visitors')) {
      return 'Website Visitors';
    }
    if (item.import_type === 'contacts') {
      return 'Lista Contactos';
    }
    return 'Lista Empresas';
  };

  const formatListId = (listId: string) => {
    if (listId?.includes('website_visitors')) {
      // Extract date range from ID
      const match = listId.match(/from_(.+)_to_(.+)/);
      if (match) {
        try {
          const from = format(new Date(match[1]), 'dd/MM', { locale: es });
          const to = format(new Date(match[2]), 'dd/MM', { locale: es });
          return `${from} - ${to}`;
        } catch {
          return 'Rango personalizado';
        }
      }
      return 'Website Visitors';
    }
    // Truncate long list IDs
    if (listId?.length > 12) {
      return `${listId.slice(0, 8)}...${listId.slice(-4)}`;
    }
    return listId || '-';
  };

  return (
    <div className="border border-border rounded-lg">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <p className="text-sm font-medium text-muted-foreground">
          {imports.length} importaciones
        </p>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualizar
        </Button>
      </div>
      
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Fecha</TableHead>
              <TableHead className="w-[120px]">Tipo</TableHead>
              <TableHead className="w-[120px]">Lista/Filtros</TableHead>
              <TableHead className="text-center w-[80px]">Encontrados</TableHead>
              <TableHead className="text-center w-[80px]">Importados</TableHead>
              <TableHead className="text-center w-[80px]">Actualizados</TableHead>
              <TableHead className="text-center w-[80px]">Omitidos</TableHead>
              <TableHead className="text-center w-[70px]">Errores</TableHead>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.map((item) => {
              const contactStats = item.results?.contacts;
              const hasContacts = contactStats && (contactStats.imported > 0 || contactStats.updated > 0);
              
              return (
                <TableRow key={item.id}>
                  {/* Date */}
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(item.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </TableCell>
                  
                  {/* Type */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getImportTypeIcon(item)}
                      <span className="text-sm">{getImportTypeLabel(item)}</span>
                    </div>
                  </TableCell>
                  
                  {/* List ID */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-muted-foreground cursor-help">
                            {formatListId(item.list_id)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.list_id || 'Sin ID'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  
                  {/* Total Found */}
                  <TableCell className="text-center">
                    <span className="font-medium">{item.total_found || 0}</span>
                  </TableCell>
                  
                  {/* Imported */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-green-600">+{item.imported_count || 0}</span>
                      {hasContacts && (
                        <span className="text-xs text-blue-500 flex items-center gap-0.5">
                          <Users className="h-3 w-3" />
                          +{contactStats.imported}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* Updated */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-blue-600">~{item.updated_count || 0}</span>
                      {hasContacts && contactStats.updated > 0 && (
                        <span className="text-xs text-blue-400">~{contactStats.updated}</span>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* Skipped */}
                  <TableCell className="text-center">
                    <span className="text-muted-foreground">{item.skipped_count || 0}</span>
                  </TableCell>
                  
                  {/* Errors */}
                  <TableCell className="text-center">
                    {(item.error_count || 0) > 0 || item.error_message ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-destructive font-medium cursor-help flex items-center justify-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {item.error_count || 1}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[300px]">
                            <p className="text-sm">{item.error_message || 'Error desconocido'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  
                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar registro de importación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará el registro del historial. Las empresas y contactos importados NO se eliminarán.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
