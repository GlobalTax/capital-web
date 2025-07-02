import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { PermissionGuard, RoleInfoTooltip } from './PermissionGuard';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Lock } from 'lucide-react';

type PermissionKey = keyof ReturnType<typeof useRoleBasedPermissions>['permissions'];

interface ProtectedButtonProps extends ButtonProps {
  permission: PermissionKey;
  showTooltip?: boolean;
  tooltipMessage?: string;
  requiredRoles?: string[];
  fallbackText?: string;
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  permission,
  showTooltip = true,
  tooltipMessage,
  requiredRoles,
  fallbackText = "Sin permisos",
  children,
  disabled,
  ...buttonProps
}) => {
  const { hasPermission } = useRoleBasedPermissions();
  const hasAccess = hasPermission(permission);

  if (!hasAccess) {
    return (
      <RoleInfoTooltip 
        permission={permission} 
        requiredRoles={requiredRoles}
      >
        <Button 
          {...buttonProps} 
          disabled={true}
          variant="outline"
          className="opacity-50 cursor-not-allowed"
        >
          <Lock className="h-4 w-4 mr-2" />
          {fallbackText}
        </Button>
      </RoleInfoTooltip>
    );
  }

  if (showTooltip) {
    return (
      <RoleInfoTooltip 
        permission={permission} 
        requiredRoles={requiredRoles}
      >
        <Button {...buttonProps} disabled={disabled}>
          {children}
        </Button>
      </RoleInfoTooltip>
    );
  }

  return (
    <Button {...buttonProps} disabled={disabled}>
      {children}
    </Button>
  );
};

export default ProtectedButton;