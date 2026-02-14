import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, Plus, Wand2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { type ContentCalendarItem, type ContentChannel } from '@/hooks/useContentCalendar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CHANNEL_CONFIG: Record<string, { label: string; emoji: string }> = {
  linkedin_company: { label: 'LinkedIn Empresa', emoji: '🏢' },
  linkedin_personal: { label: 'LinkedIn Personal', emoji: '👤' },
  blog: { label: 'Blog', emoji: '📝' },
  newsletter: { label: 'Newsletter', emoji: '📧' },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-destructive/10 text-destructive border-destructive/30',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-muted text-muted-foreground border-border',
};

interface PlanItem {
  title: string;
  channel: string;
  content_type: string;
  linkedin_format?: string;
  target_audience: string;
  priority: string;
  category: string;
  notes: string;
  key_data?: string;
  target_keywords?: string[];
  scheduled_date: string;
  selected: boolean;
}

interface SmartPlannerSectionProps {
  onAddToCalendar: (data: Partial<ContentCalendarItem>) => void;
}

const SmartPlannerSection: React.FC<SmartPlannerSectionProps> = ({ onAddToCalendar }) => {
  const [ideaText, setIdeaText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    const idea = ideaText.trim();
    if (!idea) {
      toast.error('Describe al menos una idea');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-calendar-ai', {
        body: {
          mode: 'smart_plan',
          idea,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const items = (data.result.plan || []).map((item: any) => ({
        ...item,
        selected: true,
      }));
      setPlanItems(items);
      toast.success(`Plan generado: ${items.length} contenidos programados`);
    } catch (e: any) {
      toast.error(e.message || 'Error generando plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelect = (idx: number) => {
    setPlanItems(prev => prev.map((item, i) => i === idx ? { ...item, selected: !item.selected } : item));
  };

  const toggleAll = () => {
    const allSelected = planItems.every(i => i.selected);
    setPlanItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
  };

  const updateItem = (idx: number, field: string, value: string) => {
    setPlanItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleLoadSelected = async () => {
    const selected = planItems.filter(i => i.selected);
    if (selected.length === 0) {
      toast.error('Selecciona al menos un contenido');
      return;
    }

    setIsLoading(true);
    try {
      const itemsToAdd = selected.map(item => ({
        title: item.title,
        channel: item.channel as ContentChannel,
        content_type: item.content_type as any,
        linkedin_format: item.linkedin_format as any || null,
        target_audience: (item.target_audience || 'sellers') as any,
        priority: item.priority as any,
        category: item.category,
        notes: item.notes,
        key_data: item.key_data || null,
        target_keywords: item.target_keywords || [],
        scheduled_date: item.scheduled_date,
        status: 'idea' as const,
      }));
      for (const item of itemsToAdd) {
        onAddToCalendar(item);
      }
      toast.success(`${selected.length} contenidos cargados al calendario`);
      setPlanItems([]);
      setIdeaText('');
    } catch (e: any) {
      toast.error('Error cargando contenidos');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = planItems.filter(i => i.selected).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Smart Planner</h3>
            <span className="text-xs text-muted-foreground">Describe tus ideas y la IA crea tu plan editorial completo</span>
          </div>

          <Textarea
            placeholder={"Describe tus ideas de contenido, por ejemplo:\n\nVamos a diseñar una campaña de artículos sobre consolidación en el sector de la Certificación\n\nQuiero una serie sobre qué buscan los fondos al comprar empresas de servicios profesionales\n\nCrear contenido educativo sobre múltiplos de valoración para empresarios que quieren vender"}
            value={ideaText}
            onChange={e => setIdeaText(e.target.value)}
            className="min-h-[140px] text-sm"
          />

          <Button onClick={handleGenerate} disabled={isGenerating || !ideaText.trim()} className="h-9">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generar Plan
          </Button>
        </CardContent>
      </Card>

      {/* Results Table */}
      {planItems.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Plan Editorial: {planItems.length} contenidos
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{selectedCount} seleccionados</span>
                <Button size="sm" variant="outline" onClick={() => setPlanItems([])}>
                  <X className="h-3 w-3 mr-1" /> Descartar
                </Button>
                <Button size="sm" onClick={handleLoadSelected} disabled={isLoading || selectedCount === 0}>
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                  Cargar {selectedCount} al calendario
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-auto max-h-[500px]">
              <Table density="compact">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox
                        checked={planItems.length > 0 && planItems.every(i => i.selected)}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[220px]">Título</TableHead>
                    <TableHead className="w-[100px]">Fecha</TableHead>
                    <TableHead className="w-[140px]">Canal</TableHead>
                    <TableHead className="w-[80px]">Prioridad</TableHead>
                    <TableHead className="w-[90px]">Audiencia</TableHead>
                    <TableHead className="min-w-[200px]">Brief</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planItems.map((item, idx) => {
                    const ch = CHANNEL_CONFIG[item.channel] || CHANNEL_CONFIG.blog;
                    return (
                      <TableRow key={idx} className={cn(!item.selected && 'opacity-40')}>
                        <TableCell>
                          <Checkbox checked={item.selected} onCheckedChange={() => toggleSelect(idx)} />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.title}
                            onChange={e => updateItem(idx, 'title', e.target.value)}
                            className="h-7 text-xs border-none shadow-none px-0 focus-visible:ring-0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={item.scheduled_date}
                            onChange={e => updateItem(idx, 'scheduled_date', e.target.value)}
                            className="h-7 text-xs border-none shadow-none px-0 focus-visible:ring-0 w-[100px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Select value={item.channel} onValueChange={v => updateItem(idx, 'channel', v)}>
                            <SelectTrigger className="h-7 text-xs border-none shadow-none px-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CHANNEL_CONFIG).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px]', PRIORITY_COLORS[item.priority])}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{item.target_audience}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate" title={item.notes}>
                          {item.notes}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartPlannerSection;
