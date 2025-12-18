import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIGenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  tooltip?: string;
  size?: 'sm' | 'default' | 'icon';
  variant?: 'ghost' | 'outline' | 'secondary';
}

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  onClick,
  isGenerating,
  disabled = false,
  tooltip = 'Generar con IA',
  size = 'icon',
  variant = 'ghost',
}) => {
  const button = (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || isGenerating}
      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{isGenerating ? 'Generando...' : tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};
