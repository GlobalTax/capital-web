import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator 
} from '@/components/ui/command';
import { sidebarSections } from '@/features/admin/config/sidebar-config';
import { 
  Calculator, 
  Users, 
  FileText, 
  Mail, 
  Plus,
  Search,
  ArrowRight
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords: string[];
}

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Quick actions
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'new-valuation',
      title: 'Nueva Valoración Pro',
      description: 'Crear valoración profesional',
      icon: Calculator,
      action: () => navigate('/admin/valoraciones-pro/nueva'),
      keywords: ['valoración', 'nueva', 'crear', 'profesional']
    },
    {
      id: 'new-blog',
      title: 'Nuevo Post de Blog',
      description: 'Crear artículo con IA',
      icon: FileText,
      action: () => navigate('/admin/blog-v2'),
      keywords: ['blog', 'post', 'artículo', 'nuevo']
    },
    {
      id: 'view-leads',
      title: 'Ver Pipeline de Leads',
      description: 'Tablero Kanban de leads',
      icon: Users,
      action: () => navigate('/admin/leads-pipeline'),
      keywords: ['leads', 'pipeline', 'kanban', 'ventas']
    },
    {
      id: 'newsletter',
      title: 'Crear Newsletter',
      description: 'Editor de newsletter',
      icon: Mail,
      action: () => navigate('/admin/newsletter'),
      keywords: ['newsletter', 'email', 'marketing']
    },
  ], [navigate]);

  // All navigation items from sidebar
  const allNavigationItems = useMemo(() => {
    return sidebarSections.flatMap(section => 
      section.items
        .filter(item => item.visible !== false)
        .map(item => ({
          ...item,
          sectionTitle: section.title,
          keywords: [
            item.title.toLowerCase(),
            item.description?.toLowerCase() || '',
            section.title.toLowerCase()
          ]
        }))
    );
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar páginas, acciones..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <Search className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
          </div>
        </CommandEmpty>
        
        {/* Quick Actions */}
        <CommandGroup heading="Acciones Rápidas">
          {quickActions.map((action) => (
            <CommandItem
              key={action.id}
              value={action.keywords.join(' ')}
              onSelect={() => handleAction(action.action)}
              className="flex items-center gap-3 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <action.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{action.title}</span>
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation by Section */}
        {sidebarSections.map((section) => {
          const sectionItems = allNavigationItems.filter(
            item => item.sectionTitle === section.title
          );
          
          if (sectionItems.length === 0) return null;

          return (
            <CommandGroup key={section.title} heading={section.title.replace(/[📊✨🏢💼📈📧⚙️]/g, '').trim()}>
              {sectionItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <CommandItem
                    key={item.url}
                    value={item.keywords.join(' ')}
                    onSelect={() => handleSelect(item.url)}
                    className="flex items-center gap-3 py-2"
                  >
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                          item.badge === 'AI' ? 'bg-blue-100 text-blue-700' :
                          item.badge === 'URGENTE' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
};

// Button to trigger the command palette
export const CommandPaletteTrigger: React.FC = () => {
  const [, setOpen] = useState(false);

  const handleClick = () => {
    // Dispatch keyboard event to open command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-md border border-border transition-colors"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Buscar...</span>
      <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
};
