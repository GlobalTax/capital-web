
import React, { useState } from 'react';
import { Search, Bell, Settings, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RoleIndicator } from './RoleIndicator';
import UserDropdown from './header/UserDropdown';
import NotificationCenter from './header/NotificationCenter';

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
      {/* Left section - Brand and search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <a 
              href="https://capittal.es" 
              className="flex items-center gap-2 hover:opacity-75 transition-opacity"
              title="Ir a Capittal.es"
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Command className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Capittal</h1>
            </a>
          </div>
          <Badge variant="outline" className="text-xs">
            Admin
          </Badge>
        </div>

        {/* Global search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar leads, campañas, contactos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 bg-background border-border focus:ring-primary/20"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right section - Actions and user */}
      <div className="flex items-center gap-3">
        <RoleIndicator size="sm" />
        
        <div className="flex items-center gap-1">
          <NotificationCenter />
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />
        
        <UserDropdown onLogout={onLogout} />
      </div>
    </header>
  );
};

export default AdminHeader;
