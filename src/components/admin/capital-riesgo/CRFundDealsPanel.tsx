import React, { useState } from 'react';
import { Plus, Building2, Calendar, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CRDeal, CRDealType, CR_DEAL_TYPE_LABELS } from '@/types/capitalRiesgo';

interface CRFundDealsPanelProps {
  deals: CRDeal[];
  onAdd: () => void;
  onEdit: (deal: CRDeal) => void;
  onDelete: (deal: CRDeal) => void;
}

const dealTypeColors: Record<CRDealType, string> = {
  acquisition: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  add_on: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  exit: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  recap: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  follow_on: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ipo: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  merger: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const formatCurrency = (value: number | null) => {
  if (!value) return '—';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B €`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M €`;
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(value);
};

export const CRFundDealsPanel: React.FC<CRFundDealsPanelProps> = ({
  deals,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Deals</h3>
          <Badge variant="secondary" className="text-xs">
            {deals.length}
          </Badge>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Añadir
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-border rounded-lg">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No hay deals registrados</p>
          <Button 
            size="sm" 
            variant="link" 
            onClick={onAdd}
            className="mt-2"
          >
            Añadir primer deal
          </Button>
        </div>
      ) : (
        <div className="divide-y border rounded-lg">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="p-3 hover:bg-muted/50 transition-colors flex items-start justify-between group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {deal.company_name}
                  </span>
                  <Badge className={`text-[10px] h-5 ${dealTypeColors[deal.deal_type as CRDealType] || 'bg-gray-100'}`}>
                    {CR_DEAL_TYPE_LABELS[deal.deal_type as CRDealType] || deal.deal_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {deal.deal_year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {deal.deal_year}
                    </span>
                  )}
                  {deal.deal_value && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {formatCurrency(deal.deal_value)}
                    </span>
                  )}
                  {deal.sector && (
                    <span>{deal.sector}</span>
                  )}
                  {deal.country && (
                    <span>{deal.country}</span>
                  )}
                </div>
                {deal.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {deal.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(deal)}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete(deal)}
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CRFundDealsPanel;
