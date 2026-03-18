import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateDealhubPptx, DEALHUB_SECTIONS, type QuarterType } from '../utils/generateDealhubPptx';
import type { Operation } from '../types/operations';
import { useToast } from '@/hooks/use-toast';

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
  const [quarter, setQuarter] = useState<QuarterType>(getCurrentQuarter());
  const [selectedSections, setSelectedSections] = useState<string[]>(DEALHUB_SECTIONS.map(s => s.key));
  const [generating, setGenerating] = useState(false);

  const activeOps = operations.filter(op => op.is_active && !op.is_deleted);

  const toggleSection = (key: string) => {
    setSelectedSections(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const handleGenerate = async () => {
    if (!selectedSections.length) {
      toast({ title: 'Selecciona al menos una sección', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      await generateDealhubPptx(activeOps, selectedSections, quarter);
      toast({ title: 'Catálogo ROD descargado' });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error al generar', description: 'Inténtalo de nuevo', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 border-[hsl(var(--linear-border))] rounded-[5px] shadow-sm">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold text-foreground">
            Generar Catálogo ROD
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-normal mt-1">
            Capittal Dealhub — {activeOps.length} operaciones activas
          </p>
        </DialogHeader>

        <div className="px-6 pb-2">
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
          <div className="space-y-1 mb-5">
            {DEALHUB_SECTIONS.map(section => {
              const checked = selectedSections.includes(section.key);
              const count = activeOps.filter(section.filter).length;
              return (
                <button
                  key={section.key}
                  onClick={() => toggleSection(section.key)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 rounded-[5px] text-sm transition-colors text-left',
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
                  <span className="text-xs text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[hsl(var(--linear-border))]">
          <button
            onClick={() => onOpenChange(false)}
            disabled={generating}
            className="px-4 py-2 text-sm font-semibold rounded-[5px] border border-[hsl(var(--linear-border))] bg-secondary text-foreground hover:-translate-y-[0.5px] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedSections.length}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-[5px] text-primary-foreground transition-all flex items-center gap-2',
              generating || !selectedSections.length
                ? 'bg-primary/60 cursor-not-allowed'
                : 'bg-primary hover:-translate-y-[0.5px]'
            )}
          >
            {generating && <Loader2 className="h-4 w-4 animate-spin" />}
            {generating ? 'Generando...' : 'Generar y Descargar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
