import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, 
  Type, 
  Eye, 
  Volume2, 
  Keyboard,
  Settings,
  X
} from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';
import { cn } from '@/lib/utils';

interface AccessibilityToolsProps {
  className?: string;
}

export const AccessibilityTools = ({ className }: AccessibilityToolsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, setFontSize, announceLiveRegion } = useAccessibility();

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    announceLiveRegion(`Tamaño de fuente cambiado a ${size}`);
  };

  const handleSkipToMain = () => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      announceLiveRegion('Saltando al contenido principal');
    }
  };

  const handleToggleHighContrast = () => {
    document.body.classList.toggle('high-contrast');
    const isEnabled = document.body.classList.contains('high-contrast');
    announceLiveRegion(`Alto contraste ${isEnabled ? 'activado' : 'desactivado'}`);
  };

  const handleReduceMotion = () => {
    document.body.classList.toggle('reduce-motion');
    const isEnabled = document.body.classList.contains('reduce-motion');
    announceLiveRegion(`Movimiento reducido ${isEnabled ? 'activado' : 'desactivado'}`);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-50 shadow-lg bg-background border-2",
          className
        )}
        aria-label="Abrir herramientas de accesibilidad"
      >
        <Accessibility className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 z-50 w-80 shadow-xl",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            Accesibilidad
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar herramientas de accesibilidad"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Skip Links */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Navegación
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipToMain}
            className="w-full text-xs"
          >
            Saltar al contenido principal
          </Button>
        </div>

        <Separator />

        {/* Font Size */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Type className="h-4 w-4" />
            Tamaño de texto
          </h4>
          <div className="flex gap-1">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <Button
                key={size}
                variant={preferences.fontSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => handleFontSizeChange(size)}
                className="flex-1 text-xs"
              >
                {size === 'small' ? 'Pequeño' : size === 'medium' ? 'Normal' : 'Grande'}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Visual Adjustments */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Ajustes visuales
          </h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleHighContrast}
              className="w-full text-xs"
            >
              Alternar alto contraste
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReduceMotion}
              className="w-full text-xs"
            >
              Reducir animaciones
            </Button>
          </div>
        </div>

        <Separator />

        {/* System Preferences */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferencias del sistema
          </h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            {preferences.prefersReducedMotion && (
              <Badge variant="secondary" className="text-xs">
                Movimiento reducido detectado
              </Badge>
            )}
            {preferences.prefersHighContrast && (
              <Badge variant="secondary" className="text-xs">
                Alto contraste detectado
              </Badge>
            )}
            {preferences.prefersColorScheme !== 'no-preference' && (
              <Badge variant="secondary" className="text-xs">
                Tema: {preferences.prefersColorScheme}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilityTools;