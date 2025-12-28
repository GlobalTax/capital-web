import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Database, 
  Filter, 
  Zap,
  TrendingUp,
  Clock,
  Users,
  Mail,
  Target,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SegmentCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface PresetSegment {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  conditions: SegmentCondition[];
  brevoQuery: string;
  category: 'reactivation' | 'engagement' | 'qualification' | 'time-based';
}

const PRESET_SEGMENTS: PresetSegment[] = [
  {
    id: 'abandoned-valuation-48h',
    name: 'Valoración Abandonada - 48h',
    description: 'Leads que iniciaron valoración pero no la completaron en las últimas 48 horas',
    icon: Clock,
    category: 'reactivation',
    conditions: [
      { id: '1', field: 'valuation_started', operator: 'equals', value: 'true' },
      { id: '2', field: 'valuation_completed', operator: 'equals', value: 'false' },
      { id: '3', field: 'created_at', operator: 'older_than', value: '48 hours' },
    ],
    brevoQuery: 'contact.VALUATION_STARTED = true AND contact.VALUATION_COMPLETED = false AND contact.CREATED_AT < NOW() - INTERVAL 48 HOUR',
  },
  {
    id: 'high-value-inactive',
    name: 'Alto Valor - Inactivos',
    description: 'Leads con valoración > 500K€ sin actividad en 30 días',
    icon: TrendingUp,
    category: 'qualification',
    conditions: [
      { id: '1', field: 'final_valuation', operator: 'greater_than', value: '500000' },
      { id: '2', field: 'last_activity', operator: 'older_than', value: '30 days' },
    ],
    brevoQuery: 'contact.VALUATION_AMOUNT > 500000 AND contact.LAST_ACTIVITY_AT < NOW() - INTERVAL 30 DAY',
  },
  {
    id: 'tech-sector-no-email',
    name: 'Sector Tecnología - Sin Apertura',
    description: 'Leads del sector tecnología que no abrieron el último email',
    icon: Target,
    category: 'engagement',
    conditions: [
      { id: '1', field: 'industry', operator: 'equals', value: 'Tecnología' },
      { id: '2', field: 'email_opened', operator: 'equals', value: 'false' },
    ],
    brevoQuery: 'contact.SECTOR = "Tecnología" AND contact.EMAIL_OPENED = false',
  },
  {
    id: 'completed-6-months',
    name: 'Valoración Completada - 6 Meses',
    description: 'Leads que completaron valoración hace más de 6 meses',
    icon: Users,
    category: 'time-based',
    conditions: [
      { id: '1', field: 'valuation_completed', operator: 'equals', value: 'true' },
      { id: '2', field: 'completed_at', operator: 'older_than', value: '6 months' },
    ],
    brevoQuery: 'contact.VALUATION_COMPLETED = true AND contact.COMPLETED_AT < NOW() - INTERVAL 6 MONTH',
  },
  {
    id: 'large-company-no-contact',
    name: 'Empresa Grande - Sin Contacto',
    description: 'Empresas de +50 empleados sin seguimiento en 14 días',
    icon: Zap,
    category: 'qualification',
    conditions: [
      { id: '1', field: 'employee_range', operator: 'in', value: '51-100,101-250,250+' },
      { id: '2', field: 'last_contact', operator: 'older_than', value: '14 days' },
    ],
    brevoQuery: 'contact.EMPLOYEE_RANGE IN ("51-100", "101-250", "250+") AND contact.LAST_CONTACT_AT < NOW() - INTERVAL 14 DAY',
  },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  'reactivation': { label: 'Reactivación', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  'engagement': { label: 'Engagement', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  'qualification': { label: 'Cualificación', color: 'bg-green-500/10 text-green-700 border-green-200' },
  'time-based': { label: 'Temporal', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
};

interface BrevoSegmentBuilderProps {
  onSegmentSelect?: (brevoQuery: string, segmentName: string) => void;
}

export const BrevoSegmentBuilder: React.FC<BrevoSegmentBuilderProps> = ({
  onSegmentSelect,
}) => {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<PresetSegment | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredPresets = useMemo(() => {
    if (activeCategory === 'all') return PRESET_SEGMENTS;
    return PRESET_SEGMENTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const handleCopyQuery = async (query: string) => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      toast({
        title: 'Query copiada',
        description: 'La query ha sido copiada al portapapeles',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar la query',
        variant: 'destructive',
      });
    }
  };

  const handleSelectPreset = (preset: PresetSegment) => {
    setSelectedPreset(preset);
    onSegmentSelect?.(preset.brevoQuery, preset.name);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Generador de Segmentos Brevo</h3>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
        >
          Todos
        </Button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <Button
            key={key}
            variant={activeCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(key)}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* Presets Grid */}
      <ScrollArea className="h-[300px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
          {filteredPresets.map((preset) => {
            const Icon = preset.icon;
            const category = CATEGORY_CONFIG[preset.category];
            const isSelected = selectedPreset?.id === preset.id;

            return (
              <Card
                key={preset.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  isSelected
                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
                onClick={() => handleSelectPreset(preset)}
              >
                <CardContent className="p-4">
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
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{preset.name}</h4>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {preset.description}
                      </p>
                      <Badge className={cn('text-xs', category.color)}>
                        {category.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Selected Segment Details */}
      {selectedPreset && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Segmento Seleccionado: {selectedPreset.name}
            </CardTitle>
            <CardDescription>{selectedPreset.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conditions */}
            <div>
              <Label className="text-xs mb-2 block">Condiciones:</Label>
              <div className="space-y-2">
                {selectedPreset.conditions.map((condition, idx) => (
                  <div key={condition.id} className="flex items-center gap-2 text-sm">
                    {idx > 0 && <Badge variant="outline" className="text-xs">AND</Badge>}
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1">
                      {condition.field} {condition.operator} "{condition.value}"
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Brevo Query */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Query para Brevo:</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyQuery(selectedPreset.brevoQuery)}
                  className="gap-2 h-7"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <code className="text-xs font-mono break-all">
                  {selectedPreset.brevoQuery}
                </code>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border p-3 bg-background">
              <p className="text-xs font-medium mb-2">📝 Cómo usar en Brevo:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Ve a <strong>Contacts → Segments</strong> en Brevo</li>
                <li>Crea un nuevo segmento y usa el modo "Advanced"</li>
                <li>Pega la query copiada en el editor</li>
                <li>Guarda y usa el segmento en tus campañas</li>
              </ol>
              <Button
                variant="link"
                size="sm"
                className="mt-2 h-auto p-0 text-xs gap-1"
                onClick={() => window.open('https://app.brevo.com/contacts', '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
                Abrir Brevo Contacts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!selectedPreset && (
        <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/30">
          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Selecciona un segmento predefinido</p>
          <p className="text-xs">para ver la query de Brevo</p>
        </div>
      )}
    </div>
  );
};
