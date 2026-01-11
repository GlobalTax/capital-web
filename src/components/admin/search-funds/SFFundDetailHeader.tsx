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
import { SFFund } from '@/types/searchFunds';

interface SFFundDetailHeaderProps {
  fund: SFFund | null;
  isNew: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  searching: { label: 'Buscando', color: 'bg-green-500/10 text-green-700 border-green-200' },
  acquired: { label: 'Adquirido', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  holding: { label: 'Holding', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  exited: { label: 'Exit', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  inactive: { label: 'Inactivo', color: 'bg-muted text-muted-foreground border-border' },
};

export function SFFundDetailHeader({ fund, isNew, onEdit, onDelete }: SFFundDetailHeaderProps) {
  const navigate = useNavigate();
  const statusConfig = fund ? (statusLabels[fund.status] || statusLabels.inactive) : null;

  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate('/admin/sf-directory')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">
            {isNew ? 'Nuevo Search Fund' : fund?.name || 'Search Fund'}
          </h1>
          {!isNew && fund && statusConfig && (
            <Badge className={`${statusConfig.color} border text-xs`}>
              {statusConfig.label}
            </Badge>
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
