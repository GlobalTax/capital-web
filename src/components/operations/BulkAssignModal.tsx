import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, UserX } from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  role: string;
  is_active?: boolean | null;
}

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  users: AdminUser[];
  onConfirm: (userId: string | null) => void;
  isLoading?: boolean;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  users,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('unassigned');

  const handleConfirm = () => {
    onConfirm(selectedUserId === 'unassigned' ? null : selectedUserId);
  };

  const handleClose = () => {
    setSelectedUserId('unassigned');
    onClose();
  };

  const selectedUser = users.find(u => u.user_id === selectedUserId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Asignar Operaciones
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Asignar <span className="font-semibold text-foreground">{selectedCount}</span> operaciones a:
          </p>

          <div className="space-y-2">
            <Label htmlFor="assigned_user">Usuario</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-muted-foreground" />
                    <span>Sin asignar (quitar asignación)</span>
                  </div>
                </SelectItem>
                {users.filter(u => u.is_active).map(user => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {user.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.full_name || user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedUser.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.full_name || 'Sin nombre'}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {selectedUserId === 'unassigned' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                Se quitará la asignación actual de las operaciones seleccionadas.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Asignando...' : selectedUserId === 'unassigned' ? 'Quitar asignación' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
