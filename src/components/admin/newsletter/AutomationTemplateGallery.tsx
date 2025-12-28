import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Check, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  Calendar, 
  Mail, 
  Sparkles, 
  Lock,
  Eye,
  ArrowRight,
  Search,
  Zap,
  Target,
  Users
} from 'lucide-react';
import { useReengagementTemplates, ReengagementTemplate } from '@/hooks/useReengagementTemplates';
import { CreateReengagementModal } from './CreateReengagementModal';

const ICON_MAP: Record<string, React.ElementType> = {
  'clock': Clock,
  'refresh-cw': RefreshCw,
  'trending-up': TrendingUp,
  'calendar': Calendar,
  'mail': Mail,
  'sparkles': Sparkles,
  'zap': Zap,
  'target': Target,
  'users': Users,
};

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  'reactivation': { label: 'Reactivación', color: 'bg-amber-500/10 text-amber-700' },
  'nurturing': { label: 'Nurturing', color: 'bg-blue-500/10 text-blue-700' },
  'recovery': { label: 'Recuperación', color: 'bg-red-500/10 text-red-700' },
  'engagement': { label: 'Engagement', color: 'bg-green-500/10 text-green-700' },
  'transactional': { label: 'Transaccional', color: 'bg-purple-500/10 text-purple-700' },
};

interface AutomationTemplateGalleryProps {
  onSelectTemplate: (template: ReengagementTemplate) => void;
  selectedTemplateId?: string | null;
}

export const AutomationTemplateGallery: React.FC<AutomationTemplateGalleryProps> = ({
  onSelectTemplate,
  selectedTemplateId,
}) => {
  const { templates, isLoading } = useReengagementTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ReengagementTemplate | null>(null);

  // Categorize templates
  const categorizedTemplates = useMemo(() => {
    if (!templates) return { all: [], system: [], custom: [] };
    
    let filtered = templates;
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.label.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.trigger_condition.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(t => {
        const slug = t.slug.toLowerCase();
        if (activeCategory === 'reactivation') return slug.includes('reactivation') || slug.includes('recovery');
        if (activeCategory === 'nurturing') return slug.includes('nurturing') || slug.includes('value');
        if (activeCategory === 'engagement') return slug.includes('engagement') || slug.includes('update');
        return true;
      });
    }
    
    return {
      all: filtered,
      system: filtered.filter(t => t.is_system),
      custom: filtered.filter(t => !t.is_system),
    };
  }, [templates, searchQuery, activeCategory]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and create */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Crear con IA
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="reactivation">Reactivación</TabsTrigger>
          <TabsTrigger value="nurturing">Nurturing</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Templates Grid */}
      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {categorizedTemplates.all.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={() => onSelectTemplate(template)}
              onPreview={() => setPreviewTemplate(template)}
            />
          ))}

          {categorizedTemplates.all.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron templates</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Crear primer template
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => {
            onSelectTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}

      {/* Create Modal */}
      <CreateReengagementModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: ReengagementTemplate;
  isSelected?: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  onPreview,
}) => {
  const Icon = ICON_MAP[template.icon] || Mail;
  const category = Object.entries(CATEGORY_MAP).find(([key]) => 
    template.slug.toLowerCase().includes(key)
  )?.[1] || CATEGORY_MAP['engagement'];

  return (
    <Card
      className={cn(
        'relative transition-all hover:shadow-lg cursor-pointer group',
        isSelected
          ? 'ring-2 ring-primary border-primary bg-primary/5'
          : 'hover:border-primary/50'
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Preview strip */}
      <div className="h-24 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden relative">
        {template.html_template ? (
          <iframe
            srcDoc={template.html_template}
            title="Preview"
            className="w-full h-full scale-[0.3] origin-top-left pointer-events-none"
            style={{ width: '333%', height: '333%' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Mail className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            Vista previa
          </Button>
        </div>
      </div>

      <CardContent className="p-4" onClick={onSelect}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg shrink-0',
              isSelected ? 'bg-primary/10' : 'bg-muted'
            )}>
              <Icon className={cn(
                'h-4 w-4',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{template.label}</h4>
                {template.is_system && (
                  <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {template.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn('text-xs', category.color)}>
              {category.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {template.trigger_condition}
            </Badge>
          </div>

          {/* Use button */}
          <Button
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            className="w-full gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Seleccionado
              </>
            ) : (
              <>
                Usar como base
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Preview Modal Component
interface TemplatePreviewModalProps {
  template: ReengagementTemplate;
  onClose: () => void;
  onUse: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onUse,
}) => {
  const Icon = ICON_MAP[template.icon] || Mail;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{template.label}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={onUse} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Usar template
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Subject */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Asunto sugerido:</p>
            <p className="font-medium">{template.default_subject}</p>
          </div>

          {/* Preview */}
          <div className="rounded-lg border overflow-hidden bg-white">
            <iframe
              srcDoc={template.html_template || '<p>Sin contenido HTML</p>'}
              title="Email Preview"
              className="w-full h-[500px] border-0"
            />
          </div>

          {/* Variables */}
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-2">Variables Brevo utilizadas:</p>
            <div className="flex flex-wrap gap-2">
              {(template.variables_used || ['FIRSTNAME', 'COMPANY']).map((variable) => (
                <Badge key={variable} variant="secondary" className="font-mono text-xs">
                  {'{{contact.' + variable + '}}'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Brevo segment */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <span className="font-medium">Segmento Brevo sugerido:</span>{' '}
            <code className="bg-background px-2 py-0.5 rounded text-xs">
              {template.brevo_segment}
            </code>
          </div>
        </div>
      </Card>
    </div>
  );
};
