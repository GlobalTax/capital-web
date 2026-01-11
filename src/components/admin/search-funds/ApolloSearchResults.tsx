import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Download,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ApolloPersonResult, ImportResults } from '@/hooks/useApolloSearchImport';

interface ApolloSearchResultsProps {
  people: ApolloPersonResult[];
  pagination?: { total_entries?: number; page?: number; per_page?: number };
  onImport: (people: ApolloPersonResult[], enrich: boolean) => void;
  isImporting: boolean;
  importResults?: ImportResults;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const ApolloSearchResults: React.FC<ApolloSearchResultsProps> = ({
  people,
  pagination,
  onImport,
  isImporting,
  importResults,
  onLoadMore,
  isLoadingMore,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [enrichOnImport, setEnrichOnImport] = useState(false);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === people.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(people.map(p => p.id)));
    }
  };

  const handleImport = () => {
    const selectedPeople = people.filter(p => selectedIds.has(p.id));
    onImport(selectedPeople, enrichOnImport);
  };

  const getEmailStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-600 text-xs">Verificado</Badge>;
      case 'guessed':
        return <Badge variant="outline" className="text-xs">Estimado</Badge>;
      case 'unavailable':
        return <Badge variant="secondary" className="text-xs">No disponible</Badge>;
      default:
        return null;
    }
  };

  if (importResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Importación Completada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
              <div className="text-xs text-muted-foreground">Nuevos</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importResults.updated}</div>
              <div className="text-xs text-muted-foreground">Actualizados</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{importResults.skipped}</div>
              <div className="text-xs text-muted-foreground">Omitidos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
              <div className="text-xs text-muted-foreground">Errores</div>
            </div>
          </div>

          {importResults.details.length > 0 && (
            <ScrollArea className="h-48 border rounded-md">
              <div className="p-2 space-y-1">
                {importResults.details.map((detail, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2 text-sm p-2 rounded ${
                      detail.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {detail.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="flex-1">{detail.name}</span>
                    <Badge variant={detail.action === 'created' ? 'default' : 'secondary'} className="text-xs">
                      {detail.action === 'created' ? 'Nuevo' : detail.action === 'updated' ? 'Actualizado' : 'Omitido'}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }

  if (people.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Resultados de Búsqueda
            </CardTitle>
            <CardDescription>
              {pagination?.total_entries || people.length} personas encontradas
              {selectedIds.size > 0 && ` • ${selectedIds.size} seleccionadas`}
            </CardDescription>
          </div>

          <div className="flex items-center gap-4">
            {/* Enrich toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="enrich"
                checked={enrichOnImport}
                onCheckedChange={setEnrichOnImport}
              />
              <Label htmlFor="enrich" className="text-sm flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Enriquecer emails
              </Label>
            </div>

            {/* Import button */}
            <Button
              onClick={handleImport}
              disabled={selectedIds.size === 0 || isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Importar {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </Button>
          </div>
        </div>

        {isImporting && (
          <Progress value={30} className="mt-2" />
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === people.length && people.length > 0}
                    onCheckedChange={selectAll}
                  />
                </TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((person) => (
                <TableRow 
                  key={person.id}
                  className={selectedIds.has(person.id) ? 'bg-primary/5' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(person.id)}
                      onCheckedChange={() => toggleSelect(person.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{person.name}</div>
                      <div className="text-sm text-muted-foreground">{person.title}</div>
                      {person.seniority && (
                        <Badge variant="outline" className="text-xs">
                          {person.seniority}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {person.organization ? (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{person.organization.name}</div>
                          {person.organization.industry && (
                            <div className="text-xs text-muted-foreground">
                              {person.organization.industry}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {person.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{person.email}</span>
                          {getEmailStatusBadge(person.email_status)}
                        </div>
                      )}
                      {person.phone_numbers?.[0] && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {person.phone_numbers[0].sanitized_number}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {[person.city, person.country].filter(Boolean).join(', ') || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {person.linkedin_url && (
                      <a
                        href={person.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Load more */}
        {pagination && pagination.total_entries && 
         pagination.total_entries > (pagination.page || 1) * (pagination.per_page || 25) && (
          <div className="p-4 border-t flex justify-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="gap-2"
            >
              {isLoadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Cargar más resultados
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
