import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMandatoEquipo } from '@/hooks/useMandatoEquipo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Users, Crown, Plus, X, Loader2, UserMinus } from 'lucide-react';
import type { AdminUser } from '@/hooks/useAdminUsers';

interface MandatoEquipoPanelProps {
  mandatoId: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

const UserAvatar = ({ user }: { user: AdminUser }) => {
  const initials = (user.full_name || user.email || '?').charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border border-border shrink-0">
      {initials}
    </div>
  );
};

export const MandatoEquipoPanel = ({ mandatoId }: MandatoEquipoPanelProps) => {
  const {
    ownerId, ownerData, teamData,
    isLoading, isUpdating,
    setOwner, addMember, removeMember,
    isSettingOwner, isAddingMember, isRemovingMember,
  } = useMandatoEquipo(mandatoId);

  const [selectedNewOwner, setSelectedNewOwner] = useState<string>('');
  const [selectedNewMember, setSelectedNewMember] = useState<string>('');
  const [showOwnerSelect, setShowOwnerSelect] = useState(false);
  const [showMemberSelect, setShowMemberSelect] = useState(false);

  // All admin users for selectors
  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data } = await supabase
        .from('admin_users')
        .select('id, user_id, full_name, email, role, is_active, created_at')
        .eq('is_active', true)
        .order('full_name');
      return (data || []) as AdminUser[];
    },
  });

  // Users available for owner selection (exclude current owner)
  const ownerOptions = allUsers.filter(u => u.user_id !== ownerId);

  // Users available for member addition (exclude owner and existing members)
  const memberIds = teamData.map(m => m.user_id);
  const memberOptions = allUsers.filter(
    u => u.user_id !== ownerId && !memberIds.includes(u.user_id)
  );

  const handleSetOwner = () => {
    if (!selectedNewOwner) return;
    setOwner(selectedNewOwner);
    setSelectedNewOwner('');
    setShowOwnerSelect(false);
  };

  const handleAddMember = () => {
    if (!selectedNewMember) return;
    addMember(selectedNewMember);
    setSelectedNewMember('');
    setShowMemberSelect(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando equipo...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-muted-foreground" />
          Equipo del Mandato
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">

        {/* ── Responsable (Owner) ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wide">
              <Crown className="h-3 w-3 text-foreground/50" />
              Responsable
            </p>
            {!showOwnerSelect && (
              <button
                onClick={() => setShowOwnerSelect(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {ownerData ? 'Cambiar' : 'Asignar'}
              </button>
            )}
          </div>

          {ownerData ? (
            <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/30">
              <UserAvatar user={ownerData} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{ownerData.full_name || ownerData.email}</p>
                <p className="text-xs text-muted-foreground truncate">{ownerData.email}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {ROLE_LABELS[ownerData.role] || ownerData.role}
              </Badge>
              <button
                onClick={() => setOwner(null)}
                disabled={isSettingOwner}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Quitar responsable"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            !showOwnerSelect && (
              <p className="text-xs text-muted-foreground italic">Sin responsable asignado</p>
            )
          )}

          {showOwnerSelect && (
            <div className="flex gap-2 mt-2">
              <Select value={selectedNewOwner} onValueChange={setSelectedNewOwner}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Selecciona persona..." />
                </SelectTrigger>
                <SelectContent>
                  {ownerOptions.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id} className="text-xs">
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleSetOwner}
                disabled={!selectedNewOwner || isSettingOwner}
                className="h-8 text-xs px-3"
              >
                {isSettingOwner ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowOwnerSelect(false); setSelectedNewOwner(''); }}
                className="h-8 text-xs px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* ── Team Members ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Equipo ({teamData.length})
            </p>
            {!showMemberSelect && memberOptions.length > 0 && (
              <button
                onClick={() => setShowMemberSelect(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Añadir
              </button>
            )}
          </div>

          {/* Member list */}
          <div className="space-y-1">
            {teamData.length === 0 && !showMemberSelect && (
              <p className="text-xs text-muted-foreground italic">Sin colaboradores asignados</p>
            )}
            {teamData.map(member => (
              <div key={member.user_id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/30 transition-colors group">
                <UserAvatar user={member} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{member.full_name || member.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {ROLE_LABELS[member.role] || member.role}
                </Badge>
                <button
                  onClick={() => removeMember(member.user_id)}
                  disabled={isRemovingMember}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  title="Quitar del equipo"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add member selector */}
          {showMemberSelect && (
            <div className="flex gap-2 mt-2">
              <Select value={selectedNewMember} onValueChange={setSelectedNewMember}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Selecciona colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  {memberOptions.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id} className="text-xs">
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleAddMember}
                disabled={!selectedNewMember || isAddingMember}
                className="h-8 text-xs px-3"
              >
                {isAddingMember ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowMemberSelect(false); setSelectedNewMember(''); }}
                className="h-8 text-xs px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {memberOptions.length === 0 && !showMemberSelect && teamData.length > 0 && (
            <p className="text-xs text-muted-foreground italic mt-1">Todo el equipo ya está asignado</p>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default MandatoEquipoPanel;
