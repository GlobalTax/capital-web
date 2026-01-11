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
  History,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { ApolloImportJob } from '@/hooks/useApolloSearchImport';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ApolloImportHistoryProps {
  imports: ApolloImportJob[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const ApolloImportHistory: React.FC<ApolloImportHistoryProps> = ({
  imports,
  isLoading,
  onRefresh,
}) => {
  const getStatusBadge = (status: ApolloImportJob['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 gap-1">
            <CheckCircle className="h-3 w-3" />
            Completado
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      case 'importing':
      case 'searching':
        return (
          <Badge className="bg-blue-100 text-blue-700 gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            En progreso
          </Badge>
        );
      case 'previewing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Previsualizando
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
    }
  };

  const formatCriteria = (criteria: any): string => {
    const parts = [];
    if (criteria?.person_titles?.length) {
      parts.push(`Cargos: ${criteria.person_titles.slice(0, 2).join(', ')}${criteria.person_titles.length > 2 ? '...' : ''}`);
    }
    if (criteria?.person_locations?.length) {
      parts.push(`Ubicación: ${criteria.person_locations.slice(0, 2).join(', ')}`);
    }
    if (criteria?.q_keywords) {
      parts.push(`Keywords: "${criteria.q_keywords.substring(0, 30)}..."`);
    }
    return parts.join(' • ') || 'Sin filtros';
  };

  if (imports.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No hay importaciones previas</p>
          <p className="text-sm">Las importaciones que realices aparecerán aquí</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Historial de Importaciones
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Criterios</TableHead>
                <TableHead className="text-center">Resultados</TableHead>
                <TableHead className="text-center">Importados</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.map((imp) => (
                <TableRow key={imp.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {format(new Date(imp.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(imp.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="text-sm text-muted-foreground truncate">
                      {formatCriteria(imp.search_criteria)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{imp.total_results || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-green-600 font-medium">{imp.imported_count || 0}</span>
                      {imp.updated_count > 0 && (
                        <span className="text-blue-600">+{imp.updated_count}</span>
                      )}
                      {imp.error_count > 0 && (
                        <span className="text-red-600">({imp.error_count} err)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(imp.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
