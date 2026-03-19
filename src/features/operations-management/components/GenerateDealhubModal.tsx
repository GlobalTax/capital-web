import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Check, ChevronDown, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateDealhubPptx, DEALHUB_SECTIONS, type QuarterType } from '../utils/generateDealhubPptx';
import type { Operation } from '../types/operations';
import { useToast } from '@/hooks/use-toast';
import { SlideTemplateEditor } from './SlideTemplateEditor';
import { StaticSlidesUploader } from './StaticSlidesUploader';
import { DEFAULT_FULL_TEMPLATE, type FullSlideTemplate } from '../types/slideTemplate';
import { useSlideTemplates } from '../hooks/useSlideTemplates';

/** Deep-merge saved template with defaults so new fields/values always apply */
function mergeWithDefaults(saved: FullSlideTemplate): FullSlideTemplate {
  const def = DEFAULT_FULL_TEMPLATE;
  const merge = (base: any, over: any): any => {
    if (!over || typeof over !== 'object' || Array.isArray(over)) return over ?? base;
    if (!base || typeof base !== 'object' || Array.isArray(base)) return over;
    const result: any = { ...base };
    for (const key of Object.keys(over)) {
      result[key] = merge(base[key], over[key]);
    }
    return result;
  };
  return merge(def, saved) as FullSlideTemplate;
}

const QUARTERS: QuarterType[] = ['Q1', 'Q2', 'Q3', 'Q4'];

function getCurrentQuarter(): QuarterType {
  const month = new Date().getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
}

interface GenerateDealhubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operations: any[];
}

