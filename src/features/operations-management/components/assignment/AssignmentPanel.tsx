import React, { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useOperationMutations } from '../../hooks/useOperationMutations';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, UserX, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AssignmentPanelProps {
  operationId: string;
  currentAssignedTo?: string | null;
  assignedAt?: string | null;
}

export const AssignmentPanel: React.FC<AssignmentPanelProps> = ({
  operationId,
  currentAssignedTo,
  assignedAt,
}) => {
  const { users: adminUsers, isLoading: loadingTeam } = useAdminUsers();
  const { assignOperation } = useOperationMutations();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    currentAssignedTo || null
  );

  const currentAssignee = adminUsers.find((m) => m.user_id === currentAssignedTo);

  const handleAssign = () => {
    if (selectedUserId) {
      assignOperation({ operationId, userId: selectedUserId });
    }
  };

  const handleUnassign = () => {
    assignOperation({ operationId, userId: null });
    setSelectedUserId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Asignación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Assignment */}
        {currentAssignee && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentAssignee.full_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {currentAssignee.full_name || 'Usuario sin nombre'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentAssignee.email}
              </p>
              {assignedAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <History className="h-3 w-3" />
                  Asignado {formatDistanceToNow(new Date(assignedAt), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnassign}
              className="shrink-0"
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Assignment Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {currentAssignee ? 'Reasignar a' : 'Asignar a'}
          </label>
          <div className="flex gap-2">
            <Select
              value={selectedUserId || ''}
              onValueChange={setSelectedUserId}
              disabled={loadingTeam}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleccionar usuario..." />
              </SelectTrigger>
              <SelectContent>
                {adminUsers.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {member.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.full_name || member.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssign}
              disabled={!selectedUserId || selectedUserId === currentAssignedTo}
            >
              Asignar
            </Button>
          </div>
        </div>

        {/* Team Members Count */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {adminUsers.length} miembros del equipo disponibles
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
