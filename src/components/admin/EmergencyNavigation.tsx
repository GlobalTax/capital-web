import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Settings } from 'lucide-react';

interface EmergencyNavigationProps {
  onForceNavigate: (path: string) => void;
}

export const EmergencyNavigation: React.FC<EmergencyNavigationProps> = ({ onForceNavigate }) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-center gap-2 mb-3">
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
      </div>
    </div>
  );
};