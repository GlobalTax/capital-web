import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateOperationPptx, ALL_SECTIONS, SECTION_LABELS, type SectionKey } from '../utils/generatePptx';
import { useToast } from '@/hooks/use-toast';

type TemplateType = 'teaser' | 'cim' | 'pitch_deck';

const TEMPLATE_OPTIONS: { value: TemplateType; label: string }[] = [
  { value: 'teaser', label: 'Teaser' },
  { value: 'cim', label: 'CIM' },
  { value: 'pitch_deck', label: 'Pitch Deck' },
];

interface GeneratePresentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: any;
}

export const GeneratePresentationModal = ({ open, onOpenChange, operation }: GeneratePresentationModalProps) => {
  const { toast } = useToast();
  const [selectedSections, setSelectedSections] = useState<SectionKey[]>([...ALL_SECTIONS]);
  const [template, setTemplate] = useState<TemplateType>('teaser');
  const [generating, setGenerating] = useState(false);

  const toggleSection = (key: SectionKey) => {
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
      await generateOperationPptx(operation, selectedSections, template);
      toast({ title: 'Presentación descargada' });
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
            Generar Presentación
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-normal mt-1">
            {operation?.company_name}
          </p>
        </DialogHeader>

        <div className="px-6 pb-2">
          {/* Template selector */}
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Tipo de documento
          </label>
          <div className="flex gap-1 p-0.5 rounded-[5px] bg-secondary mb-5">
            {TEMPLATE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTemplate(opt.value)}
                className={cn(
                  'flex-1 text-sm py-1.5 rounded-[4px] transition-all font-semibold',
                  template === opt.value
                    ? 'bg-[#161B22] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Section checklist */}
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Secciones a incluir
          </label>
          <div className="space-y-1 mb-5">
            {ALL_SECTIONS.map(key => {
              const checked = selectedSections.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleSection(key)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 rounded-[5px] text-sm transition-colors text-left',
                    checked ? 'bg-secondary/60' : 'hover:bg-secondary/40'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-4 h-4 rounded-[3px] border shrink-0 transition-colors',
                      checked
                        ? 'bg-[#161B22] border-[#161B22]'
                        : 'border-[hsl(var(--linear-border))] bg-background'
                    )}
                  >
                    {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-foreground font-normal">{SECTION_LABELS[key]}</span>
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
              'px-4 py-2 text-sm font-semibold rounded-[5px] text-white transition-all flex items-center gap-2',
              generating || !selectedSections.length
                ? 'bg-[#161B22]/60 cursor-not-allowed'
                : 'bg-[#161B22] hover:-translate-y-[0.5px]'
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
