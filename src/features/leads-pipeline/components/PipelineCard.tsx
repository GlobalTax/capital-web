/**
 * Pipeline Lead Card Component
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Phone, 
  Mail, 
  MailOpen, 
  Building2, 
  DollarSign,
  Clock,
  User,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PipelineLead } from '../types';

interface PipelineCardProps {
  lead: PipelineLead;
  assignedUserName?: string;
  onSendPrecallEmail: () => void;
  onRegisterCall: (answered: boolean) => void;
  onViewDetails: () => void;
  isDragging?: boolean;
}

const formatCurrency = (value: number | null) => {
  if (!value) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const PipelineCard: React.FC<PipelineCardProps> = ({
  lead,
  assignedUserName,
  onSendPrecallEmail,
  onRegisterCall,
  onViewDetails,
  isDragging,
}) => {
  const daysAgo = formatDistanceToNow(new Date(lead.created_at), { 
    addSuffix: true, 
    locale: es 
  });

  const valuationAmount = lead.final_valuation || lead.valuation_range_min;
  const hasEmailOpened = lead.email_opened;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
      }`}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{lead.company_name}</h4>
            <p className="text-xs text-muted-foreground truncate">{lead.contact_name}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewDetails}>
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSendPrecallEmail} disabled={lead.precall_email_sent || false}>
                {lead.precall_email_sent ? '✓ Email pre-llamada enviado' : 'Enviar email pre-llamada'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onRegisterCall(true)}>
                Llamada completada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRegisterCall(false)}>
                No contestó
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sector & Valuation */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            {lead.industry}
          </Badge>
          {valuationAmount && (
            <Badge variant="outline" className="text-xs font-medium">
              <DollarSign className="h-3 w-3 mr-0.5" />
              {formatCurrency(valuationAmount)}
            </Badge>
          )}
        </div>

        {/* Email Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {hasEmailOpened ? (
            <span className="flex items-center text-green-600">
              <MailOpen className="h-3 w-3 mr-1" />
              Email abierto
            </span>
          ) : lead.email_sent ? (
            <span className="flex items-center text-yellow-600">
              <Mail className="h-3 w-3 mr-1" />
              Email enviado
            </span>
          ) : null}
          
          {lead.call_attempts_count && lead.call_attempts_count > 0 && (
            <span className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {lead.call_attempts_count} llamada{lead.call_attempts_count > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {daysAgo}
          </span>
          
          {assignedUserName ? (
            <span className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px]">
                  {assignedUserName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[60px]">{assignedUserName.split(' ')[0]}</span>
            </span>
          ) : (
            <span className="flex items-center text-orange-500">
              <User className="h-3 w-3 mr-1" />
              Sin asignar
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
