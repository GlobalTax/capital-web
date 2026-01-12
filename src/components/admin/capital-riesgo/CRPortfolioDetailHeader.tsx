// ============= CR PORTFOLIO DETAIL HEADER =============
// Header para la vista de detalle de una empresa participada

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, ExternalLink, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CRPortfolio } from '@/types/capitalRiesgo';

interface CRPortfolioDetailHeaderProps {
  company: CRPortfolio;
  fundName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-200',
  exited: 'bg-purple-500/10 text-purple-700 border-purple-200',
  write_off: 'bg-red-500/10 text-red-700 border-red-200',
};

export function CRPortfolioDetailHeader({ company, fundName, onEdit, onDelete }: CRPortfolioDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-base font-semibold">
              {company.company_name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {fundName && <span>{fundName}</span>}
              {company.fund_name && <span>· {company.fund_name}</span>}
              {company.investment_year && <span>· {company.investment_year}</span>}
            </div>
          </div>
        </div>

        <Badge className={`${statusColors[company.status] || 'bg-muted'} border text-xs ml-2`}>
          {company.status === 'active' ? 'Activo' : company.status === 'exited' ? 'Desinvertida' : 'Fallida'}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {company.website && (
          <Button variant="outline" size="sm" className="h-8" asChild>
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Sitio web
            </a>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar empresa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar empresa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
