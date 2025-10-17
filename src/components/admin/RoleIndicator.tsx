import React from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Crown, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    color: 'destructive' as const,
    description: 'Acceso completo al sistema, incluyendo gestión de usuarios'
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'default' as const,
    description: 'Gestión operativa completa'
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    color: 'outline' as const,
    description: 'Solo lectura de datos y reportes'
  },
  none: {
    label: 'Sin Acceso',
    icon: Lock,
    color: 'outline' as const,
    description: 'Sin permisos administrativos'
  }
};

interface RoleIndicatorProps {
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
  role?: string | null;
}

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({
  size = 'default',
  showIcon = true,
  showTooltip = true,
  className = '',
  role: propRole
}) => {
  const { role: hookRole, isLoading } = useSimpleAuth();
  const role = propRole || hookRole;

  if (isLoading) {
    return (
      <Badge variant="outline" className={`animate-pulse ${className}`}>
        <div className="w-12 h-3 bg-gray-200 rounded"></div>
      </Badge>
    );
  }

  const roleConfig = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.none;
  const Icon = roleConfig.icon;

  const badge = (
    <Badge 
      variant={roleConfig.color} 
      className={`
        ${className}
        ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : ''}
        ${size === 'lg' ? 'text-base px-3 py-1' : ''}
        flex items-center gap-1
      `}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />}
      {roleConfig.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{roleConfig.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface PermissionListProps {
  compact?: boolean;
}

export const PermissionList: React.FC<PermissionListProps> = ({ compact = false }) => {
  const { 
    role, 
    isLoading,
    canManageUsers,
    canEditContent,
    canPublishContent,
    canViewLeads,
    canEditLeads,
    canExportLeads,
    canViewBasicAnalytics,
    canViewAdvancedAnalytics,
    canManageSettings,
    canManageIntegrations,
    canViewAuditLogs
  } = useSimpleAuth();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const permissionGroups = [
    {
      title: 'Gestión de Usuarios',
      permissions: [
        { name: 'Gestionar usuarios', value: canManageUsers }
      ]
    },
    {
      title: 'Gestión de Contenido',
      permissions: [
        { name: 'Editar contenido', value: canEditContent },
        { name: 'Publicar contenido', value: canPublishContent }
      ]
    },
    {
      title: 'Leads',
      permissions: [
        { name: 'Ver leads', value: canViewLeads },
        { name: 'Editar leads', value: canEditLeads },
        { name: 'Exportar leads', value: canExportLeads }
      ]
    },
    {
      title: 'Analytics',
      permissions: [
        { name: 'Analytics básicos', value: canViewBasicAnalytics },
        { name: 'Analytics avanzados', value: canViewAdvancedAnalytics }
      ]
    },
    {
      title: 'Configuración',
      permissions: [
        { name: 'Configuración del sistema', value: canManageSettings },
        { name: 'Gestionar integraciones', value: canManageIntegrations },
        { name: 'Ver logs de auditoría', value: canViewAuditLogs }
      ]
    }
  ];

  const activePermissions = permissionGroups.reduce((acc, group) => 
    acc + group.permissions.filter(p => p.value).length, 0
  );
  const totalPermissions = permissionGroups.reduce((acc, group) => 
    acc + group.permissions.length, 0
  );

  if (compact) {
    return (
      <div className="text-sm text-muted-foreground">
        {activePermissions} de {totalPermissions} permisos activos
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Permisos del Rol</h3>
        <RoleIndicator role={role} size="sm" showTooltip={false} />
      </div>
      
      {permissionGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {group.title}
          </h4>
          <div className="space-y-1">
            {group.permissions.map((permission, permIndex) => (
              <div 
                key={permIndex}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className={permission.value ? 'text-foreground' : 'text-muted-foreground'}>
                  {permission.name}
                </span>
                <Badge 
                  variant={permission.value ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {permission.value ? '✓' : '✗'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoleIndicator;
