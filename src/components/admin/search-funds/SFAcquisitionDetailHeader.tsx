import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, ExternalLink, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SFAcquisition, SFFund } from '@/types/searchFunds';

interface SFAcquisitionDetailHeaderProps {
  acquisition: SFAcquisition;
  fund?: SFFund;
  onEdit: () => void;
  onDelete: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  owned: { label: 'En cartera', color: 'bg-green-500/10 text-green-700 border-green-200' },
  exited: { label: 'Exit', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  unknown: { label: 'Desconocido', color: 'bg-muted text-muted-foreground' },
};

export function SFAcquisitionDetailHeader({ 
  acquisition, 
  fund,
  onEdit, 
  onDelete 
}: SFAcquisitionDetailHeaderProps) {
  const navigate = useNavigate();
  const statusConfig = statusLabels[acquisition.status] || statusLabels.unknown;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-4">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Company info */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{acquisition.company_name}</h1>
              <Badge className={`${statusConfig.color} text-xs font-normal border`}>
                {statusConfig.label}
                {acquisition.status === 'exited' && acquisition.exit_year && (
                  <span className="ml-1">{acquisition.exit_year}</span>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {fund && (
                <button
                  onClick={() => navigate(`/admin/sf-directory/${fund.id}`)}
                  className="hover:text-primary hover:underline"
                >
                  {fund.name}
                </button>
              )}
              {acquisition.deal_year && (
                <>
                  <span>•</span>
                  <span>{acquisition.deal_year}</span>
                </>
              )}
              {acquisition.sector && (
                <>
                  <span>•</span>
                  <span>{acquisition.sector}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {acquisition.website && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            asChild
          >
            <a
              href={acquisition.website.startsWith('http') ? acquisition.website : `https://${acquisition.website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Sitio web
            </a>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
