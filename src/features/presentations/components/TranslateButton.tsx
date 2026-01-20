import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { 
  usePresentationTranslation, 
  TRANSLATION_LANGUAGES, 
  type TranslationLanguage 
} from '../hooks/usePresentationTranslation';
import type { Slide } from '../types/presentation.types';

interface TranslateButtonProps {
  projectId: string;
  slides: Slide[];
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({ projectId, slides }) => {
  const { translate, isTranslating } = usePresentationTranslation();

  const handleTranslate = (lang: TranslationLanguage) => {
    translate({ projectId, slides, targetLanguage: lang });
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isTranslating}>
          {isTranslating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Languages className="w-4 h-4 mr-2" />
          )}
          Traducir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(TRANSLATION_LANGUAGES) as [TranslationLanguage, string][]).map(
          ([code, name]) => (
            <DropdownMenuItem 
              key={code} 
              onClick={() => handleTranslate(code)}
              disabled={isTranslating}
            >
              {name}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
