import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface LinearUserDropdownProps {
  onLogout: () => void;
}

const LinearUserDropdown = ({ onLogout }: LinearUserDropdownProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userEmail = user?.email || '';
  const userName = userEmail.split('@')[0] || 'Admin';
  const userInitials = userName.substring(0, 2).toUpperCase();
  
  // Role would come from admin context in production
  const userRole = 'Admin';

  const handleProfileClick = () => {
    navigate('/perfil');
  };

  const handleSettingsClick = () => {
    navigate('/admin/settings');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[hsl(var(--accent-primary))] text-white text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-56 bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]" 
        align="end" 
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal py-3">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[hsl(var(--accent-primary)/0.3)] text-[hsl(var(--accent-primary))]">
                <Shield className="h-2.5 w-2.5 mr-0.5" />
                {userRole}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
        
        <DropdownMenuItem 
          className="cursor-pointer py-2 focus:bg-[hsl(var(--linear-bg-hover))]" 
          onClick={handleProfileClick}
        >
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer py-2 focus:bg-[hsl(var(--linear-bg-hover))]" 
          onClick={handleSettingsClick}
        >
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
        
        <DropdownMenuItem 
          className="cursor-pointer py-2 text-red-500 focus:text-red-500 focus:bg-red-500/10"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LinearUserDropdown;
