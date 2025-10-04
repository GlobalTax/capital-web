import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Star, Sparkles } from 'lucide-react';
import { formatCurrency, normalizeValuationAmount } from '@/utils/formatters';
import { formatCompactCurrency } from '@/utils/formatters';
import { isRecentOperation } from '@/utils/dateHelpers';
import OperationDetailsModal from './OperationDetailsModal';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  display_locations: string[];
  created_at?: string;
}

interface OperationsTableProps {
  operations: Operation[];
  isLoading?: boolean;
}

const OperationsTable: React.FC<OperationsTableProps> = ({ operations, isLoading }) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="min-w-[200px]">Empresa</TableHead>
                  <TableHead className="min-w-[150px]">Sector</TableHead>
                  <TableHead className="text-right min-w-[120px]">Facturación</TableHead>
                  <TableHead className="text-right min-w-[120px]">EBITDA</TableHead>
                  <TableHead className="text-right min-w-[120px]">Valoración</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Año</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Tipo</TableHead>
                  <TableHead className="text-center w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && operations.length === 0 ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-10 w-10 bg-muted rounded-full animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse ml-auto" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse ml-auto" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse ml-auto" /></TableCell>
                      <TableCell className="hidden md:table-cell"><div className="h-4 bg-muted rounded w-16 animate-pulse mx-auto" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><div className="h-4 bg-muted rounded w-20 animate-pulse mx-auto" /></TableCell>
                      <TableCell><div className="h-8 bg-muted rounded w-16 animate-pulse mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : operations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No se encontraron operaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  operations.map((operation) => (
                    <TableRow 
                      key={operation.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Logo/Avatar */}
                      <TableCell>
                        {operation.logo_url ? (
                          <img 
                            src={operation.logo_url} 
                            alt={operation.company_name}
                            className="w-10 h-10 rounded-lg object-contain bg-muted p-1"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-primary font-semibold text-xs">
                              {getCompanyInitials(operation.company_name)}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Company Name + Badges */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {operation.company_name}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {operation.is_featured && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs gap-1">
                                <Star className="h-3 w-3" />
                                Destacado
                              </Badge>
                            )}
                            {isRecentOperation(operation.created_at) && (
                              <Badge className="bg-green-500 text-xs gap-1">
                                <Sparkles className="h-3 w-3" />
                                Nuevo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Sector */}
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {operation.sector}
                        </Badge>
                      </TableCell>

                      {/* Revenue */}
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-semibold text-green-600 cursor-help">
                                {operation.revenue_amount 
                                  ? formatCompactCurrency(operation.revenue_amount, operation.valuation_currency)
                                  : <span className="text-muted-foreground">Consultar</span>
                                }
                              </span>
                            </TooltipTrigger>
                            {operation.revenue_amount && (
                              <TooltipContent>
                                <p>{formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency)}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* EBITDA */}
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-semibold text-blue-600 cursor-help">
                                {operation.ebitda_amount 
                                  ? formatCompactCurrency(operation.ebitda_amount, operation.valuation_currency)
                                  : <span className="text-muted-foreground">Consultar</span>
                                }
                              </span>
                            </TooltipTrigger>
                            {operation.ebitda_amount && (
                              <TooltipContent>
                                <p>{formatCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency)}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* Valuation */}
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-bold text-primary cursor-help">
                                {formatCompactCurrency(operation.valuation_amount, operation.valuation_currency)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatCurrency(normalizeValuationAmount(operation.valuation_amount), operation.valuation_currency)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* Year */}
                      <TableCell className="text-center hidden md:table-cell">
                        <span className="text-muted-foreground text-sm">
                          {operation.year}
                        </span>
                      </TableCell>

                      {/* Deal Type */}
                      <TableCell className="text-center hidden lg:table-cell">
                        {operation.deal_type ? (
                          <Badge 
                            variant="outline"
                            className={operation.deal_type === 'sale' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                            }
                          >
                            {operation.deal_type === 'sale' ? 'Venta' : 'Adquisición'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOperation(operation)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Ver</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedOperation && (
        <OperationDetailsModal
          operation={selectedOperation}
          isOpen={!!selectedOperation}
          onClose={() => setSelectedOperation(null)}
        />
      )}
    </>
  );
};

export default OperationsTable;
