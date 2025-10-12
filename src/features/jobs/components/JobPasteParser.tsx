import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, ClipboardPaste } from 'lucide-react';
import { useJobOfferAI } from '@/hooks/useJobOfferAI';
import { UseFormSetValue } from 'react-hook-form';
import type { JobPostFormData } from '@/types/jobs';

interface JobPasteParserProps {
  setValue: UseFormSetValue<JobPostFormData>;
}

export const JobPasteParser: React.FC<JobPasteParserProps> = ({ setValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const { generateFullOffer, isGenerating } = useJobOfferAI();

  const handleParse = async () => {
    if (!rawText.trim()) return;

    try {
      const result = await generateFullOffer({
        rawText,
        title: '',
        level: '',
        sector: '',
      });

      // Aplicar todos los campos extraídos
      if (result.title) setValue('title', result.title);
      if (result.short_description) setValue('short_description', result.short_description);
      if (result.description) setValue('description', result.description);
      if (result.requirements) setValue('requirements', result.requirements);
      if (result.responsibilities) setValue('responsibilities', result.responsibilities);
      if (result.benefits) setValue('benefits', result.benefits);
      if (result.location) setValue('location', result.location);
      if (result.is_remote !== undefined) setValue('is_remote', result.is_remote);
      if (result.is_hybrid !== undefined) setValue('is_hybrid', result.is_hybrid);
      if (result.contract_type) setValue('contract_type', result.contract_type as any);
      if (result.employment_type) setValue('employment_type', result.employment_type as any);
      if (result.experience_level) setValue('experience_level', result.experience_level as any);
      if (result.sector) setValue('sector', result.sector);
      if (result.required_languages) setValue('required_languages', result.required_languages);
      if (result.salary_min) setValue('salary_min', result.salary_min);
      if (result.salary_max) setValue('salary_max', result.salary_max);

      setIsOpen(false);
      setRawText('');
    } catch (error) {
      console.error('Error parsing job offer:', error);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <ClipboardPaste className="h-4 w-4" />
        Pegar y Autocompletar
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Pegar texto de oferta existente
            </DialogTitle>
            <DialogDescription>
              Pega aquí el texto completo de una oferta de trabajo y la IA extraerá automáticamente todos los campos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Pega aquí el texto de la oferta completa (título, descripción, requisitos, etc.)"
              rows={15}
              className="font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleParse}
                disabled={isGenerating || !rawText.trim()}
              >
                {isGenerating ? (
                  'Analizando con IA...'
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analizar y Completar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
