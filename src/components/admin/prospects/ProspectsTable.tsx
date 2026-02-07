/**
 * Table component for displaying prospects
 * Shows company-grouped leads in prospect stage
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Building2, User, Mail, MapPin, TrendingUp } from 'lucide-react';
import { Prospect } from '@/hooks/useProspects';
import { useContactStatuses, STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProspectsTableProps {
  prospects: Prospect[];
  isLoading: boolean;
}

export const ProspectsTable: React.FC<ProspectsTableProps> = ({
  prospects,
  isLoading,
}) => {
  const CRM_BASE_URL = 'https://godeal.es';
  const { getStatusByKey } = useContactStatuses();

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`;
    }
    return `${value.toLocaleString('es-ES')} €`;
  };

  const handleOpenProfile = (empresaId: string) => {
    window.open(`${CRM_BASE_URL}/empresas/${empresaId}`, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (prospects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay prospectos</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-md">
          Los leads en estados de prospecto (reunión programada, PSH enviada, etc.) 
          con empresa vinculada aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[250px]">Empresa</TableHead>
            <TableHead className="w-[200px]">Contacto(s)</TableHead>
            <TableHead className="w-[120px]">Estado</TableHead>
            <TableHead className="w-[120px]">Facturación</TableHead>
            <TableHead className="w-[150px]">Ubicación</TableHead>
            <TableHead className="w-[120px]">Última act.</TableHead>
            <TableHead className="w-[120px] text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prospects.map((prospect) => {
            const status = getStatusByKey(prospect.lead_status_crm || '');
            const colorClasses = status 
              ? STATUS_COLOR_MAP[status.color] || STATUS_COLOR_MAP.gray
              : STATUS_COLOR_MAP.gray;

            return (
              <TableRow 
                key={prospect.empresa_id}
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => handleOpenProfile(prospect.empresa_id)}
              >
                {/* Empresa */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{prospect.empresa_nombre}</p>
                      {prospect.empresa_sector && (
                        <p className="text-xs text-muted-foreground truncate">
                          {prospect.empresa_sector}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Contactos */}
                <TableCell>
                  <div className="space-y-1">
                    {prospect.contacts.slice(0, 2).map((contact, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-sm">
                        <User className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{contact.name}</span>
                      </div>
                    ))}
                    {prospect.contacts.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{prospect.contacts.length - 2} más
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  {status ? (
                    <Badge 
                      variant="secondary"
                      className={`${colorClasses.bg} ${colorClasses.text}`}
                    >
                      <span className="mr-1">{status.icon}</span>
                      {status.label}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Sin estado</Badge>
                  )}
                </TableCell>

                {/* Facturación */}
                <TableCell>
                  {prospect.empresa_facturacion ? (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                      <span className="font-medium text-sm">
                        {formatCurrency(prospect.empresa_facturacion)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                {/* Ubicación */}
                <TableCell>
                  {prospect.empresa_ubicacion ? (
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{prospect.empresa_ubicacion}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                {/* Última actualización */}
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(prospect.updated_at || prospect.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </TableCell>

                {/* Acción */}
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProfile(prospect.empresa_id);
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Abrir perfil
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
