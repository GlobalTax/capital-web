import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Users, TrendingUp, UserSearch, ExternalLink } from 'lucide-react';
import { ImportedEmpresa } from '@/hooks/useApolloVisitorImport';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface ImportedEmpresasTableProps {
  empresas: ImportedEmpresa[];
  onSearchContacts: (empresa: { id: string; name: string; apolloOrgId: string }) => void;
}

const getIntentBadgeVariant = (intent?: string | null) => {
  switch (intent?.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function ImportedEmpresasTable({
  empresas,
  onSearchContacts,
}: ImportedEmpresasTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead className="text-center">Empleados</TableHead>
            <TableHead className="text-center">Intent</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead>Sincronizado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.map((empresa) => (
            <TableRow key={empresa.id}>
              <TableCell>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <Link 
                      to={`/admin/empresas/${empresa.id}`}
                      className="font-medium hover:underline"
                    >
                      {empresa.nombre}
                    </Link>
                    {empresa.sitio_web && (
                      <a
                        href={empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        {empresa.sitio_web}
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {empresa.sector || '-'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {empresa.ubicacion || '-'}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {empresa.empleados ? (
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {empresa.empleados}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {empresa.apollo_intent_level ? (
                  <Badge variant={getIntentBadgeVariant(empresa.apollo_intent_level)} className="text-xs">
                    {empresa.apollo_intent_level}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {empresa.apollo_score ? (
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    {empresa.apollo_score}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(empresa.apollo_last_synced_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSearchContacts({
                      id: empresa.id,
                      name: empresa.nombre,
                      apolloOrgId: empresa.apollo_org_id,
                    })}
                  >
                    <UserSearch className="h-4 w-4 mr-1" />
                    Contactos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link to={`/admin/empresas/${empresa.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
