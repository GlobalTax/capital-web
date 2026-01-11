// ============= CR FUND DETAIL HEADER =============
// Header para la vista de detalle de un fund de Capital Riesgo

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, ExternalLink, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CRFund, CR_FUND_STATUS_LABELS, CR_FUND_TYPE_LABELS } from '@/types/capitalRiesgo';

interface CRFundDetailHeaderProps {
  fund: CRFund | null;
  isNew: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-200',
  raising: 'bg-blue-500/10 text-blue-700 border-blue-200',
  deployed: 'bg-amber-500/10 text-amber-700 border-amber-200',
  closed: 'bg-muted text-muted-foreground border-border',
};

const typeColors: Record<string, string> = {
  private_equity: 'bg-purple-500/10 text-purple-700 border-purple-200',
  venture_capital: 'bg-teal-500/10 text-teal-700 border-teal-200',
  growth_equity: 'bg-orange-500/10 text-orange-700 border-orange-200',
  family_office: 'bg-blue-500/10 text-blue-700 border-blue-200',
  corporate: 'bg-slate-500/10 text-slate-700 border-slate-200',
};

export function CRFundDetailHeader({ fund, isNew, onEdit, onDelete }: CRFundDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate('/admin/cr-directory')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">
            {isNew ? 'Nuevo Fund CR' : fund?.name || 'Capital Riesgo Fund'}
          </h1>
          {!isNew && fund && (
            <>
              <Badge className={`${typeColors[fund.fund_type || ''] || 'bg-muted'} border text-xs`}>
                {CR_FUND_TYPE_LABELS[fund.fund_type as keyof typeof CR_FUND_TYPE_LABELS] || fund.fund_type}
              </Badge>
              <Badge className={`${statusColors[fund.status || ''] || 'bg-muted'} border text-xs`}>
                {CR_FUND_STATUS_LABELS[fund.status as keyof typeof CR_FUND_STATUS_LABELS] || fund.status}
              </Badge>
            </>
          )}
        </div>
      </div>

      {!isNew && fund && (
        <div className="flex items-center gap-2">
          {fund.website && (
            <Button variant="outline" size="sm" className="h-8" asChild>
              <a href={fund.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Website
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
                Editar detalles
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Mail className="h-4 w-4 mr-2" />
                Email a todos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar fund
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
