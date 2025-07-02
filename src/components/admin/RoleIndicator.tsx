import React from 'react';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Edit, Eye, Crown, Lock } from 'lucide-react';
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
    description: 'Gestión operativa completa excepto usuarios'
  },
  editor: {
    label: 'Editor',
    icon: Edit,
    color: 'secondary' as const,
    description: 'Creación y edición de contenido'
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
}

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({
  size = 'default',
  showIcon = true,
  showTooltip = true,
  className = ''
}) => {
  const { userRole, isLoading } = useRoleBasedPermissions();

  if (isLoading) {
    return (
      <Badge variant="outline" className={`animate-pulse ${className}`}>
        <div className="w-12 h-3 bg-gray-200 rounded"></div>
      </Badge>
    );
  }

  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.none;
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
        <TooltipTrigger>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {roleConfig.label}
            </p>
            <p className="text-sm text-muted-foreground">
              {roleConfig.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface PermissionListProps {
  compact?: boolean;
}

export const PermissionList: React.FC<PermissionListProps> = ({ compact = false }) => {
  const { permissions, userRole } = useRoleBasedPermissions();

  const permissionGroups = {
    'Gestión de Usuarios': [
      { key: 'canManageUsers', label: 'Gestionar usuarios' },
      { key: 'canCreateUsers', label: 'Crear usuarios' },
      { key: 'canEditUsers', label: 'Editar usuarios' },
      { key: 'canDeleteUsers', label: 'Eliminar usuarios' }
    ],
    'Gestión de Contenido': [
      { key: 'canManageContent', label: 'Gestionar contenido' },
      { key: 'canCreateContent', label: 'Crear contenido' },
      { key: 'canPublishContent', label: 'Publicar contenido' }
    ],
    'Analytics & Reportes': [
      { key: 'canViewAnalytics', label: 'Ver analytics' },
      { key: 'canViewAdvancedAnalytics', label: 'Analytics avanzados' },
      { key: 'canCreateReports', label: 'Crear reportes' }
    ],
    'Marketing': [
      { key: 'canManageMarketing', label: 'Gestionar marketing' },
      { key: 'canManageCampaigns', label: 'Gestionar campañas' },
      { key: 'canViewMarketingIntelligence', label: 'Marketing intelligence' }
    ]
  };

  if (compact) {
    const totalPermissions = Object.values(permissions).filter(Boolean).length;
    const maxPermissions = Object.keys(permissions).length;
    
    return (
      <div className="text-sm text-gray-600">
        {totalPermissions}/{maxPermissions} permisos activos
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-medium">Permisos por Rol</h3>
        <RoleIndicator size="sm" />
      </div>
      
      {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => (
        <div key={groupName} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{groupName}</h4>
          <div className="grid grid-cols-1 gap-1">
            {groupPermissions.map(({ key, label }) => {
              const hasPermission = permissions[key as keyof typeof permissions];
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    hasPermission ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className={hasPermission ? 'text-gray-900' : 'text-gray-500'}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoleIndicator;