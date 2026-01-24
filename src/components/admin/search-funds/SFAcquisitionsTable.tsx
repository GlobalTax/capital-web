// ============= SF ACQUISITIONS TABLE =============
// Tabla de adquisiciones de Search Funds con estilo Apollo

import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Building2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SFAcquisitionWithFund } from '@/hooks/useSFAcquisitionsWithFunds';

interface SFAcquisitionsTableProps {
  acquisitions: SFAcquisitionWithFund[];
  isLoading?: boolean;
}

// Configuración de colores por sector
const getSectorColor = (sector: string | null): string => {
  if (!sector) return 'bg-muted text-muted-foreground';
  
  const sectorLower = sector.toLowerCase();
  
  if (sectorLower.includes('software') || sectorLower.includes('saas') || sectorLower.includes('tech')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  }
  if (sectorLower.includes('industrial') || sectorLower.includes('manufactur')) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  }
  if (sectorLower.includes('health') || sectorLower.includes('salud') || sectorLower.includes('medical')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
  if (sectorLower.includes('education') || sectorLower.includes('edtech') || sectorLower.includes('formación')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
  }
  if (sectorLower.includes('food') || sectorLower.includes('alimenta') || sectorLower.includes('bodega')) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  }
  if (sectorLower.includes('retail') || sectorLower.includes('commerce') || sectorLower.includes('distribu')) {
    return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
  }
  if (sectorLower.includes('financ') || sectorLower.includes('fintech') || sectorLower.includes('insurance')) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  }
  
  return 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300';
};

// Configuración de estado
const getStatusConfig = (status: string | null) => {
  switch (status) {
    case 'owned':
      return { label: 'En cartera', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
    case 'exited':
      return { label: 'Exit', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
    default:
      return { label: 'Desconocido', className: 'bg-muted text-muted-foreground' };
  }
};

export const SFAcquisitionsTable: React.FC<SFAcquisitionsTableProps> = ({
  acquisitions,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!acquisitions || acquisitions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No se encontraron adquisiciones</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[80px]">Año</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Fondo</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead className="w-[100px]">Estado</TableHead>
            <TableHead className="w-[80px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {acquisitions.map((acquisition) => {
            const statusConfig = getStatusConfig(acquisition.status);
            
            return (
              <TableRow key={acquisition.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">
                  {acquisition.deal_year || '-'}
                </TableCell>
              <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/sf-acquisitions/${acquisition.id}`}
                      className="font-medium hover:underline text-foreground"
                    >
                      {acquisition.company_name}
                    </Link>
                    {acquisition.website && (
                      <a
                        href={acquisition.website.startsWith('http') ? acquisition.website : `https://${acquisition.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {acquisition.sector ? (
                    <Badge 
                      variant="secondary" 
                      className={`${getSectorColor(acquisition.sector)} text-xs font-normal`}
                    >
                      {acquisition.sector}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {acquisition.fund ? (
                    <Link
                      to={`/admin/sf-directory/${acquisition.fund.id}`}
                      className="text-sm hover:underline text-muted-foreground hover:text-foreground"
                    >
                      {acquisition.fund.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {[acquisition.region, acquisition.country].filter(Boolean).join(', ') || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${statusConfig.className} text-xs font-normal`}>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/admin/sf-acquisitions/${acquisition.id}`}>
                      Ver
                    </Link>
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

export default SFAcquisitionsTable;
