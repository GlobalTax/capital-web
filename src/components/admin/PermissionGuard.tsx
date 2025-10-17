import React from 'react';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Badge } from '@/components/ui/badge';
import { Lock, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type PermissionKey = keyof ReturnType<typeof useRoleBasedPermissions>['permissions'];

interface PermissionGuardProps {
  permission: PermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission,
  children, 
  fallback,
  showTooltip = false,
  tooltipMessage
}) => {
  const { hasPermission, userRole, isLoading } = useRoleBasedPermissions();

  if (isLoading) {
    return (
      <div className="opacity-50 animate-pulse">
        {children}
      </div>
    );
  }

  const hasAccess = hasPermission(permission);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="opacity-50 cursor-not-allowed">
        <div className="relative">
          {showTooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="pointer-events-none">
                    {children}
                    <Lock className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipMessage || `Requiere permisos adicionales. Tu rol: ${userRole}`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="pointer-events-none">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface PermissionAlertProps {
  permission: PermissionKey;
  title?: string;
  description?: string;
}

export const PermissionAlert: React.FC<PermissionAlertProps> = ({
  permission,
  title = "Acceso Restringido",
  description
}) => {
  const { hasPermission, userRole } = useRoleBasedPermissions();

  if (hasPermission(permission)) return null;

  return (
    <Alert variant="destructive" className="animate-fade-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong>{title}</strong>
            <p className="text-sm mt-1">
              {description || `No tienes permisos para esta acción.`}
            </p>
          </div>
          <Badge variant="outline" className="ml-4">
            {userRole}
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  );
};

interface RoleInfoTooltipProps {
  children: React.ReactNode;
  permission: PermissionKey;
  requiredRoles?: string[];
}

export const RoleInfoTooltip: React.FC<RoleInfoTooltipProps> = ({
  children,
  permission,
  requiredRoles = []
}) => {
  const { hasPermission, userRole } = useRoleBasedPermissions();
  const hasAccess = hasPermission(permission);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative ${!hasAccess ? 'opacity-75' : ''}`}>
            {children}
            {!hasAccess && (
              <Info className="absolute -top-1 -right-1 h-3 w-3 text-blue-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">
              {hasAccess ? '✅ Tienes acceso' : '❌ Acceso restringido'}
            </p>
            <p className="text-xs">Tu rol: <Badge variant="outline" className="text-xs">{userRole}</Badge></p>
            {requiredRoles.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Roles requeridos: {requiredRoles.join(', ')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PermissionGuard;