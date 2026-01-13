import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Settings, X, RefreshCw } from 'lucide-react';

interface EmergencyNavigationProps {
  onForceNavigate: (path: string) => void;
  onDismiss?: () => void;
}

export const EmergencyNavigation: React.FC<EmergencyNavigationProps> = ({ 
  onForceNavigate,
  onDismiss 
}) => {
  const handleReset = () => {
    localStorage.removeItem('websocket-error-count');
    localStorage.removeItem('websocket-last-error');
    onDismiss?.();
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
      {/* Close button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-red-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4 text-red-600" />
        </button>
      )}
      
      <div className="flex items-center gap-2 mb-3 pr-6">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <span className="text-sm font-medium text-red-800">
          Navigation Issues Detected
        </span>
      </div>
      
      <p className="text-xs text-red-700 mb-3">
        WebSocket errors are blocking navigation. Use these direct links:
      </p>
      
      <div className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onForceNavigate('/admin/admin-users')}
          className="w-full justify-start text-xs"
        >
          <Users className="h-3 w-3 mr-2" />
          Admin Users
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onForceNavigate('/admin')}
          className="w-full justify-start text-xs"
        >
          <Settings className="h-3 w-3 mr-2" />
          Dashboard
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Resetear errores
        </Button>
      </div>
    </div>
  );
};