export const GenerateDealhubModal = ({ open, onOpenChange, operations }: GenerateDealhubModalProps) => {
  const { toast } = useToast();
  const { loadDefault, save, isSaving } = useSlideTemplates();
  const [quarter, setQuarter] = useState<QuarterType>(getCurrentQuarter());
  const [selectedSections, setSelectedSections] = useState<string[]>(DEALHUB_SECTIONS.map(s => s.key));
  const [generating, setGenerating] = useState(false);
  const [excludedOpIds, setExcludedOpIds] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('config');
  const [fullTemplate, setFullTemplate] = useState<FullSlideTemplate>({ ...DEFAULT_FULL_TEMPLATE });

  // Load saved template when modal opens, merging with current defaults
  useEffect(() => {
    if (open) {
      loadDefault().then(t => setFullTemplate(mergeWithDefaults(t)));
    }
  }, [open, loadDefault]);

  const activeOps = operations.filter(op => op.is_active && !op.is_deleted);
  const includedCount = activeOps.filter(op => !excludedOpIds.has(op.id)).length;

  const toggleSection = (key: string) => {
    setSelectedSections(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const toggleExpandSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleOp = (id: string) => {
    setExcludedOpIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!selectedSections.length) {
      toast({ title: 'Selecciona al menos una sección', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      const finalOps = activeOps.filter(op => !excludedOpIds.has(op.id));
      await generateDealhubPptx(finalOps, selectedSections, quarter, undefined, fullTemplate);
      toast({ title: 'Catálogo ROD descargado' });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error al generar', description: 'Inténtalo de nuevo', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const isWideTab = activeTab === 'template' || activeTab === 'static';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'p-0 gap-0 border-[hsl(var(--linear-border))] rounded-[5px] shadow-sm transition-all duration-200',
          isTemplateTab
            ? 'sm:max-w-[95vw] h-[85vh] max-h-[85vh]'
            : 'sm:max-w-[560px]'
        )}
      >
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-base font-semibold text-foreground">
            Generar Catálogo ROD
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-normal mt-1">
            Capittal Dealhub — {includedCount} de {activeOps.length} operaciones seleccionadas
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="config" className="flex-1 text-xs">Configuración</TabsTrigger>
              <TabsTrigger value="template" className="flex-1 text-xs">Plantilla</TabsTrigger>
            </TabsList>
          </div>

          {/* Config tab */}
          <TabsContent value="config" className="flex-1 overflow-hidden mt-0">
            <div className="px-6 py-4">
              {/* Quarter selector */}
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Trimestre
              </label>
              <div className="flex gap-1 p-0.5 rounded-[5px] bg-secondary mb-5">
                {QUARTERS.map(q => (
                  <button
                    key={q}
                    onClick={() => setQuarter(q)}
                    className={cn(
                      'flex-1 text-sm py-1.5 rounded-[4px] transition-all font-semibold',
                      quarter === q
                        ? 'bg-[hsl(var(--primary))] text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Section checklist */}
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Secciones a incluir
              </label>
              <div className="space-y-1 mb-5 max-h-[40vh] overflow-y-auto pr-1">
                {DEALHUB_SECTIONS.map(section => {
                  const checked = selectedSections.includes(section.key);
                  const sectionOps = activeOps.filter(section.filter);
                  const includedInSection = sectionOps.filter(op => !excludedOpIds.has(op.id)).length;
                  const isExpanded = expandedSections.has(section.key);

                  return (
                    <div key={section.key}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleSection(section.key)}
                          className={cn(
                            'flex items-center gap-3 flex-1 px-3 py-2 rounded-[5px] text-sm transition-colors text-left',
                            checked ? 'bg-secondary/60' : 'hover:bg-secondary/40'
                          )}
                        >
                          <span
                            className={cn(
                              'flex items-center justify-center w-4 h-4 rounded-[3px] border shrink-0 transition-colors',
                              checked
                                ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))]'
                                : 'border-[hsl(var(--linear-border))] bg-background'
                            )}
                          >
                            {checked && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                          </span>
                          <span className="text-foreground font-normal flex-1">{section.label}</span>
                          <span className="text-xs text-muted-foreground">{includedInSection}/{sectionOps.length}</span>
                        </button>
                        {sectionOps.length > 0 && checked && (
                          <button
                            onClick={() => toggleExpandSection(section.key)}
                            className="p-1.5 rounded-[4px] hover:bg-secondary/60 transition-colors"
                          >
                            <ChevronDown className={cn(
                              'h-3.5 w-3.5 text-muted-foreground transition-transform',
                              isExpanded && 'rotate-180'
                            )} />
                          </button>
                        )}
                      </div>

                      {isExpanded && checked && sectionOps.length > 0 && (
                        <div className="ml-7 mt-0.5 mb-1 space-y-0.5">
                          {sectionOps.map(op => {
                            const isIncluded = !excludedOpIds.has(op.id);
                            return (
                              <button
                                key={op.id}
                                onClick={() => toggleOp(op.id)}
                                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-[4px] text-sm transition-colors text-left hover:bg-secondary/40"
                              >
                                <span
                                  className={cn(
                                    'flex items-center justify-center w-3.5 h-3.5 rounded-[2px] border shrink-0 transition-colors',
                                    isIncluded
                                      ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))]'
                                      : 'border-[hsl(var(--linear-border))] bg-background'
                                  )}
                                >
                                  {isIncluded && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                                </span>
                                <span className={cn(
                                  'text-foreground text-[13px] truncate',
                                  !isIncluded && 'line-through text-muted-foreground'
                                )}>
                                  {op.company_name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Template tab */}
          <TabsContent value="template" className="flex-1 overflow-hidden mt-0">
            <SlideTemplateEditor template={fullTemplate} onChange={setFullTemplate} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t border-[hsl(var(--linear-border))] shrink-0">
          <button
            onClick={async () => {
              const ok = await save(fullTemplate);
              toast({ title: ok ? 'Plantilla guardada' : 'Error al guardar', variant: ok ? 'default' : 'destructive' });
            }}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-semibold rounded-[5px] border border-[hsl(var(--linear-border))] bg-secondary text-foreground hover:-translate-y-[0.5px] transition-all flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Guardar plantilla
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onOpenChange(false)}
              disabled={generating}
              className="px-4 py-2 text-sm font-semibold rounded-[5px] border border-[hsl(var(--linear-border))] bg-secondary text-foreground hover:-translate-y-[0.5px] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedSections.length || includedCount === 0}
              className={cn(
                'px-4 py-2 text-sm font-semibold rounded-[5px] text-primary-foreground transition-all flex items-center gap-2',
                generating || !selectedSections.length || includedCount === 0
                  ? 'bg-primary/60 cursor-not-allowed'
                  : 'bg-primary hover:-translate-y-[0.5px]'
              )}
            >
              {generating && <Loader2 className="h-4 w-4 animate-spin" />}
              {generating ? 'Generando...' : 'Generar y Descargar'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
