/**
 * Pipeline Lead Card Component - Memoized for performance
 */

import React, { memo, useMemo, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Phone, 
  Building2, 
  DollarSign,
  Clock,
  User,
  MoreHorizontal,
  MapPin,
  Users,
  TrendingUp,
  BarChart3,
  UserCheck,
  X as XIcon
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

interface AdminUserSimple {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

interface PipelineCardProps {
  lead: PipelineLead;
  assignedUserName?: string;
  leadFormName?: string;
  channelName?: string;
  onSendPrecallEmail: () => void;
  onRegisterCall: (answered: boolean) => void;
  onViewDetails: () => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  adminUsers?: AdminUserSimple[];
  onAssignLead?: (leadId: string, userId: string | null) => void;
}

const formatCurrency = (value: number | null) => {
  if (!value) return null;
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M €`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${Math.round(value / 1_000)}K €`;
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

const PipelineCardComponent: React.FC<PipelineCardProps> = ({
  lead,
  assignedUserName,
  leadFormName,
  channelName,
  onSendPrecallEmail,
  onRegisterCall,
  onViewDetails,
  isDragging,
  isSelected,
  onToggleSelect,
  adminUsers = [],
  onAssignLead,
}) => {
  // Drag detection to avoid navigating on drag
  const mouseDownPos = useRef<{x:number,y:number}|null>(null);
  const wasDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    wasDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseDownPos.current) {
      const dx = Math.abs(e.clientX - mouseDownPos.current.x);
      const dy = Math.abs(e.clientY - mouseDownPos.current.y);
      if (dx > 5 || dy > 5) wasDragging.current = true;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (wasDragging.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="menuitem"], [data-radix-collection-item], [role="checkbox"], [data-assign-popover]')) return;
    onViewDetails();
  };

  // Memoize expensive calculations
  const daysAgo = useMemo(() => 
    formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es }),
    [lead.created_at]
  );

  const valuationFormatted = useMemo(() => 
    formatCurrency(lead.final_valuation),
    [lead.final_valuation]
  );

  const avatarInitials = useMemo(() => {
    if (!assignedUserName) return null;
    return assignedUserName.split(' ').map(n => n[0]).join('').substring(0, 2);
  }, [assignedUserName]);

  const firstName = useMemo(() => {
    if (!assignedUserName) return null;
    return assignedUserName.split(' ')[0];
  }, [assignedUserName]);

  return (
    <Card 
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          {onToggleSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(lead.id)}
              className="mt-0.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            />
          )}
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

        {/* Company Profile */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            {lead.industry}
          </Badge>
          {valuationFormatted && (
            <Badge variant="outline" className="text-xs font-medium text-emerald-700 border-emerald-200 bg-emerald-50">
              💰 {valuationFormatted}
            </Badge>
          )}
          {leadFormName && (
            <Badge className="text-xs bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100">
              📋 {leadFormName}
            </Badge>
          )}
          {channelName && (
            <Badge className="text-xs bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-100">
              📡 {channelName}
            </Badge>
          )}
        </div>

        {/* Financial & Location Details */}
        {(lead.revenue || lead.ebitda || lead.employee_range || lead.location) && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {lead.revenue ? (
              <span className="flex items-center truncate">
                <TrendingUp className="h-3 w-3 mr-1 shrink-0" />
                {formatCurrency(lead.revenue)}
              </span>
            ) : null}
            {lead.ebitda ? (
              <span className="flex items-center truncate">
                <BarChart3 className="h-3 w-3 mr-1 shrink-0" />
                {formatCurrency(lead.ebitda)}
              </span>
            ) : null}
            {lead.employee_range ? (
              <span className="flex items-center truncate">
                <Users className="h-3 w-3 mr-1 shrink-0" />
                {lead.employee_range}
              </span>
            ) : null}
            {lead.location ? (
              <span className="flex items-center truncate">
                <MapPin className="h-3 w-3 mr-1 shrink-0" />
                {lead.location}
              </span>
            ) : null}
          </div>
        )}

        {/* Call attempts */}
        {lead.call_attempts_count && lead.call_attempts_count > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {lead.call_attempts_count} llamada{lead.call_attempts_count > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {daysAgo}
          </span>
          
          <AssignmentPopover
            lead={lead}
            assignedUserName={assignedUserName}
            avatarInitials={avatarInitials}
            firstName={firstName}
            adminUsers={adminUsers}
            onAssignLead={onAssignLead}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Assignment Popover sub-component
const AssignmentPopover: React.FC<{
  lead: PipelineLead;
  assignedUserName?: string;
  avatarInitials: string | null;
  firstName: string | null;
  adminUsers: AdminUserSimple[];
  onAssignLead?: (leadId: string, userId: string | null) => void;
}> = ({ lead, assignedUserName, avatarInitials, firstName, adminUsers, onAssignLead }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return adminUsers;
    const q = search.toLowerCase();
    return adminUsers.filter(u =>
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [adminUsers, search]);

  const handleSelect = useCallback((userId: string | null) => {
    onAssignLead?.(lead.id, userId);
    setOpen(false);
    setSearch('');
  }, [onAssignLead, lead.id]);

  if (!onAssignLead) {
    return assignedUserName ? (
      <span className="flex items-center gap-1">
        <Avatar className="h-4 w-4">
          <AvatarFallback className="text-[8px]">{avatarInitials}</AvatarFallback>
        </Avatar>
        <span className="truncate max-w-[60px]">{firstName}</span>
      </span>
    ) : (
      <span className="flex items-center text-orange-500">
        <User className="h-3 w-3 mr-1" />
        Sin asignar
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button
          data-assign-popover
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity cursor-pointer"
        >
          {assignedUserName ? (
            <>
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px]">{avatarInitials}</AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[60px]">{firstName}</span>
            </>
          ) : (
            <span className="flex items-center text-orange-500">
              <User className="h-3 w-3 mr-1" />
              Sin asignar
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2"
        align="end"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Input
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs mb-2"
          autoFocus
          onPointerDown={(e) => e.stopPropagation()}
        />
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {lead.assigned_to && (
            <button
              onClick={() => handleSelect(null)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-sm hover:bg-accent text-muted-foreground"
            >
              <XIcon className="h-3 w-3" />
              Desasignar
            </button>
          )}
          {filtered.map(user => (
            <button
              key={user.user_id}
              onClick={() => handleSelect(user.user_id)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-sm hover:bg-accent ${
                lead.assigned_to === user.user_id ? 'bg-accent font-medium' : ''
              }`}
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px]">
                  {(user.full_name || user.email || '?').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left min-w-0">
                <div className="truncate">{user.full_name || user.email}</div>
                {user.full_name && user.email && (
                  <div className="text-muted-foreground truncate text-[10px]">{user.email}</div>
                )}
              </div>
              {lead.assigned_to === user.user_id && (
                <UserCheck className="h-3 w-3 ml-auto text-primary shrink-0" />
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Sin resultados</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Memoized with custom comparison
export const PipelineCard = memo(PipelineCardComponent, (prev, next) => {
  return (
    prev.lead.id === next.lead.id &&
    prev.lead.lead_status_crm === next.lead.lead_status_crm &&
    prev.lead.assigned_to === next.lead.assigned_to &&
    prev.lead.precall_email_sent === next.lead.precall_email_sent &&
    prev.lead.call_attempts_count === next.lead.call_attempts_count &&
    prev.lead.final_valuation === next.lead.final_valuation &&
    prev.lead.revenue === next.lead.revenue &&
    prev.lead.ebitda === next.lead.ebitda &&
    prev.lead.employee_range === next.lead.employee_range &&
    prev.lead.location === next.lead.location &&
    prev.assignedUserName === next.assignedUserName &&
    prev.leadFormName === next.leadFormName &&
    prev.channelName === next.channelName &&
    prev.isDragging === next.isDragging &&
    prev.isSelected === next.isSelected
  );
});
