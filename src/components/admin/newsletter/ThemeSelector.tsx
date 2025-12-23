import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Palette } from 'lucide-react';
import { newsletterThemes, NewsletterTheme } from '@/config/newsletterThemes';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onThemeChange: (theme: NewsletterTheme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onThemeChange,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Tema del Newsletter</CardTitle>
        </div>
        <CardDescription>
          Selecciona un tema para aplicar colores y estilos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {newsletterThemes.map((theme) => {
            const isSelected = theme.id === selectedThemeId;
            
            return (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme)}
                className={cn(
                  'relative p-3 rounded-lg border-2 text-left transition-all hover:shadow-md',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {/* Color Preview */}
                <div
                  className="h-12 rounded-md mb-2"
                  style={{ background: theme.preview }}
                />
                
                {/* Theme Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{theme.name}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {theme.description}
                  </p>
                </div>
                
                {/* Color Dots */}
                <div className="flex gap-1 mt-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: theme.colors.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Accent"
                  />
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: theme.colors.background }}
                    title="Background"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
